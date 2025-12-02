"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Check, X, TrendingUp } from "lucide-react";
import type { GradeGridData, BulkSaveGradeItem } from "@/lib/api/grades";
import { attendanceApi } from "@/lib/api/attendance";

interface GradeGridEditorProps {
  gridData: GradeGridData;
  onSave: (grades: BulkSaveGradeItem[]) => Promise<void>;
  isLoading?: boolean;
}

interface CellState {
  studentId: string;
  subjectId: string;
  value: string;
  originalValue: number | null;
  isModified: boolean;
  isSaving: boolean;
  error: string | null;
}

export default function GradeGridEditor({
  gridData,
  onSave,
  isLoading = false,
}: GradeGridEditorProps) {
  const [cells, setCells] = useState<{ [key: string]: CellState }>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  // ✅ Attendance summary state
  const [attendanceSummary, setAttendanceSummary] = useState<{
    [studentId: string]: { absent: number; permission: number };
  }>({});

  // Initialize cells
  useEffect(() => {
    const initialCells: { [key: string]: CellState } = {};

    gridData.students.forEach((student) => {
      gridData.subjects.forEach((subject) => {
        const cellKey = `${student.studentId}_${subject.id}`;
        const gradeData = student.grades[subject.id];

        initialCells[cellKey] = {
          studentId: student.studentId,
          subjectId: subject.id,
          value: gradeData.score !== null ? String(gradeData.score) : "",
          originalValue: gradeData.score,
          isModified: false,
          isSaving: false,
          error: null,
        };
      });
    });

    setCells(initialCells);
  }, [gridData]);

  // ✅ Fetch attendance summary when grid loads
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        console.log("🔍 Fetching attendance for:", {
          classId: gridData.classId,
          month: gridData.month,
          year: gridData.year,
        });

        const summary = await attendanceApi.getMonthlySummary(
          gridData.classId,
          gridData.month,
          gridData.year
        );

        console.log("✅ Attendance summary received:", summary);
        setAttendanceSummary(summary);
      } catch (error: any) {
        console.error("❌ Failed to fetch attendance summary:", error);
        // Set empty summary on error
        setAttendanceSummary({});
      }
    };

    if (gridData && gridData.classId && gridData.month && gridData.year) {
      fetchAttendanceSummary();
    }
  }, [gridData.classId, gridData.month, gridData.year]);

  // Auto-save pending changes
  useEffect(() => {
    if (pendingChanges.size > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pendingChanges]);

  const handleAutoSave = async () => {
    const changesToSave: BulkSaveGradeItem[] = [];

    pendingChanges.forEach((cellKey) => {
      const cell = cells[cellKey];
      if (cell && cell.isModified && !cell.error) {
        const score = cell.value.trim() === "" ? null : parseFloat(cell.value);
        changesToSave.push({
          studentId: cell.studentId,
          subjectId: cell.subjectId,
          score,
        });

        setCells((prev) => ({
          ...prev,
          [cellKey]: { ...prev[cellKey], isSaving: true },
        }));
      }
    });

    if (changesToSave.length === 0) return;

    try {
      await onSave(changesToSave);

      setCells((prev) => {
        const updated = { ...prev };
        changesToSave.forEach((change) => {
          const cellKey = `${change.studentId}_${change.subjectId}`;
          updated[cellKey] = {
            ...updated[cellKey],
            originalValue: change.score,
            isModified: false,
            isSaving: false,
            error: null,
          };
        });
        return updated;
      });

      setPendingChanges(new Set());
    } catch (error: any) {
      setCells((prev) => {
        const updated = { ...prev };
        changesToSave.forEach((change) => {
          const cellKey = `${change.studentId}_${change.subjectId}`;
          updated[cellKey] = {
            ...updated[cellKey],
            isSaving: false,
            error: "Failed",
          };
        });
        return updated;
      });
    }
  };

  const handleCellChange = (cellKey: string, value: string) => {
    const cell = cells[cellKey];
    if (!cell) return;

    const subject = gridData.subjects.find((s) => s.id === cell.subjectId);
    if (!subject) return;

    let error: string | null = null;
    if (value.trim() !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        error = "Invalid";
      } else if (numValue < 0 || numValue > subject.maxScore) {
        error = `Max ${subject.maxScore}`;
      }
    }

    const isModified =
      value !== (cell.originalValue !== null ? String(cell.originalValue) : "");

    setCells((prev) => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        value,
        isModified,
        error,
      },
    }));

    if (isModified && !error) {
      setPendingChanges((prev) => new Set(prev).add(cellKey));
    } else {
      setPendingChanges((prev) => {
        const updated = new Set(prev);
        updated.delete(cellKey);
        return updated;
      });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => {
    const totalSubjects = gridData.subjects.length;
    const totalStudents = gridData.students.length;

    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (studentIndex < totalStudents - 1) {
        const nextKey = `${gridData.students[studentIndex + 1].studentId}_${
          gridData.subjects[subjectIndex].id
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (studentIndex > 0) {
        const prevKey = `${gridData.students[studentIndex - 1].studentId}_${
          gridData.subjects[subjectIndex].id
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (subjectIndex < totalSubjects - 1) {
        const nextKey = `${gridData.students[studentIndex].studentId}_${
          gridData.subjects[subjectIndex + 1].id
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (subjectIndex > 0) {
        const prevKey = `${gridData.students[studentIndex].studentId}_${
          gridData.subjects[subjectIndex - 1].id
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    }
  };

  // Khmer display names
  const getKhmerShortName = (shortCode: string): string => {
    const khmerNames: { [key: string]: string } = {
      W: "តែង. ក្តី",
      R: "ស. អាន",
      M: "គណិត",
      P: "រូប",
      C: "គីមី",
      B: "ជីវៈ",
      Es: "ផែនដី",
      Mo: "សីលធម៌",
      G: "ភូមិ",
      H: "ប្រវត្តិ",
      E: "ភាសា",
      He: "គេហ",
      S: "កីឡា",
      Ag: "កសិកម្ម",
      IT: "ICT",
      K: "ភាសាខ្មែរ",
    };
    return khmerNames[shortCode] || shortCode;
  };

  // Color coding for subject categories
  const getSubjectColor = (
    shortCode: string
  ): { header: string; cell: string } => {
    const colors: { [key: string]: { header: string; cell: string } } = {
      W: { header: "bg-blue-100 text-blue-800", cell: "bg-blue-50/30" },
      R: { header: "bg-blue-100 text-blue-800", cell: "bg-blue-50/30" },
      E: { header: "bg-cyan-100 text-cyan-800", cell: "bg-cyan-50/30" },
      K: { header: "bg-sky-100 text-sky-800", cell: "bg-sky-50/30" },
      M: { header: "bg-purple-100 text-purple-800", cell: "bg-purple-50/30" },
      P: { header: "bg-indigo-100 text-indigo-800", cell: "bg-indigo-50/30" },
      C: { header: "bg-violet-100 text-violet-800", cell: "bg-violet-50/30" },
      B: { header: "bg-green-100 text-green-800", cell: "bg-green-50/30" },
      Es: { header: "bg-teal-100 text-teal-800", cell: "bg-teal-50/30" },
      Mo: { header: "bg-amber-100 text-amber-800", cell: "bg-amber-50/30" },
      G: { header: "bg-orange-100 text-orange-800", cell: "bg-orange-50/30" },
      H: { header: "bg-yellow-100 text-yellow-800", cell: "bg-yellow-50/30" },
      He: { header: "bg-pink-100 text-pink-800", cell: "bg-pink-50/30" },
      S: { header: "bg-rose-100 text-rose-800", cell: "bg-rose-50/30" },
      Ag: { header: "bg-lime-100 text-lime-800", cell: "bg-lime-50/30" },
      IT: {
        header: "bg-fuchsia-100 text-fuchsia-800",
        cell: "bg-fuchsia-50/30",
      },
    };
    return (
      colors[shortCode] || {
        header: "bg-gray-100 text-gray-800",
        cell: "bg-gray-50/30",
      }
    );
  };

  // Calculate total coefficient
  const totalCoefficientForClass = useMemo(() => {
    return parseFloat(
      gridData.subjects
        .reduce((sum, subject) => sum + subject.coefficient, 0)
        .toFixed(2)
    );
  }, [gridData.subjects]);

  // Real-time calculations
  const calculatedStudents = useMemo(() => {
    return gridData.students.map((student) => {
      let totalScore = 0;
      let totalMaxScore = 0;

      gridData.subjects.forEach((subject) => {
        const cellKey = `${student.studentId}_${subject.id}`;
        const cell = cells[cellKey];

        if (cell && cell.value.trim() !== "" && !cell.error) {
          const score = parseFloat(cell.value);
          if (!isNaN(score)) {
            totalScore += score;
            totalMaxScore += subject.maxScore;
          }
        }
      });

      const average =
        totalCoefficientForClass > 0
          ? totalScore / totalCoefficientForClass
          : 0;

      let gradeLevel = "F";
      if (average >= 45) gradeLevel = "A";
      else if (average >= 40) gradeLevel = "B";
      else if (average >= 35) gradeLevel = "C";
      else if (average >= 30) gradeLevel = "D";
      else if (average >= 25) gradeLevel = "E";

      return {
        ...student,
        totalScore: totalScore.toFixed(2),
        totalMaxScore,
        totalCoefficient: totalCoefficientForClass.toFixed(2),
        average: average.toFixed(2),
        gradeLevel,
      };
    });
  }, [cells, gridData.students, gridData.subjects, totalCoefficientForClass]);

  // Calculate ranks and add attendance
  const rankedStudents = useMemo(() => {
    const sorted = [...calculatedStudents]
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        // ✅ Add attendance counts from fetched summary
        absent: attendanceSummary[student.studentId]?.absent || 0,
        permission: attendanceSummary[student.studentId]?.permission || 0,
      }));

    return calculatedStudents.map((student) => {
      const ranked = sorted.find((s) => s.studentId === student.studentId);
      return {
        ...student,
        rank: ranked?.rank || 0,
        // ✅ Add attendance counts
        absent: ranked?.absent || 0,
        permission: ranked?.permission || 0,
      };
    });
  }, [calculatedStudents, attendanceSummary]);

  const getCellClassName = (cell: CellState) => {
    const baseClass =
      "w-16 h-9 px-2 text-center text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 transition-all";

    if (cell.error)
      return `${baseClass} bg-red-50 border-red-400 text-red-700 focus:ring-red-400`;
    if (cell.isSaving)
      return `${baseClass} bg-amber-50 border-amber-300 animate-pulse`;
    if (cell.isModified)
      return `${baseClass} bg-blue-50 border-blue-400 focus:ring-blue-400 font-bold text-blue-900`;
    if (cell.value && !cell.isModified)
      return `${baseClass} bg-white border-gray-300 focus:ring-indigo-400`;
    return `${baseClass} bg-gray-50 border-gray-300 focus:ring-indigo-400`;
  };

  const getGradeLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      A: "bg-green-600 text-white",
      B: "bg-blue-600 text-white",
      C: "bg-yellow-600 text-white",
      D: "bg-orange-600 text-white",
      E: "bg-red-500 text-white",
      F: "bg-red-700 text-white",
    };
    return colors[level] || "bg-gray-600 text-white";
  };

  const getStatusIcon = (cell: CellState) => {
    if (cell.isSaving)
      return <Loader2 className="w-3. 5 h-3.5 text-amber-600 animate-spin" />;
    if (cell.error) return <X className="w-3.5 h-3.5 text-red-600" />;
    if (cell.value && !cell.isModified && !cell.isSaving)
      return <Check className="w-3.5 h-3.5 text-green-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Beautiful Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">
                {gridData.className}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1. 5 rounded-lg">
                  <span className="text-sm font-bold text-white">
                    {gridData.month} {gridData.year}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">
                    {gridData.students.length} សិស្ស
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">
                    Coef: {totalCoefficientForClass}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white/90">Auto-Save ✓</p>
            <p className="text-xs text-white/70 mt-1">
              រក្សាទុកស្វ័យប្រវត្តិ • គណនាលទ្ធផលភ្លាមៗ
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="overflow-auto"
        style={{
          maxHeight: "calc(100vh - 260px)",
          scrollbarWidth: "thin",
          scrollbarColor: "#9333ea #f3f4f6",
        }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 shadow-md">
            <tr>
              {/* Fixed Columns */}
              <th className="sticky left-0 z-30 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 border-b-2 border-r border-gray-300 w-12">
                #
              </th>
              <th className="sticky left-12 z-30 bg-gray-100 px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-r border-gray-300 min-w-[180px]">
                គោត្តនាម. នាម
              </th>
              <th className="sticky left-[220px] z-30 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 border-b-2 border-r border-gray-300 w-14">
                ភេទ
              </th>

              {/* Colorful Subject Columns */}
              {gridData.subjects.map((subject) => {
                const colors = getSubjectColor(subject.shortCode);
                return (
                  <th
                    key={subject.id}
                    className={`px-3 py-3 text-center text-sm font-bold border-b-2 border-r border-gray-300 min-w-[70px] ${colors.header}`}
                    title={`${subject.nameKh} (Max: ${subject.maxScore}, Coefficient: ${subject.coefficient})`}
                  >
                    {getKhmerShortName(subject.shortCode)}
                  </th>
                );
              })}

              {/* Summary Columns */}
              <th className="px-3 py-3 text-center text-sm font-bold text-blue-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-blue-100">
                សរុប
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-green-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-green-100">
                ម.ភាគ
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-yellow-800 border-b-2 border-r border-gray-300 min-w-[65px] bg-yellow-100">
                និទ្ទេស
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-indigo-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-indigo-100">
                ចំ. ថ្នាក់
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-red-800 border-b-2 border-r border-gray-300 w-12 bg-red-100">
                អ.ច្បាប់
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-orange-800 border-b-2 border-gray-300 w-12 bg-orange-100">
                ម.ច្បាប់
              </th>
            </tr>
          </thead>
          <tbody>
            {rankedStudents.map((student, studentIndex) => {
              const rowBg = studentIndex % 2 === 0 ? "bg-white" : "bg-gray-50";

              return (
                <tr
                  key={student.studentId}
                  className={`${rowBg} hover:bg-indigo-50/50 transition-colors`}
                >
                  {/* Fixed Columns */}
                  <td
                    className={`sticky left-0 z-10 ${rowBg} hover:bg-indigo-50/50 px-3 py-2. 5 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200`}
                  >
                    {studentIndex + 1}
                  </td>
                  <td
                    className={`sticky left-12 z-10 ${rowBg} hover:bg-indigo-50/50 px-4 py-2.5 text-sm font-semibold text-gray-800 border-b border-r border-gray-200`}
                  >
                    {student.studentName}
                  </td>
                  <td
                    className={`sticky left-[220px] z-10 ${rowBg} hover:bg-indigo-50/50 px-3 py-2.5 text-center border-b border-r border-gray-200`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        student.gender === "MALE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-pink-100 text-pink-700"
                      }`}
                    >
                      {student.gender === "MALE" ? "ប" : "ស"}
                    </span>
                  </td>

                  {/* Colorful Grade Cells */}
                  {gridData.subjects.map((subject, subjectIndex) => {
                    const cellKey = `${student.studentId}_${subject.id}`;
                    const cell = cells[cellKey];
                    const colors = getSubjectColor(subject.shortCode);

                    if (!cell)
                      return (
                        <td
                          key={subject.id}
                          className={`border-b border-r border-gray-200 ${colors.cell}`}
                        />
                      );

                    return (
                      <td
                        key={subject.id}
                        className={`px-2 py-2 text-center border-b border-r border-gray-200 ${colors.cell}`}
                      >
                        <div className="flex items-center justify-center gap-1. 5">
                          <input
                            ref={(el) => {
                              if (el) inputRefs.current[cellKey] = el;
                            }}
                            type="text"
                            value={cell.value}
                            onChange={(e) =>
                              handleCellChange(cellKey, e.target.value)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, studentIndex, subjectIndex)
                            }
                            disabled={isLoading}
                            className={getCellClassName(cell)}
                            placeholder="-"
                          />
                          <div className="w-3. 5 flex-shrink-0">
                            {getStatusIcon(cell)}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Summary Columns */}
                  <td className="px-3 py-2.5 text-center text-sm font-bold border-b border-r border-gray-200 bg-blue-50/50 text-blue-700">
                    {student.totalScore}
                  </td>
                  <td className="px-3 py-2.5 text-center text-base font-bold border-b border-r border-gray-200 bg-green-50/50 text-green-700">
                    {student.average}
                  </td>
                  <td className="px-2 py-2.5 text-center border-b border-r border-gray-200 bg-yellow-50/50">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold ${getGradeLevelColor(
                        student.gradeLevel
                      )}`}
                    >
                      {student.gradeLevel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold border-b border-r border-gray-200 bg-indigo-50/50 text-indigo-700">
                    #{student.rank}
                  </td>
                  {/* ✅ ATTENDANCE COLUMNS - Real data from API */}
                  <td className="px-3 py-2.5 text-center text-sm font-semibold border-b border-r border-gray-200 bg-red-50/50 text-red-600">
                    {student.absent || "-"}
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm font-semibold border-b border-gray-200 bg-orange-50/50 text-orange-600">
                    {student.permission || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-5 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1. 5">
            <div className="w-5 h-5 bg-blue-50 border-2 border-blue-400 rounded" />
            <span>កំពុងកែ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
            <span>កំពុងរក្សា</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-600" />
            <span>រក្សារួច</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-gray-600">
          <span className="text-green-700">A (≥45)</span> •
          <span className="text-blue-700"> B (≥40)</span> •
          <span className="text-yellow-700"> C (≥35)</span> •
          <span className="text-orange-700"> D (≥30)</span> •
          <span className="text-red-600"> E (≥25)</span> •
          <span className="text-red-800"> F (&lt;25)</span>
        </div>
      </div>
    </div>
  );
}

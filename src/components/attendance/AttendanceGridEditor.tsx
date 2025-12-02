"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Check, X, Calendar } from "lucide-react";
import type {
  AttendanceGridData,
  BulkSaveAttendanceItem,
} from "@/lib/api/attendance";

interface AttendanceGridEditorProps {
  gridData: AttendanceGridData;
  onSave: (attendance: BulkSaveAttendanceItem[]) => Promise<void>;
  isLoading?: boolean;
}

interface CellState {
  studentId: string;
  day: number;
  value: string;
  originalValue: string;
  isModified: boolean;
  isSaving: boolean;
  error: string | null;
}

export default function AttendanceGridEditor({
  gridData,
  onSave,
  isLoading = false,
}: AttendanceGridEditorProps) {
  const [cells, setCells] = useState<{ [key: string]: CellState }>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  // ✅ Initialize cells from backend data
  useEffect(() => {
    console.log("🔄 Initializing attendance cells from grid data");
    const initialCells: { [key: string]: CellState } = {};

    gridData.students.forEach((student) => {
      console.log(`👤 Student: ${student.studentName}`, {
        totalAbsent: student.totalAbsent,
        totalPermission: student.totalPermission,
      });

      gridData.days.forEach((day) => {
        const cellKey = `${student.studentId}_${day}`;
        const attendanceData = student.attendance[day];

        // ✅ Use displayValue from backend (A, P, or empty)
        const displayValue = attendanceData?.displayValue || "";

        initialCells[cellKey] = {
          studentId: student.studentId,
          day,
          value: displayValue,
          originalValue: displayValue,
          isModified: false,
          isSaving: false,
          error: null,
        };

        if (displayValue) {
          console.log(`  Day ${day}: ${displayValue}`);
        }
      });
    });

    console.log("✅ Initialized cells:", Object.keys(initialCells).length);
    setCells(initialCells);
  }, [gridData]);

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

  // Add this at the beginning of the component to see data flow:
  // Replace the initialization useEffect with this:

  useEffect(() => {
    console.log("🔄 ===== INITIALIZING CELLS =====");
    console.log("Grid Data received:", gridData);

    const initialCells: { [key: string]: CellState } = {};

    gridData.students.forEach((student, studentIdx) => {
      console.log(`\n👤 Student ${studentIdx + 1}: ${student.studentName}`);
      console.log(
        `   Backend totals: A=${student.totalAbsent}, P=${student.totalPermission}`
      );

      let studentCellCount = 0;
      let studentSavedCount = 0;

      gridData.days.forEach((day) => {
        const cellKey = `${student.studentId}_${day}`;
        const attendanceData = student.attendance[day];

        // ✅ Log each day's data
        if (attendanceData && attendanceData.displayValue) {
          console.log(`   📅 Day ${day}:`, {
            displayValue: attendanceData.displayValue,
            status: attendanceData.status,
            isSaved: attendanceData.isSaved,
          });
          studentSavedCount++;
        }

        const displayValue = attendanceData?.displayValue || "";

        initialCells[cellKey] = {
          studentId: student.studentId,
          day,
          value: displayValue,
          originalValue: displayValue,
          isModified: false,
          isSaving: false,
          error: null,
        };

        studentCellCount++;
      });

      console.log(
        `   ✅ Initialized ${studentCellCount} cells, ${studentSavedCount} with saved data`
      );
    });

    console.log(
      `\n✅ Total cells initialized: ${Object.keys(initialCells).length}`
    );
    console.log("================================\n");

    setCells(initialCells);
  }, [gridData]);

  const handleAutoSave = async () => {
    const changesToSave: BulkSaveAttendanceItem[] = [];

    pendingChanges.forEach((cellKey) => {
      const cell = cells[cellKey];
      if (cell && cell.isModified && !cell.error) {
        changesToSave.push({
          studentId: cell.studentId,
          day: cell.day,
          value: cell.value.toUpperCase(),
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
          const cellKey = `${change.studentId}_${change.day}`;
          updated[cellKey] = {
            ...updated[cellKey],
            originalValue: change.value,
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
          const cellKey = `${change.studentId}_${change.day}`;
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

    const upperValue = value.toUpperCase();
    let error: string | null = null;

    if (value.trim() !== "" && upperValue !== "A" && upperValue !== "P") {
      error = "A or P only";
    }

    const isModified = upperValue !== cell.originalValue;

    setCells((prev) => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        value: upperValue,
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
    dayIndex: number
  ) => {
    const totalDays = gridData.days.length;
    const totalStudents = gridData.students.length;

    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (studentIndex < totalStudents - 1) {
        const nextKey = `${gridData.students[studentIndex + 1].studentId}_${
          gridData.days[dayIndex]
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (studentIndex > 0) {
        const prevKey = `${gridData.students[studentIndex - 1].studentId}_${
          gridData.days[dayIndex]
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (dayIndex < totalDays - 1) {
        const nextKey = `${gridData.students[studentIndex].studentId}_${
          gridData.days[dayIndex + 1]
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (dayIndex > 0) {
        const prevKey = `${gridData.students[studentIndex].studentId}_${
          gridData.days[dayIndex - 1]
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    }
  };

  // ✅ Real-time count totals from cells (not from gridData)
  const calculatedStudents = useMemo(() => {
    console.log("🔄 Recalculating attendance totals from cells");

    return gridData.students.map((student) => {
      let totalAbsent = 0;
      let totalPermission = 0;

      gridData.days.forEach((day) => {
        const cellKey = `${student.studentId}_${day}`;
        const cell = cells[cellKey];

        if (cell) {
          if (cell.value === "A") totalAbsent++;
          if (cell.value === "P") totalPermission++;
        }
      });

      console.log(
        `👤 ${student.studentName}: A=${totalAbsent}, P=${totalPermission}`
      );

      return {
        ...student,
        totalAbsent,
        totalPermission,
      };
    });
  }, [cells, gridData.students, gridData.days]);

  const getCellClassName = (cell: CellState) => {
    const baseClass =
      "w-10 h-9 px-1 text-center text-sm font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 transition-all uppercase";

    if (cell.error)
      return `${baseClass} bg-red-50 border-red-400 text-red-700 focus:ring-red-400`;
    if (cell.isSaving)
      return `${baseClass} bg-amber-50 border-amber-300 animate-pulse`;
    if (cell.isModified)
      return `${baseClass} bg-blue-50 border-blue-400 focus:ring-blue-400 text-blue-900`;
    if (cell.value && !cell.isModified) {
      if (cell.value === "A")
        return `${baseClass} bg-red-50 border-red-300 text-red-700 focus:ring-red-400`;
      if (cell.value === "P")
        return `${baseClass} bg-orange-50 border-orange-300 text-orange-700 focus:ring-orange-400`;
    }
    return `${baseClass} bg-gray-50 border-gray-300 focus:ring-indigo-400`;
  };

  const getStatusIcon = (cell: CellState) => {
    if (cell.isSaving)
      return <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />;
    if (cell.error) return <X className="w-3 h-3 text-red-600" />;
    if (cell.value && !cell.isModified && !cell.isSaving)
      return <Check className="w-3 h-3 text-green-600" />;
    return null;
  };

  const getDayOfWeek = (day: number): string => {
    const date = new Date(gridData.year, gridData.monthNumber - 1, day);
    const days = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];
    return days[date.getDay()];
  };

  const isWeekend = (day: number): boolean => {
    const date = new Date(gridData.year, gridData.monthNumber - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">
                {gridData.className}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1. 5 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
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
                    {gridData.daysInMonth} ថ្ងៃ
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white/90">Auto-Save ✓</p>
            <p className="text-xs text-white/70 mt-1">
              A = អត់ច្បាប់ • P = មានច្បាប់
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
              <th className="sticky left-0 z-30 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 border-b-2 border-r border-gray-300 w-12">
                #
              </th>
              <th className="sticky left-12 z-30 bg-gray-100 px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-r border-gray-300 min-w-[180px]">
                គោត្តនាម. នាម
              </th>
              <th className="sticky left-[220px] z-30 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 border-b-2 border-r border-gray-300 w-14">
                ភេទ
              </th>

              {gridData.days.map((day) => (
                <th
                  key={day}
                  className={`px-2 py-2 text-center border-b-2 border-r border-gray-300 min-w-[50px] ${
                    isWeekend(day) ? "bg-red-50" : "bg-blue-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={`text-xs font-bold ${
                        isWeekend(day) ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {day}
                    </span>
                    <span
                      className={`text-[9px] font-semibold ${
                        isWeekend(day) ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {getDayOfWeek(day)}
                    </span>
                  </div>
                </th>
              ))}

              <th className="px-3 py-3 text-center text-sm font-bold text-red-800 border-b-2 border-r border-gray-300 min-w-[60px] bg-red-100">
                A សរុប
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-orange-800 border-b-2 border-gray-300 min-w-[60px] bg-orange-100">
                P សរុប
              </th>
            </tr>
          </thead>
          <tbody>
            {calculatedStudents.map((student, studentIndex) => {
              const rowBg = studentIndex % 2 === 0 ? "bg-white" : "bg-gray-50";

              return (
                <tr
                  key={student.studentId}
                  className={`${rowBg} hover:bg-indigo-50/50 transition-colors`}
                >
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
                    className={`sticky left-[220px] z-10 ${rowBg} hover:bg-indigo-50/50 px-3 py-2. 5 text-center border-b border-r border-gray-200`}
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

                  {gridData.days.map((day, dayIndex) => {
                    const cellKey = `${student.studentId}_${day}`;
                    const cell = cells[cellKey];

                    if (!cell)
                      return (
                        <td
                          key={day}
                          className="border-b border-r border-gray-200"
                        />
                      );

                    return (
                      <td
                        key={day}
                        className={`px-1 py-2 text-center border-b border-r border-gray-200 ${
                          isWeekend(day) ? "bg-red-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
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
                              handleKeyDown(e, studentIndex, dayIndex)
                            }
                            disabled={isLoading}
                            className={getCellClassName(cell)}
                            placeholder="-"
                            maxLength={1}
                          />
                          <div className="w-3 flex-shrink-0">
                            {getStatusIcon(cell)}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* ✅ Summary from calculated totals */}
                  <td className="px-3 py-2. 5 text-center text-base font-black border-b border-r border-gray-200 bg-red-50/50 text-red-700">
                    {student.totalAbsent}
                  </td>
                  <td className="px-3 py-2.5 text-center text-base font-black border-b border-gray-200 bg-orange-50/50 text-orange-700">
                    {student.totalPermission}
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
          <span className="text-red-700 font-bold">A</span> = អវត្តមានអត់ច្បាប់
          •<span className="text-orange-700 font-bold"> P</span> =
          អវត្តមានមានច្បាប់ •<span className="text-gray-500"> ទទេ</span> =
          វត្តមាន
        </div>
      </div>
    </div>
  );
}

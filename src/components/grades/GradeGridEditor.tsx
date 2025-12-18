"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Loader2,
  Check,
  X,
  TrendingUp,
  ClipboardPaste,
  Save,
  Lock,
  Eye,
} from "lucide-react";
import type { GradeGridData, BulkSaveGradeItem } from "@/lib/api/grades";
import { attendanceApi } from "@/lib/api/attendance";
import { sortSubjectsByOrder, getOrderingMessage } from "@/lib/subjectOrder";

interface GradeGridEditorProps {
  gridData: GradeGridData;
  onSave: (grades: BulkSaveGradeItem[]) => Promise<void>;
  isLoading?: boolean;
  currentUser?: any; // ✅ ADDED:  Current user for permissions
}

interface CellState {
  studentId: string;
  subjectId: string;
  value: string;
  originalValue: number | null;
  isModified: boolean;
  isSaving: boolean;
  error: string | null;
  isEditable?: boolean; // ✅ ADDED:  Permission flag
}

export default function GradeGridEditor({
  gridData,
  onSave,
  isLoading = false,
  currentUser, // ✅ ADDED
}: GradeGridEditorProps) {
  const [cells, setCells] = useState<{ [key: string]: CellState }>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const [pastePreview, setPastePreview] = useState<string | null>(null);

  // Paste Mode States
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedCells, setPastedCells] = useState<Set<string>>(new Set());
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  const [allPendingChanges, setAllPendingChanges] = useState<
    Map<string, BulkSaveGradeItem>
  >(new Map());
  const [saving, setSaving] = useState(false);

  // Attendance summary state
  const [attendanceSummary, setAttendanceSummary] = useState<{
    [studentId: string]: { absent: number; permission: number };
  }>({});

  // ✅ NEW: Check if subject is editable by current user
  const isSubjectEditable = useCallback(
    (subjectId: string) => {
      if (currentUser?.role === "ADMIN") return true;

      if (currentUser?.role === "TEACHER") {
        const teacherSubjectIds =
          currentUser.teacher?.subjectAssignments?.map(
            (sa: any) => sa.subjectId
          ) || [];
        return teacherSubjectIds.includes(subjectId);
      }

      return false;
    },
    [currentUser]
  );

  // Around line 75-130, replace the entire sortedSubjects useMemo with:
  const sortedSubjects = useMemo(() => {
    const className = gridData.className || "";
    console.log("🎯 Original className:", className);

    let grade: number | undefined;

    const pattern1 = className.match(/^(\d+)/);
    if (pattern1) {
      grade = parseInt(pattern1[1]);
    }

    if (!grade) {
      const khmerNumerals: { [key: string]: number } = {
        "១": 1,
        "២": 2,
        "៣": 3,
        "៤": 4,
        "៥": 5,
        "៦": 6,
        "៧": 7,
        "៨": 8,
        "៩": 9,
        "០": 0,
      };

      const pattern2 = className.match(/[១២៣៤៥៦៧៨៩០]/);
      if (pattern2) {
        grade = khmerNumerals[pattern2[0]];
      }
    }

    if (!grade) {
      const pattern3 = className.match(/(\d+)/);
      if (pattern3) {
        grade = parseInt(pattern3[1]);
      }
    }

    console.log("🔢 Extracted grade:", grade);

    // ✅ BEFORE sorting, log original isEditable
    console.log("📋 BEFORE sort - isEditable values:");
    gridData.subjects.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.nameKh}:  isEditable =`, s.isEditable);
    });

    const sorted = sortSubjectsByOrder(gridData.subjects, grade);

    console.log("📋 AFTER sort - isEditable values:");
    sorted.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.nameKh}: isEditable =`, s.isEditable);
    });

    // ✅ FIX:   Re-apply isEditable from original gridData after sorting
    const sortedWithPermissions = sorted.map((sortedSubject) => {
      const original = gridData.subjects.find((s) => s.id === sortedSubject.id);
      return {
        ...sortedSubject,
        isEditable: original?.isEditable ?? false,
      };
    });

    console.log("✅ FINAL - After re-applying isEditable:");
    sortedWithPermissions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.nameKh}: isEditable =`, s.isEditable);
    });

    return sortedWithPermissions;
  }, [gridData.subjects, gridData.className]);

  // Sort students Excel-style
  const sortedStudents = useMemo(() => {
    const students = [...gridData.students].sort((a, b) => {
      const nameA = a.studentName || "";
      const nameB = b.studentName || "";
      return nameA.localeCompare(nameB, "en-US");
    });

    console.log(
      "👥 Students sorted Excel-style:",
      students.map((s) => s.studentName)
    );

    return students;
  }, [gridData.students]);

  // Get ordering message
  const orderingMessage = useMemo(() => {
    const gradeMatch = gridData.className?.match(/^(\d+)/);
    const grade = gradeMatch ? parseInt(gradeMatch[1]) : undefined;
    return getOrderingMessage(grade);
  }, [gridData.className]);

  // Initialize cells
  useEffect(() => {
    const initialCells: { [key: string]: CellState } = {};

    sortedStudents.forEach((student) => {
      sortedSubjects.forEach((subject) => {
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
          isEditable: subject.isEditable, // ✅ ADDED
        };
      });
    });

    setCells(initialCells);
  }, [gridData, sortedStudents, sortedSubjects]);

  // Fetch attendance summary
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
        setAttendanceSummary({});
      }
    };

    if (gridData && gridData.classId && gridData.month && gridData.year) {
      fetchAttendanceSummary();
    }
  }, [gridData.classId, gridData.month, gridData.year]);

  // Auto-save effect
  useEffect(() => {
    if (pasteMode) {
      console.log("🚫 Auto-save disabled - Paste mode active");
      return;
    }

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
  }, [pendingChanges, pasteMode]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    const changesToSave: BulkSaveGradeItem[] = [];

    pendingChanges.forEach((cellKey) => {
      const cell = cells[cellKey];
      // ✅ Only save editable cells
      if (cell && cell.isModified && !cell.error && cell.isEditable) {
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

    console.log("💾 Auto-saving", changesToSave.length, "changes");

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
      console.log("✅ Auto-save completed");
    } catch (error: any) {
      console.error("❌ Auto-save failed:", error);
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
  }, [pendingChanges, cells, onSave]);

  // Handle cell change
  const handleCellChange = (cellKey: string, value: string) => {
    const cell = cells[cellKey];
    if (!cell) return;

    // ✅ Prevent editing non-editable cells
    if (!cell.isEditable) {
      console.log("🚫 Cannot edit this subject");
      return;
    }

    const subject = sortedSubjects.find((s) => s.id === cell.subjectId);
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

    if (pasteMode) {
      console.log("📝 Edit in paste mode - accumulating change");

      setEditedCells((prev) => new Set(prev).add(cellKey));

      const numValue = value.trim() === "" ? null : parseFloat(value);

      setAllPendingChanges((prev) => {
        const updated = new Map(prev);
        if (!error) {
          updated.set(cellKey, {
            studentId: cell.studentId,
            subjectId: cell.subjectId,
            score: numValue,
          });
        } else {
          updated.delete(cellKey);
        }
        return updated;
      });
    } else {
      if (isModified && !error) {
        setPendingChanges((prev) => new Set(prev).add(cellKey));
      } else {
        setPendingChanges((prev) => {
          const updated = new Set(prev);
          updated.delete(cellKey);
          return updated;
        });
      }
    }
  };

  // Handle Paste from Excel
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startStudentIndex: number,
    startSubjectIndex: number
  ) => {
    e.preventDefault();

    try {
      const clipboardData = e.clipboardData.getData("text/plain");

      if (!clipboardData || clipboardData.trim() === "") {
        console.log("📋 Empty clipboard");
        return;
      }

      const rows = clipboardData
        .split(/\r?\n/)
        .filter((row) => row.trim() !== "");

      const data: string[][] = rows.map((row) => {
        return row.split(/\t|,/).map((cell) => cell.trim());
      });

      console.log("📊 Parsed paste data:", {
        rows: data.length,
        cols: data[0]?.length || 0,
        data,
      });

      const pastedCellKeys = new Set<string>();
      const changes = new Map<string, BulkSaveGradeItem>();
      const updatedCells: { [key: string]: CellState } = {};
      let pastedCount = 0;
      let errorCount = 0;

      data.forEach((row, rowOffset) => {
        const studentIndex = startStudentIndex + rowOffset;

        if (studentIndex >= sortedStudents.length) {
          console.warn(`⚠️ Student index ${studentIndex} out of bounds`);
          return;
        }

        const student = sortedStudents[studentIndex];

        row.forEach((value, colOffset) => {
          const subjectIndex = startSubjectIndex + colOffset;

          if (subjectIndex >= sortedSubjects.length) {
            console.warn(`⚠️ Subject index ${subjectIndex} out of bounds`);
            return;
          }

          const subject = sortedSubjects[subjectIndex];
          const cellKey = `${student.studentId}_${subject.id}`;

          // ✅ Check if subject is editable
          if (!subject.isEditable) {
            console.log(`🚫 Skipping non-editable subject: ${subject.nameKh}`);
            return;
          }

          const cleanValue = value.replace(/[^\d.-]/g, "");

          if (cleanValue !== "" || value === "") {
            const numValue = cleanValue === "" ? null : parseFloat(cleanValue);

            let error: string | null = null;
            if (numValue !== null) {
              if (isNaN(numValue)) {
                error = "Invalid";
                errorCount++;
              } else if (numValue < 0 || numValue > subject.maxScore) {
                error = `Max ${subject.maxScore}`;
                errorCount++;
              }
            }

            if (!error) {
              pastedCellKeys.add(cellKey);

              changes.set(cellKey, {
                studentId: student.studentId,
                subjectId: subject.id,
                score: numValue,
              });

              updatedCells[cellKey] = {
                studentId: student.studentId,
                subjectId: subject.id,
                value: cleanValue,
                originalValue: cells[cellKey]?.originalValue || null,
                isModified: true,
                isSaving: false,
                error: null,
                isEditable: true,
              };

              pastedCount++;
            }
          }
        });
      });

      setCells((prev) => ({ ...prev, ...updatedCells }));

      setPasteMode(true);
      setPastedCells(pastedCellKeys);
      setAllPendingChanges(changes);

      setPendingChanges(new Set());

      setPastePreview(
        `📋 បានបញ្ចូល ${pastedCount} cells${
          errorCount > 0 ? ` (${errorCount} errors)` : ""
        } - សូមពិនិត្យ ហើយចុច "រក្សាទុក"`
      );

      setTimeout(() => {
        if (pasteMode) {
          setPastePreview(null);
        }
      }, 5000);

      console.log("✅ Paste completed:", { pastedCount, errorCount });
    } catch (error) {
      console.error("❌ Paste error:", error);
      setPastePreview("❌ មានបញ្ហាក្នុងការបញ្ចូលទិន្នន័យ");
      setTimeout(() => setPastePreview(null), 3000);
    }
  };

  // Save All Handler
  const handleSaveAll = async () => {
    if (allPendingChanges.size === 0) {
      console.log("⚠️ No changes to save");
      return;
    }

    try {
      console.log(`💾 Saving ${allPendingChanges.size} changes...  `);

      const changesToSave = Array.from(allPendingChanges.values());

      setSaving(true);

      await onSave(changesToSave);

      console.log("✅ Save all completed");

      setCells((prev) => {
        const updated = { ...prev };
        allPendingChanges.forEach((change, cellKey) => {
          updated[cellKey] = {
            ...updated[cellKey],
            originalValue: change.score,
            value: change.score !== null ? String(change.score) : "",
            isModified: false,
            isSaving: false,
            error: null,
          };
        });
        return updated;
      });

      setPasteMode(false);
      setPastedCells(new Set());
      setEditedCells(new Set());
      setAllPendingChanges(new Map());

      setPastePreview(`✅ បានរក្សាទុក ${changesToSave.length} cells រួចរាល់`);
      setTimeout(() => setPastePreview(null), 3000);
    } catch (error: any) {
      console.error("❌ Save all failed:", error);
      setPastePreview(`❌ មានបញ្ហាក្នុងការរក្សាទុក:  ${error.message}`);
      setTimeout(() => setPastePreview(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Cancel Paste Handler
  const handleCancelPaste = () => {
    console.log("🚫 Canceling paste mode");

    setCells((prev) => {
      const reverted = { ...prev };
      allPendingChanges.forEach((_, cellKey) => {
        const cell = prev[cellKey];
        if (cell) {
          reverted[cellKey] = {
            ...cell,
            value:
              cell.originalValue !== null ? String(cell.originalValue) : "",
            isModified: false,
            error: null,
          };
        }
      });
      return reverted;
    });

    setPasteMode(false);
    setPastedCells(new Set());
    setEditedCells(new Set());
    setAllPendingChanges(new Map());

    setPastePreview("🚫 បានបោះបង់ការផ្លាស់ប្តូរ");
    setTimeout(() => setPastePreview(null), 2000);
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => {
    const totalSubjects = sortedSubjects.length;
    const totalStudents = sortedStudents.length;

    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (studentIndex < totalStudents - 1) {
        const nextKey = `${sortedStudents[studentIndex + 1].studentId}_${
          sortedSubjects[subjectIndex].id
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (studentIndex > 0) {
        const prevKey = `${sortedStudents[studentIndex - 1].studentId}_${
          sortedSubjects[subjectIndex].id
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (subjectIndex < totalSubjects - 1) {
        const nextKey = `${sortedStudents[studentIndex].studentId}_${
          sortedSubjects[subjectIndex + 1].id
        }`;
        inputRefs.current[nextKey]?.focus();
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (subjectIndex > 0) {
        const prevKey = `${sortedStudents[studentIndex].studentId}_${
          sortedSubjects[subjectIndex - 1].id
        }`;
        inputRefs.current[prevKey]?.focus();
      }
    }
  };

  // Khmer display names
  const getKhmerShortName = (code: string): string => {
    const baseCode = code.split("-")[0];

    const khmerNames: { [key: string]: string } = {
      WRITING: "តែង.  ក្តី",
      WRITER: "ស.  អាន",
      DICTATION: "ចំ. តាម",
      KHM: "ភាសាខ្មែរ",
      MATH: "គណិត",
      PHY: "រូប",
      CHEM: "គីមី",
      BIO: "ជីវៈ",
      EARTH: "ផែនដី",
      MORAL: "សីលធម៌",
      GEO: "ភូមិ",
      HIST: "ប្រវត្តិ",
      ENG: "ភាសា",
      HLTH: "សុខភាព",
      ECON: "សេដ្ឋកិច្ច",
      HE: "គេហ",
      SPORTS: "កីឡា",
      AGRI: "កសិកម្ម",
      ICT: "ICT",
    };

    return khmerNames[baseCode] || code;
  };

  // Color coding for subject categories
  const getSubjectColor = (
    code: string,
    isEditable: boolean
  ): { header: string; cell: string } => {
    const baseCode = code.split("-")[0];

    // ✅ If not editable, use gray
    if (!isEditable) {
      return {
        header: "bg-gray-200 text-gray-600",
        cell: "bg-gray-100/50",
      };
    }

    const colors: { [key: string]: { header: string; cell: string } } = {
      WRITING: { header: "bg-blue-100 text-blue-800", cell: "bg-blue-50/30" },
      WRITER: { header: "bg-blue-100 text-blue-800", cell: "bg-blue-50/30" },
      DICTATION: { header: "bg-blue-100 text-blue-800", cell: "bg-blue-50/30" },
      KHM: { header: "bg-sky-100 text-sky-800", cell: "bg-sky-50/30" },
      ENG: { header: "bg-cyan-100 text-cyan-800", cell: "bg-cyan-50/30" },
      MATH: {
        header: "bg-purple-100 text-purple-800",
        cell: "bg-purple-50/30",
      },
      PHY: { header: "bg-indigo-100 text-indigo-800", cell: "bg-indigo-50/30" },
      CHEM: {
        header: "bg-violet-100 text-violet-800",
        cell: "bg-violet-50/30",
      },
      BIO: { header: "bg-green-100 text-green-800", cell: "bg-green-50/30" },
      EARTH: { header: "bg-teal-100 text-teal-800", cell: "bg-teal-50/30" },
      MORAL: { header: "bg-amber-100 text-amber-800", cell: "bg-amber-50/30" },
      GEO: { header: "bg-orange-100 text-orange-800", cell: "bg-orange-50/30" },
      HIST: {
        header: "bg-yellow-100 text-yellow-800",
        cell: "bg-yellow-50/30",
      },
      ECON: {
        header: "bg-emerald-100 text-emerald-800",
        cell: "bg-emerald-50/30",
      },
      HLTH: { header: "bg-rose-100 text-rose-800", cell: "bg-rose-50/30" },
      HE: { header: "bg-pink-100 text-pink-800", cell: "bg-pink-50/30" },
      SPORTS: { header: "bg-red-100 text-red-800", cell: "bg-red-50/30" },
      AGRI: { header: "bg-lime-100 text-lime-800", cell: "bg-lime-50/30" },
      ICT: {
        header: "bg-fuchsia-100 text-fuchsia-800",
        cell: "bg-fuchsia-50/30",
      },
    };

    return (
      colors[baseCode] || {
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
    return sortedStudents.map((student) => {
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
  }, [cells, sortedStudents, gridData.subjects, totalCoefficientForClass]);

  // Calculate ranks and add attendance
  const rankedStudents = useMemo(() => {
    const sorted = [...calculatedStudents]
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        absent: attendanceSummary[student.studentId]?.absent || 0,
        permission: attendanceSummary[student.studentId]?.permission || 0,
      }));

    return calculatedStudents.map((student) => {
      const ranked = sorted.find((s) => s.studentId === student.studentId);
      return {
        ...student,
        rank: ranked?.rank || 0,
        absent: ranked?.absent || 0,
        permission: ranked?.permission || 0,
      };
    });
  }, [calculatedStudents, attendanceSummary]);

  // Cell className with paste mode states
  const getCellClassName = (cell: CellState, cellKey: string) => {
    const baseClass =
      "w-16 h-9 px-2 text-center text-sm font-semibold border rounded focus:outline-none focus:ring-2 transition-all";

    // ✅ If not editable
    if (!cell.isEditable) {
      return `${baseClass} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
    }

    // In paste mode
    if (pasteMode) {
      if (pastedCells.has(cellKey) && editedCells.has(cellKey)) {
        return `${baseClass} bg-orange-100 border-orange-400 font-bold text-orange-900 ring-2 ring-orange-300`;
      }
      if (pastedCells.has(cellKey)) {
        return `${baseClass} bg-yellow-100 border-yellow-400 font-bold text-yellow-900`;
      }
      if (editedCells.has(cellKey)) {
        return `${baseClass} bg-blue-100 border-blue-400 font-bold text-blue-900`;
      }
    }

    // Normal mode
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
    // ✅ Show lock icon for non-editable cells
    if (!cell.isEditable) {
      return <Lock className="w-3. 5 h-3.5 text-gray-400" />;
    }

    if (cell.isSaving)
      return <Loader2 className="w-3. 5 h-3.5 text-amber-600 animate-spin" />;
    if (cell.error) return <X className="w-3.5 h-3.5 text-red-600" />;
    if (cell.value && !cell.isModified && !cell.isSaving)
      return <Check className="w-3.5 h-3.5 text-green-600" />;
    return null;
  };

  // ✅ Count editable vs view-only subjects
  const subjectStats = useMemo(() => {
    const editable = sortedSubjects.filter((s) => s.isEditable).length;
    const viewOnly = sortedSubjects.length - editable;
    return { editable, viewOnly, total: sortedSubjects.length };
  }, [sortedSubjects]);

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative">
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
                    {sortedStudents.length} សិស្ស
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">
                    Coef: {totalCoefficientForClass}
                  </span>
                </div>
                {/* ✅ Show edit permissions for teachers */}
                {currentUser?.role === "TEACHER" && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">
                      {subjectStats.editable}/{subjectStats.total} កែបាន
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            {pasteMode ? (
              <p className="text-sm font-bold text-white/90">📋 Paste Mode</p>
            ) : (
              <p className="text-sm font-bold text-white/90">Auto-Save ✓</p>
            )}
            <p className="text-xs text-white/70 mt-1">
              {pasteMode
                ? "កែសម្រួល ហើយចុច រក្សាទុក"
                : "រក្សាទុកស្វ័យប្រវត្តិ • គណនាលទ្ធផលភ្លាមៗ"}
            </p>
          </div>
        </div>
      </div>

      {/* Ordering Message */}
      {orderingMessage && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 px-6 py-2">
          <p className="text-sm font-semibold text-blue-800">
            {orderingMessage}
          </p>
        </div>
      )}

      {/* Paste Preview Notification */}
      {pastePreview && (
        <div
          className={`border-b-2 px-6 py-3 ${
            pastePreview.includes("❌")
              ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
              : pastePreview.includes("✅")
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <ClipboardPaste
              className={`w-5 h-5 ${
                pastePreview.includes("❌")
                  ? "text-red-600"
                  : pastePreview.includes("✅")
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            />
            <p
              className={`text-sm font-semibold ${
                pastePreview.includes("❌")
                  ? "text-red-800"
                  : pastePreview.includes("✅")
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}
            >
              {pastePreview}
            </p>
          </div>
        </div>
      )}

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

              {/* Subject Columns */}
              {sortedSubjects.map((subject) => {
                const colors = getSubjectColor(
                  subject.code,
                  subject.isEditable || false
                );
                const khmerName = getKhmerShortName(subject.code);

                return (
                  <th
                    key={subject.id}
                    className={`px-3 py-3 text-center text-sm font-bold border-b-2 border-r border-gray-300 min-w-[70px] ${colors.header}`}
                    title={`${subject.nameKh} (Max: ${
                      subject.maxScore
                    }, Coefficient: ${subject.coefficient})${
                      !subject.isEditable ? " - មើលប៉ុណ្ណោះ" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {/* ✅ Show lock icon for view-only subjects */}
                      {!subject.isEditable && <Lock className="w-3 h-3" />}
                      <span>{khmerName}</span>
                    </div>
                  </th>
                );
              })}

              {/* Summary Columns */}
              <th className="px-3 py-3 text-center text-sm font-bold text-blue-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-blue-100">
                សរុប
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-green-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-green-100">
                ម. ភាគ
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-yellow-800 border-b-2 border-r border-gray-300 min-w-[65px] bg-yellow-100">
                និទ្ទេស
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold text-indigo-800 border-b-2 border-r border-gray-300 min-w-[70px] bg-indigo-100">
                ចំ. ថ្នាក់
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-red-800 border-b-2 border-r border-gray-300 w-12 bg-red-100">
                អ. ច្បាប់
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
                    className={`sticky left-0 z-10 ${rowBg} hover:bg-indigo-50/50 px-3 py-2.  5 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200`}
                  >
                    {studentIndex + 1}
                  </td>
                  <td
                    className={`sticky left-12 z-10 ${rowBg} hover: bg-indigo-50/50 px-4 py-2. 5 text-sm font-semibold text-gray-800 border-b border-r border-gray-200`}
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

                  {/* Grade Cells */}
                  {sortedSubjects.map((subject, subjectIndex) => {
                    const cellKey = `${student.studentId}_${subject.id}`;
                    const cell = cells[cellKey];
                    const colors = getSubjectColor(
                      subject.code,
                      subject.isEditable || false
                    );

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
                            onPaste={(e) =>
                              handlePaste(e, studentIndex, subjectIndex)
                            }
                            disabled={isLoading || saving || !cell.isEditable} // ✅ ADDED:  Disable non-editable
                            className={getCellClassName(cell, cellKey)}
                            placeholder="-"
                            title={
                              !cell.isEditable
                                ? "មើលប៉ុណ្ណោះ - អ្នកមិនអាចកែមុខវិជ្ជានេះបានទេ"
                                : ""
                            }
                          />
                          <div className="w-3.  5 flex-shrink-0">
                            {getStatusIcon(cell)}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Summary Columns */}
                  <td className="px-3 py-2. 5 text-center text-sm font-bold border-b border-r border-gray-200 bg-blue-50/50 text-blue-700">
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
          {pasteMode ? (
            <>
              <div className="flex items-center gap-1.  5">
                <div className="w-5 h-5 bg-yellow-100 border-2 border-yellow-400 rounded" />
                <span>បានបញ្ចូល</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-orange-100 border-2 border-orange-400 rounded" />
                <span>បានកែសម្រួល</span>
              </div>
            </>
          ) : (
            <>
              {/* ✅ ADDED: Legend for non-editable */}
              {currentUser?.role === "TEACHER" && (
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>មើលប៉ុណ្ណោះ</span>
                </div>
              )}
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
            </>
          )}
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-300">
            <ClipboardPaste className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-semibold">
              Ctrl+V ដើម្បី Paste ពី Excel
            </span>
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

      {/* Floating Save Panel - Only in Paste Mode */}
      {pasteMode && allPendingChanges.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-6 min-w-[420px]">
            <div className="flex items-start justify-between mb-4">
              <div className="text-white">
                <p className="text-lg font-black flex items-center gap-2">
                  📋 ទិន្នន័យរង់ចាំរក្សាទុក
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                </p>
                <div className="mt-3 space-y-1.  5 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-yellow-300 rounded"></span>
                    បានបញ្ចូលពី Excel:{" "}
                    <span className="font-bold">{pastedCells.size}</span> cells
                  </p>
                  {editedCells.size > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-orange-300 rounded"></span>
                      បានកែសម្រួល:{" "}
                      <span className="font-bold">{editedCells.size}</span>{" "}
                      cells
                    </p>
                  )}
                  <p className="text-white/90 mt-3 pt-3 border-t border-white/30">
                    សរុបទាំងអស់:{" "}
                    <span className="font-black text-2xl">
                      {allPendingChanges.size}
                    </span>{" "}
                    cells
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelPaste}
                disabled={saving}
                className="text-white/80 hover:text-white disabled:opacity-50 transition-colors"
                title="បិទ"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelPaste}
                disabled={saving}
                className="flex-1 px-5 py-3. 5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                បោះបង់
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex-1 px-6 py-3.5 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-blue-600 font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>កំពុងរក្សា... </span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>រក្សាទុកទាំងអស់</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

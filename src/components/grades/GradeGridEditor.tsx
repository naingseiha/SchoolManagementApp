"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Lock } from "lucide-react";
import type { GradeGridData, BulkSaveGradeItem } from "@/lib/api/grades";
import { attendanceApi } from "@/lib/api/attendance";
import { getOrderingMessage } from "@/lib/subjectOrder";

import { GridHeader } from "./GridHeader";
import { PasteNotification } from "./PasteNotification";
import { GradeCell } from "./GradeCell";
import { GridFooter } from "./GridFooter";
import { FloatingSavePanel } from "./FloatingSavePanel";
import { useGradeSorting } from "./useGradeSorting";
import { useGradeCalculations } from "./useGradeCalculations";
import { useGradeHandlers } from "./useGradeHandlers";
import {
  getKhmerShortName,
  getSubjectColor,
  getGradeLevelColor,
} from "./subjectUtils";
import { usePasteHandler } from "./usePasteHandler";
import { useAutoSave } from "./useAutoSave";
import type { CellState } from "./types";

// Around line 15-20, UPDATE interface:

interface GradeGridEditorProps {
  gridData: GradeGridData;
  onSave: (grades: BulkSaveGradeItem[], isAutoSave?: boolean) => Promise<void>;
  isLoading?: boolean;
  currentUser?: any;
}

export default function GradeGridEditor({
  gridData,
  onSave,
  isLoading = false,
  currentUser,
}: GradeGridEditorProps) {
  const [cells, setCells] = useState<{ [key: string]: CellState }>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const [pastePreview, setPastePreview] = useState<string | null>(null);

  const [pasteMode, setPasteMode] = useState(false);
  const [pastedCells, setPastedCells] = useState<Set<string>>(new Set());
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  const [allPendingChanges, setAllPendingChanges] = useState<
    Map<string, BulkSaveGradeItem>
  >(new Map());
  const [saving, setSaving] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    [studentId: string]: { absent: number; permission: number };
  }>({});

  // Use custom hooks
  const { sortedSubjects, sortedStudents } = useGradeSorting(
    gridData.subjects,
    gridData.students,
    gridData.className
  );

  const totalCoefficientForClass = useMemo(() => {
    return parseFloat(
      gridData.subjects
        .reduce((sum, subject) => sum + subject.coefficient, 0)
        .toFixed(2)
    );
  }, [gridData.subjects]);

  const { rankedStudents } = useGradeCalculations(
    sortedStudents,
    gridData.subjects,
    cells,
    totalCoefficientForClass,
    attendanceSummary
  );

  const { handleCellChange, handleKeyDown } = useGradeHandlers(
    cells,
    setCells,
    sortedSubjects,
    pasteMode,
    setEditedCells,
    setAllPendingChanges,
    setPendingChanges
  );

  const { handlePaste } = usePasteHandler(
    cells,
    setCells,
    sortedStudents,
    sortedSubjects,
    setPasteMode,
    setPastedCells,
    setAllPendingChanges,
    setPendingChanges,
    setPastePreview,
    pasteMode
  );

  const { handleAutoSave } = useAutoSave(
    pendingChanges,
    cells,
    setCells,
    setPendingChanges,
    onSave,
    pasteMode
  );

  const orderingMessage = useMemo(() => {
    const gradeMatch = gridData.className?.match(/^(\d+)/);
    const grade = gradeMatch ? parseInt(gradeMatch[1]) : undefined;
    return getOrderingMessage(grade);
  }, [gridData.className]);

  const subjectStats = useMemo(() => {
    const editable = sortedSubjects.filter((s) => s.isEditable).length;
    const viewOnly = sortedSubjects.length - editable;
    return { editable, viewOnly, total: sortedSubjects.length };
  }, [sortedSubjects]);

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
          isEditable: subject.isEditable,
        };
      });
    });

    setCells(initialCells);
  }, [gridData, sortedStudents, sortedSubjects]);

  // Fetch attendance
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const summary = await attendanceApi.getMonthlySummary(
          gridData.classId,
          gridData.month,
          gridData.year
        );
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
    if (pasteMode || pendingChanges.size === 0) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pendingChanges, pasteMode, handleAutoSave]);

  const handleSaveAll = async () => {
    if (allPendingChanges.size === 0) return;

    try {
      const changesToSave = Array.from(allPendingChanges.values());
      setSaving(true);
      await onSave(changesToSave);

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
      setPastePreview(`❌ មានបញ្ហាក្នុងការរក្សាទុក:  ${error.message}`);
      setTimeout(() => setPastePreview(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPaste = () => {
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

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative">
      <GridHeader
        className={gridData.className}
        month={gridData.month}
        year={gridData.year}
        studentCount={sortedStudents.length}
        totalCoefficient={totalCoefficientForClass}
        pasteMode={pasteMode}
        currentUserRole={currentUser?.role}
        editableCount={subjectStats.editable}
        totalSubjects={subjectStats.total}
      />

      {orderingMessage && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 px-6 py-2">
          <p className="text-sm font-semibold text-blue-800">
            {orderingMessage}
          </p>
        </div>
      )}

      {pastePreview && <PasteNotification message={pastePreview} />}

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
                    title={`${subject.nameKh} (Max:  ${
                      subject.maxScore
                    }, Coefficient: ${subject.coefficient})${
                      !subject.isEditable ? " - មើលប៉ុណ្ណោះ" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {!subject.isEditable && <Lock className="w-3 h-3" />}
                      <span>{khmerName}</span>
                    </div>
                  </th>
                );
              })}

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
                ម. ច្បាប់
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
                        <GradeCell
                          cell={cell}
                          cellKey={cellKey}
                          studentIndex={studentIndex}
                          subjectIndex={subjectIndex}
                          pasteMode={pasteMode}
                          pastedCells={pastedCells}
                          editedCells={editedCells}
                          isLoading={isLoading}
                          saving={saving}
                          onCellChange={handleCellChange}
                          onKeyDown={(e, si, subi) =>
                            handleKeyDown(
                              e,
                              si,
                              subi,
                              sortedStudents.length,
                              sortedSubjects.length,
                              sortedStudents,
                              inputRefs
                            )
                          }
                          onPaste={handlePaste}
                          inputRef={(el) => {
                            if (el) inputRefs.current[cellKey] = el;
                          }}
                        />
                      </td>
                    );
                  })}

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

      <GridFooter pasteMode={pasteMode} currentUserRole={currentUser?.role} />

      {pasteMode && allPendingChanges.size > 0 && (
        <FloatingSavePanel
          pastedCount={pastedCells.size}
          editedCount={editedCells.size}
          totalChanges={allPendingChanges.size}
          saving={saving}
          onSave={handleSaveAll}
          onCancel={handleCancelPaste}
        />
      )}
    </div>
  );
}

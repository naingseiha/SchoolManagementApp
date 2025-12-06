"use client";

import { useState, useEffect } from "react";
import StudentGridRow, { StudentRowData } from "./StudentGridRow";
import {
  Loader2,
  Save,
  Plus,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { parseDate, formatToKhmerDate } from "@/lib/utils/dateParser";
import { studentsApi } from "@/lib/api/students";

interface BulkStudentGridProps {
  classId: string;
  grade: string;
  onSave: (students: StudentRowData[]) => Promise<void>;
}

export default function BulkStudentGrid({
  classId,
  grade,
  onSave,
}: BulkStudentGridProps) {
  const [rows, setRows] = useState<StudentRowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [existingStudentsCount, setExistingStudentsCount] = useState(0);

  useEffect(() => {
    if (classId) {
      loadExistingStudents();
    }
  }, [classId]);

  useEffect(() => {
    const handleMultiRowPaste = (e: any) => {
      const { startRow, startField, data } = e.detail;
      handlePasteData(startRow, startField, data);
    };

    window.addEventListener("multiRowPaste", handleMultiRowPaste);
    return () =>
      window.removeEventListener("multiRowPaste", handleMultiRowPaste);
  }, [rows, grade]);

  const loadExistingStudents = async () => {
    try {
      setLoadingStudents(true);
      setSaveStatus("📥 Loading existing students...");

      const allStudents = await studentsApi.getAll();
      const classStudents = allStudents.filter((s) => s.classId === classId);

      if (classStudents.length > 0) {
        const studentRows: StudentRowData[] = classStudents.map(
          (student, index) => {
            let studentName = "";

            if (student.name) {
              studentName = student.name;
            } else if (
              (student as any).firstName ||
              (student as any).lastName
            ) {
              const firstName = (student as any).firstName || "";
              const lastName = (student as any).lastName || "";
              studentName = `${lastName} ${firstName}`.trim();
            } else if ((student as any).khmerName) {
              studentName = (student as any).khmerName;
            }

            return {
              no: index + 1,
              id: student.id,
              name: studentName,
              gender:
                student.gender === "male"
                  ? "ប"
                  : student.gender === "female"
                  ? "ស"
                  : student.gender || "",
              dateOfBirth: student.dateOfBirth
                ? formatToKhmerDate(student.dateOfBirth)
                : "",
              previousGrade: (student as any).previousGrade || "",
              previousSchool: (student as any).previousSchool || "",
              repeatingGrade: (student as any).repeatingGrade || "",
              transferredFrom: (student as any).transferredFrom || "",
              remarks: (student as any).remarks || "",
              grade9ExamSession: (student as any).grade9ExamSession || "",
              grade9ExamCenter: (student as any).grade9ExamCenter || "",
              grade9ExamRoom: (student as any).grade9ExamRoom || "",
              grade9ExamDesk: (student as any).grade9ExamDesk || "",
              grade12ExamSession: (student as any).grade12ExamSession || "",
              grade12ExamCenter: (student as any).grade12ExamCenter || "",
              grade12ExamRoom: (student as any).grade12ExamRoom || "",
              grade12ExamDesk: (student as any).grade12ExamDesk || "",
              grade12Track: (student as any).grade12Track || "",
            };
          }
        );

        setExistingStudentsCount(studentRows.length);
        const emptyRows = createEmptyRows(10, studentRows.length);
        setRows([...studentRows, ...emptyRows]);

        setSaveStatus(`✅ Loaded ${studentRows.length} existing students`);
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setExistingStudentsCount(0);
        const emptyRows = createEmptyRows(10, 0);
        setRows(emptyRows);
        setSaveStatus(
          "ℹ️ No existing students found.  Ready to add new students."
        );
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (error: any) {
      console.error("❌ Failed to load students:", error);
      setSaveStatus(`❌ Failed to load students: ${error.message}`);
      setTimeout(() => setSaveStatus(""), 5000);

      const emptyRows = createEmptyRows(10, 0);
      setRows(emptyRows);
    } finally {
      setLoadingStudents(false);
    }
  };

  const createEmptyRows = (
    count: number,
    startIndex: number
  ): StudentRowData[] => {
    const newRows: StudentRowData[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        no: startIndex + i + 1,
        name: "",
        gender: "",
        dateOfBirth: "",
        previousGrade: "",
        previousSchool: "",
        repeatingGrade: "",
        transferredFrom: "",
        remarks: "",
      });
    }
    return newRows;
  };

  const addEmptyRows = (count: number) => {
    const emptyRows = createEmptyRows(count, rows.length);
    setRows([...rows, ...emptyRows]);
  };

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };
    setRows(updatedRows);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    const renumbered = updatedRows.map((row, index) => ({
      ...row,
      no: index + 1,
    }));
    setRows(renumbered);

    if (rowIndex < existingStudentsCount) {
      setExistingStudentsCount((prev) => prev - 1);
    }
  };

  const getFieldOrder = (grade: string): string[] => {
    const baseFields = [
      "name",
      "gender",
      "dateOfBirth",
      "previousGrade",
      "previousSchool",
      "repeatingGrade",
      "transferredFrom",
    ];

    const gradeNum = parseInt(grade);

    if (gradeNum >= 9) {
      baseFields.push(
        "grade9ExamSession",
        "grade9ExamCenter",
        "grade9ExamRoom",
        "grade9ExamDesk"
      );
    }

    if (gradeNum >= 12) {
      baseFields.push(
        "grade12ExamSession",
        "grade12ExamCenter",
        "grade12ExamRoom",
        "grade12ExamDesk",
        "grade12Track"
      );
    }

    baseFields.push("remarks");

    return baseFields;
  };

  const handlePasteData = (
    startRow: number,
    startField: string,
    data: string[][]
  ) => {
    const updatedRows = [...rows];
    const requiredRows = startRow + data.length;

    if (requiredRows > rows.length) {
      const rowsToAdd = requiredRows - rows.length;
      const emptyRows = createEmptyRows(rowsToAdd, rows.length);
      updatedRows.push(...emptyRows);
    }

    const fields = getFieldOrder(grade);
    const startFieldIndex = fields.indexOf(startField);

    if (startFieldIndex === -1) {
      console.warn(`Field "${startField}" not found in field order`);
      return;
    }

    data.forEach((rowData, rowOffset) => {
      const rowIndex = startRow + rowOffset;
      if (rowIndex < updatedRows.length) {
        rowData.forEach((cellValue, colOffset) => {
          const fieldIndex = startFieldIndex + colOffset;
          if (fieldIndex < fields.length) {
            const fieldName = fields[fieldIndex];
            updatedRows[rowIndex] = {
              ...updatedRows[rowIndex],
              [fieldName]: cellValue || "",
            };
          }
        });
      }
    });

    setRows(updatedRows);
  };

  const handleSave = async () => {
    const validRows = rows.filter(
      (row) =>
        row.name.trim() !== "" &&
        row.gender.trim() !== "" &&
        row.dateOfBirth.trim() !== ""
    );

    if (validRows.length === 0) {
      setSaveStatus("⚠️ No valid data to save");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    const errors: string[] = [];
    validRows.forEach((row) => {
      try {
        parseDate(row.dateOfBirth);
      } catch (error: any) {
        errors.push(`Row ${row.no}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      setSaveStatus(`❌ ${errors[0]}`);
      setTimeout(() => setSaveStatus(""), 5000);
      return;
    }

    setLoading(true);
    setSaveStatus("💾 Saving...");

    try {
      const existingStudents = validRows.filter((row) => row.id);
      const newStudents = validRows.filter((row) => !row.id);

      let updatedCount = 0;
      let createdCount = 0;

      if (existingStudents.length > 0) {
        setSaveStatus(
          `💾 Updating ${existingStudents.length} existing students...`
        );

        for (const student of existingStudents) {
          try {
            await studentsApi.update(student.id!, {
              name: student.name,
              gender:
                student.gender === "ប"
                  ? "male"
                  : student.gender === "ស"
                  ? "female"
                  : student.gender,
              dateOfBirth: parseDate(student.dateOfBirth),
              previousGrade: student.previousGrade,
              previousSchool: student.previousSchool,
              repeatingGrade: student.repeatingGrade,
              transferredFrom: student.transferredFrom,
              remarks: student.remarks,
              grade9ExamSession: student.grade9ExamSession,
              grade9ExamCenter: student.grade9ExamCenter,
              grade9ExamRoom: student.grade9ExamRoom,
              grade9ExamDesk: student.grade9ExamDesk,
              grade12ExamSession: student.grade12ExamSession,
              grade12ExamCenter: student.grade12ExamCenter,
              grade12ExamRoom: student.grade12ExamRoom,
              grade12ExamDesk: student.grade12ExamDesk,
              grade12Track: student.grade12Track,
            });
            updatedCount++;
          } catch (error: any) {
            console.error(`Failed to update student ${student.id}:`, error);
          }
        }
      }

      if (newStudents.length > 0) {
        setSaveStatus(`💾 Creating ${newStudents.length} new students...`);
        await onSave(newStudents);
        createdCount = newStudents.length;
      }

      const messages = [];
      if (updatedCount > 0) messages.push(`${updatedCount} updated`);
      if (createdCount > 0) messages.push(`${createdCount} created`);

      setSaveStatus(`✅ Success: ${messages.join(", ")}! `);

      setTimeout(() => {
        loadExistingStudents();
        setSaveStatus("");
      }, 2000);
    } catch (error: any) {
      setSaveStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setSaveStatus(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getColumnHeaders = () => {
    const baseHeaders = [
      {
        key: "no",
        label: "ល. រ",
        width: "w-16",
        sticky: true,
        color: "bg-slate-100",
      },
      {
        key: "name",
        label: "គោត្តនាម និង នាម",
        width: "min-w-[200px]",
        required: true,
        color: "bg-rose-50",
      },
      {
        key: "gender",
        label: "ភេទ",
        width: "w-16",
        required: true,
        color: "bg-sky-50",
      },
      {
        key: "dateOfBirth",
        label: "ថ្ងៃ ខែ ឆ្នាំកំណើត",
        width: "w-32",
        required: true,
        color: "bg-amber-50",
      },
      {
        key: "previousGrade",
        label: "ឡើងពីថ្នាក់",
        width: "w-28",
        color: "bg-emerald-50",
      },
      {
        key: "previousSchool",
        label: "មកពីសាលា",
        width: "min-w-[160px]",
        color: "bg-violet-50",
      },
      {
        key: "repeatingGrade",
        label: "ត្រួតថ្នាក់ទី",
        width: "w-28",
        color: "bg-orange-50",
      },
      {
        key: "transferredFrom",
        label: "ផ្ទេរមកពី",
        width: "min-w-[160px]",
        color: "bg-cyan-50",
      },
    ];

    const gradeNum = parseInt(grade);

    if (gradeNum >= 9) {
      baseHeaders.push(
        {
          key: "grade9ExamSession",
          label: "សម័យប្រឡងទី៩",
          width: "w-32",
          color: "bg-pink-50",
        },
        {
          key: "grade9ExamCenter",
          label: "មណ្ឌលប្រឡង",
          width: "min-w-[160px]",
          color: "bg-fuchsia-50",
        },
        {
          key: "grade9ExamRoom",
          label: "បន្ទប់",
          width: "w-20",
          color: "bg-purple-50",
        },
        {
          key: "grade9ExamDesk",
          label: "លេខតុ",
          width: "w-20",
          color: "bg-indigo-50",
        }
      );
    }

    if (gradeNum >= 12) {
      baseHeaders.push(
        {
          key: "grade12ExamSession",
          label: "សម័យប្រឡងទី១២",
          width: "w-32",
          color: "bg-lime-50",
        },
        {
          key: "grade12ExamCenter",
          label: "មណ្ឌលប្រឡង",
          width: "min-w-[160px]",
          color: "bg-teal-50",
        },
        {
          key: "grade12ExamRoom",
          label: "បន្ទប់",
          width: "w-20",
          color: "bg-blue-50",
        },
        {
          key: "grade12ExamDesk",
          label: "លេខតុ",
          width: "w-20",
          color: "bg-slate-50",
        },
        {
          key: "grade12Track",
          label: "ផ្លូវ",
          width: "w-32",
          color: "bg-zinc-50",
        }
      );
    }

    baseHeaders.push(
      {
        key: "remarks",
        label: "ផ្សេងៗ",
        width: "min-w-[160px]",
        color: "bg-gray-50",
      },
      {
        key: "actions",
        label: "Actions",
        width: "w-20",
        sticky: true,
        color: "bg-slate-100",
      }
    );

    return baseHeaders;
  };

  return (
    <div className="space-y-4">
      {/* ✅ Clean Info Banner */}
      {existingStudentsCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-emerald-900 mb-0. 5">
                រកឃើញសិស្សដែលមានរួចហើយ{" "}
                <span className="text-emerald-600">
                  {existingStudentsCount} នាក់
                </span>
              </h3>
              <p className="text-xs text-emerald-700">
                អ្នកអាចកែប្រែទិន្នន័យសិស្សដែលមានរួច (ជួរពណ៌ខៀវ)
                ឬបន្ថែមសិស្សថ្មីនៅជួរទំនេរខាងក្រោម
              </p>
            </div>
            <button
              onClick={loadExistingStudents}
              disabled={loadingStudents}
              className="flex-shrink-0 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingStudents ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">ផ្ទុកឡើងវិញ</span>
            </button>
          </div>
        </div>
      )}

      {/* ✅ Clean Control Panel - Consistent Height */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Left Side */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => addEmptyRows(10)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              បន្ថែម 10 ជួរ
            </button>

            <div className="h-10 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">សរុប:</span>
              <span className="text-base font-bold text-gray-900">
                {rows.length}
              </span>
              <span className="text-xs text-gray-500">ជួរ</span>
              {existingStudentsCount > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {existingStudentsCount} ចាស់
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
            {saveStatus && (
              <div className="h-10 px-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Loader2 className="w-3. 5 h-3.5 animate-spin flex-shrink-0" />
                <span className="truncate">{saveStatus}</span>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || loadingStudents}
              className="h-10 px-5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  រក្សាទុកទាំងអស់
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Clean Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-blue-900 mb-2">
              💡 របៀបប្រើប្រាស់
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>ពណ៌នីមួយៗ = Column នីមួយៗ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Click លើ cell ដើម្បីកែប្រែ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>
                  Paste ពី Excel ដោយ{" "}
                  <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-[10px] font-mono">
                    Ctrl+V
                  </kbd>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  4
                </span>
                <span>
                  ពណ៌ <strong>លឿង</strong> = ត្រូវការបំពេញ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  5
                </span>
                <span>
                  ពណ៌ <strong>ខៀវ</strong> = សិស្សចាស់
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  6
                </span>
                <span>
                  កាលបរិច្ឆេទ:{" "}
                  <code className="px-1 bg-white border border-blue-200 rounded text-[10px] font-mono">
                    DD/MM/YY
                  </code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Table with Minimal Shadow */}
      {loadingStudents ? (
        <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-semibold">
            កំពុងផ្ទុកទិន្នន័យសិស្ស...{" "}
          </p>
          <p className="text-xs text-gray-500 mt-1">សូមរង់ចាំបន្តិច</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {getColumnHeaders().map((header) => (
                    <th
                      key={header.key}
                      className={`
                        ${header.width} 
                        px-3 py-3
                        text-left text-[11px] font-bold uppercase tracking-wide
                        border-b-2 border-r border-gray-300
                        ${header.sticky ? "sticky z-20" : ""}
                        ${header.sticky && header.key === "no" ? "left-0" : ""}
                        ${
                          header.sticky && header.key === "actions"
                            ? "right-0"
                            : ""
                        }
                        ${header.color || "bg-gray-100"}
                        ${header.required ? "text-red-700" : "text-gray-700"}
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {header.required && (
                          <span className="text-red-500 text-sm font-black">
                            *
                          </span>
                        )}
                        <span>{header.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.map((row, index) => (
                  <StudentGridRow
                    key={row.id || `new-${index}`}
                    rowIndex={index}
                    data={row}
                    grade={grade}
                    onChange={handleCellChange}
                    onDelete={handleDeleteRow}
                    isExisting={!!row.id}
                    columnHeaders={getColumnHeaders()}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import StudentGridRow, { StudentRowData } from "./StudentGridRow";
import { Loader2, Save, Plus, Download } from "lucide-react";
import { parseDate } from "@/lib/utils/dateParser";

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
  const [saveStatus, setSaveStatus] = useState<string>("");

  useEffect(() => {
    if (rows.length === 0) {
      addEmptyRows(10);
    }
  }, []);

  useEffect(() => {
    const handleMultiRowPaste = (e: any) => {
      const { startRow, data } = e.detail;
      handlePasteData(startRow, data);
    };

    window.addEventListener("multiRowPaste", handleMultiRowPaste);
    return () =>
      window.removeEventListener("multiRowPaste", handleMultiRowPaste);
  }, [rows]);

  const addEmptyRows = (count: number) => {
    const newRows: StudentRowData[] = [];
    const startIndex = rows.length;

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

    setRows([...rows, ...newRows]);
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
  };

  const handlePasteData = (startRow: number, data: string[][]) => {
    const updatedRows = [...rows];
    const requiredRows = startRow + data.length;

    if (requiredRows > rows.length) {
      addEmptyRows(requiredRows - rows.length);
    }

    data.forEach((rowData, i) => {
      const rowIndex = startRow + i;
      if (rowIndex < updatedRows.length) {
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          name: rowData[0] || "",
          gender: rowData[1] || "",
          dateOfBirth: rowData[2] || "",
          previousGrade: rowData[3] || "",
          previousSchool: rowData[4] || "",
          repeatingGrade: rowData[5] || "",
          transferredFrom: rowData[6] || "",
          remarks: rowData[7] || "",
        };
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
    validRows.forEach((row, index) => {
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
      await onSave(validRows);
      setSaveStatus(`✅ Successfully saved ${validRows.length} students! `);

      setTimeout(() => {
        setRows([]);
        addEmptyRows(10);
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
      { key: "no", label: "ល. រ", width: "w-12" },
      { key: "name", label: "គោត្តនាម-នាម *", width: "w-48" },
      { key: "gender", label: "ភេទ *", width: "w-16" },
      { key: "dateOfBirth", label: "ថ្ងៃខែឆ្នាំកំណើត *", width: "w-28" },
      { key: "previousGrade", label: "ឡើងពីថ្នាក់", width: "w-24" },
      { key: "previousSchool", label: "មកពីសាលា", width: "w-32" },
      { key: "repeatingGrade", label: "ត្រួតថ្នាក់ទី", width: "w-24" },
      { key: "transferredFrom", label: "ផ្ទេរមកពី", width: "w-32" },
    ];

    const gradeNum = parseInt(grade);

    if (gradeNum >= 9) {
      baseHeaders.push(
        { key: "grade9ExamSession", label: "សម័យប្រឡងទី៩", width: "w-24" },
        { key: "grade9ExamCenter", label: "មណ្ឌលប្រឡង", width: "w-32" },
        { key: "grade9ExamRoom", label: "បន្ទប់", width: "w-20" },
        { key: "grade9ExamDesk", label: "លេខតុ", width: "w-20" }
      );
    }

    if (gradeNum >= 12) {
      baseHeaders.push(
        { key: "grade12ExamSession", label: "សម័យប្រឡងទី១២", width: "w-24" },
        { key: "grade12ExamCenter", label: "មណ្ឌលប្រឡង", width: "w-32" },
        { key: "grade12ExamRoom", label: "បន្ទប់", width: "w-20" },
        { key: "grade12ExamDesk", label: "លេខតុ", width: "w-20" },
        { key: "grade12Track", label: "ផ្លូវ", width: "w-24" }
      );
    }

    baseHeaders.push(
      { key: "remarks", label: "ផ្សេងៗ", width: "w-40" },
      { key: "actions", label: "Actions", width: "w-16" }
    );

    return baseHeaders;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => addEmptyRows(10)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add 10 Rows
          </button>

          <div className="text-sm text-gray-600 font-medium">
            Total:{" "}
            <span className="font-bold text-gray-900">{rows.length}</span> rows
          </div>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus && (
            <div className="text-sm font-semibold px-4 py-2 bg-blue-50 text-blue-800 rounded-lg">
              {saveStatus}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-sm text-blue-900 font-medium">
          <strong>💡 How to use:</strong>
          <br />
          1. Copy data from Excel (Ctrl+C)
          <br />
          2. Click on first cell and paste (Ctrl+V)
          <br />
          3. Data will auto-fill multiple rows
          <br />
          4. Required fields (*) must be filled
          <br />
          5. Date format: DD/MM/YY (e.g., 7/5/12)
          <br />
          6. Click "Save All" when done
        </p>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-20">
            <tr>
              {getColumnHeaders().map((header) => (
                <th
                  key={header.key}
                  className={`${header.width} px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <StudentGridRow
                key={index}
                rowIndex={index}
                data={row}
                grade={grade}
                onChange={handleCellChange}
                onDelete={handleDeleteRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

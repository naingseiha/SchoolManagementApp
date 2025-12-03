"use client";

import { useState, useRef, useEffect } from "react";
import { formatToKhmerDate } from "@/lib/utils/dateParser";

interface StudentGridRowProps {
  rowIndex: number;
  data: StudentRowData;
  grade: string;
  onChange: (rowIndex: number, field: string, value: string) => void;
  onDelete: (rowIndex: number) => void;
}

export interface StudentRowData {
  no: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  previousGrade?: string;
  previousSchool?: string;
  repeatingGrade?: string;
  transferredFrom?: string;
  remarks?: string;
  // Grade 9 fields
  grade9ExamSession?: string;
  grade9ExamCenter?: string;
  grade9ExamRoom?: string;
  grade9ExamDesk?: string;
  // Grade 12 fields
  grade12ExamSession?: string;
  grade12ExamCenter?: string;
  grade12ExamRoom?: string;
  grade12ExamDesk?: string;
  grade12Track?: string;
}

export default function StudentGridRow({
  rowIndex,
  data,
  grade,
  onChange,
  onDelete,
}: StudentGridRowProps) {
  const [localData, setLocalData] = useState(data);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Update local data when prop changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    onChange(rowIndex, field, value);
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startField: string
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const rows = pastedData.split("\n").filter((row) => row.trim() !== "");

    if (rows.length === 0) return;

    const cells = rows[0].split("\t");

    // Get field order based on grade
    const fields = getFieldOrder(grade);
    const startIndex = fields.indexOf(startField);

    if (startIndex === -1) return;

    // Fill current row
    cells.forEach((cell, i) => {
      const fieldIndex = startIndex + i;
      if (fieldIndex < fields.length) {
        const field = fields[fieldIndex];
        handleChange(field, cell.trim());
      }
    });

    // If multiple rows pasted, notify parent to handle
    if (rows.length > 1) {
      const allData = rows.map((row) =>
        row.split("\t").map((cell) => cell.trim())
      );
      window.dispatchEvent(
        new CustomEvent("multiRowPaste", {
          detail: { startRow: rowIndex, data: allData },
        })
      );
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

  const getCellClassName = (field: string, value: string) => {
    const isRequired = ["name", "gender", "dateOfBirth"].includes(field);
    const isEmpty = !value || value.trim() === "";

    let className =
      "px-2 py-1. 5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ";

    if (isRequired && isEmpty) {
      className += "bg-yellow-50 border-yellow-400";
    } else if (!isEmpty) {
      className += "bg-white";
    } else {
      className += "bg-gray-50";
    }

    return className;
  };

  const renderCell = (field: string, label: string, width: string = "w-32") => {
    let displayValue = localData[field as keyof StudentRowData] || "";

    // ✅ Format date for display (convert ISO to DD/MM/YYYY for better UX)
    if (field === "dateOfBirth" && displayValue) {
      try {
        // If it's ISO format (YYYY-MM-DD), convert to DD/MM/YYYY for display
        if (/^\d{4}-\d{2}-\d{2}$/.test(displayValue as string)) {
          displayValue = formatToKhmerDate(displayValue as string);
        }
      } catch (e) {
        // Keep original if parsing fails
      }
    }

    return (
      <input
        ref={(el) => (inputRefs.current[field] = el)}
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(field, e.target.value)}
        onPaste={(e) => handlePaste(e, field)}
        onKeyDown={(e) => {
          // Handle Tab key navigation
          if (e.key === "Tab") {
            const fields = getFieldOrder(grade);
            const currentIndex = fields.indexOf(field);

            if (!e.shiftKey && currentIndex < fields.length - 1) {
              // Tab forward
              const nextField = fields[currentIndex + 1];
              const nextInput = inputRefs.current[nextField];
              if (nextInput) {
                e.preventDefault();
                nextInput.focus();
              }
            } else if (e.shiftKey && currentIndex > 0) {
              // Shift+Tab backward
              const prevField = fields[currentIndex - 1];
              const prevInput = inputRefs.current[prevField];
              if (prevInput) {
                e.preventDefault();
                prevInput.focus();
              }
            }
          }
        }}
        placeholder={label}
        className={`${width} ${getCellClassName(
          field,
          displayValue as string
        )}`}
        title={
          field === "dateOfBirth"
            ? "Format: DD/MM/YY or DD/MM/YYYY (e.g., 7/5/12)"
            : ""
        }
      />
    );
  };

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      {/* Row Number */}
      <td className="px-3 py-2 border border-gray-300 text-center font-semibold bg-gray-100 text-gray-700 sticky left-0 z-10">
        {localData.no}
      </td>

      {/* Name (Required) */}
      <td className="border border-gray-300">
        {renderCell("name", "គោត្តនាម នាម", "w-48")}
      </td>

      {/* Gender (Required) */}
      <td className="border border-gray-300">
        {renderCell("gender", "ភេទ", "w-16")}
      </td>

      {/* Date of Birth (Required) */}
      <td className="border border-gray-300">
        {renderCell("dateOfBirth", "DD/MM/YY", "w-28")}
      </td>

      {/* Previous Grade */}
      <td className="border border-gray-300">
        {renderCell("previousGrade", "ឡើងពីថ្នាក់", "w-24")}
      </td>

      {/* Previous School */}
      <td className="border border-gray-300">
        {renderCell("previousSchool", "មកពីសាលា", "w-32")}
      </td>

      {/* Repeating Grade */}
      <td className="border border-gray-300">
        {renderCell("repeatingGrade", "ត្រួតថ្នាក់ទី", "w-24")}
      </td>

      {/* Transferred From */}
      <td className="border border-gray-300">
        {renderCell("transferredFrom", "ផ្ទេរមកពី", "w-32")}
      </td>

      {/* Grade 9 Exam Fields (if grade >= 9) */}
      {parseInt(grade) >= 9 && (
        <>
          <td className="border border-gray-300">
            {renderCell("grade9ExamSession", "សម័យប្រឡងទី៩", "w-24")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade9ExamCenter", "មណ្ឌល", "w-32")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade9ExamRoom", "បន្ទប់", "w-20")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade9ExamDesk", "លេខតុ", "w-20")}
          </td>
        </>
      )}

      {/* Grade 12 Exam Fields (if grade >= 12) */}
      {parseInt(grade) >= 12 && (
        <>
          <td className="border border-gray-300">
            {renderCell("grade12ExamSession", "សម័យប្រឡងទី១២", "w-24")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade12ExamCenter", "មណ្ឌល", "w-32")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade12ExamRoom", "បន្ទប់", "w-20")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade12ExamDesk", "លេខតុ", "w-20")}
          </td>
          <td className="border border-gray-300">
            {renderCell("grade12Track", "ផ្លូវ", "w-24")}
          </td>
        </>
      )}

      {/* Remarks */}
      <td className="border border-gray-300">
        {renderCell("remarks", "ផ្សេងៗ", "w-40")}
      </td>

      {/* Actions */}
      <td className="border border-gray-300 px-2 py-1 text-center sticky right-0 bg-white">
        <button
          onClick={() => onDelete(rowIndex)}
          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1. 5 rounded transition-colors"
          title="Delete row"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

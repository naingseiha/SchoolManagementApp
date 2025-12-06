"use client";

import { useState, useRef, useEffect } from "react";
import { formatToKhmerDate } from "@/lib/utils/dateParser";
import { Trash2 } from "lucide-react";

interface StudentGridRowProps {
  rowIndex: number;
  data: StudentRowData;
  grade: string;
  onChange: (rowIndex: number, field: string, value: string) => void;
  onDelete: (rowIndex: number) => void;
  isExisting?: boolean;
  columnHeaders: any[];
}

export interface StudentRowData {
  no: number;
  id?: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  previousGrade?: string;
  previousSchool?: string;
  repeatingGrade?: string;
  transferredFrom?: string;
  remarks?: string;
  grade9ExamSession?: string;
  grade9ExamCenter?: string;
  grade9ExamRoom?: string;
  grade9ExamDesk?: string;
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
  isExisting = false,
  columnHeaders,
}: StudentGridRowProps) {
  const [localData, setLocalData] = useState(data);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
    const fields = getFieldOrder(grade);
    const startIndex = fields.indexOf(startField);

    if (startIndex === -1) return;

    cells.forEach((cell, i) => {
      const fieldIndex = startIndex + i;
      if (fieldIndex < fields.length) {
        const field = fields[fieldIndex];
        handleChange(field, cell.trim());
      }
    });

    if (rows.length > 1) {
      const allData = rows.map((row) =>
        row.split("\t").map((cell) => cell.trim())
      );
      window.dispatchEvent(
        new CustomEvent("multiRowPaste", {
          detail: {
            startRow: rowIndex,
            startField: startField,
            data: allData,
          },
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

  const getColumnColor = (field: string): string => {
    const header = columnHeaders.find((h) => h.key === field);
    return header?.color || "bg-white";
  };

  // ✅ Cleaner cell styling - minimal borders, subtle colors
  const getCellClassName = (field: string, value: string) => {
    const isRequired = ["name", "gender", "dateOfBirth"].includes(field);
    const isEmpty = !value || value.trim() === "";
    const baseColor = getColumnColor(field);

    let className =
      "h-10 px-3 border-r border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all text-sm font-medium ";

    // Required field empty
    if (isRequired && isEmpty) {
      className += "bg-yellow-100 text-gray-500 ";
    }
    // Existing student with data
    else if (isExisting && !isEmpty) {
      className += "bg-blue-100 text-gray-900 ";
    }
    // New student with data
    else if (!isEmpty) {
      className += `${baseColor} text-gray-900 `;
    }
    // Empty cell
    else {
      className += `${baseColor} opacity-50 text-gray-400 `;
    }

    className += "hover:ring-1 hover:ring-blue-300 ";

    return className;
  };

  const renderCell = (field: string, width: string = "w-32") => {
    let displayValue = localData[field as keyof StudentRowData] || "";

    if (field === "dateOfBirth" && displayValue) {
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(displayValue as string)) {
          displayValue = formatToKhmerDate(displayValue as string);
        }
      } catch (e) {
        // Keep original
      }
    }

    const header = columnHeaders.find((h) => h.key === field);
    const placeholder = header?.label || field;

    return (
      <input
        ref={(el) => (inputRefs.current[field] = el)}
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(field, e.target.value)}
        onPaste={(e) => handlePaste(e, field)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const fields = getFieldOrder(grade);
            const currentIndex = fields.indexOf(field);

            if (!e.shiftKey && currentIndex < fields.length - 1) {
              const nextField = fields[currentIndex + 1];
              const nextInput = inputRefs.current[nextField];
              if (nextInput) {
                e.preventDefault();
                nextInput.focus();
              }
            } else if (e.shiftKey && currentIndex > 0) {
              const prevField = fields[currentIndex - 1];
              const prevInput = inputRefs.current[prevField];
              if (prevInput) {
                e.preventDefault();
                prevInput.focus();
              }
            }
          }
        }}
        placeholder={`${placeholder}...`}
        className={`${width} ${getCellClassName(
          field,
          displayValue as string
        )}`}
        title={
          field === "dateOfBirth"
            ? "ទម្រង់: DD/MM/YY ឬ DD/MM/YYYY (ឧ. 7/5/12)"
            : isExisting
            ? "សិស្សដែលមានរួច - Click ដើម្បីកែប្រែ"
            : ""
        }
      />
    );
  };

  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      {/* ✅ Row Number - Clean Sticky */}
      <td
        className={`
        sticky left-0 z-10
        h-10 px-3
        text-center text-sm font-bold
        border-r-2 border-b border-gray-300
        ${isExisting ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
      `}
      >
        <div className="flex items-center justify-center gap-1">
          {isExisting && <span className="text-xs">📌</span>}
          <span>{localData.no}</span>
        </div>
      </td>

      {/* Dynamic Cells */}
      {columnHeaders
        .filter((h) => h.key !== "no" && h.key !== "actions")
        .map((header) => (
          <td key={header.key} className="p-0">
            {renderCell(header.key, header.width)}
          </td>
        ))}

      {/* ✅ Actions - Clean Sticky */}
      <td className="sticky right-0 z-10 h-10 px-3 text-center bg-slate-100 border-l-2 border-b border-gray-300">
        <button
          onClick={() => onDelete(rowIndex)}
          className="h-8 w-8 inline-flex items-center justify-center text-red-600 hover:text-white hover:bg-red-600 rounded transition-all"
          title={isExisting ? "លុបសិស្សដែលមានរួច" : "លុបជួរ"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

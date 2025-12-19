"use client";

import { Loader2, Check, X, Lock } from "lucide-react";
import type { CellState } from "./types";

interface GradeCellProps {
  cell: CellState;
  cellKey: string;
  studentIndex: number;
  subjectIndex: number;
  pasteMode: boolean;
  pastedCells: Set<string>;
  editedCells: Set<string>;
  isLoading: boolean;
  saving: boolean;
  onCellChange: (cellKey: string, value: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => void;
  onPaste: (
    e: React.ClipboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

export function GradeCell({
  cell,
  cellKey,
  studentIndex,
  subjectIndex,
  pasteMode,
  pastedCells,
  editedCells,
  isLoading,
  saving,
  onCellChange,
  onKeyDown,
  onPaste,
  inputRef,
}: GradeCellProps) {
  const getCellClassName = () => {
    const baseClass =
      "w-16 h-9 px-2 text-center text-sm font-semibold border rounded focus:outline-none focus:ring-2 transition-all";

    if (!cell.isEditable) {
      return `${baseClass} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
    }

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

  const getStatusIcon = () => {
    if (!cell.isEditable) {
      return <Lock className="w-3. 5 h-3.5 text-gray-400" />;
    }
    if (cell.isSaving)
      return <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
    if (cell.error) return <X className="w-3.5 h-3.5 text-red-600" />;
    if (cell.value && !cell.isModified && !cell.isSaving)
      return <Check className="w-3.5 h-3.5 text-green-600" />;
    return null;
  };

  return (
    <div className="flex items-center justify-center gap-1. 5">
      <input
        ref={inputRef}
        type="text"
        value={cell.value}
        onChange={(e) => onCellChange(cellKey, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, studentIndex, subjectIndex)}
        onPaste={(e) => onPaste(e, studentIndex, subjectIndex)}
        disabled={isLoading || saving || !cell.isEditable}
        className={getCellClassName()}
        placeholder="-"
        title={
          !cell.isEditable ? "មើលប៉ុណ្ណោះ - អ្នកមិនអាចកែមុខវិជ្ជានេះបានទេ" : ""
        }
      />
      <div className="w-3.5 flex-shrink-0">{getStatusIcon()}</div>
    </div>
  );
}

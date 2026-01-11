"use client";

import { memo, useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, Clock } from "lucide-react";

interface StudentScoreCardProps {
  student: {
    studentId: string;
    khmerName: string;
    gender: string;
    score: number | null;
    maxScore: number;
  };
  index: number;
  hasUnsavedChanges: boolean;
  hasDiscrepancy: boolean;
  isIncomplete: boolean;
  onScoreChange: (studentId: string, value: string, maxScore: number) => void;
}

/**
 * Memoized StudentScoreCard component with local input state
 * Maintains focus by keeping input value locally while typing
 */
export const StudentScoreCard = memo(function StudentScoreCard({
  student,
  index,
  hasUnsavedChanges,
  hasDiscrepancy,
  isIncomplete,
  onScoreChange,
}: StudentScoreCardProps) {
  // Local state for input value to prevent parent re-renders from affecting input
  const [localValue, setLocalValue] = useState(
    student.score !== null ? student.score.toString() : ""
  );
  const isTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop value when not typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(student.score !== null ? student.score.toString() : "");
    }
  }, [student.score]);

  const handleChange = (value: string) => {
    isTypingRef.current = true;
    setLocalValue(value);

    // Validate and notify parent immediately
    const score = value === "" ? null : parseFloat(value);
    if (score === null || score <= student.maxScore) {
      onScoreChange(student.studentId, value, student.maxScore);
    }
  };

  const handleBlur = () => {
    isTypingRef.current = false;
    // No auto-save - user must click Save All button
  };

  const displayScore = parseFloat(localValue);
  const isZero = displayScore === 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 p-4 hover:shadow-md transition-all ${
        hasDiscrepancy
          ? "border-orange-300 bg-orange-50 animate-pulse"
          : isIncomplete
          ? "border-yellow-300 bg-yellow-50 animate-pulse"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Student Number Badge */}
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
          <span className="font-koulen text-base text-purple-700">
            {index + 1}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <p className="font-battambang text-sm font-semibold text-gray-900 truncate mb-0.5">
            {student.khmerName}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-battambang font-medium ${
                student.gender === "MALE"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
            </span>
          </div>
        </div>

        {/* Score Input */}
        <div className="flex-shrink-0 w-20 relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full h-12 px-2 text-center font-battambang border-2 rounded-xl text-base font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-all ${
              isZero
                ? "bg-red-50 border-red-300 text-red-700"
                : hasUnsavedChanges && student.score !== null
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-purple-50 border-purple-200"
            }`}
            placeholder="0"
            style={{ fontSize: "16px" }}
          />
          {/* Absent indicator badge */}
          {isZero && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight shadow-md">
              A
            </div>
          )}
          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && student.score !== null && !isZero && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full leading-tight shadow-md">
              •
            </div>
          )}
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0 w-8 flex items-center justify-center">
          {hasUnsavedChanges && student.score !== null ? (
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
            </div>
          ) : student.score !== null ? (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  // Only re-render if these specific props change
  return (
    prevProps.student.studentId === nextProps.student.studentId &&
    prevProps.student.score === nextProps.student.score &&
    prevProps.hasUnsavedChanges === nextProps.hasUnsavedChanges &&
    prevProps.hasDiscrepancy === nextProps.hasDiscrepancy &&
    prevProps.isIncomplete === nextProps.isIncomplete
  );
});

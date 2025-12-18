"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, ChevronDown, Loader2, X } from "lucide-react";
import { subjectsApi } from "@/lib/api/subjects";

type GradeType =
  | "7"
  | "8"
  | "9"
  | "10"
  | "11-science"
  | "11-social"
  | "12-science"
  | "12-social"
  | "all";

interface TeacherSubjectsSelectorProps {
  selectedSubjects: string[];
  onToggle: (subjectId: string) => void;
  gradeOptions: Array<{ value: string; label: string }>;
  preloadedSubjects?: any[]; // ✅ ADD THIS
}

export default function TeacherSubjectsSelector({
  selectedSubjects,
  onToggle,
  gradeOptions,
  preloadedSubjects = [], // ✅ ADD THIS
}: TeacherSubjectsSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeType>("all");
  const [subjectsByGrade, setSubjectsByGrade] = useState<Record<string, any[]>>(
    {}
  );
  const [loadingSubjects, setLoadingSubjects] = useState<
    Record<string, boolean>
  >({});

  // ✅ Initialize with preloaded data
  useEffect(() => {
    if (preloadedSubjects.length > 0) {
      console.log("📚 Using preloaded subjects:", preloadedSubjects.length);

      // Group by grade
      const grouped: Record<string, any[]> = {};

      preloadedSubjects.forEach((subject) => {
        const grade = subject.grade;
        if (!grouped[grade]) {
          grouped[grade] = [];
        }
        grouped[grade].push(subject);

        // Also group by grade-track for 11-12
        if (grade === "11" || grade === "12") {
          if (subject.track) {
            const key = `${grade}-${subject.track.toLowerCase()}`;
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(subject);
          }
        }
      });

      setSubjectsByGrade(grouped);
      console.log("✅ Subjects grouped by grade:", Object.keys(grouped));
    }
  }, [preloadedSubjects]);

  const loadSubjectsForGrade = async (grade: GradeType) => {
    // ✅ Skip if already loaded
    if (grade === "all" || subjectsByGrade[grade]?.length > 0) {
      return;
    }

    if (loadingSubjects[grade]) {
      return;
    }

    setLoadingSubjects((prev) => ({ ...prev, [grade]: true }));

    try {
      let subjects: any[] = [];

      if (grade.includes("-")) {
        const [gradeNum, track] = grade.split("-");
        const allSubjects = await subjectsApi.getAll();
        subjects = allSubjects.filter(
          (s: any) => s.grade === gradeNum && s.track?.toLowerCase() === track
        );
      } else {
        const allSubjects = await subjectsApi.getAll();
        subjects = allSubjects.filter((s: any) => s.grade === grade);
      }

      setSubjectsByGrade((prev) => ({ ...prev, [grade]: subjects }));
    } catch (error) {
      console.error(`Failed to load subjects: `, error);
      alert("បរាជ័យក្នុងការទាញយកមុខវិជ្ជា!");
    } finally {
      setLoadingSubjects((prev) => ({ ...prev, [grade]: false }));
    }
  };

  const handleGradeChange = async (grade: GradeType) => {
    setSelectedGrade(grade);
    if (grade !== "all") {
      await loadSubjectsForGrade(grade);
    }
  };

  const getFilteredSubjects = () => {
    if (selectedGrade === "all") {
      return Object.values(subjectsByGrade).flat();
    }
    return subjectsByGrade[selectedGrade] || [];
  };

  // ✅ Get all selected subjects from all grades
  const getAllSelectedSubjects = () => {
    const allSubjects = Object.values(subjectsByGrade).flat();
    return allSubjects.filter((s) => selectedSubjects.includes(s.id));
  };

  const filteredSubjects = getFilteredSubjects();
  const selectedSubjectsList = getAllSelectedSubjects();

  console.log("🔍 Selected grade:", selectedGrade);
  console.log("🔍 Filtered subjects:", filteredSubjects.length);
  console.log("🔍 Selected subjects list:", selectedSubjectsList.length);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          មុខវិជ្ជាបង្រៀន • Teaching Subjects
          <span className="text-sm font-normal text-gray-600">
            (ជ្រើសរើសច្រើន)
          </span>
        </h3>

        <div className="relative">
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value as GradeType)}
            className="px-4 py-2 pr-10 border-2 border-purple-300 rounded-lg font-bold text-purple-900 bg-white focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            {gradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.value !== "all" &&
                  subjectsByGrade[option.value] &&
                  ` (${subjectsByGrade[option.value].length})`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 pointer-events-none" />
        </div>
      </div>

      {/* ✅ SHOW SELECTED SUBJECTS WITH REMOVE BUTTONS */}
      {selectedSubjectsList.length > 0 && (
        <div className="mb-4 p-4 bg-white border-2 border-purple-300 rounded-xl">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            បានជ្រើសរើស ({selectedSubjectsList.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSubjectsList.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg group hover:bg-purple-200 transition-colors"
              >
                <span className="text-sm font-bold text-purple-900">
                  {subject.nameKh || subject.name}
                </span>
                <span className="text-xs text-purple-600">
                  ({subject.code})
                </span>
                <button
                  type="button"
                  onClick={() => onToggle(subject.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="លុបចេញ"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto border-2 border-purple-100 rounded-lg p-3 bg-white">
        {loadingSubjects[selectedGrade] ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600 font-semibold">
              កំពុងទាញយក...
            </span>
          </div>
        ) : filteredSubjects.length === 0 && selectedGrade !== "all" ? (
          <div className="col-span-full text-center py-8 text-gray-500 font-semibold">
            មិនមានមុខវិជ្ជាសម្រាប់កម្រិតនេះ
          </div>
        ) : selectedGrade === "all" ? (
          <div className="col-span-full text-center py-8 text-gray-400 font-semibold">
            👆 សូមជ្រើសរើសកម្រិតដើម្បីមើលមុខវិជ្ជា
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <label
              key={subject.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedSubjects.includes(subject.id)
                  ? "bg-purple-100 border-2 border-purple-500 shadow-md"
                  : "bg-gray-50 border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.id)}
                onChange={() => onToggle(subject.id)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-900 block">
                  {subject.nameKh || subject.name}
                </span>
                <span className="text-xs text-gray-600">{subject.code}</span>
              </div>
            </label>
          ))
        )}
      </div>
      <div className="mt-3 flex items-center justify-between px-2">
        <p className="text-xs text-purple-600 font-semibold">
          ✓ បានជ្រើសរើស: {selectedSubjects.length} មុខវិជ្ជា
        </p>
        {selectedSubjects.length > 0 && (
          <button
            type="button"
            onClick={() => selectedSubjects.forEach((id) => onToggle(id))}
            className="text-xs text-red-600 hover:text-red-800 font-bold underline"
          >
            លុបទាំងអស់
          </button>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { BookOpen, Edit, Trash2, Eye, Hash, Clock, Award } from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

interface SubjectCardProps {
  subject: Subject;
  onView: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export default function SubjectCard({
  subject,
  onView,
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const getCategoryColor = (category?: string) => {
    if (category === "science") {
      return {
        gradient: "from-purple-500 via-indigo-500 to-blue-500",
        bg: "bg-purple-100",
        text: "text-purple-600",
      };
    }
    return {
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      bg: "bg-green-100",
      text: "text-green-600",
    };
  };

  const colors = getCategoryColor(subject.category);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Card Header - Gradient */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
              {subject.code?.substring(0, 2).toUpperCase() || "XX"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {subject.nameKh || subject.name}
              </h3>
              <p className="text-sm text-white/80 truncate">
                {subject.nameEn || subject.name}
              </p>
            </div>
          </div>
          {subject.isActive ? (
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
              ✓ សកម្ម
            </span>
          ) : (
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
              ✕ អសកម្ម
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Code */}
        <div className="flex items-center gap-2 text-sm">
          <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">
            លេខកូដ:{" "}
            <span className="font-semibold text-gray-900">{subject.code}</span>
          </span>
        </div>

        {/* Grade */}
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">
            កម្រិត:{" "}
            <span className="font-semibold text-gray-900">
              ថ្នាក់ទី {subject.grade}
            </span>
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h. 01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="text-gray-600">
            ប្រភេទ:{" "}
            <span className={`font-semibold ${colors.text}`}>
              {subject.category === "science" ? "វិទ្យាសាស្ត្រ" : "សង្គម"}
            </span>
          </span>
        </div>

        {/* Max Score */}
        {subject.maxScore && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              ពិន្ទុ:{" "}
              <span className="font-semibold text-gray-900">
                {subject.maxScore}
              </span>
            </span>
          </div>
        )}

        {/* Weekly Hours */}
        {subject.weeklyHours && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              ម៉ោង/សប្តាហ៍:{" "}
              <span className="font-semibold text-gray-900">
                {subject.weeklyHours}ម៉ោង
              </span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(subject)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>មើល</span>
          </button>
          <button
            onClick={() => onEdit(subject)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>កែ</span>
          </button>
          <button
            onClick={() => onDelete(subject)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>លុប</span>
          </button>
        </div>
      </div>
    </div>
  );
}

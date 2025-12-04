import React from "react";
import {
  GraduationCap,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  UserPlus,
} from "lucide-react";
import { Class } from "@/lib/api/classes";

interface ClassCardProps {
  classData: Class;
  onView: (cls: Class) => void;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onExport: (cls: Class) => void;
  onImport: (cls: Class) => void;
  onManage: (cls: Class) => void;
}

export default function ClassCard({
  classData,
  onView,
  onEdit,
  onDelete,
  onExport,
  onImport,
  onManage,
}: ClassCardProps) {
  const getGradeBadgeColor = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 9) return "from-blue-500 to-cyan-500";
    if (gradeNum <= 11) return "from-purple-500 to-pink-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      {/* Gradient Header */}
      <div
        className={`bg-gradient-to-r ${getGradeBadgeColor(
          classData.grade
        )} p-6 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 opacity-20">
          <GraduationCap className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-white mb-1">
            {classData.name}
          </h3>
          <p className="text-white text-sm opacity-90">
            ថ្នាក់ទី {classData.grade} • {classData.section || "គ្មានផ្នែក"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Teacher Info */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm text-gray-700">
            <span className="font-semibold">គ្រូបន្ទុក:</span>{" "}
            {classData.teacher?.khmerName ||
              `${classData.teacher?.firstName || ""} ${
                classData.teacher?.lastName || ""
              }`.trim() || (
                <span className="text-gray-400 italic">មិនទាន់កំណត់</span>
              )}
          </span>
        </div>

        {/* Students Count */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold">សិស្ស:</span>{" "}
            <span className="text-lg font-black text-purple-600">
              {classData._count?.students || classData.students?.length || 0}
            </span>{" "}
            នាក់
            {classData.students?.length && (
              <span className="text-gray-500">
                {" "}
                / {classData.students?.length}
              </span>
            )}
          </span>
        </div>

        {/* Academic Year */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold">ឆ្នាំ:</span>{" "}
            {classData.academicYear}
          </span>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => onView(classData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"
          >
            <Eye className="w-4 h-4" />
            មើល
          </button>

          <button
            onClick={() => onExport(classData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            នាំចេញ
          </button>

          <button
            onClick={() => onImport(classData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-semibold text-sm"
          >
            <Upload className="w-4 h-4" />
            នាំចូល
          </button>

          <button
            onClick={() => onManage(classData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-semibold text-sm"
          >
            <UserPlus className="w-4 h-4" />
            គ្រប់គ្រង
          </button>

          <button
            onClick={() => onEdit(classData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-semibold text-sm"
          >
            <Edit className="w-4 h-4" />
            កែ
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(classData)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm border border-red-200"
        >
          <Trash2 className="w-4 h-4" />
          លុបថ្នាក់ • Delete Class
        </button>
      </div>
    </div>
  );
}

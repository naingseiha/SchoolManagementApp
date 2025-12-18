"use client";

import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Award,
  UserCheck,
} from "lucide-react";

interface Teacher {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  khmerName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  subject?: string;
  employeeId?: string;
  gender?: string;
  role?: string;
  classes?: any[];
}

interface TeacherCardProps {
  teachers: Teacher[];
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export default function TeacherCard({
  teachers,
  onView,
  onEdit,
  onDelete,
}: TeacherCardProps) {
  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="text-center py-16">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg mb-2">
            រកមិនឃើញគ្រូបង្រៀន
          </p>
          <p className="text-gray-400 text-sm">
            សូមព្យាយាមស្វែងរកដោយពាក្យគន្លឹះផ្សេង
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-3 gap-6 p-6">
        {teachers.map((teacher) => {
          const fullName =
            teacher.firstName && teacher.lastName
              ? `${teacher.firstName} ${teacher.lastName}`
              : teacher.name || "Unknown";
          const initials =
            teacher.firstName && teacher.lastName
              ? `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`
              : fullName
                  .split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .substring(0, 2);

          return (
            <div
              key={teacher.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {initials}
                  </div>
                  {teacher.gender && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100">
                      <span className="text-xs">
                        {teacher.gender === "MALE" || teacher.gender === "male"
                          ? "👨"
                          : "👩"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
                      {fullName}
                    </h3>
                    {teacher.role === "INSTRUCTOR" && (
                      <Award
                        className="w-4 h-4 text-yellow-500 flex-shrink-0"
                        title="Instructor"
                      />
                    )}
                  </div>
                  {teacher.khmerName && (
                    <p className="text-sm text-gray-600 truncate font-semibold">
                      {teacher.khmerName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate font-medium">
                    {teacher.subject || "មិនទាន់កំណត់មុខវិជ្ជា"}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate font-medium">
                    {teacher.email}
                  </span>
                </div>
                {(teacher.phone || teacher.phoneNumber) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 font-medium">
                      {teacher.phone || teacher.phoneNumber}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-600 font-bold">
                    {teacher.classes?.length || 0} ថ្នាក់ • classes
                  </span>
                </div>
              </div>

              {/* Role Badge */}
              {teacher.role && (
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      teacher.role === "INSTRUCTOR"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {teacher.role === "INSTRUCTOR"
                      ? "គ្រូប្រចាំថ្នាក់"
                      : "គ្រូធម្មតា"}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onView(teacher)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-bold"
                  title="មើលព័ត៌មាន View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(teacher)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm font-bold"
                  title="កែប្រែ Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(teacher)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover: bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-bold"
                  title="លុប Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

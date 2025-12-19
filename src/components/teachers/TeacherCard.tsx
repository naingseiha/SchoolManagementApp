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
  teacher: any; // ✅ This should be a single teacher object
  onEdit: (teacher: any) => void;
  onView: (teacher: any) => void;
  onDelete: (teacherId: string) => void;
  viewMode: "grid" | "list";
}

export default function TeacherCard({
  teacher,
  onEdit,
  onView,
  onDelete,
  viewMode,
}: TeacherCardProps) {
  // ✅ ADD:  Debug log to see what data is received
  console.log("👤 TeacherCard received:", teacher);

  // ✅ REMOVE this check (it's checking wrong variable)
  // if (! teachers || teachers.length === 0) {  // ❌ WRONG!
  //   return <div>Loading...</div>;
  // }

  // ✅ ADD: Check if teacher object exists
  if (!teacher) {
    console.log("⚠️ No teacher data");
    return null;
  }

  // ✅ Extract teacher data safely
  const firstName = teacher.firstName || "";
  const lastName = teacher.lastName || "";
  const khmerName = teacher.khmerName || "";
  const email = teacher.email || "";
  const phone = teacher.phone || teacher.phoneNumber || "";
  const role = teacher.role || "TEACHER";
  const gender = teacher.gender || "MALE";

  // ✅ Get initials for avatar
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (khmerName) {
      return khmerName.substring(0, 2);
    }
    return "T";
  };

  // Rest of your component...
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          {getInitials()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">
            {firstName} {lastName}
          </h3>
          {khmerName && <p className="text-sm text-gray-600">{khmerName}</p>}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              role === "INSTRUCTOR"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {role === "INSTRUCTOR" ? "គ្រូប្រចាំថ្នាក់" : "គ្រូបង្រៀន"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {email && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            📧 {email}
          </p>
        )}
        {phone && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            📱 {phone}
          </p>
        )}
      </div>

      {/* Teaching Info */}
      <div className="text-sm text-gray-600 mb-4">
        <p>{teacher.teachingClasses?.length || 0} ថ្នាក់ • classes</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(teacher)}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          មើល
        </button>
        <button
          onClick={() => onEdit(teacher)}
          className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
        >
          កែ
        </button>
        <button
          onClick={() => onDelete(teacher.id)}
          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover: bg-red-100 transition-colors"
        >
          លុប
        </button>
      </div>
    </div>
  );
}

"use client";

import { User, Calendar, Lock, Edit } from "lucide-react";
import { StudentProfile } from "@/lib/api/student-portal";
import StudentProfileEditForm from "../StudentProfileEditForm";

const ROLE_LABELS = {
  GENERAL: "សិស្សទូទៅ",
  CLASS_LEADER: "ប្រធានថ្នាក់",
  VICE_LEADER_1: "អនុប្រធានទី១",
  VICE_LEADER_2: "អនុប្រធានទី២",
};

interface StudentProfileTabProps {
  profile: StudentProfile;
  isEditingProfile: boolean;
  hasUnsavedProfileChanges: boolean;
  loading: boolean;
  onEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  onChangePassword: () => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export default function StudentProfileTab({
  profile,
  isEditingProfile,
  hasUnsavedProfileChanges,
  loading,
  onEdit,
  onSave,
  onCancel,
  onChangePassword,
  onUnsavedChanges,
}: StudentProfileTabProps) {
  if (isEditingProfile) {
    return (
      <StudentProfileEditForm
        profile={profile}
        onSave={onSave}
        onCancel={onCancel}
        onUnsavedChanges={onUnsavedChanges}
        isSubmitting={loading}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Modern Profile Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] shadow-2xl">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        <div className="relative p-8 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl flex items-center justify-center border-4 border-white border-opacity-40 shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
            {profile.student.khmerName}
          </h1>
          <p className="text-indigo-100 font-medium mb-4">
            {profile.student.englishName || `${profile.firstName} ${profile.lastName}`}
          </p>

          {/* Info Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
              <p className="text-white text-sm font-bold">
                {profile.student?.class?.name || "N/A"}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
              <p className="text-white text-sm font-bold">
                {ROLE_LABELS[profile.student?.studentRole as keyof typeof ROLE_LABELS] ||
                  "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">ថ្ងៃកំណើត</p>
              <p className="text-sm font-black text-gray-900">
                {profile.student.dateOfBirth
                  ? new Date(profile.student.dateOfBirth).toLocaleDateString("km-KH")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">ភេទ</p>
              <p className="text-sm font-black text-gray-900">
                {profile.student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">ព័ត៌មានទំនាក់ទំនង</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">អ៊ីម៉ែល</p>
              <p className="text-sm font-bold text-gray-900">{profile.email || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">លេខទូរស័ព្ទ</p>
              <p className="text-sm font-bold text-gray-900">{profile.phone || "N/A"}</p>
            </div>
          </div>

          {profile.student.address && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">អាសយដ្ឋាន</p>
                <p className="text-sm font-bold text-gray-900">
                  {profile.student.address}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onEdit}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Edit className="w-6 h-6" />
          <span className="font-bold text-lg">កែប្រែព័ត៌មាន</span>
        </button>

        <button
          onClick={onChangePassword}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Lock className="w-6 h-6" />
          <span className="font-bold text-lg">ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
        </button>
      </div>
    </div>
  );
}

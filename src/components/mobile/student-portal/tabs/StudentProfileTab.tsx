"use client";

import {
  User,
  Calendar,
  Lock,
  Edit,
  Phone,
  Mail,
  MapPin,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Award,
  FileText,
  CreditCard,
  Home,
  Briefcase,
  UserCircle,
  CheckCircle,
  Camera,
  Share2,
  UserPlus,
  Save,
} from "lucide-react";
import { StudentProfile, GradesResponse, AttendanceResponse } from "@/lib/api/student-portal";
import StudentProfileEditForm from "../StudentProfileEditForm";

const ROLE_LABELS = {
  GENERAL: "សិស្សទូទៅ",
  CLASS_LEADER: "ប្រធានថ្នាក់",
  VICE_LEADER_1: "អនុប្រធានទី១",
  VICE_LEADER_2: "អនុប្រធានទី២",
};

interface StudentProfileTabProps {
  profile: StudentProfile;
  gradesData?: GradesResponse | null;
  attendanceData?: AttendanceResponse | null;
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
  gradesData,
  attendanceData,
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
    <div className="space-y-4">
      {/* Instagram-Style Profile Header */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        {/* Cover/Banner */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          {/* Account Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
              profile.student.isAccountActive 
                ? "bg-green-400 bg-opacity-90" 
                : "bg-red-400 bg-opacity-90"
            }`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span className="text-white text-xs font-bold">
                {profile.student.isAccountActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Section - Center Aligned */}
        <div className="px-5 pb-5">
          {/* Avatar - Overlapping cover - Center Aligned */}
          <div className="flex flex-col items-center -mt-16 mb-4">
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1 shadow-xl">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-indigo-600" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Name & Bio - Center Aligned */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                {profile.student.khmerName}
              </h1>
              <p className="text-sm text-gray-600 mb-2">
                {profile.student.englishName || `${profile.firstName} ${profile.lastName}`}
              </p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="font-medium">{profile.student.studentId}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="font-medium">{profile.student?.class?.name || "N/A"}</span>
                </div>
              </div>
              
              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">
                  {ROLE_LABELS[profile.student?.studentRole as keyof typeof ROLE_LABELS] || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid - Improved Design */}
          <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                  {gradesData?.statistics?.averageScore?.toFixed(1) || "0.0"}
                </div>
                <div className="text-xs text-gray-600 font-bold">មធ្យមភាគ</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                  {attendanceData?.statistics?.attendanceRate?.toFixed(0) || "0"}%
                </div>
                <div className="text-xs text-gray-600 font-bold">វត្តមាន</div>
                <div className="text-xs text-gray-500">Present</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                  {gradesData?.grades?.length || "0"}
                </div>
                <div className="text-xs text-gray-600 font-bold">មុខវិជ្ជា</div>
                <div className="text-xs text-gray-500">Subjects</div>
              </div>
            </div>
          </div>

          {/* Academic Highlights - Improved Design */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900">
                បុណ្យសិក្សា
              </h3>
              <span className="text-xs text-gray-500 font-medium">Academic Highlights</span>
            </div>
            
            {/* Performance Badges - Grid Layout */}
            <div className="grid grid-cols-1 gap-2.5">
              {gradesData?.statistics?.averageScore && gradesData.statistics.averageScore >= 80 && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-200 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-yellow-900">ពិន្ទុខ្ពស់</p>
                    <p className="text-xs text-yellow-700 font-medium">High Achiever</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-700 font-black text-xs">🏆</span>
                  </div>
                </div>
              )}
              
              {attendanceData?.statistics?.attendanceRate && attendanceData.statistics.attendanceRate >= 95 && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-green-900">វត្តមានល្អ</p>
                    <p className="text-xs text-green-700 font-medium">Perfect Attendance</p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <span className="text-green-700 font-black text-xs">✓</span>
                  </div>
                </div>
              )}

              {profile.student?.studentRole !== "GENERAL" && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-blue-900">អ្នកដឹកនាំថ្នាក់</p>
                    <p className="text-xs text-blue-700 font-medium">Class Leader</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-blue-700 font-black text-xs">★</span>
                  </div>
                </div>
              )}

              {(profile.student.grade9PassStatus && 
                (profile.student.grade9PassStatus.toLowerCase().includes("pass") || 
                 profile.student.grade9PassStatus.toLowerCase().includes("ជាប់"))) && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-purple-900">ជាប់ថ្នាក់៩</p>
                    <p className="text-xs text-purple-700 font-medium">Grade 9 Pass</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-black text-xs">9</span>
                  </div>
                </div>
              )}

              {(profile.student.grade12PassStatus && 
                (profile.student.grade12PassStatus.toLowerCase().includes("pass") || 
                 profile.student.grade12PassStatus.toLowerCase().includes("ជាប់"))) && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 border-2 border-rose-200 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-rose-900">បាក់ឌុប</p>
                    <p className="text-xs text-rose-700 font-medium">Grade 12 Pass</p>
                  </div>
                  <div className="w-8 h-8 bg-rose-200 rounded-lg flex items-center justify-center">
                    <span className="text-rose-700 font-black text-xs">🎓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Show message if no achievements yet */}
            {(!gradesData?.statistics?.averageScore || gradesData.statistics.averageScore < 80) &&
             (!attendanceData?.statistics?.attendanceRate || attendanceData.statistics.attendanceRate < 95) &&
             profile.student?.studentRole === "GENERAL" &&
             !profile.student.grade9PassStatus &&
             !profile.student.grade12PassStatus && (
              <div className="text-center py-6 px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🌟</span>
                </div>
                <p className="text-sm font-bold text-gray-600 mb-1">
                  មិនទាន់មានបុណ្យសិក្សា
                </p>
                <p className="text-xs text-gray-500">
                  Keep working hard to earn achievement badges!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Grid - Improved Design */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-2 shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-bold mb-1">ថ្ងៃកំណើត</p>
            <p className="text-xs font-black text-gray-900 leading-tight">
              {profile.student.dateOfBirth
                ? new Date(profile.student.dateOfBirth).toLocaleDateString("km-KH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-2 shadow-md">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-bold mb-1">ភេទ</p>
            <p className="text-xs font-black text-gray-900">
              {profile.student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2 shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-bold mb-1">កំណើត</p>
            <p className="text-xs font-black text-gray-900 leading-tight">
              {profile.student.placeOfBirth || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Button - Under Quick Info */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <button
          onClick={onEdit}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 px-4 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          <span>កែប្រែព័ត៌មាន • Edit Profile</span>
        </button>
      </div>

      {/* Action Buttons - Draft, Follow, Share, Change Profile Picture */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-4 hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Save className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-sm">Draft</span>
        </button>
        
        <button className="bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-sm">Follow</span>
        </button>
        
        <button className="bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-green-600" />
          <span className="font-bold text-sm">Share</span>
        </button>
        
        <button className="bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-4 hover:border-purple-300 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Camera className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-sm">Change Photo</span>
        </button>
      </div>

      {/* Personal Information Section - Improved Design */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
              <p className="text-xs text-white/80 font-medium">Personal Information</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {profile.email && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-bold mb-1">អ៊ីម៉ែល • Email</p>
                <p className="text-sm font-bold text-gray-900 break-words">{profile.email}</p>
              </div>
            </div>
          )}

          {(profile.phone || profile.student.phoneNumber) && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-bold mb-1">លេខទូរស័ព្ទ • Phone</p>
                <p className="text-sm font-bold text-gray-900">
                  {profile.phone || profile.student.phoneNumber}
                </p>
              </div>
            </div>
          )}

          {profile.student.currentAddress && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-bold mb-1">អាសយដ្ឋានបច្ចុប្បន្ន • Address</p>
                <p className="text-sm font-bold text-gray-900 leading-relaxed">
                  {profile.student.currentAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Family Information Section - Improved Design */}
      {(profile.student.fatherName || profile.student.motherName || profile.student.parentPhone) && (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">ព័ត៌មានគ្រួសារ</h2>
                <p className="text-xs text-white/80 font-medium">Family Information</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {profile.student.fatherName && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">ឈ្មោះឪពុក • Father</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.fatherName}</p>
                </div>
              </div>
            )}

            {profile.student.motherName && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
                <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">ឈ្មោះម្តាយ • Mother</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.motherName}</p>
                </div>
              </div>
            )}

            {profile.student.parentPhone && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">លេខទូរស័ព្ទ • Phone</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.parentPhone}</p>
                </div>
              </div>
            )}

            {profile.student.parentOccupation && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">មុខរបរ • Occupation</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.parentOccupation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic History Section - Improved Design */}
      {(profile.student.previousSchool || profile.student.previousGrade || profile.student.transferredFrom) && (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">ប្រវត្តិសិក្សា</h2>
                <p className="text-xs text-white/80 font-medium">Academic History</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {profile.student.previousSchool && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">សាលាមុន • Previous School</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.previousSchool}</p>
                </div>
              </div>
            )}

            {profile.student.previousGrade && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">ថ្នាក់មុន • Previous Grade</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.previousGrade}</p>
                </div>
              </div>
            )}

            {profile.student.transferredFrom && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border border-cyan-100">
                <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">ផ្ទេរពី • Transferred From</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.transferredFrom}</p>
                </div>
              </div>
            )}

            {profile.student.repeatingGrade && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
                <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">រៀនឡើងវិញ • Repeating</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.repeatingGrade}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade 9 Exam Information - Improved Design */}
      {(profile.student.grade9ExamSession || profile.student.grade9ExamCenter || profile.student.grade9PassStatus) && (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">ប្រឡងថ្នាក់ទី៩</h2>
                <p className="text-xs text-white/80 font-medium">Grade 9 Examination</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {profile.student.grade9ExamSession && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">វគ្គប្រឡង • Session</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.grade9ExamSession}</p>
                </div>
              </div>
            )}

            {profile.student.grade9ExamCenter && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">មជ្ឈមណ្ឌល • Center</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.grade9ExamCenter}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {profile.student.grade9ExamRoom && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold mb-0.5">បន្ទប់ • Room</p>
                    <p className="text-sm font-black text-gray-900">{profile.student.grade9ExamRoom}</p>
                  </div>
                </div>
              )}

              {profile.student.grade9ExamDesk && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold mb-0.5">តុ • Desk</p>
                    <p className="text-sm font-black text-gray-900">{profile.student.grade9ExamDesk}</p>
                  </div>
                </div>
              )}
            </div>

            {profile.student.grade9PassStatus && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm ${
                profile.student.grade9PassStatus.toLowerCase().includes("pass") || 
                profile.student.grade9PassStatus.toLowerCase().includes("ជាប់")
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
              }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  profile.student.grade9PassStatus.toLowerCase().includes("pass") ||
                  profile.student.grade9PassStatus.toLowerCase().includes("ជាប់")
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-orange-500 to-amber-600"
                }`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">លទ្ធផល • Result</p>
                  <p className="text-sm font-black text-gray-900">{profile.student.grade9PassStatus}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade 12 Exam Information - Improved Design */}
      {(profile.student.grade12ExamSession || profile.student.grade12ExamCenter || profile.student.grade12Track || profile.student.grade12PassStatus) && (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">ប្រឡងបាក់ឌុប</h2>
                <p className="text-xs text-white/80 font-medium">Grade 12 Examination</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {profile.student.grade12Track && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">ផ្នែក • Track</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.grade12Track}</p>
                </div>
              </div>
            )}

            {profile.student.grade12ExamSession && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">វគ្គប្រឡង • Session</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.grade12ExamSession}</p>
                </div>
              </div>
            )}

            {profile.student.grade12ExamCenter && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">មជ្ឈមណ្ឌល • Center</p>
                  <p className="text-sm font-bold text-gray-900">{profile.student.grade12ExamCenter}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {profile.student.grade12ExamRoom && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold mb-0.5">បន្ទប់ • Room</p>
                    <p className="text-sm font-black text-gray-900">{profile.student.grade12ExamRoom}</p>
                  </div>
                </div>
              )}

              {profile.student.grade12ExamDesk && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold mb-0.5">តុ • Desk</p>
                    <p className="text-sm font-black text-gray-900">{profile.student.grade12ExamDesk}</p>
                  </div>
                </div>
              )}
            </div>

            {profile.student.grade12PassStatus && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm ${
                profile.student.grade12PassStatus.toLowerCase().includes("pass") || 
                profile.student.grade12PassStatus.toLowerCase().includes("ជាប់")
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
              }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  profile.student.grade12PassStatus.toLowerCase().includes("pass") ||
                  profile.student.grade12PassStatus.toLowerCase().includes("ជាប់")
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-orange-500 to-amber-600"
                }`}>
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-bold mb-1">លទ្ធផល • Result</p>
                  <p className="text-sm font-black text-gray-900">{profile.student.grade12PassStatus}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remarks Section - Improved Design */}
      {profile.student.remarks && (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-600 to-slate-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">កំណត់សម្គាល់</h2>
                <p className="text-xs text-white/80 font-medium">Remarks</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-900 leading-relaxed font-medium">{profile.student.remarks}</p>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Button */}
      <div className="pt-2">
        <button
          onClick={onChangePassword}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-2xl shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Lock className="w-6 h-6" />
          <span className="font-bold text-lg">ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
        </button>
      </div>
    </div>
  );
}

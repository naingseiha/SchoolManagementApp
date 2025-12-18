"use client";

import React from "react";
import {
  X,
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  Hash,
  GraduationCap,
  Users,
  Calendar,
  Award,
  MapPin,
  Briefcase,
  Clock,
  CreditCard,
  Home,
  School,
  Sparkles,
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
  subjectIds?: string[];
  subjects?: any[];
  employeeId?: string;
  teacherId?: string;
  gender?: string;
  position?: string;
  role?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  homeroomClass?: any;
  homeroomClassId?: string;
  teachingClasses?: any[];
  classes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  subjects?: any[];
}

export default function TeacherDetailsModal({
  isOpen,
  onClose,
  teacher,
  subjects = [],
}: TeacherDetailsModalProps) {
  if (!isOpen || !teacher) return null;

  // Get full name
  const fullName =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName} ${teacher.lastName}`
      : teacher.name || "Unknown Teacher";

  // Get initials
  const initials =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`
      : fullName
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
          .substring(0, 2);

  // Get homeroom class
  const homeroomClass = teacher.homeroomClass || null;

  // Get teaching classes (handle different data structures)
  const teachingClasses = (teacher.teachingClasses || teacher.classes || [])
    .map((item: any) => item.class || item)
    .filter(Boolean);

  // Calculate total students across all teaching classes
  const totalStudents = teachingClasses.reduce(
    (sum: number, classItem: any) => sum + (classItem._count?.students || 0),
    0
  );

  // Get subject list from multiple sources
  const teacherSubjects = teacher.subjects?.length
    ? teacher.subjects.map((s) => s.nameKh || s.name)
    : teacher.subject
    ? teacher.subject.split(",").map((s) => s.trim())
    : [];

  // Calculate years of service
  const yearsOfService = teacher.hireDate
    ? new Date().getFullYear() - new Date(teacher.hireDate).getFullYear()
    : null;

  // Calculate age
  const age = teacher.dateOfBirth
    ? new Date().getFullYear() - new Date(teacher.dateOfBirth).getFullYear()
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                ព័ត៌មានលម្អិតគ្រូ • Teacher Details
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-white/25 backdrop-blur-lg flex items-center justify-center text-white font-black text-3xl border-4 border-white/40 shadow-xl">
                    {initials}
                  </div>
                  {/* Gender Badge */}
                  {teacher.gender && (
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white rounded-xl shadow-lg border-2 border-green-500">
                      <span className="text-lg">
                        {teacher.gender === "MALE" || teacher.gender === "male"
                          ? "👨"
                          : "👩"}
                      </span>
                    </div>
                  )}
                  {/* Role Badge */}
                  {teacher.role === "INSTRUCTOR" && (
                    <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg border-2 border-white">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name & Info */}
                <div>
                  <h2 className="text-3xl font-black mb-2 drop-shadow-md">
                    {fullName}
                  </h2>
                  {teacher.khmerName && (
                    <p className="text-xl text-white/95 mb-3 font-bold">
                      {teacher.khmerName}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {teacher.role && (
                      <span className="px-3 py-1.5 bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm border border-white/40">
                        {teacher.role === "INSTRUCTOR"
                          ? "🏠 គ្រូប្រចាំថ្នាក់"
                          : "📚 គ្រូធម្មតា"}
                      </span>
                    )}
                    {teacher.position && (
                      <span className="px-3 py-1.5 bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm border border-white/40">
                        💼 {teacher.position}
                      </span>
                    )}
                    {teacher.employeeId && (
                      <span className="px-3 py-1.5 bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm border border-white/40">
                        🆔 {teacher.employeeId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Homeroom Class */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-5 border-2 border-amber-200 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mb-3 shadow-md">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-amber-900">
                  {homeroomClass ? "1" : "0"}
                </p>
                <p className="text-xs text-amber-700 font-bold mt-1.5">
                  ថ្នាក់ប្រចាំ • Homeroom
                </p>
              </div>
            </div>

            {/* Teaching Classes Count */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-3 shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-blue-900">
                  {teachingClasses.length}
                </p>
                <p className="text-xs text-blue-700 font-bold mt-1.5">
                  ថ្នាក់បង្រៀន • Teaching
                </p>
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-5 border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-3 shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-purple-900">
                  {totalStudents}
                </p>
                <p className="text-xs text-purple-700 font-bold mt-1.5">
                  សិស្សសរុប • Students
                </p>
              </div>
            </div>

            {/* Years of Service */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-5 border-2 border-emerald-200 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl mb-3 shadow-md">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-emerald-900">
                  {yearsOfService !== null ? yearsOfService : "N/A"}
                </p>
                <p className="text-xs text-emerald-700 font-bold mt-1.5">
                  ឆ្នាំបម្រើការ • Years
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  ព័ត៌មានទំនាក់ទំនង • Contact
                </h3>
                <div className="space-y-3">
                  {/* Email */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-semibold mb-0.5">
                          អ៊ីមែល • Email
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  {(teacher.phone || teacher.phoneNumber) && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            លេខទូរស័ព្ទ • Phone
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {teacher.phone || teacher.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {teacher.address && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            អាសយដ្ឋាន • Address
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {teacher.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  ព័ត៌មានវិជ្ជាជីវៈ • Professional
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {/* Employee ID */}
                  {teacher.employeeId && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            លេខកូដ • Employee ID
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {teacher.employeeId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Position */}
                  {teacher.position && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            តួនាទី • Position
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {teacher.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {teacher.dateOfBirth && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            ថ្ងៃខែឆ្នាំកំណើត • DOB
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(teacher.dateOfBirth).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                            {age && (
                              <span className="text-xs text-purple-600 ml-2">
                                ({age} years)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hire Date */}
                  {teacher.hireDate && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-semibold mb-0.5">
                            ថ្ងៃចូលបម្រើការងារ • Hire Date
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(teacher.hireDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Homeroom Class (if exists) */}
              {homeroomClass && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-300 shadow-md">
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    ថ្នាក់ប្រចាំ • Homeroom Class
                  </h3>
                  <div className="bg-white border-2 border-amber-300 rounded-xl p-5 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900 text-lg mb-1. 5">
                          {homeroomClass.name}
                        </h4>
                        <p className="text-sm text-gray-600 font-semibold">
                          Grade {homeroomClass.grade}
                          {homeroomClass.section &&
                            ` • ${homeroomClass.section}`}
                          {homeroomClass.track && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                              {homeroomClass.track === "science"
                                ? "វិទ្យា"
                                : "សង្គម"}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Home className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-amber-100">
                      <Users className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-600 font-bold">
                        {homeroomClass._count?.students || 0} សិស្ស
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Teaching Subjects */}
              {teacherSubjects.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border-2 border-pink-200 shadow-md">
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    មុខវិជ្ជាបង្រៀន • Teaching Subjects
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-800 text-xs font-bold rounded-full">
                      {teacherSubjects.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {teacherSubjects.map((subject: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-white rounded-lg border-2 border-pink-200 hover:border-pink-400 hover:shadow-md transition-all"
                      >
                        <span className="text-sm font-bold text-gray-900">
                          {subject}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teaching Classes List */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <School className="w-4 h-4 text-white" />
                  </div>
                  ថ្នាក់ដែលត្រូវបង្រៀន • Teaching Classes
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {teachingClasses.length}
                  </span>
                </h3>
                {teachingClasses.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">
                      មិនទាន់មានថ្នាក់បង្រៀន
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      No teaching classes
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {teachingClasses.map((classItem: any) => {
                      const isHomeroom =
                        classItem.id === teacher.homeroomClassId;

                      return (
                        <div
                          key={classItem.id}
                          className={`bg-white border-2 rounded-xl p-4 hover: shadow-lg transition-all ${
                            isHomeroom
                              ? "border-amber-300 bg-amber-50"
                              : "border-blue-200 hover:border-blue-400"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-gray-900 text-base">
                                  {classItem.name}
                                </h4>
                                {isHomeroom && (
                                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-full">
                                    ថ្នាក់ប្រចាំ
                                  </span>
                                )}
                                {classItem.track && (
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                                    {classItem.track === "science"
                                      ? "វិទ្យា"
                                      : "សង្គម"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 font-semibold">
                                Grade {classItem.grade}
                                {classItem.section && ` • ${classItem.section}`}
                              </p>
                            </div>
                            <div
                              className={`p-2 rounded-lg ${
                                isHomeroom ? "bg-amber-100" : "bg-blue-100"
                              }`}
                            >
                              <GraduationCap
                                className={`w-4 h-4 ${
                                  isHomeroom
                                    ? "text-amber-600"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <Users className="w-3 h-3 text-blue-600" />
                            <p className="text-xs text-blue-600 font-bold">
                              {classItem._count?.students || 0} សិស្ស
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(teacher.createdAt || teacher.updatedAt) && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {teacher.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        Created
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(teacher.createdAt).toLocaleDateString(
                          "en-US"
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {teacher.updatedAt && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        Last Updated
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(teacher.updatedAt).toLocaleDateString(
                          "en-US"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold transition-all shadow-lg hover: shadow-xl flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            បិទ Close
          </button>
        </div>
      </div>
    </div>
  );
}

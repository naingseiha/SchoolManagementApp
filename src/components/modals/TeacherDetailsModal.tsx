"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  Hash,
  GraduationCap,
  Users,
  Calendar,
  X as XIcon,
} from "lucide-react";
import type { Teacher } from "@/lib/api/teachers";

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
}

export default function TeacherDetailsModal({
  isOpen,
  onClose,
  teacher,
}: TeacherDetailsModalProps) {
  // Get assigned classes
  const assignedClasses = teacher.classes || [];

  // Calculate total students across all classes
  const totalStudents = assignedClasses.reduce(
    (sum, classItem) => sum + (classItem._count?.students || 0),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ព័ត៌មានលម្អិតគ្រូ ${teacher.firstName} ${teacher.lastName} • Teacher Details`}
      size="large"
    >
      <div className="space-y-6">
        {/* Teacher Info Card */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-4 border-white/30">
                {teacher.firstName?.charAt(0)}
                {teacher.lastName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1 english-modern">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <p className="text-white/90 text-lg">
                  {teacher.subject ||
                    "មិនទាន់កំណត់មុខវិជ្ជា • No subject assigned"}
                </p>
                {teacher.employeeId && (
                  <p className="text-white/80 text-sm mt-1">
                    ID: {teacher.employeeId}
                  </p>
                )}
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <UserCheck className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {assignedClasses.length}
            </p>
            <p className="text-sm text-gray-600">ថ្នាក់ប្រចាំ • Classes</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            <p className="text-sm text-gray-600">សិស្សសរុប • Total Students</p>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            ព័ត៌មានទំនាក់ទំនង • Contact Information
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">អ៊ីមែល • Email</p>
                <p className="text-sm font-medium text-gray-900 english-modern">
                  {teacher.email}
                </p>
              </div>
            </div>
            {teacher.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">លេខទូរស័ព្ទ • Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {teacher.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            ព័ត៌មានវិជ្ជាជីវៈ • Professional Information
          </h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">មុខវិជ្ជា • Subject</p>
                <p className="text-sm font-medium text-gray-900">
                  {teacher.subject || "មិនទាន់កំណត់ • Not assigned"}
                </p>
              </div>
            </div>
            {teacher.employeeId && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">លេខកូដ • Employee ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    {teacher.employeeId}
                  </p>
                </div>
              </div>
            )}
            {teacher.createdAt && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">
                    កាលបរិច្ឆេទបង្កើត • Created Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Classes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            ថ្នាក់ប្រចាំ • Assigned Classes ({assignedClasses.length})
          </h3>
          {assignedClasses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>មិនទាន់មានថ្នាក់ប្រចាំ • No assigned classes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedClasses.map((classItem: any) => (
                <div
                  key={classItem.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {classItem.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Grade {classItem.grade}
                        {classItem.section && ` • Section ${classItem.section}`}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-600 font-medium">
                          {classItem._count?.students || 0} សិស្ស
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            <XIcon className="w-5 h-5" />
            <span>បិទ Close</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

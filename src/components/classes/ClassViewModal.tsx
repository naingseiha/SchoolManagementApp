"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StudentListTab from "@/components/classes/StudentListTab";
import AssignStudentsModal from "@/components/modals/AssignStudentsModal";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/useToast";
import {
  X,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  User,
  Loader2,
  RefreshCw,
  GitBranch,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { Class } from "@/lib/api/classes";

interface ClassViewModalProps {
  isOpen: boolean;
  classData: Class | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ClassViewModal({
  isOpen,
  classData,
  onClose,
  onRefresh,
}: ClassViewModalProps) {
  const { removeStudent, refresh: refreshClasses } = useClasses();
  const { success, error: showError, warning, ToastContainer } = useToast();

  const [activeTab, setActiveTab] = useState<"info" | "students">("info");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localClassData, setLocalClassData] = useState<Class | null>(classData);

  // Update local data when classData changes
  useEffect(() => {
    setLocalClassData(classData);
  }, [classData]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("info");
    }
  }, [isOpen]);

  if (!localClassData) return null;

  // Handle remove student
  const handleRemoveStudent = async (studentId: string) => {
    try {
      await removeStudent(localClassData.id, studentId);
      success("✅ បានដកសិស្សចេញពីថ្នាក់ដោយជោគជ័យ!");

      // Refresh class data
      await handleRefresh();
    } catch (error: any) {
      showError("❌ " + (error.message || "Failed to remove student"));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshClasses();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error refreshing:", error);
      showError("មិនអាចផ្ទុកទិន្នន័យឡើងវិញ");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle import students (placeholder)
  const handleImportStudents = () => {
    warning("មុខងារនេះនឹងត្រូវ implement ជាមួយ CSV/Excel import");
  };

  // Close assign modal and refresh
  const handleAssignModalClose = async () => {
    setShowAssignModal(false);
    await handleRefresh();
  };

  // Get track badge with improved design
  const getTrackBadge = () => {
    const gradeNum = parseInt(localClassData.grade);
    if (gradeNum !== 11 && gradeNum !== 12) return null;

    if (!localClassData.track) {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900">ត្រូវកំណត់ Track</p>
              <p className="text-sm text-amber-700">
                ថ្នាក់ទី១១ និងទី១២ ត្រូវជ្រើសរើស វិទ្យាសាស្ត្រ ឬ សង្គម
              </p>
            </div>
          </div>
        </div>
      );
    }

    const trackConfig = {
      science: {
        icon: "🧪",
        emoji: "🔬",
        label: "វិទ្យាសាស្ត្រ",
        labelEn: "Science",
        gradient: "from-blue-500 to-cyan-500",
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-300",
        text: "text-blue-900",
      },
      social: {
        icon: "📚",
        emoji: "🌍",
        label: "សង្គម",
        labelEn: "Social Studies",
        gradient: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
        border: "border-green-300",
        text: "text-green-900",
      },
    };

    const config =
      trackConfig[localClassData.track as keyof typeof trackConfig];
    if (!config) return null;

    return (
      <div
        className={`bg-gradient-to-r ${config.bg} border-2 ${config.border} rounded-xl p-4 shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`bg-gradient-to-br ${config.gradient} p-3 rounded-xl shadow-md`}
          >
            <span className="text-2xl">{config.icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              ផ្លូវសិក្សា • Track
            </p>
            <p
              className={`font-bold text-lg ${config.text} flex items-center gap-2`}
            >
              <span>{config.emoji}</span>
              <span>
                {config.label} • {config.labelEn}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const students = localClassData.students || [];
  const studentCount = localClassData._count?.students || students.length;
  const capacityPercentage = localClassData.capacity
    ? Math.round((studentCount / localClassData.capacity) * 100)
    : 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {localClassData.name}
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                ព័ត៌មានលម្អិតអំពីថ្នាក់រៀន • Class Details
              </p>
            </div>
          </div>
        }
        size="large"
      >
        <div className="space-y-6">
          {/* ✅ FIXED: Simple Tabs - Only color change */}
          <div className="flex gap-2 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-bold transition-colors border-b-4 ${
                activeTab === "info"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>ព័ត៌មាន</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-6 py-3 font-bold transition-colors border-b-4 ${
                activeTab === "students"
                  ? "text-purple-600 border-purple-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>សិស្ស</span>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {studentCount}
                </span>
              </div>
            </button>
          </div>

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-5">
              {/* Track Badge for Grade 11 & 12 */}
              {(parseInt(localClassData.grade) === 11 ||
                parseInt(localClassData.grade) === 12) &&
                getTrackBadge()}

              {/* Class Statistics Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Grade Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-blue-800">
                      ថ្នាក់ • Grade
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-900">
                    ថ្នាក់ទី {localClassData.grade}
                  </p>
                </div>

                {/* Section Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-purple-800">
                      ផ្នែក • Section
                    </span>
                  </div>
                  <p className="text-2xl font-black text-purple-900">
                    {localClassData.section || "គ្មាន"}
                  </p>
                </div>

                {/* Academic Year Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-green-800">
                      ឆ្នាំសិក្សា • Year
                    </span>
                  </div>
                  <p className="text-2xl font-black text-green-900">
                    {localClassData.academicYear}
                  </p>
                </div>

                {/* Capacity Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-sm font-bold text-orange-800">
                      សមត្ថភាព • Capacity
                    </span>
                  </div>
                  <p className="text-2xl font-black text-orange-900">
                    {studentCount}
                    {localClassData.capacity && (
                      <span className="text-lg text-orange-600">
                        {" "}
                        / {localClassData.capacity}
                      </span>
                    )}
                  </p>
                  {localClassData.capacity && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-bold text-orange-800 mb-1">
                        <span>ការបំពេញ</span>
                        <span>{capacityPercentage}%</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            capacityPercentage >= 90
                              ? "bg-gradient-to-r from-red-500 to-orange-500"
                              : capacityPercentage >= 70
                              ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(capacityPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Card */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-md">
                    <User className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-indigo-800 mb-2">
                      គ្រូបន្ទុក • Class Teacher
                    </p>
                    {localClassData.teacher ? (
                      <>
                        <p className="text-xl font-black text-indigo-900 mb-1">
                          {localClassData.teacher.khmerName ||
                            `${localClassData.teacher.firstName} ${localClassData.teacher.lastName}`}
                        </p>
                        {localClassData.teacher.email && (
                          <div className="flex items-center gap-2 text-sm text-indigo-700">
                            <Award className="w-4 h-4" />
                            <span>{localClassData.teacher.email}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 italic">
                        <AlertCircle className="w-5 h-5" />
                        <span>មិនទាន់កំណត់គ្រូបន្ទុក • Not assigned yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div>
              <StudentListTab
                students={students}
                classId={localClassData.id}
                loading={isRefreshing}
                onAddStudent={() => setShowAssignModal(true)}
                onImportStudents={handleImportStudents}
                onRemoveStudent={handleRemoveStudent}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-5 border-t-2 border-gray-200">
            <Button
              variant="secondary"
              icon={
                isRefreshing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )
              }
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="font-bold"
            >
              ផ្ទុកឡើងវិញ
            </Button>

            <Button
              variant="secondary"
              icon={<X className="w-5 h-5" />}
              onClick={onClose}
              className="font-bold"
            >
              បិទ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Students Modal */}
      {showAssignModal && (
        <AssignStudentsModal
          isOpen={showAssignModal}
          onClose={handleAssignModalClose}
          classData={localClassData}
        />
      )}

      <ToastContainer />
    </>
  );
}

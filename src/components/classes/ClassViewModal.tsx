"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import StudentListTab from "./StudentListTab";
import { Eye, Users, Clock, BookOpen } from "lucide-react";
import { Class, classesApi } from "@/lib/api/classes";

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
  const [activeTab, setActiveTab] = useState<
    "students" | "teachers" | "schedule"
  >("students");
  const [students, setStudents] = useState(classData?.students || []);
  const [loading, setLoading] = useState(false);

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen && classData?.id) {
      fetchClassDetails();
    }
  }, [isOpen, classData?.id]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("students");
    }
  }, [isOpen]);

  const fetchClassDetails = async () => {
    if (!classData?.id) return;

    try {
      setLoading(true);
      const details = await classesApi.getById(classData.id);
      if (details?.students) {
        setStudents(details.students);
      }
    } catch (error) {
      console.error("Failed to fetch class details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!classData?.id) return;

    try {
      await classesApi.removeStudent(classData.id, studentId);
      alert("✅ ដកសិស្សចេញពីថ្នាក់ដោយជោគជ័យ!");
      await fetchClassDetails();
      onRefresh?.();
    } catch (error: any) {
      alert("❌ " + (error.message || "Failed to remove student"));
    }
  };

  const handleAddStudent = () => {
    alert("មុខងារបន្ថែមសិស្ស: នឹងបើក modal ជ្រើសរើសសិស្ស");
    // TODO: Implement student selection modal
  };

  const handleImportStudents = () => {
    alert("មុខងារនាំចូលសិស្ស: នឹងបើក file upload");
    // TODO: Implement file upload for students
  };

  if (!classData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {classData.name}
            </h2>
            <p className="text-sm text-gray-600">
              ថ្នាក់ទី {classData.grade} • {classData.section || "គ្មានផ្នែក"} •{" "}
              {classData.academicYear}
            </p>
          </div>
        </div>
      }
      size="xlarge"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "students"
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>បញ្ជីសិស្ស</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "students"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {students.length}
            </span>
            {activeTab === "students" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "teachers"
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5. 356-1.857M17 20H7m10 0v-2c0-. 656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1. 857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>គ្រូបង្រៀន</span>
            {activeTab === "teachers" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "schedule"
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>កាលវិភាគ</span>
            {activeTab === "schedule" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
          {activeTab === "students" && (
            <StudentListTab
              students={students}
              classId={classData.id}
              loading={loading}
              onAddStudent={handleAddStudent}
              onImportStudents={handleImportStudents}
              onRemoveStudent={handleRemoveStudent}
            />
          )}

          {activeTab === "teachers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">គ្រូបង្រៀនក្នុងថ្នាក់</h3>
              </div>

              {/* Homeroom Teacher */}
              {classData.teacher && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500 p-4 rounded-full">
                      <svg
                        className="w-8 h-8 text-white"
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
                    </div>
                    <div>
                      <div className="text-xs text-purple-600 font-semibold mb-1">
                        គ្រូបន្ទុកថ្នាក់
                      </div>
                      <div className="text-lg font-black text-gray-900">
                        {classData.teacher.khmerName ||
                          `${classData.teacher.firstName} ${classData.teacher.lastName}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {classData.teacher.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Teachers - Placeholder */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5. 356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1. 857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-600 font-semibold">
                  បញ្ជីគ្រូបង្រៀនតាមវិជ្ជានឹងត្រូវ implement ជាមួយ API
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  នឹងបង្ហាញគ្រូបង្រៀនទាំងអស់ដែលបង្រៀនក្នុងថ្នាក់នេះ
                </p>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  កាលវិភាគសិក្សាប្រចាំសប្តាហ៍
                </h3>
              </div>

              {/* Schedule Placeholder */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">
                  កាលវិភាគសិក្សានឹងត្រូវ implement ជាមួយ API
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  នឹងបង្ហាញកាលវិភាគម៉ោងរៀនពីច័ន្ទ-សុក្រ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

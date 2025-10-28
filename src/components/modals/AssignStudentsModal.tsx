"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { UserPlus, Users, X, Check, Search, Loader2 } from "lucide-react";
import type { Class } from "@/lib/api/classes";

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
}

export default function AssignStudentsModal({
  isOpen,
  onClose,
  classData,
}: AssignStudentsModalProps) {
  const { students, assignStudentsToClass } = useData();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);

  // Show all students OR only available students
  const availableStudents = showAllStudents
    ? students.filter((student) => student.classId !== classData.id) // All except current class
    : students.filter((student) => !student.classId); // Only students without class

  // Get students already in this class
  const currentStudents = students.filter(
    (student) => student.classId === classData.id
  );

  // Filter students based on search
  const filteredStudents = availableStudents.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleAssign = async () => {
    if (selectedStudentIds.length === 0) {
      alert(
        "សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់!\nPlease select at least one student!"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await assignStudentsToClass(classData.id, selectedStudentIds);
      alert(
        `បានបន្ថែមសិស្ស ${selectedStudentIds.length} នាក់ ចូលក្នុងថ្នាក់ ${classData.name} ដោយជោគជ័យ!\n${selectedStudentIds.length} student(s) assigned successfully!`
      );
      setSelectedStudentIds([]);
      setSearchTerm("");
      setShowAllStudents(false);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to assign students");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`បន្ថែមសិស្សចូលថ្នាក់ ${classData.name} • Add Students to ${classData.name}`}
      size="large"
    >
      <div className="space-y-4">
        {/* Current Students Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Users className="w-5 h-5" />
            <h4 className="font-semibold">
              សិស្សក្នុងថ្នាក់បច្ចុប្បន្ន • Current Students
            </h4>
          </div>
          <p className="text-blue-700">
            {currentStudents.length === 0 ? (
              "មិនទាន់មានសិស្ស • No students yet"
            ) : (
              <>
                មានសិស្ស {currentStudents.length} នាក់ •{" "}
                {currentStudents
                  .slice(0, 3)
                  .map((s) => `${s.firstName} ${s.lastName}`)
                  .join(", ")}
                {currentStudents.length > 3 &&
                  ` និងសិស្សផ្សេងទៀត ${currentStudents.length - 3} នាក់`}
              </>
            )}
          </p>
        </div>

        {/* Toggle between available and all students */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
          <div>
            <p className="font-medium text-gray-900">
              {showAllStudents
                ? "បង្ហាញសិស្សទាំងអស់ • Showing all students"
                : "បង្ហាញតែសិស្សគ្មានថ្នាក់ • Showing only students without class"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {showAllStudents
                ? "អាចផ្ទេរសិស្សពីថ្នាក់ផ្សេង • Can transfer students from other classes"
                : "បង្ហាញតែសិស្សដែលមិនទាន់មានថ្នាក់ • Only unassigned students"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAllStudents(!showAllStudents);
              setSelectedStudentIds([]); // Clear selection when toggling
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showAllStudents
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50"
            }`}
          >
            {showAllStudents
              ? "បង្ហាញតែគ្មានថ្នាក់ Show Available Only"
              : "បង្ហាញទាំងអស់ Show All"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ស្វែងរកសិស្ស... Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Select All */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              បានជ្រើសរើស {selectedStudentIds.length} /{" "}
              {filteredStudents.length} នាក់
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              {selectedStudentIds.length === filteredStudents.length
                ? "ដកចេញទាំងអស់ Deselect All"
                : "ជ្រើសរើសទាំងអស់ Select All"}
            </button>
          </div>
        )}

        {/* Available Students List */}
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>
                {searchTerm
                  ? "រកមិនឃើញសិស្ស • No students found"
                  : availableStudents.length === 0
                  ? showAllStudents
                    ? "សិស្សទាំងអស់នៅក្នុងថ្នាក់នេះរួចហើយ • All students are in this class"
                    : "សិស្សទាំងអស់មានថ្នាក់រួចហើយ • All students are assigned"
                  : "មិនមានសិស្ស • No students available"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const hasClass =
                  student.classId && student.classId !== classData.id;

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-purple-50 hover:bg-purple-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {student.firstName?.charAt(0)}
                        {student.lastName?.charAt(0)}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 english-modern">
                          {student.firstName} {student.lastName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{student.email}</span>
                          <span className="capitalize">
                            {student.gender === "male" ? "ប្រុស" : "ស្រី"}
                          </span>
                          {hasClass ? (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium flex items-center gap-1">
                              <span>⚠️</span>
                              នឹងផ្ទេរពីថ្នាក់ផ្សេង Will transfer
                            </span>
                          ) : student.classId ? (
                            <span className="text-blue-600 font-medium">
                              នៅក្នុងថ្នាក់នេះ • In this class
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">
                              អាចបន្ថែម • Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Warning if transferring students */}
        {selectedStudentIds.some((id) => {
          const student = students.find((s) => s.id === id);
          return student?.classId && student.classId !== classData.id;
        }) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  ការព្រមាន • Warning
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  អ្នកកំពុងផ្ទេរសិស្សពីថ្នាក់ផ្សេង។
                  សិស្សទាំងនេះនឹងត្រូវដកចេញពីថ្នាក់ចាស់ ហើយបន្ថែមចូលថ្នាក់ថ្មី។
                  <br />
                  You are transferring students from other classes. They will be
                  removed from their current class and added to this class.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X className="w-5 h-5" />
            <span>បោះបង់ Cancel</span>
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedStudentIds.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>
                  បន្ថែម{" "}
                  {selectedStudentIds.length > 0 &&
                    `(${selectedStudentIds.length})`}{" "}
                  Add
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

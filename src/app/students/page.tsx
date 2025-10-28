"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StudentForm from "@/components/forms/StudentForm";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  UserCheck,
  UserX,
} from "lucide-react";
import type { Student } from "@/types";

export default function StudentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    students = [], // ✅ FIX: Default to empty array
    classes = [], // ✅ FIX: Default to empty array
    isLoadingStudents,
    studentsError,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      filterClass === "all" || student.classId === filterClass;

    return matchesSearch && matchesClass;
  });

  // Calculate statistics
  const stats = {
    total: students.length,
    male: students.filter((s) => s.gender === "male").length,
    female: students.filter((s) => s.gender === "female").length,
    classes: classes.length,
  };

  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (studentData: Student) => {
    try {
      setIsSubmitting(true);
      if (selectedStudent) {
        await updateStudent(studentData);
        alert("សិស្សត្រូវបានកែប្រែដោយជោគជ័យ!\nStudent updated successfully!");
      } else {
        await addStudent(studentData);
        alert("សិស្សត្រូវបានបង្កើតដោយជោគជ័យ!\nStudent created successfully!");
      }
      setIsModalOpen(false);
      setSelectedStudent(undefined);
    } catch (error: any) {
      alert(error.message || "Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (
      !confirm(
        `តើអ្នកចង់លុបសិស្ស ${student.firstName} ${student.lastName} មែនទេ?\nAre you sure you want to delete ${student.firstName} ${student.lastName}?`
      )
    ) {
      return;
    }

    try {
      await deleteStudent(student.id);
      alert("សិស្សត្រូវបានលុបដោយជោគជ័យ!\nStudent deleted successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to delete student");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  សិស្ស Students
                </h1>
                <p className="text-gray-600 mt-1">
                  ប្រព័ន្ធគ្រប់គ្រងសិស្ស • Manage student information
                </p>
              </div>
              <Button onClick={handleAddStudent}>
                <UserPlus className="w-5 h-5" />
                <span>បន្ថែមសិស្ស Add Student</span>
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    សិស្សសរុប • Total Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    សិស្សប្រុស • Male Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.male}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    សិស្សស្រី • Female Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.female}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserX className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ថ្នាក់ • Classes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.classes}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {studentsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{studentsError}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកសិស្ស... Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">
                  ថ្នាក់ទាំងអស់ • All Classes ({students.length})
                </option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} (
                    {students.filter((s) => s.classId === classItem.id).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Students Table */}
              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm || filterClass !== "all"
                      ? "រកមិនឃើញ No students found"
                      : "មិនទាន់មានសិស្ស No students yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterClass !== "all"
                      ? "សូមព្យាយាមផ្លាស់ប្តូរការស្វែងរក Try adjusting your filters"
                      : "ចាប់ផ្តើមដោយបន្ថែមសិស្សដំបូង Get started by adding your first student"}
                  </p>
                  {!searchTerm && filterClass === "all" && (
                    <Button onClick={handleAddStudent}>
                      <UserPlus className="w-5 h-5" />
                      <span>បន្ថែមសិស្ស Add Student</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ឈ្មោះ NAME
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ភេទ GENDER
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ថ្នាក់ CLASS
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            លេខទូរស័ព្ទ PHONE
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            សកម្មភាព ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                          const studentClass = classes.find(
                            (c) => c.id === student.classId
                          );
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                      {student.firstName.charAt(0)}
                                      {student.lastName.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 english-modern">
                                      {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500 english-modern">
                                      {student.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    student.gender === "male"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-pink-100 text-pink-800"
                                  }`}
                                >
                                  {student.gender === "male"
                                    ? "ប្រុស Male"
                                    : "ស្រី Female"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {studentClass ? studentClass.name : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.phone || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditStudent(student)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(student)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(undefined);
        }}
        title={
          selectedStudent
            ? "កែប្រែសិស្ស Edit Student"
            : "បន្ថែមសិស្ស Add Student"
        }
        size="large"
      >
        <StudentForm
          student={selectedStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedStudent(undefined);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

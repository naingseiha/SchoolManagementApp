"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StudentForm from "@/components/forms/StudentForm";
import { Student } from "@/types";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  GraduationCap,
  UserCheck,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function StudentsPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const {
    students,
    classes,
    isLoadingStudents,
    studentsError,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ✅ FIX: Move redirect logic to useEffect AFTER all hooks
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredByClass =
      selectedClass === "all"
        ? students
        : students.filter((s) => s.classId === selectedClass);

    const maleCount = filteredByClass.filter((s) => s.gender === "male").length;
    const femaleCount = filteredByClass.filter(
      (s) => s.gender === "female"
    ).length;

    return {
      total: filteredByClass.length,
      male: maleCount,
      female: femaleCount,
      classes: selectedClass === "all" ? classes.length : 1,
    };
  }, [students, classes, selectedClass]);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleSave = async (student: Student) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      if (selectedStudent) {
        await updateStudent(student);
      } else {
        await addStudent(student);
      }

      setIsModalOpen(false);
      setSelectedStudent(undefined);
    } catch (error: any) {
      setActionError(error.message || "Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "តើអ្នកប្រាកដថាចង់លុបសិស្សនេះមែនទេ? Are you sure you want to delete this student?"
      )
    ) {
      try {
        setActionError(null);
        await deleteStudent(id);
      } catch (error: any) {
        setActionError(error.message || "Failed to delete student");
      }
    }
  };

  const handleAddNew = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  // ✅ FIX: Show loading while checking auth instead of returning null
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                សិស្ស Students
              </h1>
              <p className="text-gray-600 mt-1">
                គ្រប់គ្រងព័ត៌មានសិស្ស • Manage student information
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoadingStudents}
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    isLoadingStudents ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="w-5 h-5" />
                <span>បន្ថែមសិស្ស Add Student</span>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {(studentsError || actionError) && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{studentsError || actionError}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingStudents && students.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Students */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        សិស្សសរុប
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Total Students
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Male Students */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <UserCheck className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        សិស្សប្រុស
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Male Students
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.male}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Female Students */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <UserCheck className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        សិស្សស្រី
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Female Students
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.female}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Classes */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        ថ្នាក់រៀន
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Classes
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.classes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter + Table - Continue with rest of the code... */}
              {/* (Keep the rest of the code unchanged from line 223 onwards) */}

              {/* Search and Filter Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ស្វែងរកសិស្ស Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>

                  {/* Class Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none appearance-none bg-white"
                    >
                      <option value="all">
                        ថ្នាក់ទាំងអស់ • All Classes ({students.length})
                      </option>
                      {classes.map((cls) => {
                        const count = students.filter(
                          (s) => s.classId === cls.id
                        ).length;
                        return (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({count} សិស្ស)
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ឈ្មោះ Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ភេទ Gender
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ថ្នាក់ Class
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          លេខទូរស័ព្ទ Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          សកម្មភាព Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => {
                        const studentClass = classes.find(
                          (c) => c.id === student.classId
                        );
                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-indigo-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {student.firstName.charAt(0)}
                                  {student.lastName.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="font-semibold text-gray-900">
                                    {student.lastName} {student.firstName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {student.dateOfBirth}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  student.gender === "male"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-pink-100 text-pink-700"
                                }`}
                              >
                                {student.gender === "male"
                                  ? "ប្រុស Male"
                                  : "ស្រី Female"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {studentClass?.name || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {student.phone || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleEdit(student)}
                                  disabled={isLoadingStudents}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>កែ</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(student.id)}
                                  disabled={isLoadingStudents}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>លុប</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        គ្មានសិស្សទេ
                      </p>
                      <p className="text-gray-400 text-sm">No students found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedStudent(undefined);
              setActionError(null);
            }}
            title={
              selectedStudent
                ? "កែប្រែសិស្ស Edit Student"
                : "បន្ថែមសិស្ស Add Student"
            }
            size="lg"
          >
            {actionError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{actionError}</span>
              </div>
            )}
            <StudentForm
              student={selectedStudent}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedStudent(undefined);
                setActionError(null);
              }}
              isSubmitting={isSubmitting}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}

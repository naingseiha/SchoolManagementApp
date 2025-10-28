"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TeacherForm from "@/components/forms/TeacherForm";
import TeacherDetailsModal from "@/components/modals/TeacherDetailsModal";
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Hash,
} from "lucide-react";
import type { Teacher } from "@/lib/api/teachers";

export default function TeachersPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const {
    teachers,
    isLoadingTeachers,
    teachersError,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(
    (teacher) =>
      `${teacher.firstName} ${teacher.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = () => {
    setSelectedTeacher(undefined);
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (
      !confirm(
        `តើអ្នកចង់លុបគ្រូ ${teacher.firstName} ${teacher.lastName} មែនទេ?\nAre you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`
      )
    ) {
      return;
    }

    try {
      await deleteTeacher(teacher.id);
      alert("គ្រូត្រូវបានលុបដោយជោគជ័យ!\nTeacher deleted successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to delete teacher");
    }
  };

  const handleSaveTeacher = async (teacherData: Teacher) => {
    try {
      setIsSubmitting(true);
      if (selectedTeacher) {
        await updateTeacher(teacherData);
        alert("គ្រូត្រូវបានកែប្រែដោយជោគជ័យ!\nTeacher updated successfully!");
      } else {
        await addTeacher(teacherData);
        alert("គ្រូត្រូវបានបង្កើតដោយជោគជ័យ!\nTeacher created successfully!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  // Get statistics
  const stats = {
    totalTeachers: teachers.length,
    withClasses: teachers.filter((t) => t.classes && t.classes.length > 0)
      .length,
    withoutClasses: teachers.filter((t) => !t.classes || t.classes.length === 0)
      .length,
    subjects: [...new Set(teachers.map((t) => t.subject).filter(Boolean))]
      .length,
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  គ្រូបង្រៀន Teachers
                </h1>
                <p className="text-gray-600 mt-1">
                  គ្រប់គ្រងគ្រូបង្រៀន • Manage teacher information
                </p>
              </div>
              <Button onClick={handleAddTeacher}>
                <Plus className="w-5 h-5" />
                <span>បង្កើតគ្រូថ្មី Add Teacher</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកគ្រូ... Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {teachersError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{teachersError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingTeachers ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading teachers...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">គ្រូសរុប • Total</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.totalTeachers}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserCheck className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        មានថ្នាក់ • With Classes
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.withClasses}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        គ្មានថ្នាក់ • No Classes
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.withoutClasses}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <UserCheck className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        មុខវិជ្ជា • Subjects
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.subjects}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Teachers Grid */}
              {filteredTeachers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm
                      ? "រកមិនឃើញ No teachers found"
                      : "មិនទាន់មានគ្រូ No teachers yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "សូមស្វែងរកដោយពាក្យគន្លឹះផ្សេង Try a different search term"
                      : "ចាប់ផ្តើមដោយបង្កើតគ្រូបង្រៀនដំបូង Get started by adding your first teacher"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleAddTeacher}>
                      <Plus className="w-5 h-5" />
                      <span>បង្កើតគ្រូថ្មី Add Teacher</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                              {teacher.firstName?.charAt(0)}
                              {teacher.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-white truncate english-modern">
                                {teacher.firstName} {teacher.lastName}
                              </h3>
                              <p className="text-sm text-white/80 truncate">
                                {teacher.subject ||
                                  "មិនទាន់កំណត់មុខវិជ្ជា No subject"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        {/* Email */}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate english-modern">
                            {teacher.email}
                          </span>
                        </div>

                        {/* Phone */}
                        {teacher.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">
                              {teacher.phone}
                            </span>
                          </div>
                        )}

                        {/* Employee ID */}
                        {teacher.employeeId && (
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">
                              ID: {teacher.employeeId}
                            </span>
                          </div>
                        )}

                        {/* Classes Count */}
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-600">
                            ថ្នាក់ប្រចាំ: {teacher.classes?.length || 0} ថ្នាក់
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleViewDetails(teacher)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>មើល</span>
                          </button>
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            <span>កែ</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>លុប</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create/Edit Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedTeacher
            ? "កែប្រែគ្រូ Edit Teacher"
            : "បង្កើតគ្រូថ្មី Create Teacher"
        }
      >
        <TeacherForm
          teacher={selectedTeacher}
          onSave={handleSaveTeacher}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <TeacherDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          teacher={selectedTeacher}
        />
      )}
    </div>
  );
}

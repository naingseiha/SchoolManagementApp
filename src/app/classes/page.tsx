"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ClassForm from "@/components/forms/ClassForm";
import AssignStudentsModal from "@/components/modals/AssignStudentsModal";
import ClassDetailsModal from "@/components/modals/ClassDetailsModal";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  UserCheck,
  BookOpen,
  Eye,
  Loader2,
  UserPlus,
} from "lucide-react";
import type { Class } from "@/lib/api/classes";

export default function ClassesPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const {
    classes,
    isLoadingClasses,
    classesError,
    addClass,
    updateClass,
    deleteClass,
    teachers,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();
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

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = () => {
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classItem: Class) => {
    if (
      !confirm(
        `តើអ្នកចង់លុបថ្នាក់ ${classItem.name} មែនទេ?\nAre you sure you want to delete ${classItem.name}?`
      )
    ) {
      return;
    }

    try {
      await deleteClass(classItem.id);
      alert("ថ្នាក់ត្រូវបានលុបដោយជោគជ័យ!\nClass deleted successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to delete class");
    }
  };

  const handleSaveClass = async (classData: Class) => {
    try {
      setIsSubmitting(true);
      if (selectedClass) {
        await updateClass(classData);
        alert("ថ្នាក់ត្រូវបានកែប្រែដោយជោគជ័យ!\nClass updated successfully!");
      } else {
        await addClass(classData);
        alert("ថ្នាក់ត្រូវបានបង្កើតដោយជោគជ័យ!\nClass created successfully!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to save class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStudents = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsAssignModalOpen(true);
  };

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDetailsModalOpen(true);
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                  ថ្នាក់រៀន Classes
                </h1>
                <p className="text-gray-600 mt-1">
                  គ្រប់គ្រងថ្នាក់រៀន • Manage class information
                </p>
              </div>
              <Button onClick={handleAddClass}>
                <Plus className="w-5 h-5" />
                <span>បង្កើតថ្នាក់ថ្មី Add Class</span>
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
                  placeholder="ស្វែងរកថ្នាក់... Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {classesError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{classesError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingClasses ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        ថ្នាក់សរុប • Total Classes
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {classes.length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        សិស្សសរុប • Total Students
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {classes.reduce(
                          (sum, c) => sum + (c._count?.students || 0),
                          0
                        )}
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
                        មានគ្រូប្រចាំថ្នាក់ • With Teachers
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {classes.filter((c) => c.teacherId).length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserCheck className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes Grid */}
              {filteredClasses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm
                      ? "រកមិនឃើញ No classes found"
                      : "មិនទាន់មានថ្នាក់ No classes yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "សូមស្វែងរកដោយពាក្យគន្លឹះផ្សេង Try a different search term"
                      : "ចាប់ផ្តើមដោយបង្កើតថ្នាក់រៀនដំបូង Get started by creating your first class"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleAddClass}>
                      <Plus className="w-5 h-5" />
                      <span>បង្កើតថ្នាក់ថ្មី Add Class</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">
                              {classItem.name}
                            </h3>
                            <p className="text-sm text-white/80">
                              Grade {classItem.grade}
                              {classItem.section &&
                                ` • Section ${classItem.section}`}
                            </p>
                          </div>
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        {/* Class Teacher */}
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">
                            គ្រូប្រចាំថ្នាក់:
                          </span>
                          <span className="font-medium text-gray-900 english-modern">
                            {classItem.teacher
                              ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                              : "មិនទាន់កំណត់ Not assigned"}
                          </span>
                        </div>

                        {/* Student Count */}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">សិស្ស:</span>
                          <span className="font-medium text-gray-900">
                            {classItem._count?.students || 0} នាក់
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleViewDetails(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>មើល View</span>
                          </button>
                          <button
                            onClick={() => handleAssignStudents(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>បន្ថែមសិស្ស Add</span>
                          </button>
                          <button
                            onClick={() => handleEditClass(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            <span>កែ Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>លុប Delete</span>
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

      {/* Create/Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedClass
            ? "កែប្រែថ្នាក់ Edit Class"
            : "បង្កើតថ្នាក់ថ្មី Create Class"
        }
      >
        <ClassForm
          classData={selectedClass}
          onSave={handleSaveClass}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Assign Students Modal */}
      {selectedClass && (
        <AssignStudentsModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          classData={selectedClass}
        />
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <ClassDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          classData={selectedClass}
        />
      )}
    </div>
  );
}

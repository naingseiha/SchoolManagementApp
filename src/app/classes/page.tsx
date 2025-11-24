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
import ExportStudentsModal from "@/components/modals/ExportStudentsModal";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Eye,
  Loader2,
  UserPlus,
  Download,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react";
import type { Class } from "@/lib/api/classes";

export default function ClassesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    classes,
    isLoadingClasses,
    classesError,
    addClass,
    updateClass,
    deleteClass,
    refreshClasses,
  } = useData();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">
            កំពុងពិនិត្យ... • Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Filter classes based on search and grade
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.section?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === "all" || classItem.grade === filterGrade;

    return matchesSearch && matchesGrade;
  });

  // Calculate statistics
  const stats = {
    total: classes.length,
    totalStudents: classes.reduce(
      (sum, c) => sum + (c._count?.students || 0),
      0
    ),
    withTeacher: classes.filter((c) => c.teacherId).length,
    averageStudents:
      classes.length > 0
        ? Math.round(
            classes.reduce((sum, c) => sum + (c._count?.students || 0), 0) /
              classes.length
          )
        : 0,
  };

  // Get unique grades for filter
  const availableGrades = Array.from(
    new Set(classes.map((c) => c.grade))
  ).sort();

  // ==================== HANDLERS ====================

  const handleAddClass = () => {
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classItem: Class) => {
    const studentCount = classItem._count?.students || 0;

    // Check if class has students
    if (studentCount > 0) {
      alert(
        `❌ មិនអាចលុបថ្នាក់ដែលមានសិស្ស ${studentCount} នាក់!\n\nCannot delete class with ${studentCount} student(s)!\n\nសូមដកសិស្សចេញជាមុនសិន • Please remove students first.`
      );
      return;
    }

    // Confirm deletion
    if (
      !confirm(
        `តើអ្នកចង់លុបថ្នាក់ "${classItem.name}" មែនទេ?\n\nAre you sure you want to delete "${classItem.name}"?\n\nសកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ • This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Deleting class:", classItem.id);
      await deleteClass(classItem.id);
      alert("✅ ថ្នាក់ត្រូវបានលុបដោយជោគជ័យ!\nClass deleted successfully!");
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      alert(
        `❌ មិនអាចលុបថ្នាក់បានទេ!\n\n${
          error.message || "Failed to delete class"
        }`
      );
    }
  };

  const handleSaveClass = async (classData: any) => {
    try {
      setIsSubmitting(true);
      if (selectedClass) {
        await updateClass({ ...classData, id: selectedClass.id });
        alert("✅ ថ្នាក់ត្រូវបានកែប្រែដោយជោគជ័យ!\nClass updated successfully!");
      } else {
        await addClass(classData);
        alert("✅ ថ្នាក់ត្រូវបានបង្កើតដោយជោគជ័យ!\nClass created successfully!");
      }
      setIsModalOpen(false);
      setSelectedClass(undefined);
    } catch (error: any) {
      console.error("❌ Save error:", error);
      alert(`❌ ${error.message || "Failed to save class"}`);
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

  const handleExportClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsExportModalOpen(true);
  };

  const handleRefresh = async () => {
    try {
      await refreshClasses();
    } catch (error) {
      console.error("❌ Refresh error:", error);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-purple-600" />
                ថ្នាក់រៀន • Classes
              </h1>
              <p className="text-gray-600 mt-1">
                គ្រប់គ្រងថ្នាក់រៀនទាំងអស់ • Manage all classes
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                disabled={isLoadingClasses}
              >
                {isLoadingClasses ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                <span>ផ្ទុកឡើងវិញ</span>
              </Button>
              <Button onClick={handleAddClass}>
                <Plus className="w-5 h-5" />
                <span>បង្កើតថ្នាក់ថ្មី</span>
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {classesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{classesError}</p>
                </div>
                <Button onClick={handleRefresh} variant="secondary" size="sm">
                  <RefreshCw className="w-4 h-4" />
                  <span>សាកល្បងម្តងទៀត</span>
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingClasses && classes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  កំពុងផ្ទុកថ្នាក់រៀន... • Loading classes...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">ថ្នាក់សរុប • Total</p>
                    <GraduationCap className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs opacity-75 mt-1">ថ្នាក់រៀន</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">សិស្សសរុប</p>
                    <Users className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs opacity-75 mt-1">នាក់</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">មានគ្រូ</p>
                    <UserCheck className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{stats.withTeacher}</p>
                  <p className="text-xs opacity-75 mt-1">ថ្នាក់</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">មធ្យម</p>
                    <Users className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{stats.averageStudents}</p>
                  <p className="text-xs opacity-75 mt-1">សិស្ស/ថ្នាក់</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ស្វែងរកថ្នាក់... • Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Grade Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">ថ្នាក់ទាំងអស់ • All Grades</option>
                      {availableGrades.map((grade) => (
                        <option key={grade} value={grade}>
                          ថ្នាក់ទី {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || filterGrade !== "all") && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      ស្វែងរកឃើញ: {filteredClasses.length} ថ្នាក់
                    </span>
                    {(searchTerm || filterGrade !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterGrade("all");
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        សម្អាតតម្រង • Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Classes Grid */}
              {filteredClasses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm || filterGrade !== "all"
                      ? "រកមិនឃើញ • No classes found"
                      : "មិនទាន់មានថ្នាក់ • No classes yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterGrade !== "all"
                      ? "សូមស្វែងរកដោយពាក្យគន្លឹះផ្សេង • Try a different search"
                      : "ចាប់ផ្តើមដោយបង្កើតថ្នាក់រៀនដំបូង • Get started by creating your first class"}
                  </p>
                  {!searchTerm && filterGrade === "all" && (
                    <Button onClick={handleAddClass}>
                      <Plus className="w-5 h-5" />
                      <span>បង្កើតថ្នាក់ថ្មី</span>
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
                              ថ្នាក់ទី {classItem.grade}
                              {classItem.section && ` • ${classItem.section}`}
                            </p>
                          </div>
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        {/* Teacher */}
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">
                            គ្រូប្រចាំថ្នាក់:
                          </span>
                          <span className="font-medium text-gray-900 truncate">
                            {classItem.teacher
                              ? classItem.teacher.khmerName ||
                                `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                              : "មិនទាន់កំណត់"}
                          </span>
                        </div>

                        {/* Student Count */}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-600">សិស្ស:</span>
                          <span className="font-medium text-gray-900">
                            {classItem._count?.students || 0} នាក់
                          </span>
                          {classItem.capacity && (
                            <span className="text-xs text-gray-500">
                              / {classItem.capacity}
                            </span>
                          )}
                        </div>

                        {/* Academic Year */}
                        <div className="text-xs text-gray-500">
                          ឆ្នាំសិក្សា: {classItem.academicYear}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleViewDetails(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                            title="មើលព័ត៌មានលម្អិត"
                          >
                            <Eye className="w-4 h-4" />
                            <span>មើល</span>
                          </button>

                          <button
                            onClick={() => handleExportClass(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm font-medium"
                            title="នាំចេញ Excel"
                          >
                            <Download className="w-4 h-4" />
                            <span>នាំចេញ</span>
                          </button>

                          <button
                            onClick={() => handleAssignStudents(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors text-sm font-medium"
                            title="បន្ថែមសិស្ស"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>បន្ថែម</span>
                          </button>

                          <button
                            onClick={() => handleEditClass(classItem)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                            title="កែប្រែ"
                          >
                            <Edit className="w-4 h-4" />
                            <span>កែ</span>
                          </button>
                        </div>

                        {/* Delete Button (separate row) */}
                        <button
                          onClick={() => handleDeleteClass(classItem)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                          title="លុបថ្នាក់"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>លុបថ្នាក់ • Delete Class</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Create/Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={
          selectedClass
            ? "កែប្រែថ្នាក់ • Edit Class"
            : "បង្កើតថ្នាក់ថ្មី • Create Class"
        }
        size="large"
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
          onClose={() => {
            setIsAssignModalOpen(false);
            handleRefresh();
          }}
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

      {/* Export Students Modal */}
      {selectedClass && (
        <ExportStudentsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          classData={selectedClass}
        />
      )}
    </div>
  );
}

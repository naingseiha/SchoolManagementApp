"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useClasses } from "@/hooks/useClasses";
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
  Eye,
  Loader2,
  UserPlus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { Class } from "@/lib/api/classes";

export default function ClassesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    classes,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    refresh,
  } = useClasses();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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
      <div className="flex items-center justify-center min-h-screen">
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

  // Show data loading
  if (loading && classes.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">
                កំពុងផ្ទុកថ្នាក់រៀន... • Loading classes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={refresh}
                icon={<RefreshCw className="w-5 h-5" />}
              >
                សាកល្បងម្តងទៀត • Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter classes
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
  };

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

    // ✅ Check if class has students
    if (studentCount > 0) {
      alert(
        `❌ មិនអាចលុបថ្នាក់ដែលមានសិស្ស ${studentCount} នាក់!\n\nCannot delete class with ${studentCount} student(s)!\n\nសូមដកសិស្សចេញជាមុនសិន • Please remove students first.`
      );
      return;
    }

    // ✅ Confirm deletion
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
        await updateClass(selectedClass.id, classData);
        alert("✅ ថ្នាក់ត្រូវបានកែប្រែដោយជោគជ័យ!\nClass updated successfully!");
      } else {
        await addClass(classData);
        alert("✅ ថ្នាក់ត្រូវបានបង្កើតដោយជោគជ័យ!\nClass created successfully!");
      }
      setIsModalOpen(false);
      setSelectedClass(undefined);
    } catch (error: any) {
      alert("❌ " + (error.message || "Failed to save class"));
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
                onClick={refresh}
                variant="secondary"
                icon={
                  loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )
                }
                disabled={loading}
              >
                ផ្ទុកឡើងវិញ
              </Button>
              <Button
                onClick={handleAddClass}
                icon={<Plus className="w-5 h-5" />}
              >
                បង្កើតថ្នាក់ថ្មី
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">សរុប • Total</div>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">ថ្នាក់រៀន</div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">សិស្សសរុប</div>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <div className="text-sm opacity-90">នាក់</div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">មានគ្រូប្រចាំថ្នាក់</div>
              <div className="text-3xl font-bold">{stats.withTeacher}</div>
              <div className="text-sm opacity-90">ថ្នាក់</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកថ្នាក់... • Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">ថ្នាក់ទាំងអស់ • All Grades</option>
                <option value="7">ថ្នាក់ទី៧</option>
                <option value="8">ថ្នាក់ទី៨</option>
                <option value="9">ថ្នាក់ទី៩</option>
                <option value="10">ថ្នាក់ទី១០</option>
                <option value="11">ថ្នាក់ទី១១</option>
                <option value="12">ថ្នាក់ទី១២</option>
              </select>
            </div>
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
                  ? "សូមស្វែងរកដោយពាក្យគន្លឹះផ្សេង"
                  : "ចាប់ផ្តើមដោយបង្កើតថ្នាក់រៀនដំបូង"}
              </p>
              {!searchTerm && filterGrade === "all" && (
                <Button
                  onClick={handleAddClass}
                  icon={<Plus className="w-5 h-5" />}
                >
                  បង្កើតថ្នាក់ថ្មី
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
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">គ្រូប្រចាំថ្នាក់:</span>
                      <span className="font-medium text-gray-900">
                        {classItem.teacher
                          ? classItem.teacher.khmerName ||
                            `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                          : "មិនទាន់កំណត់"}
                      </span>
                    </div>

                    {/* Student Count */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-600" />
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
                      >
                        <Eye className="w-4 h-4" />
                        <span>មើល</span>
                      </button>
                      <button
                        onClick={() => handleAssignStudents(classItem)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm font-medium"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>បន្ថែម</span>
                      </button>
                      <button
                        onClick={() => handleEditClass(classItem)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span>កែ</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
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
        </main>
      </div>

      {/* Modals */}
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

      {selectedClass && (
        <>
          <AssignStudentsModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              refresh(); // Refresh after assigning
            }}
            classData={selectedClass}
          />

          <ClassDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            classData={selectedClass}
          />
        </>
      )}
    </div>
  );
}

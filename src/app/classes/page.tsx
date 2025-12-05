"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/useToast"; // ✅ NEW
import ClassForm from "@/components/forms/ClassForm";
import ClassCard from "@/components/classes/ClassCard";
import ClassStatistics from "@/components/classes/ClassStatistics";
import ClassFilters from "@/components/classes/ClassFilters";
import ClassViewModal from "@/components/classes/ClassViewModal";
import EmptyState from "@/components/classes/EmptyState";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Plus,
  GraduationCap,
  Edit,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Class } from "@/lib/api/classes";

export default function ClassesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    classes,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    refresh,
  } = useClasses();

  // ✅ NEW: Toast notification
  const { success, error: showError, warning, ToastContainer } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClasses, setShowClasses] = useState(false);
  const [viewClassModal, setViewClassModal] = useState<{
    isOpen: boolean;
    classData: Class | null;
  }>({
    isOpen: false,
    classData: null,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (loading && showClasses && classes.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">កំពុងផ្ទុកថ្នាក់រៀន... </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                សាកល្បងម្តងទៀត
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === "all" || cls.grade === filterGrade;
    const matchesYear = filterYear === "all" || cls.academicYear === filterYear;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && cls.isActive !== false) ||
      (filterStatus === "inactive" && cls.isActive === false);

    return matchesSearch && matchesGrade && matchesYear && matchesStatus;
  });

  // Get unique academic years
  const academicYears = Array.from(
    new Set(classes.map((c) => c.academicYear))
  ).sort();

  // Calculate statistics
  const stats = {
    totalClasses: classes.length,
    activeClasses: classes.filter((c) => c.isActive !== false).length,
    totalStudents: classes.reduce(
      (sum, c) => sum + (c._count?.students || c.students?.length || 0),
      0
    ),
    totalCapacity: classes.reduce((sum, c) => sum + (c.capacity || 0), 0),
    withTeachers: classes.filter((c) => c.teacherId).length,
    averageSize:
      classes.length > 0
        ? Math.round(
            classes.reduce(
              (sum, c) => sum + (c._count?.students || c.students?.length || 0),
              0
            ) / classes.length
          )
        : 0,
  };

  // ✅ UPDATED: Handlers with Toast
  const handleSaveClass = async (classData: any) => {
    try {
      setIsSubmitting(true);
      if (selectedClass) {
        await updateClass(selectedClass.id, classData);
        success("✅ ថ្នាក់រៀនត្រូវបានកែប្រែដោយជោគជ័យ!");
      } else {
        await addClass(classData);
        success("✅ ថ្នាក់រៀនត្រូវបានបង្កើតដោយជោគជ័យ!");
      }
      setIsModalOpen(false);
      setSelectedClass(undefined);
    } catch (error: any) {
      showError("❌ " + (error.message || "Failed to save class"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (cls: Class) => {
    const studentCount = cls._count?.students || cls.students?.length || 0;

    if (studentCount > 0) {
      warning(
        `មិនអាចលុបថ្នាក់ដែលមានសិស្ស ${studentCount} នាក់!  សូមផ្ទេរសិស្សមុនសិន។`
      );
      return;
    }

    if (!confirm(`តើអ្នកចង់លុបថ្នាក់រៀន "${cls.name}" មែនទេ?`)) {
      return;
    }

    try {
      await deleteClass(cls.id);
      success("✅ ថ្នាក់រៀនត្រូវបានលុបដោយជោគជ័យ!");
    } catch (error: any) {
      showError("❌ " + (error.message || "Failed to delete class"));
    }
  };

  const handleToggleView = () => {
    setShowClasses(!showClasses);
    if (!showClasses && classes.length === 0) {
      refresh();
    }
  };

  const handleViewClass = (cls: Class) => {
    setViewClassModal({ isOpen: true, classData: cls });
  };

  const handleExport = (cls: Class) => {
    warning(
      `នាំចេញថ្នាក់: ${cls.name}\n\nមុខងារនេះនឹងត្រូវ implement ជាមួយ API`
    );
  };

  const handleImport = (cls: Class) => {
    warning(
      `នាំចូលសិស្សក្នុងថ្នាក់: ${cls.name}\n\nមុខងារនេះនឹងត្រូវ implement ជាមួយ API`
    );
  };

  const handleManage = (cls: Class) => {
    setViewClassModal({ isOpen: true, classData: cls });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterGrade("all");
    setFilterYear("all");
    setFilterStatus("all");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">
                    ថ្នាក់រៀន
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Classes Management
                  </p>
                </div>
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
                  onClick={() => {
                    setSelectedClass(undefined);
                    setIsModalOpen(true);
                  }}
                  variant="primary"
                  icon={<Plus className="w-5 h-5" />}
                >
                  បង្កើតថ្នាក់រៀនថ្មី
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {showClasses && classes.length > 0 && (
            <ClassStatistics stats={stats} />
          )}

          {/* Filters */}
          {showClasses && (
            <ClassFilters
              showClasses={showClasses}
              searchTerm={searchTerm}
              filterGrade={filterGrade}
              filterYear={filterYear}
              filterStatus={filterStatus}
              academicYears={academicYears}
              filteredCount={filteredClasses.length}
              totalCount={classes.length}
              onToggleView={handleToggleView}
              onSearchChange={setSearchTerm}
              onGradeChange={setFilterGrade}
              onYearChange={setFilterYear}
              onStatusChange={setFilterStatus}
              onClearFilters={clearFilters}
            />
          )}

          {/* Classes Grid */}
          {showClasses && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  onView={handleViewClass}
                  onEdit={(cls) => {
                    setSelectedClass(cls);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteClass}
                  onExport={handleExport}
                  onImport={handleImport}
                  onManage={handleManage}
                />
              ))}

              {filteredClasses.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <GraduationCap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold text-lg">
                    មិនមានថ្នាក់រៀនត្រូវនឹងលក្ខខណ្ឌនេះ
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    សូមសាកល្បងផ្លាស់ប្តូរការច្រោះ
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!showClasses && <EmptyState onShowClasses={handleToggleView} />}
        </main>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={
          selectedClass ? (
            <span className="flex items-center gap-2">
              <Edit className="w-6 h-6" />
              កែប្រែថ្នាក់រៀន
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="w-6 h-6" />
              បង្កើតថ្នាក់រៀនថ្មី
            </span>
          )
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

      {/* View Class Modal */}
      <ClassViewModal
        isOpen={viewClassModal.isOpen}
        classData={viewClassModal.classData}
        onClose={() => setViewClassModal({ isOpen: false, classData: null })}
        onRefresh={refresh}
      />

      {/* ✅ Toast Container */}
      <ToastContainer />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/useToast"; // ✅ NEW
import SubjectForm from "@/components/forms/SubjectForm";
import SubjectCard from "@/components/subjects/SubjectCard";
import SubjectStatistics from "@/components/subjects/SubjectStatistics";
import SubjectFilters from "@/components/subjects/SubjectFilters";
import EmptyState from "@/components/subjects/EmptyState";
import ViewSubjectModal from "@/components/subjects/ViewSubjectModal";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Plus,
  BookOpen,
  Edit,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
} from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

export default function SubjectsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    subjects,
    loading: subjectsLoading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    refresh,
  } = useSubjects();

  // ✅ NEW: Toast notifications
  const { success, error: showError, warning, ToastContainer } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingSubject, setViewingSubject] = useState<Subject | undefined>();

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

  if (subjectsLoading && showSubjects && subjects.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading subjects...</p>
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
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.nameKh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = filterGrade === "all" || subject.grade === filterGrade;
    const matchesCategory =
      filterCategory === "all" || subject.category === filterCategory;
    const matchesTrack =
      filterTrack === "all" ||
      (filterTrack === "none" && !subject.track) ||
      subject.track === filterTrack;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && subject.isActive) ||
      (filterStatus === "inactive" && !subject.isActive);

    return (
      matchesSearch &&
      matchesGrade &&
      matchesCategory &&
      matchesTrack &&
      matchesStatus
    );
  });

  // Calculate statistics
  const stats = {
    totalSubjects: subjects.length,
    activeSubjects: subjects.filter((s) => s.isActive).length,
    inactiveSubjects: subjects.filter((s) => !s.isActive).length,
    totalHours: subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0),
  };

  // ✅ UPDATED: Handlers with Toast
  const handleSaveSubject = async (subjectData: any) => {
    try {
      setIsSubmitting(true);

      if (selectedSubject) {
        await updateSubject(selectedSubject.id, subjectData);
        success("✅ មុខវិជ្ជាត្រូវបានកែប្រែដោយជោគជ័យ!");
      } else {
        await addSubject(subjectData);
        success("✅ មុខវិជ្ជាត្រូវបានបង្កើតដោយជោគជ័យ!");
      }

      setIsModalOpen(false);
      setSelectedSubject(undefined);
    } catch (error: any) {
      console.error("Save subject error:", error);
      showError("❌ " + (error.message || "Failed to save subject"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (
      !confirm(
        `តើអ្នកប្រាកដថាចង់លុបមុខវិជ្ជា "${
          subject.nameKh || subject.name
        }" មែនទេ? `
      )
    ) {
      return;
    }

    try {
      await deleteSubject(subject.id);
      success("✅ មុខវិជ្ជាត្រូវបានលុបដោយជោគជ័យ!");
    } catch (error: any) {
      showError("❌ " + (error.message || "Failed to delete subject"));
    }
  };

  const handleToggleView = () => {
    setShowSubjects(!showSubjects);
    if (!showSubjects && subjects.length === 0) {
      refresh();
    }
  };

  const handleViewSubject = (subject: Subject) => {
    setViewingSubject(subject);
    setViewModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterGrade("all");
    setFilterCategory("all");
    setFilterTrack("all");
    setFilterStatus("all");
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  មុខវិជ្ជា • Subjects
                </h1>
                <p className="text-gray-600 mt-1">
                  គ្រប់គ្រងមុខវិជ្ជា • Manage subject information
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={refresh}
                  variant="secondary"
                  icon={
                    subjectsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )
                  }
                  disabled={subjectsLoading}
                >
                  ផ្ទុកឡើងវិញ • Refresh
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSubject(undefined);
                    setIsModalOpen(true);
                  }}
                  variant="primary"
                  icon={<Plus className="w-5 h-5" />}
                >
                  បង្កើតមុខវិជ្ជាថ្មី • Create Subject
                </Button>
              </div>
            </div>
          </div>

          {/* Show/Hide Subjects Section */}
          {!showSubjects ? (
            <EmptyState onShowSubjects={handleToggleView} />
          ) : (
            <>
              {subjects.length > 0 && <SubjectStatistics stats={stats} />}

              <SubjectFilters
                searchTerm={searchTerm}
                filterGrade={filterGrade}
                filterCategory={filterCategory}
                filterTrack={filterTrack}
                filterStatus={filterStatus}
                filteredCount={filteredSubjects.length}
                totalCount={subjects.length}
                onSearchChange={setSearchTerm}
                onGradeChange={setFilterGrade}
                onCategoryChange={setFilterCategory}
                onTrackChange={setFilterTrack}
                onStatusChange={setFilterStatus}
                onClearFilters={clearFilters}
              />

              {filteredSubjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm
                      ? "រកមិនឃើញ • No subjects found"
                      : "មិនទាន់មានមុខវិជ្ជា • No subjects yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "សូមស្វែងរកដោយពាក្យគន្លឹះផ្សេង • Try a different search term"
                      : "ចាប់ផ្តើមដោយបង្កើតមុខវិជ្ជាដំបូង • Get started by adding your first subject"}
                  </p>
                  {!searchTerm && (
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setShowSubjects(false)}
                        variant="secondary"
                        icon={<Eye className="w-5 h-5" />}
                      >
                        លាក់មុខវិជ្ជា • Hide
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedSubject(undefined);
                          setIsModalOpen(true);
                        }}
                        variant="primary"
                        icon={<Plus className="w-5 h-5" />}
                      >
                        បង្កើតមុខវិជ្ជាថ្មី • Create Subject
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-end">
                    <Button
                      onClick={() => setShowSubjects(false)}
                      variant="secondary"
                      icon={<Eye className="w-5 h-5" />}
                      size="small"
                    >
                      លាក់មុខវិជ្ជា • Hide
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        onView={handleViewSubject}
                        onEdit={(subject) => {
                          setSelectedSubject(subject);
                          setIsModalOpen(true);
                        }}
                        onDelete={handleDeleteSubject}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create/Edit Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={
          selectedSubject ? (
            <span className="flex items-center gap-2">
              <Edit className="w-6 h-6" />
              កែប្រែមុខវិជ្ជា • Edit Subject
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="w-6 h-6" />
              បង្កើតមុខវិជ្ជាថ្មី • Create Subject
            </span>
          )
        }
        size="large"
      >
        <SubjectForm
          subject={selectedSubject}
          onSave={handleSaveSubject}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* View Subject Modal */}
      <ViewSubjectModal
        subject={viewingSubject || null}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingSubject(undefined);
        }}
      />

      {/* ✅ Toast Container */}
      <ToastContainer />
    </div>
  );
}

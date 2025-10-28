"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SubjectForm from "@/components/forms/SubjectForm";
import SubjectDetailsModal from "@/components/modals/SubjectDetailsModal";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Users,
  Clock,
  Calendar,
  Filter,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

export default function SubjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    subjects,
    isLoadingSubjects,
    subjectsError,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTrack, setFilterTrack] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
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

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.nameKh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = filterGrade === "all" || subject.grade === filterGrade;
    const matchesCategory =
      filterCategory === "all" || subject.category === filterCategory;
    const matchesTrack =
      filterTrack === "all" ||
      (filterTrack === "none" && !subject.track) ||
      subject.track === filterTrack;

    return matchesSearch && matchesGrade && matchesCategory && matchesTrack;
  });

  const handleAddSubject = () => {
    setSelectedSubject(undefined);
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleViewDetails = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: Subject) => {
    try {
      setIsSubmitting(true);
      if (selectedSubject) {
        await updateSubject(subjectData);
        alert(
          "មុខវិជ្ជាត្រូវបានកែប្រែដោយជោគជ័យ!\nSubject updated successfully!"
        );
      } else {
        await addSubject(subjectData);
        alert(
          "មុខវិជ្ជាត្រូវបានបង្កើតដោយជោគជ័យ!\nSubject created successfully!"
        );
      }
      setIsModalOpen(false);
      setSelectedSubject(undefined);
    } catch (error: any) {
      alert(error.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (
      !confirm(
        `តើអ្នកចង់លុបមុខវិជ្ជា ${subject.name} មែនទេ?\nAre you sure you want to delete ${subject.name}?`
      )
    ) {
      return;
    }

    try {
      await deleteSubject(subject.id);
      alert("មុខវិជ្ជាត្រូវបានលុបដោយជោគជ័យ!\nSubject deleted successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to delete subject");
    }
  };

  // Get statistics
  const stats = {
    totalSubjects: subjects.length,
    activeSubjects: subjects.filter((s) => s.isActive).length,
    totalTeachers: new Set(
      subjects.flatMap(
        (s) => s.teacherAssignments?.map((ta) => ta.teacherId) || []
      )
    ).size,
    totalHours: subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0),
  };

  // Get unique grades
  const uniqueGrades = [...new Set(subjects.map((s) => s.grade))].sort();

  // Category badges
  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        core: { bg: "bg-blue-100", text: "text-blue-700", label: "មូលដ្ឋាន" },
        science: {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "វិទ្យាសាស្ត្រ",
        },
        social: {
          bg: "bg-purple-100",
          text: "text-purple-700",
          label: "សង្គម",
        },
        arts: { bg: "bg-pink-100", text: "text-pink-700", label: "សិល្បៈ" },
        technology: {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "បច្ចេកវិទ្យា",
        },
        other: { bg: "bg-gray-100", text: "text-gray-700", label: "ផ្សេងៗ" },
      };
    return badges[category] || badges.other;
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
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  មុខវិជ្ជា Subjects
                </h1>
                <p className="text-gray-600 mt-1">
                  គ្រប់គ្រងមុខវិជ្ជាសិក្សា • Manage academic subjects
                </p>
              </div>
              <Button onClick={handleAddSubject}>
                <Plus className="w-5 h-5" />
                <span>បង្កើតមុខវិជ្ជា Add Subject</span>
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">មុខវិជ្ជាសរុប • Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalSubjects}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    មុខវិជ្ជាសកម្ម • Active
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.activeSubjects}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">គ្រូបង្រៀន • Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalTeachers}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    ម៉ោងសរុប • Total Hours
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalHours}h
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកមុខវិជ្ជា... Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Grade Filter */}
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">ថ្នាក់ទាំងអស់ • All Grades</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    ថ្នាក់ទី {grade} • Grade {grade}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">ប្រភេទទាំងអស់ • All Categories</option>
                <option value="core">មូលដ្ឋាន • Core</option>
                <option value="science">វិទ្យាសាស្ត្រ • Science</option>
                <option value="social">សង្គម • Social</option>
                <option value="arts">សិល្បៈ • Arts</option>
                <option value="technology">បច្ចេកវិទ្យា • Technology</option>
                <option value="other">ផ្សេងៗ • Other</option>
              </select>

              {/* Track Filter */}
              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">ផ្លូវទាំងអស់ • All Tracks</option>
                <option value="none">មិនមានផ្លូវ • No Track</option>
                <option value="science">វិទ្យាសាស្ត្រ • Science</option>
                <option value="social">សង្គមវិទ្យា • Social</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {subjectsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{subjectsError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingSubjects ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading subjects...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Subjects Grid */}
              {filteredSubjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ||
                    filterGrade !== "all" ||
                    filterCategory !== "all"
                      ? "រកមិនឃើញ No subjects found"
                      : "មិនទាន់មានមុខវិជ្ជា No subjects yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ||
                    filterGrade !== "all" ||
                    filterCategory !== "all"
                      ? "សូមព្យាយាមផ្លាស់ប្តូរការស្វែងរក Try adjusting your filters"
                      : "ចាប់ផ្តើមដោយបង្កើតមុខវិជ្ជាដំបូង Get started by adding your first subject"}
                  </p>
                  {!searchTerm &&
                    filterGrade === "all" &&
                    filterCategory === "all" && (
                      <Button onClick={handleAddSubject}>
                        <Plus className="w-5 h-5" />
                        <span>បង្កើតមុខវិជ្ជា Add Subject</span>
                      </Button>
                    )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((subject) => {
                    const categoryBadge = getCategoryBadge(subject.category);
                    const teacherCount =
                      subject.teacherAssignments?.length || 0;

                    return (
                      <div
                        key={subject.id}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${categoryBadge.bg} ${categoryBadge.text}`}
                                >
                                  {categoryBadge.label}
                                </span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-white/20 text-white">
                                  ថ្នាក់ទី {subject.grade}
                                </span>
                                {subject.track && (
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-white/20 text-white">
                                    {subject.track === "science"
                                      ? "វិទ្យា"
                                      : "សង្គម"}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1">
                                {subject.nameKh || subject.name}
                              </h3>
                              <p className="text-sm text-white/80 english-modern">
                                {subject.nameEn || subject.name}
                              </p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          {/* Code */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                              {subject.code}
                            </span>
                          </div>

                          {/* Hours */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {subject.weeklyHours}h/សប្តាហ៍
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {subject.annualHours}h/ឆ្នាំ
                              </span>
                            </div>
                          </div>

                          {/* Teachers */}
                          <div className="flex items-center gap-2 text-sm">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">
                              គ្រូបង្រៀន: {teacherCount} នាក់
                            </span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                subject.isActive
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs text-gray-600">
                              {subject.isActive
                                ? "សកម្ម Active"
                                : "អសកម្ម Inactive"}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleViewDetails(subject)}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              <span>មើល</span>
                            </button>
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              <span>កែ</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject)}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>លុប</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create/Edit Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubject(undefined);
        }}
        title={
          selectedSubject
            ? "កែប្រែមុខវិជ្ជា Edit Subject"
            : "បង្កើតមុខវិជ្ជា Create Subject"
        }
        size="large"
      >
        <SubjectForm
          subject={selectedSubject}
          onSave={handleSaveSubject}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedSubject(undefined);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Subject Details Modal */}
      {selectedSubject && (
        <SubjectDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          subject={selectedSubject}
        />
      )}
    </div>
  );
}

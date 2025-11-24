"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSubjects } from "@/hooks/useSubjects";
import SubjectForm from "@/components/forms/SubjectForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Sidebar from "@/components/layout/Sidebar"; // ✅ ADD
import Header from "@/components/layout/Header"; // ✅ ADD
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

export default function SubjectsPage() {
  const { isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    subjects,
    loading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    refresh,
  } = useSubjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTrack, setFilterTrack] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (loading && subjects.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">កំពុងផ្ទុកមុខវិជ្ជា...</p>
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

    return matchesSearch && matchesGrade && matchesCategory && matchesTrack;
  });

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

  const handleSaveSubject = async (subjectData: any) => {
    try {
      setIsSubmitting(true);
      if (selectedSubject) {
        await updateSubject(selectedSubject.id, subjectData);
        alert("✅ មុខវិជ្ជាត្រូវបានកែប្រែដោយជោគជ័យ!");
      } else {
        await addSubject(subjectData);
        alert("✅ មុខវិជ្ជាត្រូវបានបង្កើតដោយជោគជ័យ!");
      }
      setIsModalOpen(false);
      setSelectedSubject(undefined);
    } catch (error: any) {
      alert("❌ " + (error.message || "Failed to save subject"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (
      !confirm(
        `តើអ្នកចង់លុបមុខវិជ្ជា "${subject.nameKh || subject.name}" មែនទេ?`
      )
    ) {
      return;
    }

    try {
      await deleteSubject(subject.id);
      alert("✅ មុខវិជ្ជាត្រូវបានលុបដោយជោគជ័យ!");
    } catch (error: any) {
      alert("❌ " + (error.message || "Failed to delete subject"));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ ADD SIDEBAR */}
      <Sidebar />

      <div className="flex-1">
        {/* ✅ ADD HEADER */}
        <Header />

        {/* ✅ MAIN CONTENT */}
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                មុខវិជ្ជា • Subjects
              </h1>
              <p className="text-gray-600 mt-1">គ្រប់គ្រងមុខវិជ្ជាទាំងអស់</p>
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
                  setSelectedSubject(undefined);
                  setIsModalOpen(true);
                }}
                variant="primary"
                icon={<Plus className="w-5 h-5" />}
              >
                បង្កើតមុខវិជ្ជា
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">សរុប</div>
              <div className="text-3xl font-bold">{stats.totalSubjects}</div>
              <div className="text-sm opacity-90">មុខវិជ្ជា</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">សកម្ម</div>
              <div className="text-3xl font-bold">{stats.activeSubjects}</div>
              <div className="text-sm opacity-90">មុខវិជ្ជា</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">គ្រូបង្រៀន</div>
              <div className="text-3xl font-bold">{stats.totalTeachers}</div>
              <div className="text-sm opacity-90">នាក់</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">ម៉ោង/សប្តាហ៍</div>
              <div className="text-3xl font-bold">{stats.totalHours}</div>
              <div className="text-sm opacity-90">ម៉ោង</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="ស្វែងរក..."
                icon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                options={[
                  { value: "all", label: "ថ្នាក់ទាំងអស់" },
                  { value: "7", label: "ថ្នាក់ទី៧" },
                  { value: "8", label: "ថ្នាក់ទី៨" },
                  { value: "9", label: "ថ្នាក់ទី៩" },
                  { value: "10", label: "ថ្នាក់ទី១០" },
                  { value: "11", label: "ថ្នាក់ទី១១" },
                  { value: "12", label: "ថ្នាក់ទី១២" },
                ]}
              />
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: "all", label: "ប្រភេទទាំងអស់" },
                  { value: "social", label: "សង្គម" },
                  { value: "science", label: "វិទ្យាសាស្ត្រ" },
                ]}
              />
              <Select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                options={[
                  { value: "all", label: "ផ្លូវទាំងអស់" },
                  { value: "none", label: "គ្មាន" },
                  { value: "science", label: "វិទ្យាសាស្ត្រ" },
                  { value: "social", label: "សង្គម" },
                ]}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    លេខកូដ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ឈ្មោះមុខវិជ្ជា
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ថ្នាក់
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ប្រភេទ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ពិន្ទុ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ស្ថានភាព
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {subject.nameKh || subject.name}
                      </div>
                      {subject.nameEn && (
                        <div className="text-sm text-gray-500">
                          {subject.nameEn}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ថ្នាក់ទី {subject.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {subject.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {subject.maxScore || 100}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          subject.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subject.isActive ? "សកម្ម" : "អសកម្ម"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedSubject(subject);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">មិនទាន់មានមុខវិជ្ជា</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedSubject ? "កែប្រែមុខវិជ្ជា" : "បង្កើតមុខវិជ្ជា"}
        size="large"
      >
        <SubjectForm
          subject={selectedSubject}
          onSave={handleSaveSubject}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

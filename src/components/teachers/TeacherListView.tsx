"use client";

import { useState } from "react";
import TeacherCard from "./TeacherCard";
import TeacherCreateModal from "./TeacherAddModal";
import TeacherEditModal from "./TeacherEditModal";
import TeacherViewModal from "../modals/TeacherDetailsModal";
import {
  Plus,
  Search,
  Grid,
  List,
  RefreshCw,
  Loader2,
  Database,
} from "lucide-react";
import { teachersApi } from "@/lib/api/teachers";

interface TeacherListViewProps {
  teachers: any[];
  subjects: any[];
  isDataLoaded: boolean; // ✅ NEW
  loading?: boolean; // ✅ NEW
  onLoadData: () => Promise<void>; // ✅ NEW
  onRefresh: () => void;
}

export default function TeacherListView({
  teachers,
  subjects,
  isDataLoaded,
  loading = false,
  onLoadData,
  onRefresh,
}: TeacherListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setEditModalOpen(true);
  };

  const handleView = (teacher: any) => {
    setSelectedTeacher(teacher);
    setViewModalOpen(true);
  };

  const handleDelete = async (teacherId: string) => {
    if (
      !confirm(
        "តើអ្នកប្រាកដថាចង់លុបគ្រូបង្រៀននេះមែនទេ?\nAre you sure you want to delete this teacher?"
      )
    ) {
      return;
    }

    try {
      await teachersApi.delete(teacherId);
      alert("✅ លុបគ្រូបង្រៀនបានជោគជ័យ!");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to delete teacher:", error);
      alert(`❌ បរាជ័យក្នុងការលុប: ${error.message}`);
    }
  };

  const handleCreateSuccess = () => {
    onRefresh();
    setCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    onRefresh();
    setEditModalOpen(false);
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.khmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.phone?.includes(searchQuery);

    const matchesRole = filterRole === "all" || teacher.role === filterRole;

    const matchesGrade =
      filterGrade === "all" ||
      teacher.teachingClasses?.some((tc: any) =>
        tc.class?.name?.includes(filterGrade)
      );

    return matchesSearch && matchesRole && matchesGrade;
  });

  // ✅ Show empty state if not loaded
  if (!isDataLoaded) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 bg-white">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ទិន្នន័យមិនទាន់បានផ្ទុកឡើយ
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            ចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទុកទិន្នន័យគ្រូបង្រៀនទាំងអស់
          </p>
          <button
            onClick={onLoadData}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងផ្ទុក...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                ផ្ទុកទិន្នន័យគ្រូបង្រៀន
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-4">
            💡 ការផ្ទុកទិន្នន័យអាចចំណាយពេលមួយរយៈ
          </p>
        </div>
      </div>
    );
  }

  // ✅ Show full interface after loaded
  return (
    <>
      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ស្វែងរកគ្រូបង្រៀន...  (ឈ្មោះ, អ៊ីមែល, ទូរស័ព្ទ)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">តួនាទីទាំងអស់</option>
            <option value="TEACHER">គ្រូបង្រៀន</option>
            <option value="INSTRUCTOR">គ្រូប្រចាំថ្នាក់</option>
          </select>

          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">កម្រិតទាំងអស់</option>
            <option value="ថ្នាក់ទី៧">ថ្នាក់ទី៧</option>
            <option value="ថ្នាក់ទី៨">ថ្នាក់ទី៨</option>
            <option value="ថ្នាក់ទី៩">ថ្នាក់ទី៩</option>
            <option value="ថ្នាក់ទី១០">ថ្នាក់ទី១០</option>
            <option value="ថ្នាក់ទី១១">ថ្នាក់ទី១១</option>
            <option value="ថ្នាក់ទី១២">ថ្នាក់ទី១២</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
              title="ប្រូក្រឡា"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
              title="តារាង"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            title="ផ្ទុកឡើងវិញ"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            ផ្ទុកឡើងវិញ
          </button>

          {/* Add New */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            បន្ថែមគ្រូ
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          បង្ហាញ <strong>{filteredTeachers.length}</strong> ពី{" "}
          <strong>{teachers.length}</strong> គ្រូបង្រៀន
        </p>
      </div>

      {/* Teachers Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">កំពុងផ្ទុកទិន្នន័យ...</p>
          </div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">
            គ្មានគ្រូបង្រៀនត្រូវនឹងលក្ខខណ្ឌស្វែងរក
          </p>
          <p className="text-sm text-gray-500">
            សូមព្យាយាមប្តូរលក្ខខណ្ឌស្វែងរក
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {createModalOpen && (
        <TeacherCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          subjects={subjects}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editModalOpen && selectedTeacher && (
        <TeacherEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          teacher={selectedTeacher}
          subjects={subjects}
          onSuccess={handleEditSuccess}
        />
      )}

      {viewModalOpen && selectedTeacher && (
        <TeacherViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          teacher={selectedTeacher}
        />
      )}
    </>
  );
}

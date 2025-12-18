"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, X, Grid, List } from "lucide-react";
import { teachersApi } from "@/lib/api/teachers";
import TeacherCard from "./TeacherCard";
import TeacherTable from "./TeacherTable";
import TeacherAddModal from "./TeacherAddModal";
import TeacherEditModal from "./TeacherEditModal";
import TeacherDeleteModal from "./TeacherDeleteModal";
import TeacherDetailsModal from "@/components/modals/TeacherDetailsModal";

interface Teacher {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  khmerName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  subject?: string;
  subjectIds?: string[];
  employeeId?: string;
  teacherId?: string;
  gender?: string;
  position?: string;
  role?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  classes?: any[];
  classIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TeacherListViewProps {
  teachers: Teacher[];
  subjects: any[];
  isDataLoaded: boolean;
  onLoadData: () => void;
  onRefresh: () => void;
}

type ViewMode = "grid" | "table";

export default function TeacherListView({
  teachers: initialTeachers,
  subjects,
  isDataLoaded,
  onLoadData,
  onRefresh,
}: TeacherListViewProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    setTeachers(initialTeachers);
    setFilteredTeachers(initialTeachers);
  }, [initialTeachers]);

  useEffect(() => {
    if (!isDataLoaded) {
      onLoadData();
    }
  }, [isDataLoaded, onLoadData]);

  // Filter teachers
  useEffect(() => {
    let filtered = [...teachers];

    if (searchQuery) {
      filtered = filtered.filter((teacher) => {
        const fullName = `${teacher.firstName || ""} ${
          teacher.lastName || ""
        }`.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower) ||
          teacher.phone?.includes(searchQuery) ||
          teacher.phoneNumber?.includes(searchQuery) ||
          teacher.employeeId?.toLowerCase().includes(searchLower) ||
          teacher.subject?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (selectedGender) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.gender?.toUpperCase() === selectedGender.toUpperCase()
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((teacher) => teacher.role === selectedRole);
    }

    setFilteredTeachers(filtered);
  }, [searchQuery, selectedGender, selectedRole, teachers]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGender("");
    setSelectedRole("");
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    try {
      await teachersApi.delete(selectedTeacher.id);
      setShowDeleteModal(false);
      onRefresh();
      alert("✅ បានលុបគ្រូបង្រៀនដោយជោគជ័យ!");
    } catch (error: any) {
      alert(`❌ បរាជ័យក្នុងការលុបគ្រូបង្រៀន!\nError: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ មុខវិជ្ជា..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
          >
            <option value="">តួនាទីទាំងអស់</option>
            <option value="INSTRUCTOR">គ្រូប្រចាំថ្នាក់</option>
            <option value="TEACHER">គ្រូធម្មតា</option>
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus: ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
          >
            <option value="">ភេទទាំងអស់</option>
            <option value="MALE">ប្រុស</option>
            <option value="FEMALE">ស្រី</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2.5 flex items-center gap-2 font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover: bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
              ក្រឡា
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2.5 flex items-center gap-2 font-semibold transition-colors border-l ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
              តារាង
            </button>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedGender || selectedRole) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors font-semibold"
            >
              <X className="w-4 h-4" />
              សម្អាត
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            ផ្ទុកឡើងវិញ
          </button>

          {/* Add Teacher */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមគ្រូ
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-4">
        <p className="text-sm text-gray-600 font-semibold">
          បង្ហាញ{" "}
          <span className="font-black text-blue-600">
            {filteredTeachers.length}
          </span>{" "}
          ពី <span className="font-black text-gray-900">{teachers.length}</span>{" "}
          គ្រូបង្រៀន
        </p>
      </div>

      {/* Display Teachers */}
      {viewMode === "grid" ? (
        <TeacherCard
          teachers={filteredTeachers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <TeacherTable
          teachers={filteredTeachers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <TeacherAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        subjects={subjects}
        onSuccess={onRefresh}
      />

      {selectedTeacher && (
        <>
          <TeacherEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            teacher={selectedTeacher}
            subjects={subjects}
            onSuccess={onRefresh}
          />

          <TeacherDetailsModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            teacher={selectedTeacher}
            subjects={subjects}
          />

          <TeacherDeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            teacher={selectedTeacher}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}

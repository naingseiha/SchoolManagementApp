"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TeacherForm from "@/components/forms/TeacherForm";
import { Teacher } from "@/types";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  UserCheck,
  Users,
  Award,
} from "lucide-react";

export default function TeachersPage() {
  const { isAuthenticated } = useAuth();
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const classTeachers = teachers.filter((t) => t.isClassTeacher).length;
    const regularTeachers = teachers.length - classTeachers;

    return {
      total: teachers.length,
      classTeachers,
      regularTeachers,
      subjects: teachers.reduce((sum, t) => sum + (t.subjects?.length || 0), 0),
    };
  }, [teachers]);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (teacher: Teacher) => {
    if (selectedTeacher) {
      updateTeacher(teacher);
    } else {
      addTeacher(teacher);
    }
    setIsModalOpen(false);
    setSelectedTeacher(undefined);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "តើអ្នកប្រាកដថាចង់លុបគ្រូនេះមែនទេ? Are you sure you want to delete this teacher?"
      )
    ) {
      deleteTeacher(id);
    }
  };

  const handleAddNew = () => {
    setSelectedTeacher(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                គ្រូបង្រៀន Teachers
              </h1>
              <p className="text-gray-600 mt-1">
                គ្រប់គ្រងព័ត៌មានគ្រូបង្រៀន • Manage teacher information
              </p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-5 h-5" />
              <span>បន្ថែមគ្រូបង្រៀន Add Teacher</span>
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Teachers */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>

              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    គ្រូបង្រៀនសរុប
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                    Total Teachers
                  </p>
                  <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Teachers */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>

              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <UserCheck className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    គ្រូបង្រៀនថ្នាក់
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                    Class Teachers
                  </p>
                  <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                    {stats.classTeachers}
                  </p>
                </div>
              </div>
            </div>

            {/* Regular Teachers */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>

              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    គ្រូបង្រៀនទូទៅ
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                    Subject Teachers
                  </p>
                  <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                    {stats.regularTeachers}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Subjects */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50"></div>

              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Award className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    មុខវិជ្ជាបង្រៀន
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                    Teaching Subjects
                  </p>
                  <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                    {stats.subjects}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ស្វែងរកគ្រូបង្រៀន Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ឈ្មោះ Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      លេខទូរស័ព្ទ Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      អ៊ីមែល Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      គ្រូបង្រៀនថ្នាក់ Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សកម្មភាព Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-green-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {teacher.isClassTeacher
                                ? "គ្រូបង្រៀនថ្នាក់"
                                : "គ្រូបង្រៀនមុខវិជ្ជា"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {teacher.phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {teacher.email || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            teacher.isClassTeacher
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {teacher.isClassTeacher
                            ? "គ្រូថ្នាក់ Class Teacher"
                            : "គ្រូមុខវិជ្ជា Subject Teacher"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Edit className="w-4 h-4" />
                            <span>កែ</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>លុប</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    គ្មានគ្រូបង្រៀនទេ
                  </p>
                  <p className="text-gray-400 text-sm">No teachers found</p>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTeacher(undefined);
            }}
            title={
              selectedTeacher
                ? "កែប្រែគ្រូបង្រៀន Edit Teacher"
                : "បន្ថែមគ្រូបង្រៀន Add Teacher"
            }
            size="lg"
          >
            <TeacherForm
              teacher={selectedTeacher}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedTeacher(undefined);
              }}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}

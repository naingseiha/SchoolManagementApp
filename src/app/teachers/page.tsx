"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TeacherForm from "@/components/forms/TeacherForm";
import { Teacher } from "@/types";
import { Plus, Edit, Trash2, Search } from "lucide-react";

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
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              គ្រូបង្រៀន Teachers
            </h1>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              បន្ថែមគ្រូបង្រៀន Add Teacher
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ស្វែងរកគ្រូបង្រៀន Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ឈ្មោះ Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      លេខទូរស័ព្ទ Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      អ៊ីមែល Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      គ្រូបង្រៀនថ្នាក់ Class Teacher
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      សកម្មភាព Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {teacher.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {teacher.phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {teacher.email || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            teacher.isClassTeacher
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {teacher.isClassTeacher ? "បាទ/ចាស Yes" : "ទេ No"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTeachers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  គ្មានគ្រូបង្រៀនទេ No teachers found
                </div>
              )}
            </div>
          </div>

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

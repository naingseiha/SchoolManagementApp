"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StudentForm from "@/components/forms/StudentForm";
import { Student } from "@/types";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function StudentsPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { students, classes, addStudent, updateStudent, deleteStudent } =
    useData();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSave = (student: Student) => {
    if (selectedStudent) {
      updateStudent(student);
    } else {
      addStudent(student);
    }
    setIsModalOpen(false);
    setSelectedStudent(undefined);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "តើអ្នកប្រាកដថាចង់លុបសិស្សនេះមែនទេ? Are you sure you want to delete this student?"
      )
    ) {
      deleteStudent(id);
    }
  };

  const handleAddNew = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">សិស្ស Students</h1>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              បន្ថែមសិស្ស Add Student
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ស្វែងរកសិស្ស Search students..."
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
                      ភេទ Gender
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ថ្នាក់ Class
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      លេខទូរស័ព្ទ Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      សកម្មភាព Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const studentClass = classes.find(
                      (c) => c.id === student.classId
                    );
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {student.lastName} {student.firstName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {student.gender === "male"
                              ? "ប្រុស Male"
                              : "ស្រី Female"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {studentClass?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {student.phone || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(student.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  គ្មានសិស្សទេ No students found
                </div>
              )}
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedStudent(undefined);
            }}
            title={
              selectedStudent
                ? "កែប្រែសិស្ស Edit Student"
                : "បន្ថែមសិស្ស Add Student"
            }
            size="lg"
          >
            <StudentForm
              student={selectedStudent}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedStudent(undefined);
              }}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}

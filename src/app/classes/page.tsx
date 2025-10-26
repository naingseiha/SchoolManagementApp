"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ClassForm from "@/components/forms/ClassForm";
import { Class } from "@/types";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function ClassesPage() {
  const { isAuthenticated } = useAuth();
  const { classes, students, teachers, addClass, updateClass, deleteClass } =
    useData();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSave = (classData: Class) => {
    if (selectedClass) {
      updateClass(classData);
    } else {
      addClass(classData);
    }
    setIsModalOpen(false);
    setSelectedClass(undefined);
  };

  const handleEdit = (classData: Class) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "តើអ្នកប្រាកដថាចង់លុបថ្នាក់នេះមែនទេ? Are you sure you want to delete this class?"
      )
    ) {
      deleteClass(id);
    }
  };

  const handleAddNew = () => {
    setSelectedClass(undefined);
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
              ថ្នាក់រៀន Classes
            </h1>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              បន្ថែមថ្នាក់ Add Class
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              const classStudents = students.filter(
                (s) => s.classId === classItem.id
              );
              const classTeacher = teachers.find(
                (t) => t.id === classItem.classTeacherId
              );

              return (
                <div
                  key={classItem.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-gray-600">{classItem.level}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(classItem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(classItem.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {classStudents.length} សិស្ស students
                      </span>
                    </div>

                    {classTeacher && (
                      <div className="text-sm">
                        <span className="text-gray-600">គ្រូបង្រៀនថ្នាក់:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {classTeacher.name}
                        </span>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-gray-600">ឆ្នាំសិក្សា:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {classItem.year}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">គ្មានថ្នាក់រៀនទេ No classes found</p>
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedClass(undefined);
            }}
            title={
              selectedClass
                ? "កែប្រែថ្នាក់ Edit Class"
                : "បន្ថែមថ្នាក់ Add Class"
            }
            size="lg"
          >
            <ClassForm
              classData={selectedClass}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedClass(undefined);
              }}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}

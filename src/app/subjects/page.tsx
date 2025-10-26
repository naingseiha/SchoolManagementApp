"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SubjectForm from "@/components/forms/SubjectForm";
import { Subject } from "@/types";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";

export default function SubjectsPage() {
  const { isAuthenticated } = useAuth();
  const { subjects, addSubject, updateSubject, deleteSubject } = useData();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSave = (subject: Subject) => {
    if (selectedSubject) {
      updateSubject(subject);
    } else {
      addSubject(subject);
    }
    setIsModalOpen(false);
    setSelectedSubject(undefined);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "តើអ្នកប្រាកដថាចង់លុបមុខវិជ្ជានេះមែនទេ? Are you sure you want to delete this subject?"
      )
    ) {
      deleteSubject(id);
    }
  };

  const handleAddNew = () => {
    setSelectedSubject(undefined);
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
              មុខវិជ្ជា Subjects
            </h1>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              បន្ថែមមុខវិជ្ជា Add Subject
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600">{subject.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(subject.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">កម្រិត Level:</span>
                    <span className="font-medium text-gray-900">
                      {subject.level === "both"
                        ? "ទាំងអស់ Both"
                        : subject.level === "អនុវិទ្យាល័យ"
                        ? "អនុវិទ្យាល័យ Lower"
                        : "វិទ្យាល័យ Upper"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {subjects.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">
                គ្មានមុខវិជ្ជាទេ No subjects found
              </p>
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedSubject(undefined);
            }}
            title={
              selectedSubject
                ? "កែប្រែមុខវិជ្ជា Edit Subject"
                : "បន្ថែមមុខវិជ្ជា Add Subject"
            }
            size="lg"
          >
            <SubjectForm
              subject={selectedSubject}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedSubject(undefined);
              }}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}

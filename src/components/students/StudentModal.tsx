"use client";

import { useState, useEffect } from "react";
import { studentsApi } from "@/lib/api/students";
import StudentDetailView from "./StudentDetailView";
import StudentEditForm from "./StudentEditForm";
import { X, Eye, Edit, Trash2, Loader2 } from "lucide-react";

interface StudentModalProps {
  student: any;
  mode: "view" | "edit";
  onClose: () => void;
  onUpdate: () => void;
}

export default function StudentModal({
  student: initialStudent,
  mode: initialMode,
  onClose,
  onUpdate,
}: StudentModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ✅ Load full student data when modal opens
  useEffect(() => {
    loadFullStudentData();
  }, [initialStudent.id]);

  const loadFullStudentData = async () => {
    try {
      setLoading(true);
      const fullData = await studentsApi.getById(initialStudent.id);
      setStudent(fullData);
    } catch (error) {
      console.error("Failed to load student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData: Partial<any>) => {
    try {
      setSaving(true);
      await studentsApi.update(student.id, updatedData as any);
      await loadFullStudentData();
      onUpdate();
      setMode("view");
      alert("✅ រក្សាទុកទិន្នន័យបានជោគជ័យ");
    } catch (error: any) {
      console.error("Failed to update student:", error);
      alert(`❌ កំហុស: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await studentsApi.delete(student.id);
      onUpdate();
      alert("✅ លុបសិស្សបានជោគជ័យ");
      onClose();
    } catch (error: any) {
      console.error("Failed to delete student:", error);
      alert(`❌ កំហុស: ${error.message}`);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl">
              {mode === "view" ? (
                <Eye className="w-6 h-6 text-blue-600" />
              ) : (
                <Edit className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-black">
                {mode === "view" ? "មើលព័ត៌មានសិស្ស" : "កែសម្រួលព័ត៌មាន"}
              </h2>
              <p className="text-blue-100 font-medium">
                {student.khmerName ||
                  `${student.firstName} ${student.lastName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <>
                <button
                  onClick={() => setMode("edit")}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  title="កែសម្រួល"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-all"
                  title="លុប"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode("view")}
                disabled={saving}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all disabled:opacity-50"
                title="បោះបង់"
              >
                <Eye className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              title="បិទ"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  កំពុងផ្ទុកទិន្នន័យ...{" "}
                </p>
              </div>
            </div>
          ) : mode === "view" ? (
            <StudentDetailView student={student} />
          ) : (
            <StudentEditForm
              student={student}
              onSave={handleSave}
              onCancel={() => setMode("view")}
              isSubmitting={saving}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                លុបសិស្ស?
              </h3>
              <p className="text-gray-600 mb-1">
                តើអ្នកប្រាកដថាចង់លុបសិស្សនេះមែនទេ?
              </p>
              <p className="text-sm text-red-600 font-semibold mb-6">
                {student.khmerName ||
                  `${student.firstName} ${student.lastName}`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all disabled:opacity-50"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      កំពុងលុប...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      លុប
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

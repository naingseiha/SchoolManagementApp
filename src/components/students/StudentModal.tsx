"use client";

import { useState, useEffect } from "react";
import { studentsApi } from "@/lib/api/students";
import { classesApi, Class } from "@/lib/api/classes";
import StudentDetailView from "./StudentDetailView";
import StudentEditForm from "./StudentEditForm";
import {
  X,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Save,
  ArrowLeftRight,
  AlertTriangle,
  Check,
  School,
  UserX,
  ChevronRight,
  Info,
} from "lucide-react";

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
  const [showChangeClassModal, setShowChangeClassModal] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [changingClass, setChangingClass] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ✅ Load full student data when modal opens
  useEffect(() => {
    loadFullStudentData();
    loadClasses();
  }, [initialStudent.id]);

  const loadFullStudentData = async () => {
    try {
      setLoading(true);
      const fullData = await studentsApi.getById(initialStudent.id);
      setStudent(fullData);
      setSelectedClassId(fullData.classId || "");
    } catch (error) {
      console.error("Failed to load student:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const allClasses = await classesApi.getAll();
      setClasses(allClasses);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSave = async (updatedData: Partial<any>) => {
    try {
      setSaving(true);
      await studentsApi.update(student.id, updatedData as any);
      await loadFullStudentData();
      onUpdate();
      setMode("view");

      // ✅ Toast notification
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-300";
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-bold">រក្សាទុកទិន្នន័យបានជោគជ័យ! </span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
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

      // ✅ Success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-[100]";
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-bold">លុបសិស្សបានជោគជ័យ!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      handleClose();
    } catch (error: any) {
      console.error("Failed to delete student:", error);
      alert(`❌ កំហុស: ${error.message}`);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChangeClass = async () => {
    if (!selectedClassId) {
      alert("❌ សូមជ្រើសរើសថ្នាក់!");
      return;
    }

    if (selectedClassId === student.classId) {
      alert("ℹ️ សិស្សនេះស្ថិតនៅក្នុងថ្នាក់នេះរួចហើយ");
      return;
    }

    try {
      setChangingClass(true);
      await studentsApi.update(student.id, { classId: selectedClassId } as any);
      await loadFullStudentData();
      onUpdate();
      setShowChangeClassModal(false);

      // ✅ Success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-300";
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-bold">ផ្លាស់ប្តូរថ្នាក់បានជោគជ័យ!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error: any) {
      console.error("Failed to change class:", error);
      alert(`❌ កំហុស: ${error.message}`);
    } finally {
      setChangingClass(false);
    }
  };

  const getCurrentClassName = () => {
    if (!student.classId) return "មិនមានថ្នាក់";
    return student.class?.name || "Unknown";
  };

  const getNewClassName = () => {
    if (!selectedClassId) return "-";
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    return selectedClass?.name || "-";
  };

  return (
    <>
      {/* ✅ Main Modal with Backdrop Animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 overflow-y-auto ${
          isClosing ? "bg-opacity-0" : "bg-opacity-50"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col my-8 transition-all duration-300 ${
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-200">
                {mode === "view" ? (
                  <Eye className="w-6 h-6 text-blue-600" />
                ) : (
                  <Edit className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-black tracking-tight">
                  {mode === "view" ? "ព័ត៌មានសិស្ស" : "កែសម្រួលសិស្ស"}
                </h2>
                <p className="text-blue-100 text-sm font-medium mt-0.5">
                  {mode === "view"
                    ? "Student Details"
                    : "Edit Student Information"}
                </p>
              </div>
            </div>

            {/* ✅ Action Buttons with Hover Effects */}
            <div className="flex items-center gap-2">
              {mode === "view" ? (
                <>
                  {/* Change Class Button */}
                  <button
                    onClick={() => setShowChangeClassModal(true)}
                    className="h-11 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/20 hover: scale-105 hover:shadow-lg"
                    title="ផ្លាស់ប្តូរថ្នាក់"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="hidden sm:inline">ផ្លាស់ប្តូរថ្នាក់</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => setMode("edit")}
                    className="h-11 px-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">កែសម្រួល</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-11 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                    title="លុបសិស្ស"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">លុប</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Cancel Edit */}
                  <button
                    onClick={() => setMode("view")}
                    disabled={saving}
                    className="h-11 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 border border-white/20"
                  >
                    បោះបង់
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="h-11 w-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-200 flex items-center justify-center border border-white/20 hover: rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ✅ Content with Smooth Loading */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-gray-600 font-medium">
                  កំពុងផ្ទុកទិន្នន័យ...
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {mode === "view" ? (
                  <StudentDetailView student={student} />
                ) : (
                  <StudentEditForm
                    student={student}
                    onSave={handleSave}
                    onCancel={() => setMode("view")}
                    isSaving={saving}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Change Class Modal with Smooth Animations */}
      {showChangeClassModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
          onClick={() => setShowChangeClassModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">ផ្លាស់ប្តូរថ្នាក់</h3>
                  <p className="text-purple-100 text-sm">
                    Transfer to New Class
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Student Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                    {student.gender === "male" ? "👨‍🎓" : "👩‍🎓"}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {student.khmerName ||
                        `${student.firstName} ${student.lastName}`}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        ID: {student.studentId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <School className="w-4 h-4 text-gray-600" />
                  ថ្នាក់បច្ចុប្បន្ន • Current Class
                </label>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3 border-2 border-gray-200">
                  <School className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-900">
                    {getCurrentClassName()}
                  </span>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex justify-center">
                <div className="bg-purple-100 p-2 rounded-full">
                  <ChevronRight className="w-6 h-6 text-purple-600 rotate-90" />
                </div>
              </div>

              {/* New Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <School className="w-4 h-4 text-purple-600" />
                  ថ្នាក់ថ្មី • New Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium transition-all duration-200 hover:border-purple-300"
                  disabled={changingClass}
                >
                  <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                  {classes
                    .filter((c) => c.id !== student.classId)
                    .map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls._count?.students || 0} សិស្ស)
                      </option>
                    ))}
                </select>
              </div>

              {/* Preview */}
              {selectedClassId && selectedClassId !== student.classId && (
                <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <div className="font-bold mb-1">ការផ្លាស់ប្តូរ: </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-200 rounded font-semibold text-gray-700">
                          {getCurrentClassName()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-green-600" />
                        <span className="px-2 py-1 bg-green-200 rounded font-semibold text-green-700">
                          {getNewClassName()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowChangeClassModal(false);
                  setSelectedClassId(student.classId || "");
                }}
                disabled={changingClass}
                className="flex-1 h-12 px-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
              >
                បោះបង់
              </button>
              <button
                onClick={handleChangeClass}
                disabled={
                  changingClass ||
                  !selectedClassId ||
                  selectedClassId === student.classId
                }
                className="flex-1 h-12 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                {changingClass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    កំពុងផ្លាស់ប្តូរ...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    បញ្ជាក់ការផ្លាស់ប្តូរ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal with Warning Animation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">លុបសិស្ស</h3>
                  <p className="text-red-100 text-sm">
                    Permanent Deletion Warning
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Warning */}
              <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500 animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-start gap-3">
                  <UserX className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      សកម្មភាពនេះមិនអាចត្រលប់វិញបានទេ!
                    </p>
                    <p className="text-sm text-red-800 leading-relaxed">
                      ការលុបសិស្សនេះនឹងដកចេញពី System ទាំងស្រុង រួមទាំង:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-red-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        ពិន្ទុគ្រប់មុខវិជ្ជា
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        កំណត់ត្រាវត្តមាន
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        ព័ត៌មានទាំងអស់
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                    {student.gender === "male" ? "👨‍🎓" : "👩‍🎓"}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {student.khmerName ||
                        `${student.firstName} ${student.lastName}`}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-300 text-gray-700 rounded text-xs font-semibold">
                        ID: {student.studentId || "N/A"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {getCurrentClassName()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="text-center bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <Info className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">
                  តើអ្នកប្រាកដថាចង់លុបសិស្សនេះមែនទេ?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  សូមពិចារណាម្តងទៀតមុនពេលបញ្ជាក់
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 h-12 px-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
              >
                បោះបង់
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-12 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    កំពុងលុប...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    បញ្ជាក់ការលុប
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

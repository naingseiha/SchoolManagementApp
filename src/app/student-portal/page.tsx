"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, BookOpen, Calendar, Award, Key, Lock } from "lucide-react";

const ROLE_LABELS = {
  GENERAL: "សិស្សធម្មតា",
  CLASS_LEADER: "ប្រធានថ្នាក់",
  VICE_LEADER_1: "អនុប្រធានទី១",
  VICE_LEADER_2: "អនុប្រធានទី២",
};

export default function StudentPortalPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "STUDENT")) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || !oldPassword) {
      setMessage({ type: 'error', text: 'សូមបំពេញព័ត៌មានទាំងអស់' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ' });
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password change API
      setMessage({ type: 'success', text: 'មុខងារនេះនឹងមាននៅក្នុងការធ្វើបច្ចុប្បន្នភាពបន្ទាប់' });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !currentUser || currentUser.role !== "STUDENT") {
    return null;
  }

  const student = currentUser.student;
  const roleLabel = ROLE_LABELS[student?.studentRole as keyof typeof ROLE_LABELS] || "សិស្សធម្មតា";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-khmer-title text-2xl mb-1">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="font-khmer-body text-gray-600">
                {student?.class?.name} • {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-khmer-body">{message.text}</p>
            <button onClick={() => setMessage(null)} className="text-sm underline mt-2">បិទ</button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-khmer-body font-semibold text-gray-700">មុខវិជ្ជា</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600 font-khmer-body">ខ្លឹមសារនឹងបញ្ចូលឆាប់ៗ</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-khmer-body font-semibold text-gray-700">ពិន្ទុមធ្យម</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600 font-khmer-body">ខ្លឹមសារនឹងបញ្ចូលឆាប់ៗ</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-khmer-body font-semibold text-gray-700">វត្តមាន</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600 font-khmer-body">ខ្លឹមសារនឹងបញ្ចូលឆាប់ៗ</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-khmer-title text-xl mb-4">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-khmer-body">លេខកូដសិស្ស</p>
                  <p className="font-mono text-gray-900">{student?.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-khmer-body">ថ្នាក់</p>
                  <p className="font-khmer-body text-gray-900">{student?.class?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-khmer-body">តួនាទី</p>
                  <p className="font-khmer-body text-gray-900">{roleLabel}</p>
                </div>
                {currentUser.email && (
                  <div>
                    <p className="text-sm text-gray-600 font-khmer-body">អ៊ីមែល</p>
                    <p className="text-gray-900">{currentUser.email}</p>
                  </div>
                )}
                {currentUser.phone && (
                  <div>
                    <p className="text-sm text-gray-600 font-khmer-body">លេខទូរស័ព្ទ</p>
                    <p className="text-gray-900">{currentUser.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-khmer-title text-xl mb-4">សុវត្ថិភាព</h2>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-khmer-body"
              >
                <Key className="w-4 h-4" />
                ផ្លាស់ប្តូរពាក្យសម្ងាត់
              </button>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grades Section - Coming Soon */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-khmer-title text-xl mb-4">ពិន្ទុរបស់ខ្ញុំ</h2>
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-khmer-body text-gray-500">មុខងារនេះកំពុងអភិវឌ្ឍ</p>
                <p className="font-khmer-body text-sm text-gray-400 mt-2">
                  អ្នកនឹងអាចមើលពិន្ទុសិក្សារបស់អ្នកនៅទីនេះឆាប់ៗនេះ
                </p>
              </div>
            </div>

            {/* Attendance Section - Coming Soon */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-khmer-title text-xl mb-4">វត្តមានរបស់ខ្ញុំ</h2>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-khmer-body text-gray-500">មុខងារនេះកំពុងអភិវឌ្ឍ</p>
                <p className="font-khmer-body text-sm text-gray-400 mt-2">
                  អ្នកនឹងអាចមើលវត្តមានរបស់អ្នកនៅទីនេះឆាប់ៗនេះ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="font-khmer-title text-xl mb-4">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-khmer-body text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ចាស់
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ចាស់"
                  />
                </div>

                <div>
                  <label className="block text-sm font-khmer-body text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                  />
                </div>

                <div>
                  <label className="block text-sm font-khmer-body text-gray-700 mb-2">
                    បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-khmer-body"
                >
                  {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-khmer-body"
                >
                  បោះបង់
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

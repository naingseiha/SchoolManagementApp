"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  User,
  BookOpen,
  Calendar,
  Home,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getMyProfile,
  getMyGrades,
  getMyAttendance,
  changeMyPassword,
  updateMyProfile,
  type StudentProfile,
  type GradesResponse,
  type AttendanceResponse,
} from "@/lib/api/student-portal";
import { subjectsApi, type Subject } from "@/lib/api/subjects";
import { getCurrentAcademicYear } from "@/utils/academicYear";

// Lazy load tab components for better code splitting
const StudentDashboardTab = dynamic(
  () => import("@/components/mobile/student-portal/tabs/StudentDashboardTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const StudentGradesTab = dynamic(
  () => import("@/components/mobile/student-portal/tabs/StudentGradesTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const StudentAttendanceTab = dynamic(
  () => import("@/components/mobile/student-portal/tabs/StudentAttendanceTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const StudentProfileTab = dynamic(
  () => import("@/components/mobile/student-portal/tabs/StudentProfileTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

function TabLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-gray-200 rounded-3xl h-48 animate-pulse"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
      </div>
    </div>
  );
}

const MONTHS = [
  { value: "មករា", label: "មករា", number: 1 },
  { value: "កុម្ភៈ", label: "កុម្ភៈ", number: 2 },
  { value: "មីនា", label: "មីនា", number: 3 },
  { value: "មេសា", label: "មេសា", number: 4 },
  { value: "ឧសភា", label: "ឧសភា", number: 5 },
  { value: "មិថុនា", label: "មិថុនា", number: 6 },
  { value: "កក្កដា", label: "កក្កដា", number: 7 },
  { value: "សីហា", label: "សីហា", number: 8 },
  { value: "កញ្ញា", label: "កញ្ញា", number: 9 },
  { value: "តុលា", label: "តុលា", number: 10 },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា", number: 11 },
  { value: "ធ្នូ", label: "ធ្នូ", number: 12 },
];

const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1;
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

type TabType = "dashboard" | "grades" | "attendance" | "profile";

export default function StudentPortalPage() {
  const { currentUser, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Data state
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentYear = getCurrentAcademicYear();
  const currentMonth = getCurrentKhmerMonth();

  // Load data functions
  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);

      // Load subjects for the student's class
      if (data.student?.class?.grade) {
        const subjects = await subjectsApi.getByGrade(
          data.student.class.grade,
          data.student.class.track || undefined
        );
        setAllSubjects(subjects);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadGrades = async () => {
    try {
      const data = await getMyGrades({
        year: currentYear,
        month: currentMonth,
      });
      setGradesData(data);
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  };

  const loadAttendance = async () => {
    try {
      const monthNumber = MONTHS.find((m) => m.value === currentMonth)?.number || 1;
      const data = await getMyAttendance({
        month: monthNumber,
        year: currentYear,
      });
      setAttendanceData(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  // Redirect non-students
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || currentUser?.role !== "STUDENT")) {
      console.log("⚠️ Not a student, redirecting to dashboard...");
      router.push("/");
    }
  }, [authLoading, isAuthenticated, currentUser, router]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "STUDENT") {
      loadProfile();
      loadGrades();
      loadAttendance();
    }
  }, [isAuthenticated, currentUser]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (isEditingProfile && hasUnsavedProfileChanges && tab !== activeTab) {
        setPendingTab(tab);
        setShowUnsavedWarning(true);
        return;
      }
      setActiveTab(tab);
    },
    [isEditingProfile, hasUnsavedProfileChanges, activeTab]
  );

  const handleDiscardAndNavigate = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedProfileChanges(false);
    setIsEditingProfile(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingTab(null);
    setPendingAction(null);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "សូមបំពេញព័ត៌មានទាំងអស់" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "ពាក្យសម្ងាត់មិនត្រូវគ្នា" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ" });
      return;
    }

    try {
      setLoading(true);
      await changeMyPassword({ oldPassword, newPassword });
      setMessage({ type: "success", text: "ផ្លាស់ប្តូរពាក្យសម្ងាត់បានជោគជ័យ" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "ការផ្លាស់ប្តូរបរាជ័យ" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      setLoading(true);
      await updateMyProfile(data);
      setMessage({ type: "success", text: "រក្សាទុកបានជោគជ័យ" });
      setIsEditingProfile(false);
      setHasUnsavedProfileChanges(false);
      await loadProfile();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "រក្សាទុកបរាជ័យ" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([loadProfile(), loadGrades(), loadAttendance()]);
    setIsRefreshing(false);
  };

  const studentName = useMemo(() => {
    if (!profile) return currentUser ? `${currentUser.student.khmerName}` : "";
    return `${profile.student.khmerName}`;
  }, [profile, currentUser]);

  // Early returns
  if (authLoading || !currentUser || currentUser.role !== "STUDENT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div
            className={`rounded-2xl shadow-xl p-4 ${
              message.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <p className="font-bold text-center">{message.text}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto min-h-screen pb-24">
        <div className="p-5">
          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <StudentDashboardTab
              profile={profile}
              gradesData={gradesData}
              attendanceData={attendanceData}
              studentName={studentName}
              onLogout={handleLogout}
              onRefresh={handleRefreshData}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "grades" && (
            <StudentGradesTab
              initialGradesData={gradesData}
              allSubjects={allSubjects}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />
          )}

          {activeTab === "attendance" && (
            <StudentAttendanceTab
              initialAttendanceData={attendanceData}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />
          )}

          {activeTab === "profile" && profile && (
            <StudentProfileTab
              profile={profile}
              isEditingProfile={isEditingProfile}
              hasUnsavedProfileChanges={hasUnsavedProfileChanges}
              loading={loading}
              onEdit={() => setIsEditingProfile(true)}
              onSave={handleUpdateProfile}
              onCancel={() => {
                if (hasUnsavedProfileChanges) {
                  setPendingAction(() => () => setIsEditingProfile(false));
                  setShowUnsavedWarning(true);
                } else {
                  setIsEditingProfile(false);
                }
              }}
              onChangePassword={() => setShowPasswordModal(true)}
              onUnsavedChanges={setHasUnsavedProfileChanges}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {!isEditingProfile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-0 p-2">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-bold transition-all rounded-xl ${
                activeTab === "dashboard"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <Home className="w-6 h-6 mb-1" />
              <span>ទំព័រដើម</span>
            </button>
            <button
              onClick={() => handleTabChange("grades")}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-bold transition-all rounded-xl ${
                activeTab === "grades"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <BookOpen className="w-6 h-6 mb-1" />
              <span>ពិន្ទុ</span>
            </button>
            <button
              onClick={() => handleTabChange("attendance")}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-bold transition-all rounded-xl ${
                activeTab === "attendance"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <Calendar className="w-6 h-6 mb-1" />
              <span>អវត្តមាន</span>
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-bold transition-all rounded-xl ${
                activeTab === "profile"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <User className="w-6 h-6 mb-1" />
              <span>ខ្ញុំ</span>
            </button>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-md mx-auto">
          <div className="w-full bg-white rounded-t-3xl shadow-2xl">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h1>
            </div>
            <div className="p-6">
              {message && (
                <div
                  className={`mb-4 p-4 rounded-xl ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ចាស់
                  </label>
                  <input
                    type={showPassword.old ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    បញ្ជាក់ពាក្យសម្ងាត់
                  </label>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setMessage(null);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "រក្សាទុក"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h1 className="font-koulen text-xl text-gray-900">
                  មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក
                </h1>
                <p className="text-sm text-gray-600">Unsaved Changes</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              អ្នកមានព័ត៌មានដែលមិនទាន់រក្សាទុក។ តើអ្នកចង់បោះបង់ការផ្លាស់ប្តូរទេ?
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDiscardAndNavigate}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                បោះបង់ • Discard
              </button>
              <button
                onClick={handleCancelNavigation}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 px-6 rounded-xl"
              >
                ត្រឡប់ក្រោយ • Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

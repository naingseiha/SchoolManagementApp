"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  BookOpen,
  Calendar,
  Award,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Home,
  LogOut,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Clock,
  AlertCircle,
  Edit,
  CalendarCheck,
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
import { getCurrentAcademicYear } from "@/utils/academicYear";
import StudentProfileEditForm from "@/components/mobile/student-portal/StudentProfileEditForm";

const ROLE_LABELS = {
  GENERAL: "សិស្សទូទៅ",
  CLASS_LEADER: "ប្រធានថ្នាក់",
  VICE_LEADER_1: "អនុប្រធានទី១",
  VICE_LEADER_2: "អនុប្រធានទី២",
};

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
  const {
    currentUser,
    isLoading: authLoading,
    isAuthenticated,
    logout,
  } = useAuth();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Data state
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<AttendanceResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());

  // Sticky header state
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Data loading functions (defined before useEffect hooks that use them)
  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  const loadGrades = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await getMyGrades({
        year: selectedYear,
        month: selectedMonth,
      });
      setGradesData(data);
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setDataLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  const loadAttendance = useCallback(async () => {
    setDataLoading(true);
    try {
      const monthNumber =
        MONTHS.find((m) => m.value === selectedMonth)?.number || 1;
      const data = await getMyAttendance({
        month: monthNumber,
        year: selectedYear,
      });
      setAttendanceData(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setDataLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auth check - redirect if not authenticated or not a student
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !currentUser) {
        console.log("⚠️ Not authenticated, redirecting to login...");
        router.push("/login");
      } else if (currentUser.role !== "STUDENT") {
        console.log("⚠️ Not a student, redirecting to dashboard...");
        router.push("/");
      }
    }
  }, [isAuthenticated, currentUser, authLoading, router]);

  // Load profile on mount
  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      loadProfile();
    }
  }, [currentUser, loadProfile]);

  // Load initial data for dashboard on mount
  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      loadGrades();
      loadAttendance();
    }
  }, [currentUser, loadGrades, loadAttendance]);

  // Scroll listener for sticky header (grades tab only)
  useEffect(() => {
    if (activeTab !== "grades") return;

    const handleScroll = () => {
      // Check if scrolled past 350px (approximately where filters end)
      const scrollPosition = window.scrollY;
      setIsHeaderSticky(scrollPosition > 350);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  // Handlers
  const handleChangePassword = useCallback(async () => {
    if (!newPassword || !confirmPassword || !oldPassword) {
      setMessage({ type: "error", text: "សូមបំពេញព័ត៌មានទាំងអស់" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ",
      });
      return;
    }

    try {
      setLoading(true);
      await changeMyPassword({ oldPassword, newPassword });
      setMessage({ type: "success", text: "ផ្លាស់ប្តូរពាក្យសម្ងាត់បានជោគជ័យ" });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់",
      });
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword, oldPassword]);

  const handleUpdateProfile = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await updateMyProfile(data);
      setMessage({ type: "success", text: "កែប្រែព័ត៌មានបានជោគជ័យ" });
      setIsEditingProfile(false);
      await loadProfile(); // Reload profile data
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "មានបញ្ហាក្នុងការកែប្រែព័ត៌មាន",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

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

  const student = currentUser.student;
  const roleLabel =
    ROLE_LABELS[student?.studentRole as keyof typeof ROLE_LABELS] ||
    "សិស្សទូទៅ";

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
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              {/* Welcome Header */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-2xl">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-indigo-100 text-sm mb-1">សួស្តី,</p>
                      <h1 className="text-xl font-bold text-white leading-tight">
                        {studentName}
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-white text-sm font-medium">
                        {student?.class?.name || "N/A"}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-white text-sm font-medium">
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div>
                <h1 className="text-base font-bold text-gray-900 mb-3 px-1">
                  ស្ថិតិទូទៅ
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-4 border-2 border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-900">
                        មធ្យមភាគ
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {gradesData?.statistics?.averageScore?.toFixed(1) || "--"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">ពិន្ទុមធ្យម</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-4 border-2 border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-green-600 p-2 rounded-xl shadow-sm">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-green-900">
                        ការចូលរៀន
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {attendanceData?.statistics?.attendanceRate?.toFixed(0) ||
                        "--"}
                      %
                    </p>
                    <p className="text-xs text-green-600 mt-1">អត្រាចូលរៀន</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm p-4 border-2 border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-purple-600 p-2 rounded-xl shadow-sm">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-purple-900">
                        មុខវិជ្ជា
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {gradesData?.grades?.length || "--"}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      សរុបមុខវិជ្ជា
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm p-4 border-2 border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-amber-600 p-2 rounded-xl shadow-sm">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-amber-900">លំដាប់</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">
                      {gradesData?.summaries?.[0]?.classRank
                        ? `#${gradesData.summaries[0].classRank}`
                        : "--"}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">លំដាប់ថ្នាក់</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h1 className="text-base font-bold text-gray-900 mb-3 px-1">
                  សកម្មភាពរហ័ស
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleTabChange("grades")}
                    className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white bg-opacity-20 p-2.5 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold">មើលពិន្ទុ</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange("attendance")}
                    className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white bg-opacity-20 p-2.5 rounded-xl">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold">មើលការចូលរៀន</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange("profile")}
                    className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white bg-opacity-20 p-2.5 rounded-xl">
                        <User className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold">
                        ព័ត៌មានផ្ទាល់ខ្លួន
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white bg-opacity-20 p-2.5 rounded-xl">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold">
                        ប្តូរពាក្យសម្ងាត់
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-bold text-gray-900 mb-1 text-sm">
                      ព័ត៌មានសំខាន់
                    </h1>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      សូមចុចប៊ូតុង "ផ្ទុកទិន្នន័យ" នៅក្នុងផ្នែកពិន្ទុ
                      និងការចូលរៀន ដើម្បីមើលព័ត៌មានថ្មីបំផុត។
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === "grades" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">ពិន្ទុ</h1>
                <button
                  onClick={loadGrades}
                  disabled={dataLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-gray-600 ${
                      dataLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ឆ្នាំសិក្សា
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      <option value={2024}>2024-2025</option>
                      <option value={2025}>2025-2026</option>
                      <option value={2026}>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ខែ
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      {MONTHS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Load Button */}
              {!gradesData && !dataLoading && (
                <button
                  onClick={loadGrades}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="font-bold text-lg">ផ្ទុកទិន្នន័យពិន្ទុ</span>
                </button>
              )}

              {dataLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">កំពុងផ្ទុក...</p>
                </div>
              ) : gradesData && gradesData.grades.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary Card - JavaScript-based Sticky */}
                  {gradesData.summaries && gradesData.summaries.length > 0 && (
                    <>
                      {/* Placeholder div to maintain layout when fixed */}
                      {isHeaderSticky && <div className="h-[200px]"></div>}

                      {/* Summary Card with conditional fixed positioning */}
                      <div
                        className={`${
                          isHeaderSticky
                            ? "fixed -top-4 left-0 right-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 pt-9 pb-4 shadow-lg animate-in slide-in-from-top duration-300"
                            : ""
                        } transition-all`}
                      >
                        <div
                          className={`${
                            isHeaderSticky ? "max-w-md mx-auto px-5" : ""
                          }`}
                        >
                          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="font-bold text-lg">
                                  សង្ខេបពិន្ទុ
                                </h1>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                                  <p className="text-xs text-indigo-100 mb-1">
                                    មធ្យមភាគ
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {gradesData.summaries[0].average?.toFixed(
                                      2
                                    ) || "0.00"}
                                  </p>
                                </div>
                                {gradesData.summaries[0].classRank && (
                                  <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                                    <p className="text-xs text-indigo-100 mb-1">
                                      លំដាប់ថ្នាក់
                                    </p>
                                    <p className="text-2xl font-bold">
                                      #{gradesData.summaries[0].classRank}
                                    </p>
                                  </div>
                                )}
                                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                                  <p className="text-xs text-indigo-100 mb-1">
                                    សរុប
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {gradesData.summaries[0].totalScore?.toFixed(
                                      1
                                    ) || "0"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Grades List */}
                  <div className="space-y-3">
                    {gradesData.grades.map((grade) => {
                      const percentage =
                        grade.percentage ||
                        (grade.score / grade.maxScore) * 100;
                      const isPass = percentage >= 50;

                      return (
                        <div
                          key={grade.id}
                          className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                        >
                          {/* Top Section - Subject and Score */}
                          <div className="p-4 pb-3">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h1 className="font-bold text-gray-900 text-base leading-tight mb-1">
                                  {grade.subject.nameKh}
                                </h1>
                                <p className="text-xs text-gray-500">
                                  {grade.subject.code} • មេគុណពិន្ទុ:{" "}
                                  {grade.subject.coefficient}
                                </p>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`inline-flex items-baseline gap-1 px-3 py-1 rounded-xl ${
                                    isPass ? "bg-green-50" : "bg-red-50"
                                  }`}
                                >
                                  <span
                                    className={`text-2xl font-bold ${
                                      isPass ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {grade.score?.toFixed(1) || "0"}
                                  </span>
                                  <span className="text-sm text-gray-600 font-medium">
                                    /{grade.maxScore}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 font-medium">
                                  ភាគរយសម្រេច
                                </span>
                                <span
                                  className={`font-bold ${
                                    isPass ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                                    isPass
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                      : "bg-gradient-to-r from-red-500 to-rose-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Section - Status Badge */}
                          <div
                            className={`px-4 py-2 ${
                              isPass
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100"
                                : "bg-gradient-to-r from-red-50 to-rose-50 border-t border-red-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold ${
                                  isPass ? "text-green-700" : "text-red-700"
                                }`}
                              >
                                {isPass ? "✓ ជាប់" : "✗ ធ្លាក់"}
                              </span>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>ខែ: {grade.month}</span>
                                <span>ឆ្នាំ: {grade.year}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : gradesData ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm p-8 text-center border-2 border-dashed border-gray-300">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    មិនទាន់មានទិន្នន័យពិន្ទុ
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    សម្រាប់ {selectedMonth} {selectedYear}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">ការចូលរៀន</h1>
                <button
                  onClick={loadAttendance}
                  disabled={dataLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-gray-600 ${
                      dataLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ឆ្នាំសិក្សា
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      <option value={2024}>2024-2025</option>
                      <option value={2025}>2025-2026</option>
                      <option value={2026}>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ខែ
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      {MONTHS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Load Button */}
              {!attendanceData && !dataLoading && (
                <button
                  onClick={loadAttendance}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="font-bold text-lg">
                    ផ្ទុកទិន្នន័យការចូលរៀន
                  </span>
                </button>
              )}

              {dataLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">កំពុងផ្ទុក...</p>
                </div>
              ) : attendanceData ? (
                <div className="space-y-4">
                  {/* Enhanced Statistics Summary */}
                  <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                          <CalendarCheck className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg">ស្ថិតិការចូលរៀន</h1>
                      </div>

                      {/* Stats Grid - 4 columns */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-green-100 mb-1">ឡើង</p>
                          <p className="text-xl font-bold">
                            {attendanceData.statistics?.presentCount || 0}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <X className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-green-100 mb-1">
                            អត់ច្បាប់
                          </p>
                          <p className="text-xl font-bold">
                            {attendanceData.statistics?.absentCount || 0}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-green-100 mb-1">
                            មានច្បាប់
                          </p>
                          <p className="text-xl font-bold">
                            {attendanceData.statistics?.permissionCount || 0}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-green-100 mb-1">យឺត</p>
                          <p className="text-xl font-bold">
                            {attendanceData.statistics?.lateCount || 0}
                          </p>
                        </div>
                      </div>

                      {/* Summary Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3">
                          <p className="text-xs text-green-100 mb-1">
                            សរុបថ្ងៃ
                          </p>
                          <p className="text-2xl font-bold">
                            {attendanceData.statistics?.totalDays || 0}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3">
                          <p className="text-xs text-green-100 mb-1">
                            អត្រាចូលរៀន
                          </p>
                          <p className="text-2xl font-bold">
                            {(() => {
                              const totalDays =
                                attendanceData.statistics?.totalDays || 0;
                              const presentCount =
                                attendanceData.statistics?.presentCount || 0;
                              const lateCount =
                                attendanceData.statistics?.lateCount || 0;

                              // If no attendance records exist, assume 100% (no attendance taken yet or perfect attendance)
                              if (totalDays === 0) {
                                return "100%";
                              }

                              // Calculate attendance rate: (Present + Late) / Total
                              // Late students are still counted as attended
                              const attendedCount = presentCount + lateCount;
                              const rate = (attendedCount / totalDays) * 100;

                              return `${rate.toFixed(1)}%`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Records - Enhanced */}
                  {attendanceData.attendance.length > 0 && (
                    <div>
                      <h1 className="text-base font-bold text-gray-900 mb-3 px-1">
                        កំណត់ត្រារាយមុខ
                      </h1>
                      <div className="space-y-3">
                        {attendanceData.attendance.map((record) => {
                          const statusConfig = {
                            PRESENT: {
                              bg: "bg-gradient-to-r from-green-50 to-emerald-50",
                              border: "border-green-200",
                              iconBg: "bg-green-600",
                              textColor: "text-green-800",
                              label: "ឡើង",
                              icon: (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ),
                            },
                            ABSENT: {
                              bg: "bg-gradient-to-r from-red-50 to-rose-50",
                              border: "border-red-200",
                              iconBg: "bg-red-600",
                              textColor: "text-red-800",
                              label: "គ្មាន",
                              icon: <X className="w-4 h-4 text-white" />,
                            },
                            LATE: {
                              bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
                              border: "border-yellow-200",
                              iconBg: "bg-yellow-600",
                              textColor: "text-yellow-800",
                              label: "យឺត",
                              icon: <Clock className="w-4 h-4 text-white" />,
                            },
                            PERMISSION: {
                              bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                              border: "border-blue-200",
                              iconBg: "bg-blue-600",
                              textColor: "text-blue-800",
                              label: "អនុញ្ញាត",
                              icon: (
                                <AlertCircle className="w-4 h-4 text-white" />
                              ),
                            },
                          };

                          const config = statusConfig[record.status];
                          const date = new Date(record.date);
                          const dayOfWeek = date.toLocaleDateString("km-KH", {
                            weekday: "long",
                          });
                          const dateStr = date.toLocaleDateString("km-KH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });

                          return (
                            <div
                              key={record.id}
                              className={`${config.bg} rounded-2xl shadow-sm border-2 ${config.border} overflow-hidden`}
                            >
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* Status Icon */}
                                  <div
                                    className={`${config.iconBg} p-2 rounded-xl shrink-0`}
                                  >
                                    {config.icon}
                                  </div>

                                  {/* Main Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex-1">
                                        <p
                                          className={`font-bold ${config.textColor} text-base leading-tight`}
                                        >
                                          {dateStr}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                          {dayOfWeek}
                                        </p>
                                      </div>
                                      <div
                                        className={`${config.iconBg} bg-opacity-10 px-3 py-1 rounded-lg`}
                                      >
                                        <span
                                          className={`text-xs font-bold ${config.textColor}`}
                                        >
                                          {config.label}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Session Info */}
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {record.session === "MORNING"
                                            ? "វេលាព្រឹក"
                                            : "វេលាល្ងាច"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Remarks if any */}
                                    {record.remarks && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-700 italic">
                                          <span className="font-semibold">
                                            សម្គាល់:
                                          </span>{" "}
                                          {record.remarks}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && profile && (
            <>
              {isEditingProfile ? (
                <StudentProfileEditForm
                  profile={profile}
                  onSave={handleUpdateProfile}
                  onCancel={() => setIsEditingProfile(false)}
                  isSubmitting={loading}
                />
              ) : (
                <div className="space-y-5">
                  {/* Modern Profile Header Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] shadow-2xl">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                    </div>

                    <div className="relative p-8 text-center">
                      {/* Avatar */}
                      <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl flex items-center justify-center border-4 border-white border-opacity-40 shadow-2xl">
                          <User className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
                      </div>

                      {/* Name */}
                      <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                        {profile.student.khmerName}
                      </h1>
                      <p className="text-indigo-100 font-medium mb-4">
                        {profile.student.englishName ||
                          `${profile.firstName} ${profile.lastName}`}
                      </p>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                          <p className="text-white text-sm font-bold">
                            {profile.student?.class?.name || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                          <p className="text-white text-sm font-bold">
                            {ROLE_LABELS[
                              profile.student
                                ?.studentRole as keyof typeof ROLE_LABELS
                            ] || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            ថ្ងៃកំណើត
                          </p>
                          <p className="text-sm font-black text-gray-900">
                            {profile.student.dateOfBirth
                              ? new Date(
                                  profile.student.dateOfBirth
                                ).toLocaleDateString("km-KH")
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            ភេទ
                          </p>
                          <p className="text-sm font-black text-gray-900">
                            {profile.student.gender === "MALE"
                              ? "ប្រុស"
                              : "ស្រី"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                      <h2 className="text-white font-black text-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        ព័ត៌មានទំនាក់ទំនង
                      </h2>
                    </div>
                    <div className="p-1">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium text-sm">
                            អ៊ីមែល
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            {profile.email || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-gray-100"></div>
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium text-sm">
                            លេខទូរស័ព្ទ
                          </span>
                          <span className="font-bold text-gray-900">
                            {profile.student.phoneNumber ||
                              profile.phone ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      {profile.student.currentAddress && (
                        <>
                          <div className="h-px bg-gray-100"></div>
                          <div className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600 font-medium text-sm">
                                អាសយដ្ឋាន
                              </span>
                              <span className="font-bold text-gray-900 text-right max-w-[60%]">
                                {profile.student.currentAddress}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Modern Design */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <Edit className="w-6 h-6" />
                        </div>
                        <span className="font-black text-sm">កែប្រែ</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="font-black text-sm">ពាក្យសម្ងាត់</span>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="flex items-center justify-center gap-3">
                      <LogOut className="w-6 h-6" />
                      <span className="font-black text-lg">ចាកចេញ</span>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {!isEditingProfile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-0 p-2">
            <button
              onClick={() => setActiveTab("dashboard")}
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
              onClick={() => setActiveTab("grades")}
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
              onClick={() => setActiveTab("attendance")}
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
              onClick={() => setActiveTab("profile")}
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
              <h1 className="text-xl font-bold text-gray-900">
                ផ្លាស់ប្តូរពាក្យសម្ងាត់
              </h1>
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
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ចាស់
                  </label>
                  <input
                    type={showPassword.old ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        old: !showPassword.old,
                      })
                    }
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.old ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    បញ្ជាក់ពាក្យសម្ងាត់
                  </label>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
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
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "រក្សាទុក"
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

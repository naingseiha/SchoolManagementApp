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
  Edit
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
  GENERAL: "សិស្សធម្មតា",
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
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "STUDENT")) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  // Load profile on mount
  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      loadProfile();
    }
  }, [currentUser]);

  // Manual loading - removed automatic data loading

  // Data loading functions
  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadGrades = async () => {
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
  };

  const loadAttendance = async () => {
    setDataLoading(true);
    try {
      const monthNumber = MONTHS.find(m => m.value === selectedMonth)?.number || 1;
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
  };

  // Handlers
  const handleChangePassword = useCallback(async () => {
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
      await changeMyPassword({ oldPassword, newPassword });
      setMessage({ type: 'success', text: 'ផ្លាស់ប្តូរពាក្យសម្ងាត់បានជោគជ័យ' });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់' });
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword, oldPassword]);

  const handleUpdateProfile = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await updateMyProfile(data);
      setMessage({ type: 'success', text: 'កែប្រែព័ត៌មានបានជោគជ័យ' });
      setIsEditingProfile(false);
      await loadProfile(); // Reload profile data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការកែប្រែព័ត៌មាន' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }, [router]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const studentName = useMemo(() => {
    if (!profile) return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "";
    return `${profile.firstName} ${profile.lastName}`;
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
  const roleLabel = ROLE_LABELS[student?.studentRole as keyof typeof ROLE_LABELS] || "សិស្សធម្មតា";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className={`rounded-2xl shadow-xl p-4 ${
            message.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
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
                      <h1 className="text-xl font-bold text-white leading-tight">{studentName}</h1>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-white text-sm font-medium">{student?.class?.name || "N/A"}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-white text-sm font-medium">{roleLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3 px-1">ស្ថិតិទូទៅ</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-4 border-2 border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-900">មធ្យមភាគ</p>
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
                      <p className="text-xs font-bold text-green-900">ការចូលរៀន</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {attendanceData?.statistics?.attendanceRate?.toFixed(0) || "--"}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">អត្រាចូលរៀន</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm p-4 border-2 border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-purple-600 p-2 rounded-xl shadow-sm">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-purple-900">មុខវិជ្ជា</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {gradesData?.grades?.length || "--"}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">សរុបមុខវិជ្ជា</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm p-4 border-2 border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-amber-600 p-2 rounded-xl shadow-sm">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-amber-900">លំដាប់</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">
                      {gradesData?.summaries?.[0]?.classRank ? `#${gradesData.summaries[0].classRank}` : "--"}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">លំដាប់ថ្នាក់</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3 px-1">សកម្មភាពរហ័ស</h2>
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
                      <span className="text-sm font-bold">ព័ត៌មានផ្ទាល់ខ្លួន</span>
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
                      <span className="text-sm font-bold">ប្តូរពាក្យសម្ងាត់</span>
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
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">ព័ត៌មានសំខាន់</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      សូមចុចប៊ូតុង "ផ្ទុកទិន្នន័យ" នៅក្នុងផ្នែកពិន្ទុ និងការចូលរៀន ដើម្បីមើលព័ត៌មានថ្មីបំផុត។
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
                <h2 className="text-2xl font-bold text-gray-900">ពិន្ទុ</h2>
                <button
                  onClick={loadGrades}
                  disabled={dataLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${dataLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ឆ្នាំសិក្សា</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      <option value={2024}>2024-2025</option>
                      <option value={2025}>2025-2026</option>
                      <option value={2026}>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ខែ</label>
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
                <div className="space-y-3">
                  {gradesData.grades.map((grade) => (
                    <div key={grade.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{grade.subject.nameKh}</h3>
                        <span className={`text-2xl font-bold ${(grade.percentage || 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {grade.score?.toFixed(1) || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>ពិន្ទុសរុប: {grade.maxScore}</span>
                        <span>ភាគរយ: {grade.percentage?.toFixed(1) || '0'}%</span>
                      </div>
                    </div>
                  ))}
                  {gradesData.summaries && gradesData.summaries.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
                      <h3 className="font-bold mb-3">សង្ខេបពិន្ទុ</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-indigo-100">មធ្យមភាគ</p>
                          <p className="text-3xl font-bold">{gradesData.summaries[0].average?.toFixed(2) || '0.00'}</p>
                        </div>
                        {gradesData.summaries[0].classRank && (
                          <div>
                            <p className="text-sm text-indigo-100">លំដាប់ថ្នាក់</p>
                            <p className="text-3xl font-bold">#{gradesData.summaries[0].classRank}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : gradesData ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm p-8 text-center border-2 border-dashed border-gray-300">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">មិនទាន់មានទិន្នន័យពិន្ទុ</p>
                  <p className="text-sm text-gray-500 mt-2">សម្រាប់ {selectedMonth} {selectedYear}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">ការចូលរៀន</h2>
                <button
                  onClick={loadAttendance}
                  disabled={dataLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${dataLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ឆ្នាំសិក្សា</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-sm"
                    >
                      <option value={2024}>2024-2025</option>
                      <option value={2025}>2025-2026</option>
                      <option value={2026}>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ខែ</label>
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
                  <span className="font-bold text-lg">ផ្ទុកទិន្នន័យការចូលរៀន</span>
                </button>
              )}

              {dataLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">កំពុងផ្ទុក...</p>
                </div>
              ) : attendanceData && attendanceData.attendance.length > 0 ? (
                <div className="space-y-4">
                  {/* Statistics Summary */}
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
                    <h3 className="font-bold mb-3">ស្ថិតិការចូលរៀន</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm text-green-100">ឡើង</p>
                        <p className="text-2xl font-bold">{attendanceData.statistics?.presentCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-100">គ្មាន</p>
                        <p className="text-2xl font-bold">{attendanceData.statistics?.absentCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-100">អត្រា</p>
                        <p className="text-2xl font-bold">{attendanceData.statistics?.attendanceRate?.toFixed(1) || '0'}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Records */}
                  {attendanceData.attendance.map((record) => {
                    const statusColors = {
                      PRESENT: "bg-green-50 border-green-200 text-green-800",
                      ABSENT: "bg-red-50 border-red-200 text-red-800",
                      LATE: "bg-yellow-50 border-yellow-200 text-yellow-800",
                      PERMISSION: "bg-blue-50 border-blue-200 text-blue-800",
                    };
                    const statusLabels = {
                      PRESENT: "ឡើង",
                      ABSENT: "គ្មាន",
                      LATE: "យឺត",
                      PERMISSION: "អនុញ្ញាត",
                    };
                    return (
                      <div key={record.id} className={`rounded-2xl shadow-sm p-4 border-2 ${statusColors[record.status]}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{new Date(record.date).toLocaleDateString('km-KH')}</p>
                            <p className="text-sm">{record.session === 'MORNING' ? 'ព្រឹក' : 'ល្ងាច'}</p>
                          </div>
                          <span className="font-bold text-lg">{statusLabels[record.status]}</span>
                        </div>
                        {record.remarks && (
                          <p className="text-sm mt-2">{record.remarks}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : attendanceData ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-sm p-8 text-center border-2 border-dashed border-gray-300">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">មិនទាន់មានទិន្នន័យការចូលរៀន</p>
                  <p className="text-sm text-gray-500 mt-2">សម្រាប់ {selectedMonth} {selectedYear}</p>
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
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white border-opacity-30">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{studentName}</h2>
                    <p className="text-blue-100">{profile.email || profile.student.khmerName || "គ្មានអ៊ីមែល"}</p>
                    <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mt-3">
                      <p className="text-white text-sm font-medium">{profile.student?.class?.name || "N/A"}</p>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-bold text-gray-900">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
                    </div>
                    <div className="divide-y">
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">នាមខ្លួន</span>
                        <span className="font-bold text-gray-900">{profile.firstName}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">នាមត្រកូល</span>
                        <span className="font-bold text-gray-900">{profile.lastName}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">ឈ្មោះជាភាសាខ្មែរ</span>
                        <span className="font-bold text-gray-900">{profile.student.khmerName || "N/A"}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">អ៊ីមែល</span>
                        <span className="font-bold text-gray-900 text-sm">{profile.email || "N/A"}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">លេខទូរស័ព្ទ</span>
                        <span className="font-bold text-gray-900">{profile.student.phoneNumber || profile.phone || "N/A"}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">ថ្នាក់</span>
                        <span className="font-bold text-gray-900">{profile.student?.class?.name || "N/A"}</span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-gray-600">តួនាទី</span>
                        <span className="font-bold text-gray-900">{ROLE_LABELS[profile.student?.studentRole as keyof typeof ROLE_LABELS] || "N/A"}</span>
                      </div>
                      {profile.student.dateOfBirth && (
                        <div className="p-4 flex justify-between">
                          <span className="text-gray-600">ថ្ងៃកំណើត</span>
                          <span className="font-bold text-gray-900">{new Date(profile.student.dateOfBirth).toLocaleDateString('km-KH')}</span>
                        </div>
                      )}
                      {profile.student.gender && (
                        <div className="p-4 flex justify-between">
                          <span className="text-gray-600">ភេទ</span>
                          <span className="font-bold text-gray-900">{profile.student.gender === 'MALE' ? 'ប្រុស' : 'ស្រី'}</span>
                        </div>
                      )}
                      {profile.student.currentAddress && (
                        <div className="p-4 flex justify-between items-start">
                          <span className="text-gray-600">អាសយដ្ឋាន</span>
                          <span className="font-bold text-gray-900 text-right max-w-[60%]">{profile.student.currentAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full flex items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
                    >
                      <Edit className="w-6 h-6" />
                      <span className="flex-1 text-left font-bold">កែប្រែព័ត៌មាន</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
                    >
                      <Lock className="w-6 h-6" />
                      <span className="flex-1 text-left font-bold">ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
                    >
                      <LogOut className="w-6 h-6" />
                      <span className="flex-1 text-left font-bold">ចាកចេញ</span>
                    </button>
                  </div>
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
            <span>ផ្ទះ</span>
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
            <span>ចូលរៀន</span>
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
            <span>ប្រវត្តិ</span>
          </button>
        </div>
      </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-md mx-auto">
          <div className="w-full bg-white rounded-t-3xl shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
            </div>
            <div className="p-6">
              {message && (
                <div className={`mb-4 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">ពាក្យសម្ងាត់ចាស់</label>
                  <input
                    type={showPassword.old ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">ពាក្យសម្ងាត់ថ្មី</label>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">បញ្ជាក់ពាក្យសម្ងាត់</label>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-11 text-gray-500"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "រក្សាទុក"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

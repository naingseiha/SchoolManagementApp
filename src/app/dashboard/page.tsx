"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import { dashboardApi, DashboardStats } from "@/lib/api/dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  SkeletonDashboard,
  SkeletonCard,
  SkeletonChart,
} from "@/components/ui/LoadingSkeleton";

// ✅ OPTIMIZED PHASE 6: Lazy load heavy chart components for code splitting
const SimpleBarChart = dynamic(
  () => import("@/components/ui/SimpleBarChart").then((mod) => ({ default: mod.SimpleBarChart })),
  { ssr: false, loading: () => <SkeletonChart /> }
);

const GroupedBarChart = dynamic(
  () => import("@/components/ui/SimpleBarChart").then((mod) => ({ default: mod.GroupedBarChart })),
  { ssr: false, loading: () => <SkeletonChart /> }
);

const SimplePieChart = dynamic(
  () => import("@/components/ui/SimpleBarChart").then((mod) => ({ default: mod.SimplePieChart })),
  { ssr: false, loading: () => <SkeletonChart /> }
);
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Loader2,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// ✅ OPTIMIZED PHASE 6: Lazy load mobile dashboard for code splitting
const MobileDashboard = dynamic(
  () => import("@/components/mobile/dashboard/SimpleMobileDashboard"),
  { ssr: false, loading: () => <SkeletonDashboard /> }
);

export default function DashboardPage() {
  const router = useRouter();
  const deviceType = useDeviceType();
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const {
    students = [],
    teachers = [],
    classes = [],
    subjects = [],
    isLoadingStudents,
    isLoadingClasses,
  } = useData();

  // ✅ OPTIMIZED: Calculate stats BEFORE any conditional returns (Rules of Hooks)
  // Memoize expensive statistics calculations for desktop
  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    studentsWithClass: students.filter((s) => s.classId).length,
    teachersWithClass: teachers.filter((t) => t.classes && t.classes.length > 0)
      .length,
    activeSubjects: subjects.filter((s) => s.isActive).length,
  }), [students, teachers, classes, subjects]);

  const completionRate = useMemo(() => ({
    students:
      stats.totalStudents > 0
        ? (stats.studentsWithClass / stats.totalStudents) * 100
        : 0,
    teachers:
      stats.totalTeachers > 0
        ? (stats.teachersWithClass / stats.totalTeachers) * 100
        : 0,
  }), [stats]);

  // ✅ FIX: Add missing state management for dashboard stats (desktop only)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("⚠️ Not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // ✅ FIX: Load dashboard stats for desktop (only for authenticated non-students)
  useEffect(() => {
    if (!isAuthenticated || isLoading || currentUser?.role === "STUDENT" || deviceType === "mobile") {
      return; // Don't load stats for students, mobile, or unauthenticated users
    }

    const loadDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        setStatsError(null);

        // ✅ OPTIMIZED: Add timeout to prevent stuck requests (30s timeout for gender breakdown query)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout - please refresh the page")), 30000); // 30 second timeout
        });

        const dataPromise = dashboardApi.getStats();

        // Race between data fetch and timeout
        const data = await Promise.race([dataPromise, timeoutPromise]) as DashboardStats;

        console.log("📊 Dashboard data received:", {
          hasStudentsByGrade: !!data.studentsByGrade,
          studentsByGradeLength: data.studentsByGrade?.length,
          studentsByGrade: data.studentsByGrade,
        });

        setDashboardStats(data);
        console.log("✅ Desktop dashboard stats loaded successfully");
      } catch (error: any) {
        console.error("❌ Failed to load dashboard stats:", error);
        setStatsError(error.message || "Failed to load statistics");
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardStats();
  }, [isAuthenticated, isLoading, currentUser, deviceType]);

  // ✅ PERFORMANCE: Progressive Loading - Only block on auth, not data
  // Desktop and mobile both render immediately after auth
  // Data loads progressively in background
  if (isLoading) {
    return deviceType === "mobile" ? (
      <MobileLayout title="ផ្ទាំង">
        <div className="p-4">
          <SkeletonDashboard />
        </div>
      </MobileLayout>
    ) : (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto min-h-0 p-8">
            <SkeletonDashboard />
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ✅ Prevent rendering for students - they should be redirected
  if (currentUser?.role === "STUDENT") {
    return null;
  }

  // Mobile layout
  if (deviceType === "mobile") {
    return (
      <ErrorBoundary>
        <MobileLayout title="ផ្ទាំង">
          <MobileDashboard currentUser={currentUser} />
        </MobileLayout>
      </ErrorBoundary>
    );
  }

  // Desktop layout
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto min-h-0 p-8">
            {/* Welcome Section - Modern Design */}
            <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl">
              {/* ✅ OPTIMIZED: Reduced decorative elements for better performance */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>

              <div className="relative z-10 p-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-khmer-body text-white/80 text-sm font-semibold">
                    ផ្ទាំងគ្រប់គ្រង
                  </span>
                </div>
                <h1 className="font-khmer-title text-5xl text-white mb-3 drop-shadow-lg">
                  ស្វាគមន៍, {currentUser?.firstName}! 👋
                </h1>
                <p className="font-khmer-body text-white/90 text-lg font-medium mb-8">
                  ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធគ្រប់គ្រងសាលា
                </p>

                {/* Quick stats summary - ✅ OPTIMIZED: Removed hover animations for better performance */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      សិស្សសរុប
                    </span>
                    <div className="text-3xl font-moul text-white">
                      {isLoadingStudents ? (
                        <div className="animate-pulse bg-white/30 h-9 w-16 rounded"></div>
                      ) : (
                        stats.totalStudents
                      )}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      គ្រូបង្រៀនសរុប
                    </span>
                    <div className="text-3xl font-moul text-white">
                      {isLoadingStudents ? (
                        <div className="animate-pulse bg-white/30 h-9 w-16 rounded"></div>
                      ) : (
                        stats.totalTeachers
                      )}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      ថ្នាក់សកម្ម
                    </span>
                    <div className="text-3xl font-moul text-white">
                      {isLoadingClasses ? (
                        <div className="animate-pulse bg-white/30 h-9 w-16 rounded"></div>
                      ) : (
                        stats.totalClasses
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Statistics - Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Students Card */}
              <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-khmer-body text-xs font-bold text-blue-600">
                        សកម្ម
                      </span>
                    </div>
                  </div>
                  <p className="font-khmer-body text-gray-500 text-xs font-bold mb-2">
                    សិស្ស
                  </p>
                  {isLoadingStudents ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-24 rounded mb-4"></div>
                  ) : (
                    <p className="text-4xl font-moul text-gray-900 mb-4">
                      {stats.totalStudents}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {isLoadingStudents ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-32 rounded"></div>
                    ) : (
                      <span className="font-khmer-body text-sm text-gray-600 font-medium">
                        {stats.studentsWithClass} បានចុះឈ្មោះ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Teachers Card */}
              <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      <span className="font-khmer-body text-xs font-bold text-green-600">
                        សកម្ម
                      </span>
                    </div>
                  </div>
                  <p className="font-khmer-body text-gray-500 text-xs font-bold mb-2">
                    គ្រូបង្រៀន
                  </p>
                  {isLoadingStudents ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-24 rounded mb-4"></div>
                  ) : (
                    <p className="text-4xl font-moul text-gray-900 mb-4">
                      {stats.totalTeachers}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {isLoadingStudents ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-32 rounded"></div>
                    ) : (
                      <span className="font-khmer-body text-sm text-gray-600 font-medium">
                        {stats.teachersWithClass} បានចាត់តាំង
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Classes Card */}
              <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-khmer-body text-xs font-bold text-purple-600">
                        ថ្ងៃនេះ
                      </span>
                    </div>
                  </div>
                  <p className="font-khmer-body text-gray-500 text-xs font-bold mb-2">
                    ថ្នាក់រៀន
                  </p>
                  {isLoadingClasses ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-24 rounded mb-4"></div>
                  ) : (
                    <p className="text-4xl font-moul text-gray-900 mb-4">
                      {stats.totalClasses}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      ថ្នាក់សកម្ម
                    </span>
                  </div>
                </div>
              </div>

              {/* Subjects Card */}
              <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
                      <Award className="w-3.5 h-3.5 text-orange-600" />
                      <span className="font-khmer-body text-xs font-bold text-orange-600">
                        សកម្ម
                      </span>
                    </div>
                  </div>
                  <p className="font-khmer-body text-gray-500 text-xs font-bold mb-2">
                    មុខវិជ្ជា
                  </p>
                  {isLoadingStudents ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-24 rounded mb-4"></div>
                  ) : (
                    <p className="text-4xl font-moul text-gray-900 mb-4">
                      {stats.totalSubjects}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {isLoadingStudents ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-32 rounded"></div>
                    ) : (
                      <span className="font-khmer-body text-sm text-gray-600 font-medium">
                        {stats.activeSubjects} សកម្ម
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview - Modern Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Student Enrollment Progress */}
              <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                      ការចុះឈ្មោះសិស្ស
                    </h3>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      វឌ្ឍនភាពនៃការចាត់ថ្នាក់
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      សិស្សបានចុះឈ្មោះ
                    </span>
                    <span className="font-black text-gray-900 text-xl">
                      {stats.studentsWithClass} / {stats.totalStudents}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 shadow-md"
                      style={{ width: `${completionRate.students}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="font-khmer-body text-xs text-gray-500 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      អត្រាវឌ្ឍនភាព
                    </p>
                    <p className="text-sm font-black text-blue-600">
                      {completionRate.students.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher Assignment Progress */}
              <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                      ការចាត់តាំងគ្រូ
                    </h3>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      វឌ្ឍនភាពនៃការចាត់ថ្នាក់
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      គ្រូបានចាត់តាំង
                    </span>
                    <span className="font-black text-gray-900 text-xl">
                      {stats.teachersWithClass} / {stats.totalTeachers}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700 shadow-md"
                      style={{ width: `${completionRate.teachers}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="font-khmer-body text-xs text-gray-500 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      អត្រាវឌ្ឍនភាព
                    </p>
                    <p className="text-sm font-black text-green-600">
                      {completionRate.teachers.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Categories Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-khmer-title text-2xl text-gray-900 font-bold">
                    ចូលប្រើរហ័សៗ
                  </h3>
                  <p className="font-khmer-body text-xs text-gray-500 font-medium mt-1">
                    Quick Access
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <button
                  onClick={() => router.push("/students")}
                  className="group relative bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-3xl p-8 border-2 border-cyan-100 hover:border-cyan-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl group-hover:bg-cyan-300/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-xl text-gray-900 font-bold mb-1">
                      សិស្ស
                    </h4>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      Student Management
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/teachers")}
                  className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-3xl p-8 border-2 border-indigo-100 hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl group-hover:bg-indigo-300/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-xl text-gray-900 font-bold mb-1">
                      គ្រូ
                    </h4>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      Teacher Management
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/results")}
                  className="group relative bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-3xl p-8 border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl group-hover:bg-purple-300/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-xl text-gray-900 font-bold mb-1">
                      លទ្ធផល
                    </h4>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      Student Results
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/statistics")}
                  className="group relative bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-3xl p-8 border-2 border-orange-100 hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl group-hover:bg-orange-300/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-xl text-gray-900 font-bold mb-1">
                      ស្ថិតិ
                    </h4>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      Statistics
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/score-progress")}
                  className="group relative bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-3xl p-8 border-2 border-teal-100 hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl group-hover:bg-teal-300/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-xl text-gray-900 font-bold mb-1">
                      ការបញ្ចូលពិន្ទុ
                    </h4>
                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                      Score Progress
                    </p>
                  </div>
                </button>
              </div>
            </div>



            {/* Enhanced Analytics Section */}
            {isLoadingStats && !dashboardStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-3xl shadow-lg p-7">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl shadow-lg p-7">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : dashboardStats ? (
              <>
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Activity Card */}
                  <div className="bg-white rounded-3xl shadow-lg p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                          សកម្មភាពថ្មីៗ
                        </h3>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          ៧ ថ្ងៃចុងក្រោយ
                        </p>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="group flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl hover:shadow-md transition-all border-2 border-blue-100">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-khmer-body font-bold text-gray-900">
                              ពិន្ទុថ្មី
                            </p>
                            <p className="font-khmer-body text-xs text-gray-600 font-medium">
                              ពិន្ទុបានកត់ត្រា
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl font-moul text-blue-600">
                          {dashboardStats.recentActivity.recentGradeEntries}
                        </span>
                      </div>
                      <div className="group flex items-center justify-between p-5 bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl hover:shadow-md transition-all border-2 border-green-100">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-khmer-body font-bold text-gray-900">
                              វត្តមាន
                            </p>
                            <p className="font-khmer-body text-xs text-gray-600 font-medium">
                              វត្តមានថ្មីបានកត់ត្រា
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl font-moul text-green-600">
                          {
                            dashboardStats.recentActivity
                              .recentAttendanceRecords
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Distribution by Grade */}
                  <div className="bg-white rounded-3xl shadow-lg p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                          សិស្សតាមកម្រិត
                        </h3>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          ចំនួនសិស្សសរុបតាមភេទ
                        </p>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {dashboardStats.studentsByGrade && dashboardStats.studentsByGrade.length > 0 ? (
                      <GroupedBarChart
                        data={dashboardStats.studentsByGrade.map((item) => ({
                          label: `ថ្នាក់ទី ${item.grade}`,
                          groups: [
                            {
                              label: "ប្រុស",
                              value: item.male,
                              color: "#3b82f6",
                            },
                            {
                              label: "ស្រី",
                              value: item.female,
                              color: "#ec4899",
                            },
                          ],
                        }))}
                        height={180}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[180px] text-gray-400">
                        <p className="font-khmer-body text-sm">មិនមានទិន្នន័យ</p>
                      </div>
                    )}
                  </div>
                </div>


              </>
            ) : null}

            {/* Error state */}
            {statsError && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-3xl p-7 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-khmer-body font-black text-red-900 text-lg mb-1">
                      បរាជ័យក្នុងការផ្ទុកស្ថិតិ
                    </p>
                    <p className="font-khmer-body text-sm text-red-700 font-medium">
                      {statsError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

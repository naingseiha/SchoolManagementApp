"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import { dashboardApi, DashboardStats } from "@/lib/api/dashboard";
import { SimpleBarChart, SimplePieChart } from "@/components/ui/SimpleBarChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  SkeletonDashboard,
  SkeletonCard,
  SkeletonChart,
} from "@/components/ui/LoadingSkeleton";
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

// Lazy load mobile dashboard for code splitting
const MobileDashboard = dynamic(
  () => import("@/components/mobile/dashboard/MobileDashboard"),
  { ssr: false }
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
  } = useData();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("⚠️ Not authenticated, redirecting to login...");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, currentUser]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      const stats = await dashboardApi.getStats();
      setDashboardStats(stats);
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      setStatsError(error.message || "Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isLoading) {
    return deviceType === "mobile" ? (
      <MobileLayout title="ផ្ទាំង">
        <div className="p-4">
          <SkeletonDashboard />
        </div>
      </MobileLayout>
    ) : (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <SkeletonDashboard />
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    studentsWithClass: students.filter((s) => s.classId).length,
    teachersWithClass: teachers.filter((t) => t.classes && t.classes.length > 0)
      .length,
    activeSubjects: subjects.filter((s) => s.isActive).length,
  };

  const completionRate = {
    students:
      stats.totalStudents > 0
        ? (stats.studentsWithClass / stats.totalStudents) * 100
        : 0,
    teachers:
      stats.totalTeachers > 0
        ? (stats.teachersWithClass / stats.totalTeachers) * 100
        : 0,
  };

  // Mobile layout
  if (deviceType === "mobile") {
    return (
      <ErrorBoundary>
        <MobileLayout title="ផ្ទាំង">
          <MobileDashboard
            currentUser={currentUser}
            stats={stats}
            completionRate={completionRate}
            dashboardStats={dashboardStats}
            isLoadingStats={isLoadingStats}
          />
        </MobileLayout>
      </ErrorBoundary>
    );
  }

  // Desktop layout
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Battambang:wght@100;300;400;700;900&family=Bokor&family=Koulen&family=Metal&family=Moul&display=swap");

          .font-khmer-title {
            font-family: "Khmer OS Muol Light", "Muol", serif;
          }

          .font-khmer-body {
            font-family: "Khmer OS Battambang", "Battambang", sans-serif;
          }
        `}</style>

        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            {/* Welcome Section - Modern Design */}
            <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
              <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"></div>

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

                {/* Quick stats summary */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 hover:bg-white/30 transition-all duration-300 group">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      សិស្សសរុប
                    </span>
                    <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                      {stats.totalStudents}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 hover:bg-white/30 transition-all duration-300 group">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      គ្រូបង្រៀនសរុប
                    </span>
                    <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                      {stats.totalTeachers}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 hover:bg-white/30 transition-all duration-300 group">
                    <span className="font-khmer-body text-white/80 text-xs font-bold block mb-2">
                      ថ្នាក់សកម្ម
                    </span>
                    <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                      {stats.totalClasses}
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
                  <p className="text-4xl font-black text-gray-900 mb-4">
                    {stats.totalStudents}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      {stats.studentsWithClass} បានចុះឈ្មោះ
                    </span>
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
                  <p className="text-4xl font-black text-gray-900 mb-4">
                    {stats.totalTeachers}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      {stats.teachersWithClass} បានចាត់តាំង
                    </span>
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
                  <p className="text-4xl font-black text-gray-900 mb-4">
                    {stats.totalClasses}
                  </p>
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
                  <p className="text-4xl font-black text-gray-900 mb-4">
                    {stats.totalSubjects}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-khmer-body text-sm text-gray-600 font-medium">
                      {stats.activeSubjects} សកម្ម
                    </span>
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

            {/* Quick Actions - Modern Grid */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-khmer-title text-2xl text-gray-900">
                    ចម្លើយរហ័ស
                  </h3>
                  <p className="font-khmer-body text-sm text-gray-500 font-medium">
                    រុករកទៅផ្នែកសំខាន់ៗ
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push("/students")}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-blue-100 hover:border-blue-200"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl group-hover:bg-blue-300/50 transition-all"></div>
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl inline-flex mb-3 group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-khmer-body text-sm font-bold text-gray-900 block">
                      គ្រប់គ្រងសិស្ស
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/teachers")}
                  className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100/50 hover:from-green-100 hover:to-emerald-200/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-green-100 hover:border-green-200"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full blur-2xl group-hover:bg-green-300/50 transition-all"></div>
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl inline-flex mb-3 group-hover:scale-110 transition-transform shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-khmer-body text-sm font-bold text-gray-900 block">
                      គ្រប់គ្រងគ្រូ
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/classes")}
                  className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-purple-100 hover:border-purple-200"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl group-hover:bg-purple-300/50 transition-all"></div>
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl inline-flex mb-3 group-hover:scale-110 transition-transform shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-khmer-body text-sm font-bold text-gray-900 block">
                      គ្រប់គ្រងថ្នាក់
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/subjects")}
                  className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg border-2 border-orange-100 hover:border-orange-200"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl group-hover:bg-orange-300/50 transition-all"></div>
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl inline-flex mb-3 group-hover:scale-110 transition-transform shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-khmer-body text-sm font-bold text-gray-900 block">
                      គ្រប់គ្រងមុខវិជ្ជា
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced Analytics Section */}
            {dashboardStats && (
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
                        <span className="text-3xl font-black text-blue-600">
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
                        <span className="text-3xl font-black text-green-600">
                          {
                            dashboardStats.recentActivity
                              .recentAttendanceRecords
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class Distribution */}
                  <div className="bg-white rounded-3xl shadow-lg p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                          ថ្នាក់តាមកម្រិត
                        </h3>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          ទិដ្ឋភាពចែកចាយ
                        </p>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <SimpleBarChart
                      data={dashboardStats.classByGrade.map((item) => ({
                        label: `ថ្នាក់ទី ${item.grade}`,
                        value: item.count,
                        color: "#8b5cf6",
                      }))}
                      height={180}
                    />
                  </div>
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Grade Distribution */}
                  <div className="bg-white rounded-3xl shadow-lg p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                          ការចែកចាយពិន្ទុ
                        </h3>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          ការអនុវត្តឆ្នាំសិក្សាបច្ចុប្បន្ន
                        </p>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <SimpleBarChart
                      data={[
                        {
                          label: "A (ល្អប្រសើរ)",
                          value: dashboardStats.gradeDistribution.A,
                          color: "#10b981",
                        },
                        {
                          label: "B (ល្អណាស់)",
                          value: dashboardStats.gradeDistribution.B,
                          color: "#3b82f6",
                        },
                        {
                          label: "C (ល្អ)",
                          value: dashboardStats.gradeDistribution.C,
                          color: "#f59e0b",
                        },
                        {
                          label: "D (ល្អបង្គួរ)",
                          value: dashboardStats.gradeDistribution.D,
                          color: "#f97316",
                        },
                        {
                          label: "E (មធ្យម)",
                          value: dashboardStats.gradeDistribution.E,
                          color: "#ef4444",
                        },
                        {
                          label: "F (ខ្សោយ)",
                          value: dashboardStats.gradeDistribution.F,
                          color: "#dc2626",
                        },
                      ]}
                      height={200}
                    />
                  </div>

                  {/* Attendance Overview */}
                  <div className="bg-white rounded-3xl shadow-lg p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-khmer-title text-lg text-gray-900 mb-1">
                          ទិដ្ឋភាពវត្តមាន
                        </h3>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          ស្ថិតិ ៣០ ថ្ងៃចុងក្រោយ
                        </p>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <SimplePieChart
                        data={[
                          {
                            label: "មាន",
                            value: dashboardStats.attendanceStats.present,
                            color: "#10b981",
                          },
                          {
                            label: "អវត្តមាន",
                            value: dashboardStats.attendanceStats.absent,
                            color: "#ef4444",
                          },
                          {
                            label: "យឺត",
                            value: dashboardStats.attendanceStats.late,
                            color: "#f59e0b",
                          },
                          {
                            label: "មានច្បាប់",
                            value: dashboardStats.attendanceStats.excused,
                            color: "#3b82f6",
                          },
                        ]}
                        size={180}
                      />
                    </div>
                  </div>
                </div>

                {/* Top Performing Classes */}
                {dashboardStats.topPerformingClasses.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-7">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-khmer-title text-2xl text-gray-900 flex items-center gap-2">
                            ថ្នាក់ល្អប្រសើរបំផុត 🏆
                          </h3>
                          <p className="font-khmer-body text-xs text-gray-500 font-medium">
                            ផ្អែកលើមធ្យមភាគសិស្ស
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {dashboardStats.topPerformingClasses.map((cls, index) => (
                        <div
                          key={cls.id}
                          className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-amber-200 hover:border-amber-300 transform hover:-translate-y-1"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full blur-2xl group-hover:bg-amber-300/50 transition-all"></div>
                          <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                  <span className="text-xl font-black text-white">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-khmer-body font-black text-gray-900 text-lg">
                                    {cls.name}
                                  </h4>
                                  <p className="font-khmer-body text-xs text-gray-600 font-medium">
                                    ថ្នាក់ទី {cls.grade} • {cls.studentCount}{" "}
                                    សិស្ស
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="pt-4 border-t-2 border-amber-200">
                              <p className="font-khmer-body text-xs text-gray-600 font-bold mb-2">
                                ពិន្ទុមធ្យម
                              </p>
                              <p className="text-3xl font-black text-amber-600">
                                {cls.averageScore?.toFixed(1) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading state for stats */}
            {isLoadingStats && !dashboardStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkeletonChart />
                  <SkeletonChart />
                </div>
              </div>
            )}

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

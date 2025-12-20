"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { dashboardApi, DashboardStats } from "@/lib/api/dashboard";
import { SimpleBarChart, SimplePieChart } from "@/components/ui/SimpleBarChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkeletonDashboard, SkeletonCard, SkeletonChart } from "@/components/ui/LoadingSkeleton";
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

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const {
    students = [],
    teachers = [],
    classes = [],
    subjects = [],
  } = useData();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
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
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
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

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
          {/* Welcome Section - Modern Design */}
          <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h1 className="text-4xl font-black text-white mb-2">
                Welcome back, {currentUser?.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលា • Here's what's happening
                today
              </p>

              {/* Quick stats summary */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <span className="text-white/80 text-xs font-semibold">
                    Total Students
                  </span>
                  <div className="text-2xl font-black text-white">
                    {stats.totalStudents}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <span className="text-white/80 text-xs font-semibold">
                    Total Teachers
                  </span>
                  <div className="text-2xl font-black text-white">
                    {stats.totalTeachers}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <span className="text-white/80 text-xs font-semibold">
                    Active Classes
                  </span>
                  <div className="text-2xl font-black text-white">
                    {stats.totalClasses}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Statistics - Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Students Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-blue-100 text-sm font-semibold mb-1">
                  សិស្ស • Students
                </p>
                <p className="text-4xl font-black text-white mb-3">
                  {stats.totalStudents}
                </p>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {stats.studentsWithClass} enrolled
                </div>
              </div>
            </div>

            {/* Teachers Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-green-100 text-sm font-semibold mb-1">
                  គ្រូ • Teachers
                </p>
                <p className="text-4xl font-black text-white mb-3">
                  {stats.totalTeachers}
                </p>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {stats.teachersWithClass} assigned
                </div>
              </div>
            </div>

            {/* Classes Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <Calendar className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-purple-100 text-sm font-semibold mb-1">
                  ថ្នាក់ • Classes
                </p>
                <p className="text-4xl font-black text-white mb-3">
                  {stats.totalClasses}
                </p>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Active classes
                </div>
              </div>
            </div>

            {/* Subjects Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <Award className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-orange-100 text-sm font-semibold mb-1">
                  មុខវិជ្ជា • Subjects
                </p>
                <p className="text-4xl font-black text-white mb-3">
                  {stats.totalSubjects}
                </p>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {stats.activeSubjects} active
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview - Modern Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Student Enrollment Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900">
                  Student Enrollment
                </h3>
                <div className="p-2 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-semibold">
                    Enrolled Students
                  </span>
                  <span className="font-black text-gray-900 text-lg">
                    {stats.studentsWithClass} / {stats.totalStudents}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${completionRate.students}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {completionRate.students.toFixed(1)}% of students assigned to
                  classes
                </p>
              </div>
            </div>

            {/* Teacher Assignment Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900">
                  Teacher Assignments
                </h3>
                <div className="p-2 bg-green-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-semibold">
                    Assigned Teachers
                  </span>
                  <span className="font-black text-gray-900 text-lg">
                    {stats.teachersWithClass} / {stats.totalTeachers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${completionRate.teachers}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {completionRate.teachers.toFixed(1)}% of teachers assigned to
                  classes
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions - Modern Grid */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-6">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push("/students")}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white block">
                    Manage Students
                  </span>
                </button>
                <button
                  onClick={() => router.push("/teachers")}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white block">
                    Manage Teachers
                  </span>
                </button>
                <button
                  onClick={() => router.push("/classes")}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white block">
                    Manage Classes
                  </span>
                </button>
                <button
                  onClick={() => router.push("/subjects")}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white block">
                    Manage Subjects
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          {dashboardStats && (
            <>
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activity Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-gray-900">
                      Recent Activity (Last 7 Days)
                    </h3>
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Grade Entries</p>
                          <p className="text-xs text-gray-600">New grades recorded</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-blue-600">
                        {dashboardStats.recentActivity.recentGradeEntries}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Attendance Records</p>
                          <p className="text-xs text-gray-600">New attendance marked</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-green-600">
                        {dashboardStats.recentActivity.recentAttendanceRecords}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Class Distribution */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-gray-900">
                      Classes by Grade Level
                    </h3>
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <SimpleBarChart
                    data={dashboardStats.classByGrade.map((item) => ({
                      label: `Grade ${item.grade}`,
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Grade Distribution
                      </h3>
                      <p className="text-xs text-gray-600">
                        Current academic year performance
                      </p>
                    </div>
                    <Award className="w-5 h-5 text-orange-600" />
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Attendance Overview
                      </h3>
                      <p className="text-xs text-gray-600">Last 30 days statistics</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex justify-center">
                    <SimplePieChart
                      data={[
                        {
                          label: "Present",
                          value: dashboardStats.attendanceStats.present,
                          color: "#10b981",
                        },
                        {
                          label: "Absent",
                          value: dashboardStats.attendanceStats.absent,
                          color: "#ef4444",
                        },
                        {
                          label: "Late",
                          value: dashboardStats.attendanceStats.late,
                          color: "#f59e0b",
                        },
                        {
                          label: "Excused",
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
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Top Performing Classes 🏆
                      </h3>
                      <p className="text-xs text-gray-600">
                        Based on average student performance
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardStats.topPerformingClasses.map((cls, index) => (
                      <div
                        key={cls.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-amber-600">
                                #{index + 1}
                              </span>
                              <h4 className="font-black text-gray-900">{cls.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600">
                              Grade {cls.grade} • {cls.studentCount} students
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-amber-100">
                          <p className="text-xs text-gray-600 mb-1">Average Score</p>
                          <p className="text-2xl font-black text-amber-600">
                            {cls.averageScore?.toFixed(1) || "N/A"}
                          </p>
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
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-900">Failed to load statistics</p>
                  <p className="text-sm text-red-700">{statsError}</p>
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

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
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
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const {
    students = [], // ✅ ADD DEFAULT
    teachers = [], // ✅ ADD DEFAULT
    classes = [], // ✅ ADD DEFAULT
    subjects = [], // ✅ ADD DEFAULT
  } = useData();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("⚠️ Not authenticated, redirecting to login...");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
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
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8">
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
        </main>
      </div>
    </div>
  );
}

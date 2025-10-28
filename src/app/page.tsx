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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលា • Here's what's happening
              today
            </p>
          </div>

          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Students Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">សិស្ស • Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalStudents}
                  </p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stats.studentsWithClass} enrolled
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Teachers Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">គ្រូ • Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalTeachers}
                  </p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stats.teachersWithClass} assigned
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Classes Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ថ្នាក់ • Classes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalClasses}
                  </p>
                  <p className="text-xs text-purple-600 mt-2 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Active classes
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Subjects Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">មុខវិជ្ជា • Subjects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalSubjects}
                  </p>
                  <p className="text-xs text-orange-600 mt-2 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {stats.activeSubjects} active
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Student Enrollment Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Student Enrollment
                </h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Enrolled Students</span>
                  <span className="font-semibold text-gray-900">
                    {stats.studentsWithClass} / {stats.totalStudents}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate.students}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {completionRate.students.toFixed(1)}% of students assigned to
                  classes
                </p>
              </div>
            </div>

            {/* Teacher Assignment Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Teacher Assignments
                </h3>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned Teachers</span>
                  <span className="font-semibold text-gray-900">
                    {stats.teachersWithClass} / {stats.totalTeachers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate.teachers}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {completionRate.teachers.toFixed(1)}% of teachers assigned to
                  classes
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/students")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all hover:scale-105"
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Manage Students</span>
              </button>
              <button
                onClick={() => router.push("/teachers")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all hover:scale-105"
              >
                <UserCheck className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Manage Teachers</span>
              </button>
              <button
                onClick={() => router.push("/classes")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all hover:scale-105"
              >
                <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Manage Classes</span>
              </button>
              <button
                onClick={() => router.push("/subjects")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all hover:scale-105"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Manage Subjects</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

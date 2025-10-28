"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  UserCheck,
  Clock,
  Award,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const {
    students,
    teachers,
    classes,
    subjects,
    isLoadingStudents,
    isLoadingClasses,
  } = useData();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    maleStudents: students.filter((s) => s.gender === "male").length,
    femaleStudents: students.filter((s) => s.gender === "female").length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    studentsWithClass: students.filter((s) => s.classId).length,
    studentsWithoutClass: students.filter((s) => !s.classId).length,
  };

  const isLoading = isLoadingStudents || isLoadingClasses;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ផ្ទាំងគ្រប់គ្រង Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                សង្ខេបព័ត៌មានប្រព័ន្ធ • System Overview
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">សួស្តី Welcome,</p>
              <p className="text-lg font-semibold text-gray-900 english-modern">
                {currentUser?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize english-modern">
                {currentUser?.role || "N/A"}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Students Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        សិស្សសរុប
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Total Students
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.totalStudents}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="text-gray-600 group-hover:text-white/80">
                          ប្រុស {stats.maleStudents} • ស្រី{" "}
                          {stats.femaleStudents}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Teachers Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <UserCheck className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        គ្រូបង្រៀន
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Total Teachers
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.totalTeachers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Classes Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        ថ្នាក់រៀន
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Total Classes
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.totalClasses}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Subjects Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50"></div>

                  <div className="relative p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <BookOpen className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                        មុខវិជ្ជា
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                        Total Subjects
                      </p>
                      <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                        {stats.totalSubjects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity / Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    ចំណាត់ថ្នាក់សិស្ស • Student Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        សិស្សមានថ្នាក់ • Students with Class
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.studentsWithClass}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        សិស្សគ្មានថ្នាក់ • Students without Class
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {stats.studentsWithoutClass}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    សកម្មភាពរហ័ស • Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push("/students")}
                      className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition-all duration-200 text-left"
                    >
                      <Users className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">សិស្ស</p>
                      <p className="text-xs text-gray-500">Manage Students</p>
                    </button>
                    <button
                      onClick={() => router.push("/teachers")}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-200 text-left"
                    >
                      <UserCheck className="w-6 h-6 text-green-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">គ្រូ</p>
                      <p className="text-xs text-gray-500">Manage Teachers</p>
                    </button>
                    <button
                      onClick={() => router.push("/classes")}
                      className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-200 text-left"
                    >
                      <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        ថ្នាក់
                      </p>
                      <p className="text-xs text-gray-500">Manage Classes</p>
                    </button>
                    <button
                      onClick={() => router.push("/grades")}
                      className="p-4 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all duration-200 text-left"
                    >
                      <Award className="w-6 h-6 text-orange-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        ពិន្ទុ
                      </p>
                      <p className="text-xs text-gray-500">Manage Grades</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

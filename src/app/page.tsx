"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Activity,
  Calendar,
  Award,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { students, teachers, classes, subjects } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      name: "សិស្សសរុប",
      nameEn: "Total Students",
      value: students.length,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
      iconHoverColor: "group-hover:text-blue-700",
      chartData: [65, 75, 70, 85, 90, 88, students.length || 95],
    },
    {
      name: "គ្រូបង្រៀន",
      nameEn: "Teachers",
      value: teachers.length,
      icon: GraduationCap,
      gradient: "from-green-500 to-emerald-500",
      lightBg: "from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      iconHoverColor: "group-hover:text-green-700",
      chartData: [12, 15, 14, 16, 18, 17, teachers.length || 20],
    },
    {
      name: "ថ្នាក់រៀន",
      nameEn: "Classes",
      value: classes.length,
      icon: School,
      gradient: "from-purple-500 to-pink-500",
      lightBg: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      iconHoverColor: "group-hover:text-purple-700",
      chartData: [5, 6, 7, 8, 9, 10, classes.length || 12],
    },
    {
      name: "មុខវិជ្ជា",
      nameEn: "Subjects",
      value: subjects.length,
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500",
      lightBg: "from-orange-50 to-red-50",
      iconColor: "text-orange-600",
      iconHoverColor: "group-hover:text-orange-700",
      chartData: [8, 10, 12, 15, 18, 20, subjects.length || 22],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header Section - Clean Design */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-4xl font-light text-white khmer-title tracking-wide">
                      ផ្ទាំងគ្រប់គ្រង
                    </h1>
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-2xl">
                  ព័ត៌មានទូទៅអំពីប្រព័ន្ធគ្រប់គ្រងសាលារៀន
                </p>
              </div>
            </div>

            {/* Stats Grid - Fixed Icon Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.nameEn}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    {/* Light background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.lightBg} opacity-40`}
                    ></div>

                    <div className="relative p-6 z-10">
                      {/* Icon and trend indicator */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white shadow-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <Icon
                            className={`w-7 h-7 ${stat.iconColor} ${stat.iconHoverColor} transition-colors duration-300`}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex items-center space-x-1 text-green-600 group-hover:text-white/90 transition-colors duration-300">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-semibold">+12%</span>
                        </div>
                      </div>

                      {/* Stats content */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                          {stat.name}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                          {stat.nameEn}
                        </p>
                        <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-3">
                          {stat.value}
                        </p>
                      </div>

                      {/* Mini chart */}
                      <div className="mt-4 flex items-end justify-between h-10 space-x-1">
                        {stat.chartData.map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gray-300/60 group-hover:bg-white/50 rounded-t transition-all duration-300"
                            style={{
                              height: `${
                                (height / Math.max(...stat.chartData)) * 100
                              }%`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 md:p-10 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="relative z-10 space-y-5">
                  <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Award className="w-5 h-5 text-white" />
                    <span className="text-white font-medium text-sm">
                      សូមស្វាគមន៍ • Welcome
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-light text-white khmer-title leading-relaxed">
                    ប្រព័ន្ធគ្រប់គ្រងសាលារៀន
                  </h2>

                  <p className="text-white/90 text-base leading-relaxed max-w-xl">
                    School Management System -
                    ជ្រើសរើសមុខងារពីម៉ឺនុយដើម្បីចាប់ផ្តើមគ្រប់គ្រងសិស្ស
                    គ្រូបង្រៀន ថ្នាក់រៀន និងមុខវិជ្ជា។
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all duration-200 hover:scale-105 shadow-md">
                      ចាប់ផ្តើម
                    </button>
                    <button className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/25 transition-all duration-200 border border-white/20">
                      ស្វែងយល់បន្ថែម
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-sm">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1 font-medium">
                    អ្នកប្រើប្រាស់សកម្ម
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.length + teachers.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total Active Users
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-1 font-medium">
                    ស្ថានភាពប្រព័ន្ធ
                  </p>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-white/75 mt-1">System Uptime</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 khmer-title">
                    សកម្មភាពថ្មីៗ
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Recent Activities
                  </p>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors">
                  មើលទាំងអស់
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    action: "New student registered",
                    time: "5 minutes ago",
                    icon: Users,
                    color: "bg-blue-500",
                  },
                  {
                    action: "Grade updated for Class 10A",
                    time: "1 hour ago",
                    icon: BookOpen,
                    color: "bg-green-500",
                  },
                  {
                    action: "Teacher assigned to Math",
                    time: "2 hours ago",
                    icon: GraduationCap,
                    color: "bg-purple-500",
                  },
                  {
                    action: "New subject added",
                    time: "3 hours ago",
                    icon: School,
                    color: "bg-orange-500",
                  },
                ].map((activity, index) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-200"
                    >
                      <div
                        className={`p-2.5 ${activity.color} rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm`}
                      >
                        <ActivityIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-indigo-600 text-xl">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

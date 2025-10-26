"use client";

import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useData } from "@/context/DataContext";

export default function DashboardPage() {
  const { students, teachers, classes, subjects } = useData();

  const stats = [
    {
      name: "សិស្សសរុប",
      nameEn: "Total Students",
      value: students.length,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
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
      chartData: [8, 10, 12, 15, 18, 20, subjects.length || 22],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl animate-fadeIn">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-white animate-pulse" />
            <h1 className="text-3xl font-bold text-white">
              ផ្ទាំងគ្រប់គ្រង Dashboard
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            ព័ត៌មានទូទៅអំពីប្រព័ន្ធគ្រប់គ្រងសាលារៀន • Overview of School
            Management System
          </p>
        </div>
      </div>

      {/* Stats Grid with Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.nameEn}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>

              {/* Light Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.lightBg} opacity-50`}
              ></div>

              <div className="relative p-6 z-10">
                {/* Icon with Animation */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-white shadow-md group-hover:scale-105 transition-transform duration-300 ease-out`}
                  >
                    <Icon
                      className={`w-8 h-8 ${stat.iconColor} group-hover:text-white transition-colors duration-300`}
                    />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 group-hover:text-white transition-colors duration-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">+12%</span>
                  </div>
                </div>

                {/* Stats Text */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    {stat.name}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-white/75 transition-colors duration-300">
                    {stat.nameEn}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mt-2">
                    {stat.value}
                  </p>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="mt-4 flex items-end justify-between h-12 space-x-1">
                  {stat.chartData.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-gray-300 to-gray-400 group-hover:from-white/50 group-hover:to-white/80 rounded-t transition-all duration-300"
                      style={{
                        height: `${
                          (height / Math.max(...stat.chartData)) * 100
                        }%`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          );
        })}
      </div>

      {/* Welcome Section - Enhanced */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Welcome Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Activity className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-semibold text-sm">
                ព័ត៌មានថ្មីៗ • Recent Activity
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white">
              សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលារៀន
            </h2>

            <p className="text-white/90 text-lg leading-relaxed">
              Welcome to the School Management System. Select a menu item from
              the sidebar to get started with managing students, teachers,
              classes, and more.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 hover:scale-105 shadow-lg">
                ចាប់ផ្តើម Get Started
              </button>
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30">
                ស្វែងយល់បន្ថែម Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="space-y-4">
          {/* Active Users */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">អ្នកប្រើប្រាស់សកម្ម</p>
            <p className="text-2xl font-bold text-gray-900">
              {students.length + teachers.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Active Users</p>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">ស្ថានភាពប្រព័ន្ធ</p>
            <p className="text-2xl font-bold text-white">99.9%</p>
            <p className="text-xs text-white/75 mt-1">System Uptime</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            សកម្មភាពថ្មីៗ • Recent Activities
          </h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors">
            មើលទាំងអស់ View All
          </button>
        </div>

        <div className="space-y-4">
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
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className={`p-3 ${activity.color} rounded-lg group-hover:scale-105 transition-transform duration-200`}
                >
                  <ActivityIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-indigo-600">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

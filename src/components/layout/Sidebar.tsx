"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Match Prisma schema roles
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "ផ្ទាំងគ្រប់គ្រង",
      subLabel: "Dashboard",
      href: "/",
      roles: ["ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      label: "សិស្ស",
      subLabel: "Students",
      href: "/students",
      roles: ["ADMIN", "CLASS_TEACHER"],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: UserCheck,
      label: "គ្រូបង្រៀន",
      subLabel: "Teachers",
      href: "/teachers",
      roles: ["ADMIN"],
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: GraduationCap,
      label: "ថ្នាក់រៀន",
      subLabel: "Classes",
      href: "/classes",
      roles: ["ADMIN", "CLASS_TEACHER"],
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BookOpen,
      label: "មុខវិជ្ជា",
      subLabel: "Subjects",
      href: "/subjects",
      roles: ["ADMIN", "SUBJECT_TEACHER"],
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: ClipboardList,
      label: "ពិន្ទុ",
      subLabel: "Grades",
      href: "/grade-entry",
      roles: ["ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Calendar,
      label: "វត្តមាន",
      subLabel: "Attendance",
      href: "/attendance",
      roles: ["ADMIN", "CLASS_TEACHER"],
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      label: "របាយការណ៍",
      subLabel: "Reports",
      href: "/reports/monthly",
      roles: ["ADMIN", "CLASS_TEACHER"],
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: BookOpen,
      label: "សៀវភៅតាមដានសិស្ស",
      subLabel: "Reports",
      href: "/reports/tracking-book",
      roles: ["ADMIN", "CLASS_TEACHER"],
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Settings,
      label: "ការកំណត់",
      subLabel: "Settings",
      href: "/settings",
      roles: ["ADMIN"],
      gradient: "from-gray-500 to-slate-500",
    },
  ];

  const userRole = currentUser?.role;
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole || "")
  );

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Super Admin",
          color: "text-indigo-600",
          bg: "bg-indigo-100",
        };
      case "CLASS_TEACHER":
        return {
          label: "Class Teacher",
          color: "text-purple-600",
          bg: "bg-purple-100",
        };
      case "SUBJECT_TEACHER":
        return {
          label: "Subject Teacher",
          color: "text-green-600",
          bg: "bg-green-100",
        };
      default:
        return { label: "Unknown", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const roleInfo = getRoleDisplay(userRole || "");

  return (
    <aside
      className={`bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      } relative flex flex-col h-screen`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                School MS
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5 english-modern">
                Management System
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mb-4 animate-bounce">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>
            <p className="font-semibold text-gray-900 mb-2">
              No menu available
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Role:{" "}
              <span className="font-medium text-red-600">
                {userRole || "Unknown"}
              </span>
            </p>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-left">
              <p className="font-medium text-yellow-800 text-xs mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Expected Roles:
              </p>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  ADMIN
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  CLASS_TEACHER
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  SUBJECT_TEACHER
                </li>
              </ul>
            </div>
          </div>
        ) : (
          filteredMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r " +
                        item.gradient +
                        " text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md"
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "slideIn 0.3s ease-out forwards",
                }}
              >
                {/* Animated background effect for active item */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}

                {/* Icon with hover effect */}
                <div className="relative z-10">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? "text-white drop-shadow-md"
                        : "text-gray-600 group-hover:text-indigo-600 group-hover:scale-110"
                    }`}
                  />
                </div>

                {/* Labels */}
                {!isCollapsed && (
                  <div className="flex-1 relative z-10">
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-xs transition-colors english-modern ${
                        isActive ? "text-white/90" : "text-gray-500"
                      }`}
                    >
                      {item.subLabel}
                    </p>
                  </div>
                )}

                {/* Active indicator dot */}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-md animate-pulse relative z-10"></div>
                )}

                {/* Collapsed active indicator */}
                {isActive && isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-md"></div>
                )}
              </Link>
            );
          })
        )}
      </nav>

      {/* User Info at Bottom */}
      {currentUser && (
        <div
          className={`border-t border-gray-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-sm transition-all duration-500 ${
            isCollapsed ? "p-3" : "p-4"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md">
                <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* User Details */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate english-modern mb-0.5">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${roleInfo.bg} ${roleInfo.color}`}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Collapsed mode tooltip */}
          {isCollapsed && (
            <div className="mt-2 text-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse"></div>
            </div>
          )}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #818cf8, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6366f1, #9333ea);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}

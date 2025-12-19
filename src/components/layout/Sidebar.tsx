"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BookIcon,
  Calendar,
  ClipboardList,
  BarChart3,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // ✅ Get user role (from User table)
  const userRole = currentUser?.role; // "ADMIN" or "TEACHER"

  // ✅ Get teacher role (from Teacher table) if user is a teacher
  const teacherRole = currentUser?.teacher?.role; // "TEACHER" or "INSTRUCTOR"

  // ✅ Menu items with proper role filtering
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "ផ្ទាំងគ្រប់គ្រង",
      subLabel: "Dashboard",
      href: "/",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access dashboard
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      label: "សិស្ស",
      subLabel: "Students",
      href: "/students",
      roles: ["ADMIN"], // ✅ Admin only
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: UserCheck,
      label: "គ្រូបង្រៀន",
      subLabel: "Teachers",
      href: "/teachers",
      roles: ["ADMIN"], // ✅ Admin only
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: GraduationCap,
      label: "ថ្នាក់រៀន",
      subLabel: "Classes",
      href: "/classes",
      roles: ["ADMIN"], // ✅ Admin only
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BookIcon,
      label: "មុខវិជ្ជា",
      subLabel: "Subjects",
      href: "/subjects",
      roles: ["ADMIN"], // ✅ Admin only
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: ClipboardList,
      label: "ពិន្ទុ",
      subLabel: "Grades",
      href: "/grade-entry",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Calendar,
      label: "វត្តមាន",
      subLabel: "Attendance",
      href: "/attendance",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      label: "របាយការណ៍",
      subLabel: "Reports",
      href: "/reports/monthly",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Award,
      label: "តារាងកិត្តិយស",
      subLabel: "Honor Roll",
      href: "/reports/award",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: BookOpen,
      label: "សៀវភៅតាមដានសិស្ស",
      subLabel: "Tracking Book",
      href: "/reports/tracking-book",
      roles: ["ADMIN", "TEACHER"], // ✅ Both can access
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Settings,
      label: "ការកំណត់",
      subLabel: "Settings",
      href: "/settings",
      roles: ["ADMIN"], // ✅ Admin only
      gradient: "from-gray-500 to-slate-500",
    },
  ];

  // ✅ Filter menu based on User. role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole || "")
  );

  // ✅ Get role display for sidebar
  const getRoleDisplay = (userRole?: string, teacherRole?: string) => {
    if (userRole === "ADMIN") {
      return {
        label: "Admin",
        khmerLabel: "អ្នកគ្រប់គ្រង",
        color: "text-indigo-600",
        bg: "bg-indigo-100",
      };
    }

    if (userRole === "TEACHER") {
      if (teacherRole === "INSTRUCTOR") {
        return {
          label: "Instructor",
          khmerLabel: "គ្រូប្រចាំថ្នាក់",
          color: "text-purple-600",
          bg: "bg-purple-100",
        };
      }
      return {
        label: "Teacher",
        khmerLabel: "គ្រូបង្រៀន",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    }

    return {
      label: "Unknown",
      khmerLabel: "មិនស្គាល់",
      color: "text-gray-600",
      bg: "bg-gray-100",
    };
  };

  const roleInfo = getRoleDisplay(userRole, teacherRole);

  // ✅ Handle navigation with loading state
  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href === pathname) return; // Already on this page

      e.preventDefault();
      setIsNavigating(true);
      setTargetPath(href);

      // Start navigation
      router.push(href);
    },
    [pathname, router]
  );

  // ✅ Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
    setTargetPath(null);
  }, [pathname]);

  // ✅ Prefetch routes on hover for faster navigation
  const handleMouseEnter = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router]
  );

  return (
    <aside
      className={`bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      } relative flex flex-col h-screen`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        {!isCollapsed && (
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                School MS
              </h1>
              <p className="text-[9px] text-gray-500 -mt-0.5 font-medium english-modern">
                Management System
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group border border-transparent hover:border-indigo-100"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
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
                  TEACHER
                </li>
              </ul>
            </div>
          </div>
        ) : (
          filteredMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isLoadingThis = isNavigating && targetPath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavigation(e, item.href)}
                onMouseEnter={() => handleMouseEnter(item.href)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r " +
                        item.gradient +
                        " text-white shadow-lg scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md hover:scale-[1.01]"
                  }
                  ${isLoadingThis ? "opacity-75 cursor-wait" : ""}
                `}
                style={{
                  animationDelay: `${index * 30}ms`,
                  animation: "slideIn 0.2s ease-out forwards",
                }}
              >
                {/* Animated background effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                )}

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  {isLoadingThis ? (
                    <Loader2
                      className={`w-5 h-5 animate-spin ${
                        isActive ? "text-white" : "text-indigo-600"
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 ${
                        isActive
                          ? "text-white drop-shadow-md"
                          : "text-gray-600 group-hover:text-indigo-600 group-hover:scale-110"
                      }`}
                    />
                  )}
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

                {/* Active indicator */}
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
          className={`border-t border-gray-200 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 backdrop-blur-md transition-all duration-300 ${
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md transform group-hover:scale-105 transition-transform duration-200">
                {currentUser.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm">
                <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            {/* User Details */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate english-modern mb-1">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${roleInfo.bg} ${roleInfo.color}`}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    {roleInfo.label}
                  </span>
                </div>
                {/* Show Khmer role name */}
                <p className="text-[9px] text-gray-500 mt-0.5 font-medium">
                  {roleInfo.khmerLabel}
                </p>
              </div>
            )}
          </div>

          {/* Collapsed mode indicator */}
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
            transform: translateX(-10px);
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

// ✅ Memoize to prevent unnecessary re-renders
export default memo(Sidebar);

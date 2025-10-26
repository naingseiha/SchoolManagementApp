"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  School,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    name: "ផ្ទាំងគ្រប់គ្រង",
    nameEn: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["superadmin", "classteacher", "teacher"],
  },
  {
    name: "សិស្ស",
    nameEn: "Students",
    href: "/students",
    icon: Users,
    roles: ["superadmin", "classteacher"],
  },
  {
    name: "គ្រូបង្រៀន",
    nameEn: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
    roles: ["superadmin"],
  },
  {
    name: "ថ្នាក់រៀន",
    nameEn: "Classes",
    href: "/classes",
    icon: School,
    roles: ["superadmin", "classteacher"],
  },
  {
    name: "មុខវិជ្ជា",
    nameEn: "Subjects",
    href: "/subjects",
    icon: BookOpen,
    roles: ["superadmin"],
  },
  {
    name: "បញ្ចូលពិន្ទុ",
    nameEn: "Grades",
    href: "/grades",
    icon: ClipboardList,
    roles: ["superadmin", "classteacher", "teacher"],
  },
  {
    name: "របាយការណ៍",
    nameEn: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["superadmin", "classteacher"],
  },
  {
    name: "ការកំណត់",
    nameEn: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["superadmin", "classteacher", "teacher"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser?.role || "")
  );

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white shadow-xl">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white drop-shadow-lg">
            ប្រព័ន្ធគ្រប់គ្រង
          </h1>
          <p className="text-xs text-white/90 font-medium">School Management</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600"
                }
                animate-slideUp
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white"></div>
              )}

              {/* Icon */}
              <div
                className={`
                flex-shrink-0 transition-all duration-300
                ${
                  isActive
                    ? "scale-110"
                    : "group-hover:scale-110 group-hover:rotate-6"
                }
              `}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p
                  className={`
                  font-semibold transition-all duration-300
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-900 group-hover:text-indigo-600"
                  }
                `}
                >
                  {item.name}
                </p>
                <p
                  className={`
                  text-xs transition-all duration-300
                  ${
                    isActive
                      ? "text-white/90"
                      : "text-gray-500 group-hover:text-indigo-500"
                  }
                `}
                >
                  {item.nameEn}
                </p>
              </div>

              {/* Hover Arrow */}
              {!isActive && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-indigo-600">→</span>
                </div>
              )}

              {/* Background Glow Effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-xl"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              {currentUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUser?.role}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
          </div>
          <p className="mt-2 text-xs text-gray-600 text-center">
            Profile 75% Complete
          </p>
        </div>
      </div>
    </aside>
  );
}

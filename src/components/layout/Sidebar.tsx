"use client";

import React, { useState } from "react";
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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    name: "ផ្ទាំងគ្រប់គ្រង",
    nameEn: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["superadmin", "classteacher", "teacher"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "សិស្ស",
    nameEn: "Students",
    href: "/students",
    icon: Users,
    roles: ["superadmin", "classteacher"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "គ្រូបង្រៀន",
    nameEn: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
    roles: ["superadmin"],
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "ថ្នាក់រៀន",
    nameEn: "Classes",
    href: "/classes",
    icon: School,
    roles: ["superadmin", "classteacher"],
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "មុខវិជ្ជា",
    nameEn: "Subjects",
    href: "/subjects",
    icon: BookOpen,
    roles: ["superadmin"],
    color: "from-orange-500 to-red-500",
  },
  {
    name: "បញ្ចូលពិន្ទុ",
    nameEn: "Grades",
    href: "/grades",
    icon: ClipboardList,
    roles: ["superadmin", "classteacher", "teacher"],
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "របាយការណ៍",
    nameEn: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["superadmin", "classteacher"],
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "ការកំណត់",
    nameEn: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["superadmin", "classteacher", "teacher"],
    color: "from-gray-500 to-slate-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser?.role || "")
  );

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200/50 bg-white shadow-2xl animate-slideInLeft">
      {/* Logo Section */}
      <div className="relative flex h-20 items-center justify-center border-b border-gray-200/50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden group">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>

        {/* Sparkle effect */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-5 h-5 text-white/50 animate-pulse" />
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg khmer-sidebar tracking-wide transition-transform duration-300 group-hover:scale-105">
            ប្រព័ន្ធគ្រប់គ្រង
          </h1>
          <p className="text-xs text-white/90 font-medium english-modern mt-1">
            School Management
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHovered = hoveredItem === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                group relative flex items-center space-x-3 rounded-xl px-4 py-3.5 text-sm font-medium 
                transition-all duration-300 ease-out overflow-hidden
                ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-102"
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Active Indicator - Left Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full bg-white transition-all duration-300 animate-slideInLeft shadow-lg"></div>
              )}

              {/* Hover background effect */}
              {!isActive && isHovered && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5 transition-opacity duration-300`}
                ></div>
              )}

              {/* Icon with gradient background */}
              <div
                className={`
                relative flex-shrink-0 p-2 rounded-lg transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-white/20 backdrop-blur-sm shadow-lg scale-110"
                    : "bg-gray-100 group-hover:bg-white group-hover:shadow-md group-hover:scale-110"
                }
              `}
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-300 ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                  font-semibold transition-all duration-300 khmer-sidebar tracking-wide
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-900 group-hover:text-indigo-700"
                  }
                `}
                >
                  {item.name}
                </p>
                <p
                  className={`
                  text-xs transition-all duration-300 english-modern font-medium
                  ${
                    isActive
                      ? "text-white/90"
                      : "text-gray-500 group-hover:text-indigo-600"
                  }
                `}
                >
                  {item.nameEn}
                </p>
              </div>

              {/* Arrow indicator */}
              <div
                className={`
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                }
              `}
              >
                <ChevronRight
                  className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-indigo-600"
                  }`}
                />
              </div>

              {/* Glow effect for active item */}
              {isActive && (
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-20 blur-xl transition-opacity duration-500 animate-pulse`}
                ></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section - User Profile */}
      <div className="border-t border-gray-200/50 p-4 animate-slideUp">
        <div className="relative rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 transition-all duration-300 hover:shadow-lg overflow-hidden group cursor-pointer">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white animate-pulse shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate english-modern">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize english-modern font-medium">
                  {currentUser?.role}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center english-modern font-medium">
                Profile 75% Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

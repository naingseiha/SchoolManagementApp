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
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">ប្រព័ន្ធគ្រប់គ្រង</h1>
        <p className="text-blue-200 text-sm mt-1">School Management</p>
      </div>

      <nav className="p-4">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-blue-200">{item.nameEn}</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

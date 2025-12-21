"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  labelKh: string;
  icon: LucideIcon;
  href: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    labelKh: "ផ្ទាំង",
    icon: LayoutDashboard,
    href: "/",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "grade-entry",
    label: "Grade Entry",
    labelKh: "បញ្ចូលពិន្ទុ",
    icon: ClipboardList,
    href: "/grade-entry",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "attendance",
    label: "Attendance",
    labelKh: "វត្តមាន",
    icon: CalendarCheck,
    href: "/attendance",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "students",
    label: "Students",
    labelKh: "សិស្ស",
    icon: Users,
    href: "/students",
    roles: ["ADMIN"],
  },
  {
    id: "reports",
    label: "Reports",
    labelKh: "របាយការណ៍",
    icon: FileText,
    href: "/reports/mobile",
    roles: ["ADMIN", "TEACHER"],
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Filter nav items based on user role
  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(currentUser?.role || "")
  );

  // If we have less than 5 items, we might want to adjust the grid
  const gridCols =
    filteredItems.length === 3
      ? "grid-cols-3"
      : filteredItems.length === 4
      ? "grid-cols-4"
      : "grid-cols-5";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className={`grid ${gridCols} h-16`}>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center touch-feedback transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.labelKh}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

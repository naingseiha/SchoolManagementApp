"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Users, GraduationCap, School, BookOpen } from "lucide-react";
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
      color: "bg-blue-500",
    },
    {
      name: "គ្រូបង្រៀន",
      nameEn: "Teachers",
      value: teachers.length,
      icon: GraduationCap,
      color: "bg-green-500",
    },
    {
      name: "ថ្នាក់រៀន",
      nameEn: "Classes",
      value: classes.length,
      icon: School,
      color: "bg-purple-500",
    },
    {
      name: "មុខវិជ្ជា",
      nameEn: "Subjects",
      value: subjects.length,
      icon: BookOpen,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              ផ្ទាំងគ្រប់គ្រង Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.nameEn}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">{stat.name}</p>
                        <p className="text-gray-500 text-xs">{stat.nameEn}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.color} p-4 rounded-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ព័ត៌មានថ្មីៗ Recent Activity
              </h2>
              <p className="text-gray-600">
                សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងសាលារៀន។
                ជ្រើសរើសម៉ឺនុយនៅខាងឆ្វេងដើម្បីចាប់ផ្តើម។
              </p>
              <p className="text-gray-600 mt-2">
                Welcome to the School Management System. Select a menu item from
                the sidebar to get started.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

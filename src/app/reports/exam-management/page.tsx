"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Import both tab components
import ExamSeatingTab from "./tabs/ExamSeatingTab";
import AttendanceTab from "./tabs/AttendanceTab";

export default function ExamManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"seating" | "attendance">("seating");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              គ្រប់គ្រងប្រឡង
            </h1>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {/* Exam Seating Tab */}
                  <button
                    onClick={() => setActiveTab("seating")}
                    className={`
                      whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                      ${
                        activeTab === "seating"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }
                    `}
                  >
                    តារាងប្រឡង
                  </button>

                  {/* Attendance Tab */}
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={`
                      whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                      ${
                        activeTab === "attendance"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }
                    `}
                  >
                    តារាងវត្តមាន
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "seating" && <ExamSeatingTab />}
              {activeTab === "attendance" && <AttendanceTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

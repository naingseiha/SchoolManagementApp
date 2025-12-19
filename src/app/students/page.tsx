"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StudentListView from "@/components/students/StudentListView";
import BulkImportView from "@/components/students/BulkImportView";
import { studentsApi } from "@/lib/api/students";
import { Users, Upload } from "lucide-react";

type ViewMode = "list" | "bulk-import";

export default function StudentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes, students: contextStudents, refreshStudents } = useData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ViewMode>("list");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ Load students on mount when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !isDataLoaded) {
      loadStudents();
    }
  }, [isAuthenticated, authLoading, isDataLoaded]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log("⚡ Loading students data (lightweight)...");
      const data = await studentsApi.getAllLightweight();
      console.log("⚡ Loaded students:", data.length);
      setStudents(data);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImportSuccess = () => {
    loadStudents();
    refreshStudents();
    setActiveTab("list");
  };

  const handleRefreshData = () => {
    loadStudents();
    refreshStudents();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 space-y-4 overflow-x-hidden">
          {/* ✅ Clean Header Section - No heavy shadow */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    គ្រប់គ្រងសិស្ស
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Student Management System
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">
                    {contextStudents.length}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">
                    សរុប
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-600">
                    {
                      contextStudents.filter((s) => s.gender === "female")
                        .length
                    }
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">
                    ស្រី
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-indigo-600">
                    {contextStudents.filter((s) => s.gender === "male").length}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">
                    ប្រុស
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Clean Tabs - No shadow, consistent padding */}
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 h-11 flex items-center justify-center gap-2 px-6 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-4 h-4" />
                បញ្ជីសិស្ស
              </button>
              <button
                onClick={() => setActiveTab("bulk-import")}
                className={`flex-1 h-11 flex items-center justify-center gap-2 px-6 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "bulk-import"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Upload className="w-4 h-4" />
                បញ្ចូលជាបណ្តុំ
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === "list" ? (
            <StudentListView
              students={students}
              classes={classes}
              isDataLoaded={isDataLoaded}
              onLoadData={loadStudents}
              onRefresh={handleRefreshData}
            />
          ) : (
            <BulkImportView
              classes={classes}
              onSuccess={handleBulkImportSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
}

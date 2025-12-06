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
import { Users, Upload, Search, Filter, Grid3x3, List } from "lucide-react";

type ViewMode = "list" | "bulk-import";

export default function StudentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes, students: contextStudents, refreshStudents } = useData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ViewMode>("list");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ REMOVED auto-load on mount
  // Students will only load when user clicks "Load Data" button

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll();
      setStudents(data);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImportSuccess = () => {
    // Auto-load students after bulk import
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
      <div className="flex-1">
        <Header />

        <main className="p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">
                    គ្រប់គ្រងសិស្ស
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Student Management System
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center px-6 py-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  <div className="text-3xl font-black text-blue-600">
                    {isDataLoaded ? students.length : "-"}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">
                    សិស្សសរុប
                  </div>
                </div>
                <div className="text-center px-6 py-3 bg-green-50 rounded-xl border-l-4 border-green-500">
                  <div className="text-3xl font-black text-green-600">
                    {classes.length}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">
                    ថ្នាក់សរុប
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                  activeTab === "list"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-5 h-5" />
                បញ្ជីសិស្ស
              </button>
              <button
                onClick={() => setActiveTab("bulk-import")}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                  activeTab === "bulk-import"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Upload className="w-5 h-5" />
                បញ្ចូលជាបណ្តុំ
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {activeTab === "list" ? (
              <StudentListView
                students={students}
                classes={classes}
                loading={loading}
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
          </div>
        </main>
      </div>
    </div>
  );
}

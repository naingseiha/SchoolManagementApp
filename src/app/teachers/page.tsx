"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TeacherListView from "@/components/teachers/TeacherListView";
import BulkImportView from "@/components/teachers/BulkImportView";
import { teachersApi } from "@/lib/api/teachers";
import { UserCheck, Upload, Loader2 } from "lucide-react";

type ViewMode = "list" | "bulk-import";

export default function TeachersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { subjects, teachers: contextTeachers, refreshTeachers } = useData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ViewMode>("list");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // ✅ Track if data loaded

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ Manual load function (using full data to show correct counts)
  // ✅ REMOVED auto-load - user must click "Load Data" button
  const loadTeachers = async () => {
    try {
      setLoading(true);
      console.log("⚡ Loading teachers data (full)...");
      const data = await teachersApi.getAll();
      console.log("⚡ Loaded teachers:", data.length);
      setTeachers(data);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("❌ Failed to load teachers:", error);
      alert("បរាជ័យក្នុងការទាញយកទិន្នន័យ!");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImportSuccess = () => {
    loadTeachers();
    refreshTeachers();
    setActiveTab("list");
  };

  const handleRefreshData = () => {
    loadTeachers();
    refreshTeachers();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">កំពុងពិនិត្យ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 space-y-5 overflow-x-hidden">
          {/* ✅ Modern Header Section with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-sm">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-3.5 rounded-2xl shadow-lg">
                      <UserCheck className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      គ្រប់គ្រងគ្រូបង្រៀន
                    </h1>
                    <p className="text-sm text-gray-600 font-semibold">
                      Teacher Management System
                    </p>
                  </div>
                </div>

                {/* Enhanced Stats */}
                <div className="flex items-center gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {isDataLoaded ? teachers.length : contextTeachers.length}
                    </div>
                    <div className="text-xs text-gray-600 font-bold">សរុប</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-black bg-gradient-to-br from-pink-600 to-pink-700 bg-clip-text text-transparent">
                      {isDataLoaded
                        ? teachers.filter(
                            (t: any) =>
                              t.gender === "FEMALE" || t.gender === "female"
                          ).length
                        : contextTeachers.filter(
                            (t: any) =>
                              t.gender === "FEMALE" || t.gender === "female"
                          ).length}
                    </div>
                    <div className="text-xs text-gray-600 font-bold">ស្រី</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-black bg-gradient-to-br from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                      {isDataLoaded
                        ? teachers.filter(
                            (t: any) => t.gender === "MALE" || t.gender === "male"
                          ).length
                        : contextTeachers.filter(
                            (t: any) => t.gender === "MALE" || t.gender === "male"
                          ).length}
                    </div>
                    <div className="text-xs text-gray-600 font-bold">ប្រុស</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Modern Tabs with Gradient */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 h-12 flex items-center justify-center gap-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === "list"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-[1.02]"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-[1.01]"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                បញ្ជីគ្រូបង្រៀន
              </button>
              <button
                onClick={() => setActiveTab("bulk-import")}
                className={`flex-1 h-12 flex items-center justify-center gap-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === "bulk-import"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-[1.02]"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-[1.01]"
                }`}
              >
                <Upload className="w-4 h-4" />
                បញ្ចូលជាបណ្តុំ
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === "list" ? (
            <TeacherListView
              teachers={teachers}
              subjects={subjects}
              isDataLoaded={isDataLoaded} // ✅ Pass load state
              loading={loading} // ✅ Pass loading state
              onLoadData={loadTeachers} // ✅ Pass load function
              onRefresh={handleRefreshData}
            />
          ) : (
            <BulkImportView
              subjects={subjects}
              onSuccess={handleBulkImportSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
}

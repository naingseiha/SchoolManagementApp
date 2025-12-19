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

  // ✅ REMOVED:  Auto-load on mount

  // ✅ Manual load function
  const loadTeachers = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading teachers data...");
      const data = await teachersApi.getAll();
      console.log("✅ Loaded teachers:", data.length);
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

        <main className="flex-1 p-6 space-y-4 overflow-x-hidden">
          {/* ✅ Clean Header Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    គ្រប់គ្រងគ្រូបង្រៀន
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Teacher Management System
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">
                    {isDataLoaded ? teachers.length : contextTeachers.length}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">
                    សរុប
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-600">
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
                  <div className="text-xs text-gray-600 font-semibold">
                    ស្រី
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-indigo-600">
                    {isDataLoaded
                      ? teachers.filter(
                          (t: any) => t.gender === "MALE" || t.gender === "male"
                        ).length
                      : contextTeachers.filter(
                          (t: any) => t.gender === "MALE" || t.gender === "male"
                        ).length}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">
                    ប្រុស
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Clean Tabs */}
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
                <UserCheck className="w-4 h-4" />
                បញ្ជីគ្រូបង្រៀន
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

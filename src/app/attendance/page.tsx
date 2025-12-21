"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/useToast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AttendanceGridEditor from "@/components/attendance/AttendanceGridEditor";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import dynamic from "next/dynamic";
import {
  Download,
  Loader2,
  AlertCircle,
  CalendarCheck,
  Info,
} from "lucide-react";
import {
  attendanceApi,
  type AttendanceGridData,
  type BulkSaveAttendanceItem,
} from "@/lib/api/attendance";

// Dynamic import for mobile component
const MobileAttendance = dynamic(
  () => import("@/components/mobile/attendance/MobileAttendance"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    ),
  }
);

const MONTHS = [
  { value: "មករា", label: "មករា", number: 1 },
  { value: "កុម្ភៈ", label: "កុម្ភៈ", number: 2 },
  { value: "មីនា", label: "មីនា", number: 3 },
  { value: "មេសា", label: "មេសា", number: 4 },
  { value: "ឧសភា", label: "ឧសភា", number: 5 },
  { value: "មិថុនា", label: "មិថុនា", number: 6 },
  { value: "កក្កដា", label: "កក្កដា", number: 7 },
  { value: "សីហា", label: "សីហា", number: 8 },
  { value: "កញ្ញា", label: "កញ្ញា", number: 9 },
  { value: "តុលា", label: "តុលា", number: 10 },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា", number: 11 },
  { value: "ធ្នូ", label: "ធ្នូ", number: 12 },
];

const getCurrentMonth = () => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex]?.value || "ធ្នូ";
};

const getCurrentYear = () => {
  return new Date().getFullYear();
};

export default function AttendancePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { success, error: showError, warning, ToastContainer } = useToast();
  const deviceType = useDeviceType();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [gridData, setGridData] = useState<AttendanceGridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Render mobile version for mobile devices
  if (deviceType === "mobile") {
    return (
      <MobileAttendance
        classId={selectedClassId}
        month={selectedMonth}
        year={selectedYear}
      />
    );
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ Filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) {
            classIdsSet.add(classId);
          }
        });
      }

      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }

      const teacherClassIds = Array.from(classIdsSet);
      return classes.filter((c) => teacherClassIds.includes(c.id));
    }

    return [];
  }, [currentUser, classes]);

  useEffect(() => {
    if (
      isAuthenticated &&
      !authLoading &&
      classes.length === 0 &&
      !isLoadingClasses
    ) {
      console.log("📚 Classes array is empty, fetching classes...");
      refreshClasses();
    }
  }, [
    isAuthenticated,
    authLoading,
    classes.length,
    isLoadingClasses,
    refreshClasses,
  ]);

  const handleLoadData = async () => {
    if (!selectedClassId || !currentUser) {
      warning("សូមជ្រើសរើសថ្នាក់សិន");
      return;
    }

    setLoading(true);
    setError(null);
    setGridData(null);

    try {
      const data = await attendanceApi.getAttendanceGrid(
        selectedClassId,
        selectedMonth,
        selectedYear
      );

      setGridData(data);
      success(
        `ផ្ទុកទិន្នន័យបានជោគជ័យ • ${data.daysInMonth} ថ្ងៃ • ${
          data.students?.length || 0
        } សិស្ស`
      );
    } catch (err: any) {
      console.error("❌ Error fetching attendance grid:", err);
      showError(`មានបញ្ហាក្នុងការទាញយកទិន្នន័យ: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Silent auto-save, only toast on manual save
  const handleSaveAttendance = async (
    attendance: BulkSaveAttendanceItem[],
    isAutoSave: boolean = false
  ) => {
    if (!gridData) return;

    try {
      if (attendance.length === 0) {
        // ❌ NO toast for auto-save
        if (!isAutoSave) {
          warning("សូមបញ្ចូលវត្តមានយ៉ាងហោចណាស់មួយ");
        }
        return;
      }

      console.log(
        `💾 Saving ${attendance.length} attendance${
          isAutoSave ? " (AUTO-SAVE - SILENT)" : " (MANUAL)"
        }`
      );

      const result = await attendanceApi.bulkSaveAttendance(
        selectedClassId,
        selectedMonth,
        selectedYear,
        gridData.monthNumber,
        attendance
      );

      const savedCount = result?.savedCount ?? attendance.length;
      const errorCount = result?.errorCount ?? 0;

      // ✅ ONLY show toast for MANUAL saves
      if (!isAutoSave) {
        if (errorCount > 0) {
          warning(`រក្សាទុក ${savedCount} ជោគជ័យ, ${errorCount} មានកំហុស`);
        } else {
          success(`រក្សាទុកបានជោគជ័យ ${savedCount} វត្តមាន`);
        }
      } else {
        // ❌ NO toast for auto-save - completely silent
        console.log(`🔇 Auto-saved ${savedCount} silently`);
      }
    } catch (err: any) {
      console.error(`❌ Save failed:`, err);

      // ✅ ONLY show error for manual saves
      if (!isAutoSave) {
        showError(
          `មានបញ្ហាក្នុងការរក្សាទុក: ${err.message || "Unknown error"}`
        );
        throw err;
      } else {
        console.error("🔇 Auto-save failed silently");
      }
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">កំពុងពិនិត្យ... </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const classOptions = isLoadingClasses
    ? [{ value: "", label: "កំពុងផ្ទុក...  - Loading..." }]
    : [
        { value: "", label: "ជ្រើសរើសថ្នាក់" },
        ...availableClasses.map((c) => ({ value: c.id, label: c.name })),
      ];

  const monthOptions = MONTHS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const yearOptions = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            {/* Teacher Info Box */}
            {currentUser.role === "TEACHER" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      ព័ត៌មានគ្រូបង្រៀន • Teacher Information
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <p>
                          <strong>ថ្នាក់រៀន:</strong> {availableClasses.length}{" "}
                          ថ្នាក់
                        </p>
                      </div>
                      <div>
                        {currentUser.teacher?.homeroomClass && (
                          <p>
                            <strong>ថ្នាក់ប្រចាំ:</strong>{" "}
                            {currentUser.teacher.homeroomClass.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">វត្តមាន</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    រក្សាទុកស្វ័យប្រវត្តិ • គណនាចំនួនភ្លាមៗ
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ថ្នាក់
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    disabled={isLoadingClasses}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus: ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {currentUser.role === "TEACHER" &&
                    availableClasses.length === 0 && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        អ្នកមិនទាន់មានថ្នាក់ដែលបានចាត់តាំងទេ
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ខែ
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus: ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ឆ្នាំ
                  </label>
                  <select
                    value={selectedYear.toString()}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setGridData(null);
                      setError(null);
                    }}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus: ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {yearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ផ្ទុកទិន្នន័យ
                  </label>
                  <button
                    onClick={handleLoadData}
                    disabled={!selectedClassId || loading}
                    className="w-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>កំពុងផ្ទុក...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>ផ្ទុកទិន្នន័យ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      មានបញ្ហា
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    កំពុងផ្ទុកទិន្នន័យ...
                  </p>
                </div>
              </div>
            ) : gridData ? (
              <AttendanceGridEditor
                gridData={gridData}
                onSave={handleSaveAttendance}
                isLoading={loading}
              />
            ) : selectedClassId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    ចុច "ផ្ទុកទិន្នន័យ" ដើម្បីចាប់ផ្តើម
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    សូមជ្រើសរើសថ្នាក់ដើម្បីចាប់ផ្តើម
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

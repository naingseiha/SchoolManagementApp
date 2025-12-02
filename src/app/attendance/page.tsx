"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AttendanceGridEditor from "@/components/attendance/AttendanceGridEditor";
import { Download, Loader2, AlertCircle, CalendarCheck } from "lucide-react";
import {
  attendanceApi,
  type AttendanceGridData,
  type BulkSaveAttendanceItem,
} from "@/lib/api/attendance";

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes } = useData();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [gridData, setGridData] = useState<AttendanceGridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGridData();
    }
  }, [selectedClassId, selectedMonth, selectedYear]);

  // Update fetchGridData function:

  const fetchGridData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 Fetching attendance grid.. .");
      console.log("  - Class ID:", selectedClassId);
      console.log("  - Month:", selectedMonth);
      console.log("  - Year:", selectedYear);

      const data = await attendanceApi.getAttendanceGrid(
        selectedClassId,
        selectedMonth,
        selectedYear
      );

      // ✅ LOG EVERYTHING
      console.log("\n📊 ===== RAW API RESPONSE =====");
      console.log("Full response:", JSON.stringify(data, null, 2)); // ✅ Pretty print
      console.log("Response type:", typeof data);
      console.log("Response keys:", Object.keys(data || {}));

      if (data) {
        console.log("\n📋 Response Details:");
        console.log("  - classId:", data.classId);
        console.log("  - className:", data.className);
        console.log("  - month:", data.month);
        console.log("  - year:", data.year);
        console.log("  - daysInMonth:", data.daysInMonth);
        console.log("  - days:", data.days);
        console.log("  - students:", data.students?.length || 0);

        if (data.students && data.students.length > 0) {
          console.log("\n🔍 First Student Detail:");
          const firstStudent = data.students[0];
          console.log("  - Name:", firstStudent.studentName);
          console.log("  - ID:", firstStudent.studentId);
          console.log("  - Total Absent:", firstStudent.totalAbsent);
          console.log("  - Total Permission:", firstStudent.totalPermission);
          console.log(
            "  - Attendance keys:",
            Object.keys(firstStudent.attendance || {})
          );

          // Check if any day has data
          const sampleDays = [1, 2, 3, 4, 5];
          console.log("\n  Sample Days (1-5):");
          sampleDays.forEach((day) => {
            const att = firstStudent.attendance[day];
            console.log(`    Day ${day}:`, att);
          });
        }
      } else {
        console.error("❌ Response is null or undefined!");
      }

      console.log("================================\n");

      setGridData(data);
    } catch (err: any) {
      console.error("❌ Error fetching attendance grid:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (attendance: BulkSaveAttendanceItem[]) => {
    if (!gridData) return;

    try {
      await attendanceApi.bulkSaveAttendance(
        selectedClassId,
        selectedMonth,
        selectedYear,
        gridData.monthNumber,
        attendance
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  if (authLoading) {
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

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
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
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ខែ
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    onClick={fetchGridData}
                    disabled={!selectedClassId || loading}
                    className="w-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>កំពុងផ្ទុក... </span>
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
    </div>
  );
}

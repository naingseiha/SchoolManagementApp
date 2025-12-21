// 📂 src/components/mobile/attendance/MobileAttendance.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  Save,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";

type AttendanceStatus = "PRESENT" | "ABSENT" | "PERMISSION";

interface StudentAttendance {
  studentId: string;
  studentName: string;
  khmerName: string;
  rollNumber?: number;
  gender: string;
  dailyAttendance: {
    [day: number]: AttendanceStatus;
  };
}

interface MobileAttendanceProps {
  classId?: string;
  month?: string;
  year?: number;
}

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

const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1;
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

const getAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -1; i <= 2; i++) {
    const year = currentYear + i;
    years.push({
      value: year.toString(),
      label: `${year}-${year + 1}`,
    });
  }
  return years;
};

const getCurrentAcademicYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 9 ? year : year - 1;
};

export default function MobileAttendance({
  classId,
  month,
  year,
}: MobileAttendanceProps) {
  const { classes, isLoadingClasses, refreshClasses } = useData();

  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  const selectedMonthData = MONTHS.find((m) => m.value === selectedMonth);
  const monthNumber = selectedMonthData?.number || 1;
  const daysInMonth = new Date(selectedYear, monthNumber, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const loadAttendanceData = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoadingData(true);
    try {
      console.log("📅 Loading attendance:", {
        classId: selectedClass,
        month: selectedMonth,
        monthNumber: monthNumber,
        year: selectedYear,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/grid/${selectedClass}? month=${selectedMonth}&year=${selectedYear}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        throw new Error(`មានបញ្ហា:  ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load attendance");
      }

      const gridData = result.data;

      const studentsData: StudentAttendance[] = gridData.students.map(
        (student: any) => {
          const dailyAttendance: { [day: number]: AttendanceStatus } = {};

          daysArray.forEach((day) => {
            const morningKey = `${day}_M`;
            const afternoonKey = `${day}_A`;

            const morningData = student.attendance[morningKey];
            const afternoonData = student.attendance[afternoonKey];

            if (
              morningData?.displayValue === "A" ||
              afternoonData?.displayValue === "A"
            ) {
              dailyAttendance[day] = "ABSENT";
            } else if (
              morningData?.displayValue === "P" ||
              afternoonData?.displayValue === "P"
            ) {
              dailyAttendance[day] = "PERMISSION";
            } else {
              dailyAttendance[day] = "PRESENT";
            }
          });

          return {
            studentId: student.studentId,
            studentName: student.studentName,
            khmerName: student.studentName,
            gender: student.gender,
            dailyAttendance,
          };
        }
      );

      setStudents(studentsData);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("❌ Error loading attendance:", error);
      alert(`មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleStudentStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) return student;

        const currentStatus = student.dailyAttendance[currentDay] || "PRESENT";
        const statusCycle: AttendanceStatus[] = [
          "PRESENT",
          "ABSENT",
          "PERMISSION",
        ];
        const currentIndex = statusCycle.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statusCycle.length;

        return {
          ...student,
          dailyAttendance: {
            ...student.dailyAttendance,
            [currentDay]: statusCycle[nextIndex],
          },
        };
      })
    );

    setHasUnsavedChanges(true);
  };

  // ✅ FIXED: Save only current day data (smaller payload)
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const attendanceRecords: any[] = [];

      // ✅ Only save CURRENT DAY (not all days)
      students.forEach((student) => {
        const status = student.dailyAttendance[currentDay];

        let value = "";
        if (status === "ABSENT") value = "A";
        else if (status === "PERMISSION") value = "P";

        // Save for both morning and afternoon sessions
        attendanceRecords.push({
          studentId: student.studentId,
          day: currentDay,
          session: "M",
          value: value,
        });

        attendanceRecords.push({
          studentId: student.studentId,
          day: currentDay,
          session: "A",
          value: value,
        });
      });

      console.log("💾 Saving attendance for day:", currentDay, {
        records: attendanceRecords.length,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/bulk-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass,
            month: selectedMonth,
            year: selectedYear,
            monthNumber: monthNumber,
            attendance: attendanceRecords,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);

        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } else {
        throw new Error(result.message || "Save failed");
      }
    } catch (error: any) {
      console.error("❌ Save error:", error);
      alert(`មានបញ្ហាក្នុងការរក្សាទុក: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const setAllStatus = (status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        dailyAttendance: {
          ...student.dailyAttendance,
          [currentDay]: status,
        },
      }))
    );
    setHasUnsavedChanges(true);
  };

  const handlePrevDay = () => {
    if (currentDay > 1) {
      if (hasUnsavedChanges) {
        if (confirm("មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក។ តើចង់រក្សាទុកមុនទេ? ")) {
          handleSave();
        }
      }
      setCurrentDay((prev) => prev - 1);
      setHasUnsavedChanges(false);
    }
  };

  const handleNextDay = () => {
    if (currentDay < daysInMonth) {
      if (hasUnsavedChanges) {
        if (confirm("មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក។ តើចង់រក្សាទុកមុនទេ?")) {
          handleSave();
        }
      }
      setCurrentDay((prev) => prev + 1);
      setHasUnsavedChanges(false);
    }
  };

  const handleDayChange = (day: number) => {
    if (day === currentDay) return;

    if (hasUnsavedChanges) {
      if (confirm("មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក។ តើចង់រក្សាទុកមុនទេ?")) {
        handleSave();
      }
    }
    setCurrentDay(day);
    setHasUnsavedChanges(false);
  };

  const currentDaySummary = {
    present: students.filter((s) => s.dailyAttendance[currentDay] === "PRESENT")
      .length,
    absent: students.filter((s) => s.dailyAttendance[currentDay] === "ABSENT")
      .length,
    permission: students.filter(
      (s) => s.dailyAttendance[currentDay] === "PERMISSION"
    ).length,
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  return (
    <MobileLayout title="វត្តមាន • Attendance">
      <div className="flex flex-col h-full bg-gray-50">
        {/* ✅ Filters - Collapsible */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1. 5 uppercase tracking-wide">
                ថ្នាក់ • Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setStudents([]);
                }}
                disabled={isLoadingClasses}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus: ring-indigo-500"
                style={{ fontSize: "16px" }}
              >
                <option value="">
                  {isLoadingClasses ? "កំពុងផ្ទុក..." : "-- ជ្រើសរើសថ្នាក់ --"}
                </option>
                {!isLoadingClasses &&
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  ខែ • Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentDay(1);
                  }}
                  className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  style={{ fontSize: "16px" }}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  ឆ្នាំ • Year
                </label>
                <select
                  value={selectedYear.toString()}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  style={{ fontSize: "16px" }}
                >
                  {getAcademicYearOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={loadAttendanceData}
              disabled={!selectedClass || loadingData}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {loadingData ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">កំពុងផ្ទុក...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">ផ្ទុកទិន្នន័យ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        {students.length > 0 ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ✅ FIXED: Scrollable Day Navigator */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handlePrevDay}
                  disabled={currentDay === 1}
                  className="p-2 bg-indigo-100 rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-indigo-600" />
                </button>

                <div className="text-center">
                  <div className="text-indigo-600 text-xl font-bold">
                    ថ្ងៃទី {currentDay}
                  </div>
                  <div className="text-gray-600 text-xs mt-0.5">
                    {selectedMonth} {selectedYear}
                  </div>
                </div>

                <button
                  onClick={handleNextDay}
                  disabled={currentDay === daysInMonth}
                  className="p-2 bg-indigo-100 rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-indigo-600" />
                </button>
              </div>

              {/* ✅ Horizontal scrollable day grid */}
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex gap-2 pb-2 min-w-max">
                  {daysArray.map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDayChange(day)}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                        day === currentDay
                          ? "bg-indigo-600 text-white shadow-md scale-110"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 bg-white border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAllStatus("PRESENT")}
                  className="h-9 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-green-200"
                >
                  <Check className="w-3. 5 h-3.5" />
                  All P
                </button>
                <button
                  onClick={() => setAllStatus("ABSENT")}
                  className="h-9 bg-red-50 hover: bg-red-100 text-red-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-red-200"
                >
                  <X className="w-3.5 h-3.5" />
                  All A
                </button>
                <button
                  onClick={() => setAllStatus("PERMISSION")}
                  className="h-9 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-orange-200"
                >
                  P
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-around text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-700">
                    {currentDaySummary.present}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="font-semibold text-red-700">
                    {currentDaySummary.absent}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="font-semibold text-orange-700">
                    {currentDaySummary.permission}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ FIXED:  Scrollable Student List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {students.map((student, index) => {
                const status = student.dailyAttendance[currentDay] || "PRESENT";

                return (
                  <button
                    key={student.studentId}
                    onClick={() => toggleStudentStatus(student.studentId)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg shadow-sm transition-all active:scale-98 border-2 ${
                      status === "PRESENT"
                        ? "bg-green-50 border-green-300"
                        : status === "ABSENT"
                        ? "bg-red-50 border-red-300"
                        : "bg-orange-50 border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                          status === "PRESENT"
                            ? "bg-green-500"
                            : status === "ABSENT"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      >
                        {status === "PRESENT" && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                        {status === "ABSENT" && (
                          <X className="w-5 h-5 text-white" />
                        )}
                        {status === "PERMISSION" && (
                          <span className="text-white font-bold text-sm">
                            P
                          </span>
                        )}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {student.khmerName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                      Tap
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ✅ Save Button (sticky bottom) */}
            <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
                className={`w-full h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  hasUnsavedChanges
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : saveSuccess
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    កំពុងរក្សាទុក...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    រក្សាទុករួចរាល់
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    រក្សាទុក
                  </>
                )}
              </button>
            </div>
          </div>
        ) : selectedClass && !loadingData ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">
                ចុច "ផ្ទុកទិន្នន័យ" ដើម្បីចាប់ផ្តើម
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">
                សូមជ្រើសរើសថ្នាក់ដើម្បីចាប់ផ្តើម
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

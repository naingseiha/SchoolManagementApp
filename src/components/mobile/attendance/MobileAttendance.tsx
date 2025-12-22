"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

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

// ✅ Same MONTHS structure as MobileGradeEntry
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

// ✅ Get current Khmer month
const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1; // 1-12
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

// ✅ Auto-calculate academic year
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
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // ✅ Get homeroom class ID for INSTRUCTOR
  const teacherHomeroomClassId = useMemo(() => {
    if (currentUser?.role === "TEACHER") {
      return currentUser.teacher?.homeroomClassId || null;
    }
    return null;
  }, [currentUser]);

  // ✅ Get class name
  const selectedClassName = useMemo(() => {
    const classObj = classes.find((c) => c.id === selectedClass);
    return classObj?.name || "";
  }, [classes, selectedClass]);

  const selectedMonthData = MONTHS.find((m) => m.value === selectedMonth);
  const monthNumber = selectedMonthData?.number || 1;
  const daysInMonth = new Date(selectedYear, monthNumber, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ✅ Auto-select class for INSTRUCTOR and auto-load
  useEffect(() => {
    if (
      !authLoading &&
      currentUser &&
      teacherHomeroomClassId &&
      !selectedClass &&
      !hasAutoLoaded.current
    ) {
      console.log("✅ Auto-selecting homeroom class:", teacherHomeroomClassId);
      setSelectedClass(teacherHomeroomClassId);
      hasAutoLoaded.current = true;
    }
  }, [authLoading, currentUser, teacherHomeroomClassId, selectedClass]);

  // ✅ Auto-load data when class is selected
  useEffect(() => {
    if (selectedClass && !loadingData && hasAutoLoaded.current) {
      console.log("✅ Auto-loading attendance data");
      loadAttendanceData();
    }
  }, [selectedClass]);

  const loadAttendanceData = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoadingData(true);
    setError(null);
    setHasUnsavedChanges(false); // Reset unsaved changes when loading new data
    try {
      console.log("📅 Loading attendance:", {
        classId: selectedClass,
        month: selectedMonth,
        monthNumber: monthNumber,
        year: selectedYear,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/grid/${selectedClass}?month=${selectedMonth}&year=${selectedYear}`
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
    } catch (error: any) {
      console.error("❌ Error loading attendance:", error);
      setError(`មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ:  ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  // ✅ Toggle student status - NO AUTO SAVE
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

    // ✅ ONLY mark as unsaved - NO AUTO SAVE
    setHasUnsavedChanges(true);
  };

  // ✅ Manual Save - ONLY save when button clicked
  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      // If no changes, just show success briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1000);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const attendanceRecords: any[] = [];

      // ✅ Save ONLY current day
      students.forEach((student) => {
        const status = student.dailyAttendance[currentDay];

        let value = "";
        if (status === "ABSENT") value = "A";
        else if (status === "PERMISSION") value = "P";

        // Save for morning session only
        attendanceRecords.push({
          studentId: student.studentId,
          day: currentDay,
          session: "M",
          value: value,
        });
      });

      console.log("💾 Saving attendance (manual save):", {
        classId: selectedClass,
        month: selectedMonth,
        year: selectedYear,
        currentDay: currentDay,
        monthNumber: monthNumber,
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

  // ✅ Set all status - NO AUTO SAVE
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
    setHasUnsavedChanges(true); // Mark as unsaved only
  };

  const handlePrevDay = () => {
    if (currentDay > 1) setCurrentDay((prev) => prev - 1);
  };

  const handleNextDay = () => {
    if (currentDay < daysInMonth) setCurrentDay((prev) => prev + 1);
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    setCurrentDay(1);
    setStudents([]);
    hasAutoLoaded.current = true;
    setTimeout(() => loadAttendanceData(), 100);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    setStudents([]);
    hasAutoLoaded.current = true;
    setTimeout(() => loadAttendanceData(), 100);
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
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  // ✅ Loading state
  if (authLoading) {
    return (
      <MobileLayout title="វត្តមាន • Attendance">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  // ✅ No permission state
  if (
    currentUser &&
    !teacherHomeroomClassId &&
    currentUser.role === "TEACHER"
  ) {
    return (
      <MobileLayout title="វត្តមាន • Attendance">
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-800 mb-2">
              អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់
            </p>
            <p className="text-xs text-gray-600">
              មានតែគ្រូប្រចាំថ្នាក់ (INSTRUCTOR) ទើបអាចបញ្ចូលអវត្តមានបាន
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="វត្តមាន • Attendance">
      <div className="flex flex-col h-full bg-gray-50">
        {/* ✅ FIXED Filters Section - STICKY AT TOP */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 space-y-3">
          {/* Class Info (Read-only) */}
          {selectedClassName && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    ថ្នាក់របស់អ្នក • Your Class
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedClassName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1. 5 uppercase tracking-wide">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
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
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
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

          {/* ✅ SAVE BUTTON - MANUAL SAVE ONLY */}
          <button
            onClick={handleSave}
            disabled={saving || (!hasUnsavedChanges && !saveSuccess)}
            className={`w-full h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
              saving
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : saveSuccess
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : hasUnsavedChanges
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-95"
                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">កំពុងរក្សាទុក...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">រក្សាទុករួចរាល់ ✓</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="w-5 h-5" />
                <span className="text-sm">រក្សាទុក • Save Changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">រួចរាល់ • No Changes</span>
              </>
            )}
          </button>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
              <p className="text-xs text-orange-700 text-center flex items-center justify-center gap-1">
                ⚠️ មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក • សូមចុច "រក្សាទុក"
              </p>
            </div>
          )}

          {/* INSTRUCTOR Badge */}
          {currentUser?.role === "TEACHER" &&
            teacherHomeroomClassId === selectedClass && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1">
                  🏠 អ្នកគឺជា INSTRUCTOR - គ្រប់គ្រងអវត្តមានថ្នាក់នេះ
                </p>
              </div>
            )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 m-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">
                កំពុងផ្ទុកទិន្នន័យ...
              </p>
            </div>
          </div>
        )}

        {/* Main Content - SCROLLABLE */}
        {!loadingData && students.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {/* Day Navigator */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevDay}
                  disabled={currentDay === 1}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="text-center flex-1 px-4">
                  <div className="text-white text-xl font-bold">
                    ថ្ងៃទី {currentDay}
                  </div>
                  <div className="text-indigo-100 text-xs mt-0.5">
                    {selectedMonth} {selectedYear}
                  </div>
                </div>

                <button
                  onClick={handleNextDay}
                  disabled={currentDay === daysInMonth}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Day Grid Selector */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2">
                <div className="grid grid-cols-7 gap-1">
                  {daysArray.map((day) => (
                    <button
                      key={day}
                      onClick={() => setCurrentDay(day)}
                      className={`h-8 rounded-md text-xs font-semibold transition-all ${
                        day === currentDay
                          ? "bg-white text-indigo-600 shadow-md scale-110"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAllStatus("PRESENT")}
                  className="h-9 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-green-200"
                >
                  <Check className="w-3. 5 h-3.5" />
                  All Present
                </button>
                <button
                  onClick={() => setAllStatus("ABSENT")}
                  className="h-9 bg-red-50 hover: bg-red-100 text-red-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-red-200"
                >
                  <X className="w-3.5 h-3.5" />
                  All Absent
                </button>
                <button
                  onClick={() => setAllStatus("PERMISSION")}
                  className="h-9 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-orange-200"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Permission
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-2. 5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {currentDaySummary.present}
                      </div>
                      <div className="text-[10px] text-gray-600 uppercase font-medium">
                        Present
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {currentDaySummary.absent}
                      </div>
                      <div className="text-[10px] text-gray-600 uppercase font-medium">
                        Absent
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">
                        P
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {currentDaySummary.permission}
                      </div>
                      <div className="text-[10px] text-gray-600 uppercase font-medium">
                        Permission
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="px-4 py-3 space-y-2 pb-6">
              {students.map((student, index) => {
                const status = student.dailyAttendance[currentDay] || "PRESENT";

                return (
                  <button
                    key={student.studentId}
                    onClick={() => toggleStudentStatus(student.studentId)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl shadow-md transition-all active:scale-98 border-2 ${
                      status === "PRESENT"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                        : status === "ABSENT"
                        ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                        : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md ${
                          status === "PRESENT"
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : status === "ABSENT"
                            ? "bg-gradient-to-br from-red-500 to-rose-600"
                            : "bg-gradient-to-br from-orange-500 to-amber-600"
                        }`}
                      >
                        {status === "PRESENT" && (
                          <Check className="w-6 h-6 text-white" />
                        )}
                        {status === "ABSENT" && (
                          <X className="w-6 h-6 text-white" />
                        )}
                        {status === "PERMISSION" && (
                          <span className="text-white font-bold text-lg">
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
                        {student.rollNumber && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            Roll #{student.rollNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-medium text-gray-500 bg-white/50 px-2.5 py-1 rounded-full">
                      Tap
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : !loadingData && !error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">
                ទិន្នន័យកំពុងផ្ទុក...
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </MobileLayout>
  );
}

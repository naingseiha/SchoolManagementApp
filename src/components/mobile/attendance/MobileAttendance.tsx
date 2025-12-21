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
  XCircle,
  AlertCircle,
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
  // Attendance for each day in the month
  dailyAttendance: {
    [day: number]: AttendanceStatus;
  };
}

interface MobileAttendanceProps {
  classId?: string;
  month?: string;
  year?: number;
}

export default function MobileAttendance({
  classId,
  month,
  year,
}: MobileAttendanceProps) {
  const { classes, isLoadingClasses, refreshClasses } = useData();

  // Filters
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(
    month ? parseInt(month) : new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    year || new Date().getFullYear()
  );

  // Current day being edited
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  // Data
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const monthNames = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ];

  // Proactively load classes
  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // Calculate days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Load attendance data when class/month/year changes
  const loadAttendanceData = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoadingData(true);
    try {
      const khmerMonth = monthNames[selectedMonth - 1];

      // Fetch attendance grid data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/grid/${selectedClass}? month=${khmerMonth}&year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to load attendance data");
      }

      const result = await response.json();
      const gridData = result.data;

      // Transform grid data to mobile format
      const studentsData: StudentAttendance[] = gridData.students.map(
        (student: any) => {
          const dailyAttendance: { [day: number]: AttendanceStatus } = {};

          // Parse attendance for each day (both sessions)
          daysArray.forEach((day) => {
            const morningKey = `${day}_M`;
            const afternoonKey = `${day}_A`;

            const morningData = student.attendance[morningKey];
            const afternoonData = student.attendance[afternoonKey];

            // Priority: if either session is absent/permission, mark the day as such
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
    } catch (error) {
      console.error("Error loading attendance:", error);
      alert("មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ");
    } finally {
      setLoadingData(false);
    }
  };

  // Toggle student status for current day
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
    triggerAutoSave();
  };

  // Auto-save with debounce
  const triggerAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1500); // Save after 1.5 seconds of inactivity
  };

  // Save attendance
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const khmerMonth = monthNames[selectedMonth - 1];

      // Build attendance records for all students and all days
      const attendanceRecords: any[] = [];

      students.forEach((student) => {
        daysArray.forEach((day) => {
          const status = student.dailyAttendance[day];

          let value = "";
          if (status === "ABSENT") value = "A";
          else if (status === "PERMISSION") value = "P";

          // Save for morning session (can extend to afternoon later)
          attendanceRecords.push({
            studentId: student.studentId,
            day: day,
            session: "M",
            value: value,
          });
        });
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/bulk-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass,
            month: khmerMonth,
            year: selectedYear,
            monthNumber: selectedMonth,
            attendance: attendanceRecords,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);

        // Hide success after 2 seconds
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
      console.error("Save error:", error);
      alert(`មានបញ្ហាក្នុងការរក្សាទុក:  ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Navigate days
  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay((prev) => prev - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < daysInMonth) {
      setCurrentDay((prev) => prev + 1);
    }
  };

  // Calculate summary for current day
  const currentDaySummary = {
    present: students.filter((s) => s.dailyAttendance[currentDay] === "PRESENT")
      .length,
    absent: students.filter((s) => s.dailyAttendance[currentDay] === "ABSENT")
      .length,
    permission: students.filter(
      (s) => s.dailyAttendance[currentDay] === "PERMISSION"
    ).length,
  };

  // Quick actions
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
    triggerAutoSave();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  return (
    <MobileLayout title="វត្តមាន • Attendance">
      <div className="flex flex-col h-full bg-gray-50">
        {/* Filters Section */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 space-y-3">
          {/* Class Selector */}
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
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
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

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                  setCurrentDay(1);
                }}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                ឆ្នាំ • Year
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Load Button */}
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

        {/* Main Content */}
        {students.length > 0 ? (
          <div className="flex-1 flex flex-col overflow-hidden">
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
                    {monthNames[selectedMonth - 1]} {selectedYear}
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

              {/* Save Status */}
              <div className="mt-3 flex items-center justify-center">
                {saving ? (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Loader2 className="w-3. 5 h-3.5 animate-spin text-white" />
                    <span className="text-xs font-medium text-white">
                      កំពុងរក្សាទុក...
                    </span>
                  </div>
                ) : saveSuccess ? (
                  <div className="flex items-center gap-2 bg-green-500/90 px-3 py-1.5 rounded-full animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                      រក្សាទុករួចរាល់
                    </span>
                  </div>
                ) : hasUnsavedChanges ? (
                  <div className="flex items-center gap-2 bg-yellow-500/30 px-3 py-1.5 rounded-full border border-yellow-300/50">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white">
                      មានការផ្លាស់ប្តូរ
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                      រួចរាល់
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAllStatus("PRESENT")}
                  className="h-9 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1. 5 transition-all active:scale-95 border border-green-200"
                >
                  <Check className="w-3.5 h-3.5" />
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
                <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
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
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
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
                      {/* Status Icon */}
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

                      {/* Student Info */}
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

                    {/* Tap Indicator */}
                    <div className="text-xs font-medium text-gray-500 bg-white/50 px-2.5 py-1 rounded-full">
                      Tap
                    </div>
                  </button>
                );
              })}
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

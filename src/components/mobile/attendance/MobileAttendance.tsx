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
  dailyAttendance: {
    [day: number]: AttendanceStatus;
  };
}

interface MobileAttendanceProps {
  classId?: string;
  month?: string;
  year?: number;
}

// ✅ FIXED: Use same MONTHS structure as MobileGradeEntry
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
  const monthNumber = new Date().getMonth() + 1;
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

export default function MobileAttendance({
  classId,
  month,
  year,
}: MobileAttendanceProps) {
  const { classes, isLoadingClasses, refreshClasses } = useData();

  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(
    month || getCurrentKhmerMonth() // ✅ FIXED: Use Khmer string
  );
  const [selectedYear, setSelectedYear] = useState(
    year || new Date().getFullYear()
  );

  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
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

  // ✅ Get month number for calculations
  const selectedMonthData = MONTHS.find((m) => m.value === selectedMonth);
  const monthNumber = selectedMonthData?.number || 1;
  const daysInMonth = new Date(selectedYear, monthNumber, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Load attendance data
  const loadAttendanceData = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoadingData(true);
    try {
      console.log("📅 Loading attendance:", {
        classId: selectedClass,
        month: selectedMonth, // ✅ Already Khmer string
        year: selectedYear,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/grid/${selectedClass}? month=${selectedMonth}&year=${selectedYear}`
        //                                                                           ^^^^^^^^^^^^^^ Already Khmer string
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

  // Toggle student status
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

  const triggerAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1500);
  };

  // Save attendance
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const attendanceRecords: any[] = [];

      students.forEach((student) => {
        daysArray.forEach((day) => {
          const status = student.dailyAttendance[day];

          let value = "";
          if (status === "ABSENT") value = "A";
          else if (status === "PERMISSION") value = "P";

          attendanceRecords.push({
            studentId: student.studentId,
            day: day,
            session: "M",
            value: value,
          });
        });
      });

      console.log("💾 Saving attendance:", {
        classId: selectedClass,
        month: selectedMonth, // ✅ Already Khmer string
        year: selectedYear,
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
            month: selectedMonth, // ✅ Already Khmer string
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
    triggerAutoSave();
  };

  const handlePrevDay = () => {
    if (currentDay > 1) setCurrentDay((prev) => prev - 1);
  };

  const handleNextDay = () => {
    if (currentDay < daysInMonth) setCurrentDay((prev) => prev + 1);
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
        {/* Filters */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 space-y-3">
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
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              />
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

        {/* Rest of component continues... (day navigator, student list, etc.) */}
        {/* Keep all the existing UI code from previous version */}
      </div>
    </MobileLayout>
  );
}

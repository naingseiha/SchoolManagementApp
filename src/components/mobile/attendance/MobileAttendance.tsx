"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Save,
  Loader2,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";

type AttendanceStatus = "PRESENT" | "ABSENT" | "PERMISSION" | "LATE";

interface StudentAttendance {
  studentId: string;
  khmerName: string;
  rollNumber?: number;
  status: AttendanceStatus;
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
  const { classes } = useData();
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(
    month || new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    year || new Date().getFullYear()
  );
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDate = new Date(selectedYear, selectedMonth - 1, currentDay);
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

  // Load attendance data
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch class students
        const classResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/${selectedClass}`
        );
        const classData = await classResponse.json();

        if (classData.success) {
          const classStudents = classData.data.students || [];

          // Fetch attendance for the selected date
          const attendanceResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/attendance/grid/${selectedClass}?month=${selectedMonth}&year=${selectedYear}`
          );
          const attendanceData = await attendanceResponse.json();

          // Map students with their attendance status for the current day
          const studentsWithAttendance: StudentAttendance[] =
            classStudents.map((student: any) => {
              // Find attendance record for this student on this day
              const dayAttendance = attendanceData.data?.students?.find(
                (s: any) => s.studentId === student.id
              );

              const dayKey = `day${currentDay}`;
              const status =
                dayAttendance?.attendance?.[dayKey] || "PRESENT";

              return {
                studentId: student.id,
                khmerName: student.khmerName,
                rollNumber: student.rollNumber,
                status,
              };
            });

          setStudents(studentsWithAttendance);
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedClass, currentDay, selectedMonth, selectedYear]);

  const cycleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) return student;

        // Cycle through statuses: PRESENT → ABSENT → PERMISSION → PRESENT
        const statusCycle: AttendanceStatus[] = [
          "PRESENT",
          "ABSENT",
          "PERMISSION",
        ];
        const currentIndex = statusCycle.indexOf(student.status);
        const nextIndex = (currentIndex + 1) % statusCycle.length;

        return { ...student, status: statusCycle[nextIndex] };
      })
    );
  };

  const setAllStatus = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((student) => ({ ...student, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendanceRecords = students.map((student) => ({
        studentId: student.studentId,
        classId: selectedClass,
        date: new Date(selectedYear, selectedMonth - 1, currentDay).toISOString(),
        session: "MORNING", // Default to morning session
        status: student.status,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/bulk-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendance: attendanceRecords }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("ការរក្សាទុកជោគជ័យ! • Saved successfully!");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក • Error saving");
    } finally {
      setSaving(false);
    }
  };

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

  // Calculate summary
  const summary = {
    present: students.filter((s) => s.status === "PRESENT").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
    permission: students.filter((s) => s.status === "PERMISSION").length,
  };

  return (
    <MobileLayout title="Attendance • វត្តមាន">
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ថ្នាក់ • Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              style={{ fontSize: "16px" }}
            >
              <option value="">-- ជ្រើសរើសថ្នាក់ • Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ឆ្នាំ • Year
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <button
            onClick={handlePrevDay}
            disabled={currentDay === 1}
            className="p-2 touch-target touch-feedback disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold">
              Day {currentDay} / {daysInMonth}
            </div>
            <div className="text-sm text-indigo-100">
              {dayName}, {monthNames[selectedMonth - 1]} {currentDay},{" "}
              {selectedYear}
            </div>
          </div>
          <button
            onClick={handleNextDay}
            disabled={currentDay === daysInMonth}
            className="p-2 touch-target touch-feedback disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAllStatus("PRESENT")}
            className="h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium touch-feedback flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            All Present
          </button>
          <button
            onClick={() => setAllStatus("ABSENT")}
            className="h-10 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium touch-feedback flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            All Absent
          </button>
        </div>

        {/* Student List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              មិនមានសិស្ស • No students found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.studentId}
                onClick={() => cycleStatus(student.studentId)}
                className={`w-full flex items-center justify-between p-4 rounded-lg shadow touch-feedback transition-all ${
                  student.status === "PRESENT"
                    ? "bg-green-50 border-l-4 border-green-500"
                    : student.status === "ABSENT"
                    ? "bg-red-50 border-l-4 border-red-500"
                    : "bg-orange-50 border-l-4 border-orange-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  {student.status === "PRESENT" && (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {student.status === "ABSENT" && (
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {student.status === "PERMISSION" && (
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">P</span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {student.khmerName}
                    </div>
                    {student.rollNumber && (
                      <div className="text-xs text-gray-500">
                        Roll #{student.rollNumber}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600">
                  Tap to change
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Summary • សង្ខេប
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.present}
                </div>
                <div className="text-xs text-gray-600 mt-1">Present</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.absent}
                </div>
                <div className="text-xs text-gray-600 mt-1">Absent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {summary.permission}
                </div>
                <div className="text-xs text-gray-600 mt-1">Permission</div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {students.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 touch-feedback shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងរក្សាទុក • Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                រក្សាទុក • Save
              </>
            )}
          </button>
        )}
      </div>
    </MobileLayout>
  );
}

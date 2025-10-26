"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DualSessionTimetableGrid from "@/components/schedule/DualSessionTimetableGrid";
import ScheduleEntryModal from "@/components/schedule/ScheduleEntryModal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  Calendar,
  Printer,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Schedule,
  TimetableEntry,
  DayOfWeek,
  SessionType,
  ScheduleConflict,
  SESSION_NAMES,
} from "@/types/schedule";
import { validateSchedule, checkTeacherConflict } from "@/lib/scheduleUtils";

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const {
    classes,
    teachers,
    subjects,
    schedules,
    addSchedule,
    updateSchedule,
  } = useData();
  const router = useRouter();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<
    TimetableEntry | undefined
  >();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedSession, setSelectedSession] = useState<
    "morning" | "afternoon"
  >("morning");
  const [saveStatus, setSaveStatus] = useState("");
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [sessionTypeOverride, setSessionTypeOverride] =
    useState<SessionType | null>(null);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Load schedule when class is selected
  useEffect(() => {
    if (selectedClassId) {
      const existingSchedule = schedules.find(
        (s) => s.classId === selectedClassId
      );
      const selectedClass = classes.find((c) => c.id === selectedClassId);

      if (existingSchedule) {
        setCurrentSchedule(existingSchedule);
        setSessionTypeOverride(null);
      } else if (selectedClass) {
        // Default session type based on grade, but allow override
        const defaultSessionType: SessionType = "both"; // Allow both sessions by default

        const newSchedule: Schedule = {
          id: `schedule-${Date.now()}`,
          classId: selectedClass.id,
          className: selectedClass.name,
          grade: selectedClass.grade,
          section: selectedClass.section,
          level: selectedClass.level as "អនុវិទ្យាល័យ" | "វិទ្យាល័យ",
          sessionType: defaultSessionType,
          year: new Date().getFullYear(),
          entries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentSchedule(newSchedule);
        setSessionTypeOverride(defaultSessionType);
      }
    }
  }, [selectedClassId, schedules, classes]);

  // Validate schedule on changes
  useEffect(() => {
    if (currentSchedule) {
      const foundConflicts = validateSchedule(
        currentSchedule,
        schedules,
        teachers,
        subjects
      );
      setConflicts(foundConflicts);
    }
  }, [currentSchedule, schedules, teachers, subjects]);

  const handleSaveEntry = (entryData: Partial<TimetableEntry>) => {
    if (!currentSchedule) return;

    let updatedEntries: TimetableEntry[];

    if (selectedEntry) {
      updatedEntries = currentSchedule.entries.map((e) =>
        e.id === selectedEntry.id
          ? ({ ...e, ...entryData } as TimetableEntry)
          : e
      );
    } else {
      updatedEntries = [
        ...currentSchedule.entries,
        entryData as TimetableEntry,
      ];
    }

    const updatedSchedule: Schedule = {
      ...currentSchedule,
      entries: updatedEntries,
      updatedAt: new Date().toISOString(),
    };

    setCurrentSchedule(updatedSchedule);

    const existingSchedule = schedules.find((s) => s.id === updatedSchedule.id);
    if (existingSchedule) {
      updateSchedule(updatedSchedule);
    } else {
      addSchedule(updatedSchedule);
    }

    setSaveStatus("រក្សាទុករួចរាល់ ✓ Saved");
    setTimeout(() => setSaveStatus(""), 2000);

    setIsModalOpen(false);
    setSelectedEntry(undefined);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!currentSchedule) return;

    if (confirm("តើអ្នកប្រាកដថាចង់លុបមេរៀននេះមែនទេ? Delete this entry?")) {
      const updatedEntries = currentSchedule.entries.filter(
        (e) => e.id !== entryId
      );
      const updatedSchedule: Schedule = {
        ...currentSchedule,
        entries: updatedEntries,
        updatedAt: new Date().toISOString(),
      };

      setCurrentSchedule(updatedSchedule);
      updateSchedule(updatedSchedule);

      setSaveStatus("លុបរួចរាល់ ✓ Deleted");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const handleCellClick = (
    day: DayOfWeek,
    period: number,
    session: "morning" | "afternoon"
  ) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
    setSelectedSession(session);
    setSelectedEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setSelectedDay(entry.day);
    setSelectedPeriod(entry.period);
    setSelectedSession(entry.session);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleSessionType = () => {
    if (!currentSchedule) return;

    let newSessionType: SessionType;
    const current = sessionTypeOverride || currentSchedule.sessionType;

    if (current === "morning") {
      newSessionType = "afternoon";
    } else if (current === "afternoon") {
      newSessionType = "both";
    } else {
      newSessionType = "morning";
    }

    const updatedSchedule: Schedule = {
      ...currentSchedule,
      sessionType: newSessionType,
      updatedAt: new Date().toISOString(),
    };

    setCurrentSchedule(updatedSchedule);
    setSessionTypeOverride(newSessionType);
    updateSchedule(updatedSchedule);
  };

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: `${c.name} (${c.level})` })),
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!currentSchedule)
      return {
        totalHours: 0,
        morningHours: 0,
        afternoonHours: 0,
        subjects: 0,
        teachers: 0,
      };

    const morningEntries = currentSchedule.entries.filter(
      (e) => e.session === "morning"
    );
    const afternoonEntries = currentSchedule.entries.filter(
      (e) => e.session === "afternoon"
    );
    const uniqueSubjects = new Set(
      currentSchedule.entries.map((e) => e.subjectId)
    );
    const uniqueTeachers = new Set(
      currentSchedule.entries.map((e) => e.teacherId)
    );

    return {
      totalHours: currentSchedule.entries.length,
      morningHours: morningEntries.length,
      afternoonHours: afternoonEntries.length,
      subjects: uniqueSubjects.size,
      teachers: uniqueTeachers.size,
    };
  }, [currentSchedule]);

  // Get conflict cells for highlighting
  const conflictCells = useMemo(() => {
    const cells = new Set<string>();
    currentSchedule?.entries.forEach((entry) => {
      const hasConflict = checkTeacherConflict(
        entry.teacherId,
        entry.day,
        entry.period,
        entry.session,
        schedules,
        entry.id
      );
      if (hasConflict) {
        cells.add(`${entry.session}-${entry.day}-${entry.period}`);
      }
    });
    return cells;
  }, [currentSchedule, schedules]);

  const modalConflictMessage = useMemo(() => {
    if (!isModalOpen || !currentSchedule) return undefined;

    const teacherConflict = selectedEntry
      ? undefined
      : teachers.find((t) =>
          checkTeacherConflict(
            t.id,
            selectedDay,
            selectedPeriod,
            selectedSession,
            schedules
          )
        );

    if (teacherConflict) {
      return `គ្រូ ${teacherConflict.name} មានកាលវិភាគនៅពេលនេះរួចហើយ / Teacher already scheduled at this time`;
    }
    return undefined;
  }, [
    isModalOpen,
    selectedEntry,
    selectedDay,
    selectedPeriod,
    selectedSession,
    schedules,
    teachers,
  ]);

  const effectiveSessionType =
    sessionTypeOverride || currentSchedule?.sessionType || "both";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6 no-print">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                តារាងកាលវិភាគ
              </h1>
              <p className="text-gray-600 mt-1">
                រៀបចំកាលវិភាគសម្រាប់ថ្នាក់រៀនទាំងពីរវេន
              </p>
            </div>
            {/* Right Side - Action Buttons */}
            <div className="flex gap-3">
              {/* ✨ MASTER TIMETABLE LINK - បន្ថែមត្រង់នេះ */}
              <Link href="/schedule/master">
                <Button variant="secondary">
                  <Calendar className="w-5 h-5 mr-2" />
                  តារាងរួម Master View
                </Button>
              </Link>

              {/* ✨ TEACHER SCHEDULE LINK - បន្ថែមត្រង់នេះ */}
              <Link href="/schedule/teacher">
                <Button variant="secondary">
                  <Users className="w-5 h-5 mr-2" />
                  កាលវិភាគគ្រូ Teacher
                </Button>
              </Link>

              {/* Print Button - បង្ហាញតែពេលមានកាលវិភាគ */}
              {currentSchedule && (
                <Button onClick={handlePrint}>
                  <Printer className="w-5 h-5 mr-2" />
                  បោះពុម្ព Print
                </Button>
              )}
            </div>
          </div>

          {/* Class Selection & Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1">
                <Select
                  label="ជ្រើសរើសថ្នាក់ Select Class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  options={classOptions}
                />
              </div>

              {currentSchedule && (
                <>
                  {/* Session Type Toggle */}
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={handleToggleSessionType}
                      variant="secondary"
                      className="w-full"
                    >
                      {effectiveSessionType === "morning" && (
                        <>
                          <Sun className="w-5 h-5 mr-2" />
                          {SESSION_NAMES.morning.kh}
                        </>
                      )}
                      {effectiveSessionType === "afternoon" && (
                        <>
                          <Moon className="w-5 h-5 mr-2" />
                          {SESSION_NAMES.afternoon.kh}
                        </>
                      )}
                      {effectiveSessionType === "both" && (
                        <>
                          <Calendar className="w-5 h-5 mr-2" />
                          {SESSION_NAMES.both.kh}
                        </>
                      )}
                      <ToggleRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* Statistics Cards */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                      <div className="flex items-center gap-3">
                        <Sun className="w-7 h-7 text-yellow-600" />
                        <div>
                          <div className="text-2xl font-bold text-yellow-900">
                            {stats.morningHours}
                          </div>
                          <div className="text-xs text-yellow-600">
                            ម៉ោងព្រឹក
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <Moon className="w-7 h-7 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-blue-900">
                            {stats.afternoonHours}
                          </div>
                          <div className="text-xs text-blue-600">ម៉ោងរសៀល</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentSchedule && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-7 h-7 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-900">
                        {stats.totalHours}
                      </div>
                      <div className="text-xs text-purple-600">
                        ម៉ោងសរុប Total
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-900">
                        {stats.subjects}
                      </div>
                      <div className="text-xs text-green-600">
                        មុខវិជ្ជា Subjects
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-7 h-7 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {stats.teachers}
                      </div>
                      <div className="text-xs text-orange-600">
                        គ្រូបង្រៀន Teachers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Status */}
            {saveStatus && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {saveStatus}
                </span>
              </div>
            )}

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-2">
                      ការជំទាស់កាលវិភាគ Schedule Conflicts ({conflicts.length})
                    </h3>
                    <ul className="space-y-1 text-sm text-red-700">
                      {conflicts.slice(0, 5).map((conflict, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {conflict.messageKh} / {conflict.message}
                          </span>
                        </li>
                      ))}
                      {conflicts.length > 5 && (
                        <li className="text-red-600 font-semibold">
                          និង {conflicts.length - 5} ជំទាស់ផ្សេងទៀត...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timetable Grid */}
          {currentSchedule ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentSchedule.className}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {currentSchedule.level} • ឆ្នាំសិក្សា{" "}
                      {currentSchedule.year}
                    </p>
                  </div>
                </div>
              </div>

              <DualSessionTimetableGrid
                entries={currentSchedule.entries}
                teachers={teachers}
                subjects={subjects}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onCellClick={handleCellClick}
                conflicts={conflictCells}
                showBothSessions={effectiveSessionType === "both"}
              />

              {/* Legend */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">
                  តម្រាស្លាក Legend:
                </h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                    <span className="text-gray-700">គណិតវិទ្យា Math</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
                    <span className="text-gray-700">រូបវិទ្យា Physics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="text-gray-700">គីមីវិទ្យា Chemistry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span className="text-gray-700">ភាសាខ្មែរ Khmer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-300 rounded"></div>
                    <span className="text-gray-700">ភាសាអង់គ្លេស English</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-gray-700">ការជំទាស់ Conflict</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                សូមជ្រើសរើសថ្នាក់
              </h3>
              <p className="text-gray-500">
                Please select a class to view or create timetable
              </p>
            </div>
          )}

          {/* Modal */}
          {currentSchedule && (
            <ScheduleEntryModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedEntry(undefined);
              }}
              onSave={handleSaveEntry}
              entry={selectedEntry}
              day={selectedDay}
              period={selectedPeriod}
              session={selectedSession}
              classId={currentSchedule.classId}
              teachers={teachers}
              subjects={subjects}
              conflictMessage={modalConflictMessage}
              allowSessionChange={true}
            />
          )}
        </main>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}

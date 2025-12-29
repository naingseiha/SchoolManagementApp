"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { gradeApi, type GradeGridData } from "@/lib/api/grades";

interface Subject {
  id: string;
  nameKh: string;
  nameEn: string;
  code: string;
  maxScore: number;
  coefficient: number;
  isEditable?: boolean;
}

interface StudentGrade {
  studentId: string;
  khmerName: string;
  firstName: string;
  lastName: string;
  gender: string;
  rollNumber?: number;
  score: number | null;
  maxScore: number;
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

// Get current Khmer month
const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1; // 1-12
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

// Auto-calculate academic year
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

interface MobileGradeEntryProps {
  classId?: string;
  month?: string;
  year?: number;
}

export default function MobileGradeEntry({ classId: propClassId, month: propMonth, year: propYear }: MobileGradeEntryProps = {}) {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  // ✅ Read classId from URL params or props
  const urlClassId = searchParams?.get("classId");
  const initialClassId = urlClassId || propClassId || "";

  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [selectedMonth, setSelectedMonth] = useState(propMonth || getCurrentKhmerMonth()); // ✅ Auto-select current month
  const [selectedYear, setSelectedYear] = useState(propYear || getCurrentAcademicYear());
  const [selectedSubject, setSelectedSubject] = useState("");

  const [gridData, setGridData] = useState<GradeGridData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentGrade[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Auto-save state
  const [savingStudents, setSavingStudents] = useState<Set<string>>(new Set());
  const [savedStudents, setSavedStudents] = useState<Set<string>>(new Set());
  const saveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // ✅ FIX: Add queue for batch saves to prevent concurrent API calls
  const saveQueueRef = useRef<Map<string, number | null>>(new Map());
  const batchSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBatchSavingRef = useRef(false);

  // ✅ Load classes if empty
  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // ✅ Auto-load data when class is pre-selected from URL/props
  useEffect(() => {
    if (initialClassId && classes.length > 0 && !dataLoaded && !loading && currentUser) {
      handleLoadData();
    }
  }, [initialClassId, classes.length, currentUser]);

  const availableClasses = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
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

  const teacherEditableSubjects = useMemo(() => {
    if (!currentUser) return new Set<string>();
    if (currentUser.role === "ADMIN") return new Set<string>();

    if (currentUser.role === "TEACHER") {
      const subjectTeachers = currentUser.teacher?.subjectTeachers || [];
      const subjectCodes = subjectTeachers
        .map((st: any) => {
          const code = st.subject?.code;
          return code ? code.split("-")[0] : null;
        })
        .filter((code): code is string => code !== null);

      return new Set(subjectCodes);
    }

    return new Set<string>();
  }, [currentUser]);

  const teacherHomeroomClassId = useMemo(() => {
    if (currentUser?.role === "TEACHER") {
      return currentUser.teacher?.homeroomClassId || null;
    }
    return null;
  }, [currentUser]);

  const handleLoadData = async () => {
    if (!selectedClass || !currentUser) {
      alert("សូមជ្រើសរើសថ្នាក់សិន • Please select a class first");
      return;
    }

    setLoading(true);
    setError(null);
    setGridData(null);
    setSubjects([]);
    setStudents([]);
    setSelectedSubject("");
    setDataLoaded(false);
    setSavedStudents(new Set());
    setSavingStudents(new Set());

    try {
      const data = await gradeApi.getGradesGrid(
        selectedClass,
        selectedMonth,
        selectedYear
      );

      if (currentUser.role === "ADMIN") {
        data.subjects = data.subjects.map((subject) => ({
          ...subject,
          isEditable: true,
        }));
      } else if (currentUser.role === "TEACHER") {
        const isHomeroomClass = teacherHomeroomClassId === selectedClass;

        data.subjects = data.subjects.map((subject) => {
          const baseCode = subject.code?.split("-")[0];
          const isEditable = isHomeroomClass
            ? true
            : baseCode
            ? teacherEditableSubjects.has(baseCode)
            : false;

          return {
            ...subject,
            isEditable,
          };
        });
      }

      const editableSubjects = data.subjects.filter((s) => s.isEditable);

      if (editableSubjects.length === 0) {
        setError(
          "អ្នកមិនមានសិទ្ធិបញ្ចូលពិន្ទុសម្រាប់ថ្នាក់នេះទេ • You don't have permission to enter grades for this class"
        );
        setLoading(false);
        return;
      }

      setGridData(data);
      setSubjects(editableSubjects);
      setDataLoaded(true);

      if (editableSubjects.length === 1) {
        setSelectedSubject(editableSubjects[0].id);
      }
    } catch (err: any) {
      console.error("Error loading grades:", err);
      setError(err.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gridData || !selectedSubject) {
      setStudents([]);
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return;

    const studentGrades: StudentGrade[] = gridData.students.map((student) => {
      const gradeData = student.grades[selectedSubject];
      return {
        studentId: student.studentId,
        khmerName: student.studentName,
        firstName: "",
        lastName: "",
        gender: student.gender,
        rollNumber: undefined,
        score: gradeData?.score !== undefined && gradeData?.score !== null ? gradeData.score : null,
        maxScore: subject.maxScore,
      };
    });

    setStudents(studentGrades);
  }, [gridData, selectedSubject, subjects]);

  // ✅ FIX: Batch save function to save multiple students at once
  const executeBatchSave = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return;
    if (isBatchSavingRef.current) return;
    if (saveQueueRef.current.size === 0) return;

    // ✅ Snapshot the queue
    const studentsToSave = new Map(saveQueueRef.current);
    saveQueueRef.current.clear();

    isBatchSavingRef.current = true;

    // Mark all as saving
    setSavingStudents(
      (prev) => new Set([...prev, ...studentsToSave.keys()])
    );

    try {
      const gradesToSave = Array.from(studentsToSave.entries()).map(
        ([studentId, score]) => ({
          studentId,
          subjectId: selectedSubject,
          score: score!,
        })
      );

      await gradeApi.bulkSaveGrades(
        selectedClass,
        selectedMonth,
        selectedYear,
        gradesToSave
      );

      // Remove from saving state
      setSavingStudents((prev) => {
        const next = new Set(prev);
        studentsToSave.forEach((_, studentId) => next.delete(studentId));
        return next;
      });

      // Add to saved state
      setSavedStudents((prev) => new Set([...prev, ...studentsToSave.keys()]));

      // Clear saved indicators after 2 seconds
      setTimeout(() => {
        setSavedStudents((prev) => {
          const next = new Set(prev);
          studentsToSave.forEach((_, studentId) => next.delete(studentId));
          return next;
        });
      }, 2000);
    } catch (error: any) {
      setSavingStudents((prev) => {
        const next = new Set(prev);
        studentsToSave.forEach((_, studentId) => next.delete(studentId));
        return next;
      });
      alert(`មានបញ្ហា: ${error.message}`);
    } finally {
      isBatchSavingRef.current = false;

      // ✅ If more changes were queued during save, trigger another batch
      if (saveQueueRef.current.size > 0) {
        batchSaveTimeoutRef.current = setTimeout(executeBatchSave, 500);
      }
    }
  }, [selectedClass, selectedSubject, selectedMonth, selectedYear]);

  // ✅ Auto-save function - now queues for batch save
  const autoSaveScore = useCallback(
    (studentId: string, score: number | null) => {
      if (!selectedClass || !selectedSubject) return;

      // ✅ Add to batch queue
      saveQueueRef.current.set(studentId, score);

      // ✅ Clear existing batch timeout
      if (batchSaveTimeoutRef.current) {
        clearTimeout(batchSaveTimeoutRef.current);
      }

      // ✅ Schedule batch save after 1 second of inactivity
      batchSaveTimeoutRef.current = setTimeout(executeBatchSave, 1000);
    },
    [selectedClass, selectedSubject, executeBatchSave]
  );

  // ✅ Handle score change with auto-save
  const handleScoreChange = useCallback(
    (studentId: string, value: string, maxScore: number) => {
      const score = value === "" ? null : parseFloat(value);

      if (score !== null && score > maxScore) {
        return;
      }

      // Update local state immediately
      setStudents((prev) =>
        prev.map((student) =>
          student.studentId === studentId ? { ...student, score } : student
        )
      );

      // ✅ FIX: Remove per-student timeout, use batch queue instead
      if (score !== null) {
        autoSaveScore(studentId, score);
      }
    },
    [autoSaveScore]
  );

  // ✅ FIX: Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      saveTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      if (batchSaveTimeoutRef.current) {
        clearTimeout(batchSaveTimeoutRef.current);
      }
    };
  }, []);

  if (authLoading) {
    return (
      <MobileLayout title="Grade Entry">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  return (
    <MobileLayout title="Grade Entry • បញ្ចូលពិន្ទុ">
      {/* Clean Modern Header */}
      <div className="bg-white px-5 pt-6 pb-5 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-koulen text-xl text-gray-900 leading-tight">
              បញ្ចូលពិន្ទុ
            </h1>
            <p className="font-battambang text-xs text-gray-500">
              Grade Entry System
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Modern Filter Cards */}
        <div className="space-y-3">
          {/* Class Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <label className="font-battambang text-sm font-semibold text-gray-700">
                ថ្នាក់ • Class
              </label>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setDataLoaded(false);
                setSelectedSubject("");
              }}
              disabled={isLoadingClasses}
              className="w-full h-12 px-4 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              style={{ fontSize: "16px" }}
            >
              <option value="">
                {isLoadingClasses ? "កំពុងផ្ទុក..." : "-- ជ្រើសរើសថ្នាក់ --"}
              </option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <label className="font-battambang text-sm font-semibold text-gray-700">
                ខែ និងឆ្នាំ • Month & Year
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontSize: "16px" }}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear.toString()}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

          {/* Load Button */}
          <button
            onClick={handleLoadData}
            disabled={!selectedClass || loading}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-battambang font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងផ្ទុក...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                ផ្ទុកទិន្នន័យ
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="font-battambang text-sm text-red-700 flex-1 pt-2">{error}</p>
            </div>
          </div>
        )}

        {/* Subject Selector - Modern Design */}
        {dataLoaded && subjects.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="font-battambang text-sm font-bold text-gray-800">
                  មុខវិជ្ជា • Subject
                </label>
                {subjects.length > 1 && (
                  <p className="font-battambang text-xs text-purple-600">
                    {subjects.length} មុខវិជ្ជា
                  </p>
                )}
              </div>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-13 px-4 font-battambang bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
              style={{ fontSize: "16px" }}
            >
              <option value="">-- ជ្រើសរើសមុខវិជ្ជា --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nameKh} ({subject.maxScore} ពិន្ទុ)
                </option>
              ))}
            </select>
            {currentUser?.role === "TEACHER" &&
              teacherHomeroomClassId === selectedClass && (
                <div className="mt-3 bg-green-100 border border-green-200 rounded-xl p-3">
                  <p className="font-battambang text-xs text-green-700 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-lg flex items-center justify-center">
                      🏠
                    </div>
                    អ្នកគឺជា INSTRUCTOR - អាចបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជា
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Students List - Show ALL students */}
        {selectedSubject && students.length > 0 && currentSubject && (
          <div className="space-y-4">
            {/* Modern Stats Banner */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-koulen text-lg text-white leading-tight">
                          {currentSubject.nameKh}
                        </h3>
                        <p className="font-battambang text-xs text-purple-100">
                          {currentSubject.nameEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                        <p className="font-battambang text-xs text-purple-100">សិស្សសរុប</p>
                        <p className="font-koulen text-lg text-white">{students.length}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                        <p className="font-battambang text-xs text-purple-100">ពិន្ទុអតិបរមា</p>
                        <p className="font-koulen text-lg text-white">{currentSubject.maxScore}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                      <CheckCircle className="w-6 h-6 text-white mx-auto mb-1" />
                      <p className="font-battambang text-xs text-purple-100 whitespace-nowrap">Auto-Save</p>
                      <p className="font-battambang text-[10px] text-white/90">ស្វ័យប្រវត្តិ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Student Cards */}
            <div className="space-y-2.5">
              {students.map((student, index) => {
                const isSaving = savingStudents.has(student.studentId);
                const isSaved = savedStudents.has(student.studentId);

                return (
                  <div
                    key={student.studentId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {/* Student Number Badge */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="font-koulen text-base text-purple-700">
                          {index + 1}
                        </span>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-battambang text-sm font-semibold text-gray-900 truncate mb-0.5">
                          {student.khmerName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-battambang font-medium ${
                            student.gender === "MALE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}>
                            {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                          </span>
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="flex-shrink-0 w-20 relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={student.score !== null ? student.score.toString() : ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student.studentId,
                              e.target.value,
                              student.maxScore
                            )
                          }
                          className={`w-full h-12 px-2 text-center font-battambang border-2 rounded-xl text-base font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-all ${
                            student.score === 0
                              ? "bg-red-50 border-red-300 text-red-700"
                              : "bg-purple-50 border-purple-200"
                          }`}
                          placeholder="0"
                          style={{ fontSize: "16px" }}
                        />
                        {/* Absent indicator badge */}
                        {student.score === 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight shadow-md">
                            A
                          </div>
                        )}
                      </div>

                      {/* Save Status Icon */}
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        ) : isSaved ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        ) : student.score !== null ? (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modern Info Footer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-xs text-blue-800 font-semibold mb-0.5">
                    ពិន្ទុរក្សាទុកដោយស្វ័យប្រវត្តិ
                  </p>
                  <p className="font-battambang text-[10px] text-blue-600">
                    Scores automatically save after typing
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Empty State */}
        {!dataLoaded && !loading && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl shadow-sm border border-gray-200 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full opacity-30 blur-2xl"></div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <p className="font-battambang text-sm text-gray-700 mb-2 font-semibold">
                សូមជ្រើសរើសថ្នាក់ ខែ និងឆ្នាំ
              </p>
              <p className="font-battambang text-xs text-gray-500">
                ហើយចុច "ផ្ទុកទិន្នន័យ" ដើម្បីចាប់ផ្តើម
              </p>
              <p className="font-battambang text-[10px] text-gray-400 mt-1">
                Select class, month & year, then click "Load Data"
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

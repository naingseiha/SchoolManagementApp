"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
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

export default function MobileGradeEntry() {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth()); // ✅ Auto-select current month
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
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

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

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
        score: gradeData?.score || null,
        maxScore: subject.maxScore,
      };
    });

    setStudents(studentGrades);
  }, [gridData, selectedSubject, subjects]);

  // ✅ Auto-save function
  const autoSaveScore = useCallback(
    async (studentId: string, score: number | null) => {
      if (!selectedClass || !selectedSubject) return;

      setSavingStudents((prev) => new Set(prev).add(studentId));

      try {
        const gradesToSave = [
          {
            studentId,
            subjectId: selectedSubject,
            score: score!,
          },
        ];

        await gradeApi.bulkSaveGrades(
          selectedClass,
          selectedMonth,
          selectedYear,
          gradesToSave
        );

        setSavingStudents((prev) => {
          const next = new Set(prev);
          next.delete(studentId);
          return next;
        });

        setSavedStudents((prev) => new Set(prev).add(studentId));

        // Clear saved indicator after 2 seconds
        setTimeout(() => {
          setSavedStudents((prev) => {
            const next = new Set(prev);
            next.delete(studentId);
            return next;
          });
        }, 2000);
      } catch (error: any) {
        console.error("Auto-save error:", error);
        setSavingStudents((prev) => {
          const next = new Set(prev);
          next.delete(studentId);
          return next;
        });
        alert(`មានបញ្ហា: ${error.message}`);
      }
    },
    [selectedClass, selectedSubject, selectedMonth, selectedYear]
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

      // Clear existing timeout for this student
      const existingTimeout = saveTimeouts.current.get(studentId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for auto-save (1 second debounce)
      if (score !== null) {
        const timeout = setTimeout(() => {
          autoSaveScore(studentId, score);
        }, 1000);

        saveTimeouts.current.set(studentId, timeout);
      }
    },
    [autoSaveScore]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      saveTimeouts.current.forEach((timeout) => clearTimeout(timeout));
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
      <div className="p-4 space-y-4 pb-24">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ជ្រើសរើស • Selection
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              ថ្នាក់ • Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setDataLoaded(false);
                setSelectedSubject("");
              }}
              disabled={isLoadingClasses}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                ឆ្នាំសិក្សា • Academic Year
              </label>
              <select
                value={selectedYear.toString()}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
            onClick={handleLoadData}
            disabled={!selectedClass || loading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 touch-feedback"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងផ្ទុក...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                ផ្ទុកទិន្នន័យ • Load Data
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Subject Selector */}
        {dataLoaded && subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              មុខវិជ្ជា • Subject{" "}
              {subjects.length > 1 && `(${subjects.length})`}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  🏠 អ្នកគឺជា INSTRUCTOR - អាចបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជា
                </p>
              )}
          </div>
        )}

        {/* Students List - Show ALL students */}
        {selectedSubject && students.length > 0 && currentSubject && (
          <div className="space-y-3">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{currentSubject.nameKh}</h3>
                  <p className="text-sm text-indigo-100 mt-1">
                    {students.length} សិស្ស • Max: {currentSubject.maxScore}{" "}
                    ពិន្ទុ
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-100">Auto-save</p>
                  <p className="text-sm font-semibold">រក្សាស្វ័យប្រវត្តិ</p>
                </div>
              </div>
            </div>

            {/* All Students List */}
            <div className="space-y-2">
              {students.map((student, index) => {
                const isSaving = savingStudents.has(student.studentId);
                const isSaved = savedStudents.has(student.studentId);

                return (
                  <div
                    key={student.studentId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Student Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-700">
                          {index + 1}
                        </span>
                      </div>

                      {/* Student Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {student.khmerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                        </p>
                      </div>

                      {/* Score Input */}
                      <div className="flex-shrink-0 w-24 relative">
                        <input
                          type="number"
                          value={student.score ?? ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student.studentId,
                              e.target.value,
                              student.maxScore
                            )
                          }
                          className="w-full h-11 px-3 text-center border-2 border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                          max={student.maxScore}
                          step="0.5"
                          style={{ fontSize: "16px" }}
                        />
                      </div>

                      {/* Save Status */}
                      <div className="flex-shrink-0 w-8">
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        ) : isSaved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : student.score !== null ? (
                          <Clock className="w-5 h-5 text-gray-300" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center">
                💡 ពិន្ទុរក្សាទុកដោយស្វ័យប្រវត្តិ • Scores auto-save after
                typing
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!dataLoaded && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-sm text-gray-600 mb-2">
              សូមជ្រើសរើសថ្នាក់ ខែ និងឆ្នាំ ហើយចុច "ផ្ទុកទិន្នន័យ"
            </p>
            <p className="text-xs text-gray-500">
              Select class, month, year and click "Load Data"
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

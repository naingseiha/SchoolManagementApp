// 📂 src/components/mobile/grades/MobileGradeEntry.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  BookOpen,
  Users,
  Award,
  Save,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";

interface StudentGrade {
  studentId: string;
  studentName: string;
  khmerName: string;
  rollNumber?: number;
  gender: string;
  grades: {
    [subjectId: string]: {
      score: number | null;
      maxScore: number;
      coefficient: number;
    };
  };
}

interface Subject {
  id: string;
  name: string;
  nameKh: string;
  code: string;
  maxScore: number;
  coefficient: number;
}

export default function MobileGradeEntry() {
  const {
    classes,
    subjects: allSubjects,
    isLoadingClasses,
    refreshClasses,
  } = useData();

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Current student index
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Data
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // Load grade data
  const loadGradeData = async () => {
    if (!selectedClass) {
      alert("សូមជ្រើសរើសថ្នាក់");
      return;
    }

    setLoading(true);
    try {
      const khmerMonth = monthNames[selectedMonth - 1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/grades/grid/${selectedClass}? month=${khmerMonth}&year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to load grades");
      }

      const result = await response.json();
      const gridData = result.data;

      // Set subjects
      setSubjects(gridData.subjects || []);

      // Transform students data
      const studentsData: StudentGrade[] = gridData.students.map(
        (student: any) => {
          const grades: { [subjectId: string]: any } = {};

          gridData.subjects.forEach((subject: any) => {
            const gradeData = student.grades[subject.id];
            grades[subject.id] = {
              score: gradeData?.score ?? null,
              maxScore: subject.maxScore,
              coefficient: subject.coefficient,
            };
          });

          return {
            studentId: student.studentId,
            studentName: student.studentName,
            khmerName: student.studentName,
            rollNumber: student.rollNumber,
            gender: student.gender,
            grades,
          };
        }
      );

      setStudents(studentsData);
      setCurrentStudentIndex(0);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error loading grades:", error);
      alert(`មានបញ្ហា: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update grade
  const updateGrade = (subjectId: string, score: string) => {
    const numScore = score === "" ? null : parseFloat(score);
    const subject = subjects.find((s) => s.id === subjectId);

    if (numScore !== null && subject && numScore > subject.maxScore) {
      alert(`ពិន្ទុមិនអាចលើសពី ${subject.maxScore} បានទេ`);
      return;
    }

    setStudents((prev) =>
      prev.map((student, index) => {
        if (index !== currentStudentIndex) return student;

        return {
          ...student,
          grades: {
            ...student.grades,
            [subjectId]: {
              ...student.grades[subjectId],
              score: numScore,
            },
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
    }, 1500);
  };

  // Save grades
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const khmerMonth = monthNames[selectedMonth - 1];
      const gradesToSave: any[] = [];

      students.forEach((student) => {
        Object.entries(student.grades).forEach(([subjectId, gradeData]) => {
          if (gradeData.score !== null) {
            gradesToSave.push({
              studentId: student.studentId,
              subjectId: subjectId,
              score: gradeData.score,
            });
          }
        });
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/grades/bulk-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass,
            month: khmerMonth,
            year: selectedYear,
            grades: gradesToSave,
          }),
        }
      );

      const result = await response.json();

      if (result.success || result.savedCount > 0) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);

        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } else {
        throw new Error("Save failed");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`មានបញ្ហាក្នុងការរក្សាទុក: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Navigate students
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex((prev) => prev - 1);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex((prev) => prev + 1);
    }
  };

  // Calculate student average
  const calculateStudentAverage = (student: StudentGrade) => {
    let totalScore = 0;
    let totalCoefficient = 0;

    Object.values(student.grades).forEach((grade) => {
      if (grade.score !== null) {
        totalScore += grade.score * grade.coefficient;
        totalCoefficient += grade.coefficient;
      }
    });

    return totalCoefficient > 0 ? totalScore / totalCoefficient : 0;
  };

  // Get grade level
  const getGradeLevel = (average: number) => {
    if (average >= 45)
      return {
        level: "A",
        color: "text-green-600",
        bg: "bg-green-100",
        label: "ល្អប្រសើរ",
      };
    if (average >= 40)
      return {
        level: "B",
        color: "text-blue-600",
        bg: "bg-blue-100",
        label: "ល្អ",
      };
    if (average >= 35)
      return {
        level: "C",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        label: "ល្អបុរេ",
      };
    if (average >= 30)
      return {
        level: "D",
        color: "text-orange-600",
        bg: "bg-orange-100",
        label: "មធ្យម",
      };
    if (average >= 25)
      return {
        level: "E",
        color: "text-red-500",
        bg: "bg-red-100",
        label: "ខ្សោយ",
      };
    return {
      level: "F",
      color: "text-red-700",
      bg: "bg-red-100",
      label: "ខ្សោយបំផុត",
    };
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const currentStudent = students[currentStudentIndex];
  const studentAverage = currentStudent
    ? calculateStudentAverage(currentStudent)
    : 0;
  const gradeLevel = getGradeLevel(studentAverage);

  return (
    <MobileLayout title="បញ្ចូលពិន្ទុ • Grade Entry">
      <div className="flex flex-col h-full bg-gray-50">
        {/* Filters Section */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              បញ្ចូលពិន្ទុប្រចាំខែ
            </h2>
          </div>

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

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
            onClick={loadGradeData}
            disabled={!selectedClass || loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">កំពុងផ្ទុក...</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">ផ្ទុកទិន្នន័យ</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        {students.length > 0 && currentStudent ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Student Navigator */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevStudent}
                  disabled={currentStudentIndex === 0}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="text-center flex-1 px-4">
                  <div className="text-white text-lg font-bold truncate">
                    {currentStudent.khmerName}
                  </div>
                  <div className="text-indigo-100 text-xs mt-0.5">
                    សិស្សទី {currentStudentIndex + 1} / {students.length}
                    {currentStudent.rollNumber &&
                      ` • Roll #${currentStudent.rollNumber}`}
                  </div>
                </div>

                <button
                  onClick={handleNextStudent}
                  disabled={currentStudentIndex === students.length - 1}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-indigo-100 font-medium">
                      មធ្យមភាគ
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {studentAverage.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">/50</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-xs text-indigo-100 font-medium">
                      និទ្ទេស
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {gradeLevel.level}
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">
                    {gradeLevel.label}
                  </div>
                </div>
              </div>

              {/* Save Status */}
              <div className="mt-3 flex items-center justify-center">
                {saving ? (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1. 5 rounded-full">
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
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                      រួចរាល់
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Grade List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {subjects.map((subject) => {
                const grade = currentStudent.grades[subject.id];
                const scoreValue = grade?.score ?? "";

                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 transition-all hover:shadow-lg"
                  >
                    {/* Subject Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">
                          {subject.nameKh}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {subject.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">មេគុណ</div>
                        <div className="text-sm font-bold text-indigo-600">
                          ×{subject.coefficient}
                        </div>
                      </div>
                    </div>

                    {/* Score Input */}
                    <div className="relative">
                      <input
                        type="number"
                        value={scoreValue}
                        onChange={(e) =>
                          updateGrade(subject.id, e.target.value)
                        }
                        placeholder="0"
                        step="0.5"
                        min="0"
                        max={subject.maxScore}
                        className="w-full h-14 px-4 pr-20 text-2xl font-bold text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        style={{ fontSize: "24px" }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                        <div className="text-lg font-bold text-gray-400">
                          /{subject.maxScore}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {scoreValue !== "" && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (parseFloat(scoreValue.toString()) /
                                  subject.maxScore) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            {(
                              (parseFloat(scoreValue.toString()) /
                                subject.maxScore) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                          <span className="text-xs text-gray-600">
                            ពិន្ទុពេញលេញ:{" "}
                            {(
                              parseFloat(scoreValue.toString()) *
                              subject.coefficient
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedClass && !loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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

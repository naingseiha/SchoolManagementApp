"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Save, Loader2, Download, AlertCircle } from "lucide-react";
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

// Auto-calculate academic year (2025 means 2025-2026)
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
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // If current month is Sept-Dec, academic year is current year
  // If current month is Jan-Aug, academic year is previous year
  return month >= 9 ? year : year - 1;
};

export default function MobileGradeEntry() {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("មករា");
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [selectedSubject, setSelectedSubject] = useState("");

  const [gridData, setGridData] = useState<GradeGridData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentGrade[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Proactively load classes if empty
  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // ✅ Filter classes based on role (same logic as desktop)
  const availableClasses = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      // From teacherClasses
      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
        });
      }

      // From homeroom class
      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }

      const teacherClassIds = Array.from(classIdsSet);
      return classes.filter((c) => teacherClassIds.includes(c.id));
    }

    return [];
  }, [currentUser, classes]);

  // ✅ Get teacher's editable subjects by CODE
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

  // ✅ Get homeroom class ID
  const teacherHomeroomClassId = useMemo(() => {
    if (currentUser?.role === "TEACHER") {
      return currentUser.teacher?.homeroomClassId || null;
    }
    return null;
  }, [currentUser]);

  // ✅ Load data when user clicks "Load" button
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

    try {
      const data = await gradeApi.getGradesGrid(
        selectedClass,
        selectedMonth,
        selectedYear
      );

      // ✅ Apply teacher permissions (same logic as desktop)
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

      // ✅ Filter to show only editable subjects
      const editableSubjects = data.subjects.filter((s) => s.isEditable);

      if (editableSubjects.length === 0) {
        setError("អ្នកមិនមានសិទ្ធិបញ្ចូលពិន្ទុសម្រាប់ថ្នាក់នេះទេ • You don't have permission to enter grades for this class");
        setLoading(false);
        return;
      }

      setGridData(data);
      setSubjects(editableSubjects);
      setDataLoaded(true);

      // Auto-select first subject if only one available
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

  // ✅ Load students for selected subject
  useEffect(() => {
    if (!gridData || !selectedSubject) {
      setStudents([]);
      setCurrentIndex(0);
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return;

    // Map grid data to student grades for this subject
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
    setCurrentIndex(0);
  }, [gridData, selectedSubject, subjects]);

  const currentStudent = students[currentIndex];
  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  const handleNext = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleScoreChange = (value: string) => {
    const score = value === "" ? null : parseFloat(value);

    // Validate score doesn't exceed max
    if (score !== null && currentStudent && score > currentStudent.maxScore) {
      return;
    }

    setStudents((prev) =>
      prev.map((student, idx) =>
        idx === currentIndex
          ? { ...student, score }
          : student
      )
    );
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject) {
      alert("សូមជ្រើសរើសថ្នាក់ និងមុខវិជ្ជាសិន • Please select class and subject first");
      return;
    }

    setSaving(true);
    try {
      // Prepare grades for the selected subject only
      const gradesToSave = students
        .filter((student) => student.score !== null)
        .map((student) => ({
          studentId: student.studentId,
          subjectId: selectedSubject,
          score: student.score!,
        }));

      if (gradesToSave.length === 0) {
        alert("សូមបញ្ចូលពិន្ទុយ៉ាងហោចណាស់មួយ • Please enter at least one score");
        return;
      }

      const result = await gradeApi.bulkSaveGrades(
        selectedClass,
        selectedMonth,
        selectedYear,
        gradesToSave
      );

      if (result.savedCount > 0) {
        alert(`រក្សាទុកបាន ${result.savedCount} ពិន្ទុ • Saved ${result.savedCount} grades successfully!`);

        // Reload data to get updated scores
        await handleLoadData();
      }
    } catch (error: any) {
      console.error("Error saving grades:", error);
      alert(`មានបញ្ហា: ${error.message} • Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <MobileLayout title="Grade Entry">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

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

          {/* Load Button */}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Subject Selector - Only show after data loaded */}
        {dataLoaded && subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              មុខវិជ្ជា • Subject {subjects.length > 1 && `(${subjects.length})`}
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
            {currentUser?.role === "TEACHER" && teacherHomeroomClassId === selectedClass && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                🏠 អ្នកគឺជា​ INSTRUCTOR - អាចបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជា
              </p>
            )}
          </div>
        )}

        {/* Student List - Only show when subject is selected */}
        {selectedSubject && students.length > 0 && currentSubject && (
          <>
            {/* Student Navigation */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 touch-target touch-feedback disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-700">
                  {currentIndex + 1} / {students.length}
                </span>
                <p className="text-xs text-gray-500">{currentSubject.nameKh}</p>
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex === students.length - 1}
                className="p-2 touch-target touch-feedback disabled:opacity-30"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Student Card */}
            {currentStudent && (
              <>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-4 text-white">
                  <h2 className="text-xl font-bold">{currentStudent.khmerName}</h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    {currentStudent.gender === "MALE" ? "ប្រុស • Male" : "ស្រី • Female"}
                  </p>
                </div>

                {/* Score Input */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentSubject.nameKh}
                    <span className="text-gray-500 text-xs ml-2">
                      (Max: {currentSubject.maxScore} ពិន្ទុ)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={currentStudent.score ?? ""}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`0 - ${currentSubject.maxScore}`}
                    min="0"
                    max={currentSubject.maxScore}
                    step="0.5"
                    style={{ fontSize: "24px" }}
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 touch-feedback shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      រក្សាទុក • Save All
                    </>
                  )}
                </button>
              </>
            )}
          </>
        )}

        {/* Empty State */}
        {!dataLoaded && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-sm text-gray-600">
              សូមជ្រើសរើសថ្នាក់ ខែ និងឆ្នាំ ហើយចុច "ផ្ទុកទិន្នន័យ"
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Select class, month, year and click "Load Data"
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

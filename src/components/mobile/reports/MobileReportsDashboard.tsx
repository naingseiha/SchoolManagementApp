// 📂 src/components/mobile/reports/MobileReportsDashboard.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  BarChart3,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Award,
  ChevronRight,
  ArrowLeft,
  Users,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import { gradeApi } from "@/lib/api/grades";

interface StudentGrade {
  studentId: string;
  studentName: string;
  gender: string;
  score: number | null;
  maxScore: number;
}

interface SubjectStatus {
  subjectId: string;
  subjectName: string;
  subjectNameKh: string;
  subjectCode: string;
  maxScore: number;
  coefficient: number;
  totalStudents: number;
  studentsWithGrades: number;
  completionRate: number;
  isComplete: boolean;
  studentGrades: StudentGrade[];
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

export default function MobileReportsDashboard() {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [subjects, setSubjects] = useState<SubjectStatus[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  const loadSubjectStatus = async () => {
    if (!selectedClass) {
      alert("សូមជ្រើសរើសថ្នាក់");
      return;
    }

    setLoading(true);
    setSelectedSubject(null);
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 LOADING SUBJECT STATUS:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Request params:", {
        classId: selectedClass,
        month: selectedMonth,
        monthType: typeof selectedMonth,
        year: selectedYear,
        yearType: typeof selectedYear,
      });

      const gridData = await gradeApi.getGradesGrid(
        selectedClass,
        selectedMonth,
        selectedYear
      );

      console.log("✅ Grid data received:", {
        className: gridData.className,
        month: selectedMonth,
        year: selectedYear,
        studentsCount: gridData.students.length,
        subjectsCount: gridData.subjects.length,
      });

      const totalStudents = gridData.students.length;

      console.log("🔍 Processing grades for each subject:");

      const subjectStatusList: SubjectStatus[] = gridData.subjects.map(
        (subject: any, idx: number) => {
          const studentGrades: StudentGrade[] = [];
          let studentsWithGrades = 0;

          gridData.students.forEach((student: any, studentIdx: number) => {
            const gradeData = student.grades[subject.id];
            const score = gradeData?.score ?? null;

            studentGrades.push({
              studentId: student.studentId,
              studentName: student.studentName,
              gender: student.gender,
              score: score,
              maxScore: subject.maxScore,
            });

            if (score !== null && score !== undefined) {
              studentsWithGrades++;
            }

            if (studentIdx === 0) {
              console.log(`  Subject ${idx + 1} (${subject.nameKh}):`, {
                firstStudent: student.studentName,
                score: score,
                hasScore: score !== null,
              });
            }
          });

          const completionRate =
            totalStudents > 0
              ? Math.round((studentsWithGrades / totalStudents) * 100)
              : 0;

          const isComplete = studentsWithGrades === totalStudents;

          console.log(
            `  ✅ ${subject.nameKh}:  ${studentsWithGrades}/${totalStudents} (${completionRate}%)`
          );

          return {
            subjectId: subject.id,
            subjectName: subject.name,
            subjectNameKh: subject.nameKh,
            subjectCode: subject.code,
            maxScore: subject.maxScore,
            coefficient: subject.coefficient,
            totalStudents: totalStudents,
            studentsWithGrades: studentsWithGrades,
            completionRate: completionRate,
            isComplete: isComplete,
            studentGrades: studentGrades,
          };
        }
      );

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Subject status loaded successfully");
      console.log("Total subjects:", subjectStatusList.length);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      setSubjects(subjectStatusList);
      setDataLoaded(true);
    } catch (error: any) {
      console.error("❌ Error loading subject status:", error);
      alert(`មានបញ្ហា: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    const params = new URLSearchParams({
      class: selectedClass,
      month: selectedMonth,
      year: selectedYear.toString(),
    });
    router.push(`/reports/mobile? ${params.toString()}`);
  };

  const completedSubjects = subjects.filter((s) => s.isComplete).length;
  const totalSubjects = subjects.length;
  const overallCompletion =
    totalSubjects > 0
      ? Math.round((completedSubjects / totalSubjects) * 100)
      : 0;

  // ✅ Subject Detail View
  if (selectedSubject) {
    return (
      <MobileLayout title="ពិន្ទុសិស្ស • Student Grades">
        <div className="flex flex-col h-full bg-gray-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1 text-center px-4">
                <h3 className="text-white text-lg font-bold truncate">
                  {selectedSubject.subjectNameKh}
                </h3>
                <p className="text-indigo-100 text-xs mt-0.5">
                  {selectedSubject.subjectCode}
                </p>
              </div>
              <div className="w-10" />
            </div>

            {/* Subject Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                <div className="text-xs text-indigo-100 mb-0.5">Max</div>
                <div className="text-lg font-bold text-white">
                  {selectedSubject.maxScore}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                <div className="text-xs text-indigo-100 mb-0.5">មេគុណ</div>
                <div className="text-lg font-bold text-white">
                  ×{selectedSubject.coefficient}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                <div className="text-xs text-indigo-100 mb-0.5">Status</div>
                <div className="text-lg font-bold text-white">
                  {selectedSubject.completionRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {selectedSubject.studentGrades.map((student, index) => {
              const hasScore =
                student.score !== null && student.score !== undefined;

              return (
                <div
                  key={student.studentId}
                  className={`bg-white rounded-lg shadow-sm border-2 p-3 ${
                    hasScore
                      ? "border-green-200 bg-green-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          hasScore
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {student.studentName}
                          </p>
                          {student.gender === "FEMALE" && (
                            <span className="text-pink-500 text-xs">♀</span>
                          )}
                          {student.gender === "MALE" && (
                            <span className="text-blue-500 text-xs">♂</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-right">
                      {hasScore ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-green-600">
                            {student.score}
                          </span>
                          <span className="text-xs text-gray-500">
                            /{student.maxScore}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-400">
                          មិនទាន់បញ្ចូល
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {hasScore && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1. 5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            ((student.score || 0) / student.maxScore) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">បានបញ្ចូល: </span>{" "}
                <span className="font-bold text-green-600">
                  {selectedSubject.studentsWithGrades}
                </span>
                <span className="text-gray-500">
                  /{selectedSubject.totalStudents}
                </span>
              </div>
              <div>
                {selectedSubject.isComplete ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    រួចរាល់
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    មិនទាន់ចប់
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // ✅ Main Dashboard View
  return (
    <MobileLayout title="របាយការណ៍ • Reports">
      <div className="flex flex-col h-full bg-gray-50">
        {/* Filters Section */}
        <div className="bg-white shadow-lg border-b border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              ស្ថានភាពបញ្ចូលពិន្ទុ
            </h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1. 5 uppercase tracking-wide">
              ថ្នាក់ • Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setDataLoaded(false);
              }}
              disabled={isLoadingClasses}
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  setDataLoaded(false);
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
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setDataLoaded(false);
                }}
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
            onClick={loadSubjectStatus}
            disabled={!selectedClass || loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">កំពុងពិនិត្យ...</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">ពិនិត្យស្ថានភាព</span>
              </>
            )}
          </button>
        </div>

        {/* Content */}
        {dataLoaded && subjects.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {/* Summary Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 shadow-lg">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-indigo-100 font-medium">
                    ភាពពេញលេញ
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {overallCompletion}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${overallCompletion}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-indigo-100">
                  <span>
                    {completedSubjects} / {totalSubjects} មុខវិជ្ជា
                  </span>
                  <span>{subjects[0]?.totalStudents || 0} សិស្ស</span>
                </div>
              </div>
            </div>

            {/* Subject Cards */}
            <div className="px-4 py-3 space-y-2">
              {subjects.map((subject, index) => {
                const isComplete = subject.isComplete;
                const isPartial = subject.studentsWithGrades > 0 && !isComplete;
                const isEmpty = subject.studentsWithGrades === 0;

                return (
                  <button
                    key={subject.subjectId}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full bg-white rounded-xl shadow-md border-2 p-4 transition-all active:scale-98 ${
                      isComplete
                        ? "border-green-300 bg-gradient-to-r from-green-50/30 to-emerald-50/30"
                        : isPartial
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-50/30 to-amber-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                            isComplete
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : isPartial
                              ? "bg-gradient-to-br from-yellow-500 to-amber-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                            {subject.subjectNameKh}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {subject.subjectCode}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span>Max: {subject.maxScore}</span>
                            <span>•</span>
                            <span>មេគុណ: ×{subject.coefficient}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                            isComplete
                              ? "bg-green-100"
                              : isPartial
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : isPartial ? (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-500" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              isComplete
                                ? "text-green-700"
                                : isPartial
                                ? "text-yellow-700"
                                : "text-gray-600"
                            }`}
                          >
                            {subject.completionRate}%
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isComplete
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : isPartial
                            ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                            : "bg-gray-300"
                        }`}
                        style={{ width: `${subject.completionRate}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {subject.studentsWithGrades}/{subject.totalStudents}{" "}
                        សិស្ស
                      </span>
                      {isComplete ? (
                        <span className="text-green-700 font-semibold">
                          ✓ បញ្ចូលពិន្ទុរួចរាល់
                        </span>
                      ) : isPartial ? (
                        <span className="text-yellow-700 font-semibold">
                          ⚠ បញ្ចូលមិនទាន់ចប់
                        </span>
                      ) : (
                        <span className="text-gray-500 font-semibold">
                          ✗ មិនទាន់បានបញ្ចូល
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* View Report Button */}
            {completedSubjects === totalSubjects && (
              <div className="px-4 py-4 bg-white border-t border-gray-200">
                <button
                  onClick={handleViewReport}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Award className="w-5 h-5" />
                  <span>មើលរបាយការណ៍ពេញលេញ</span>
                </button>
              </div>
            )}

            {completedSubjects < totalSubjects && (
              <div className="px-4 py-4 bg-white border-t border-gray-200">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    សូមបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជាជាមុនសិន
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">
                សូមជ្រើសរើសថ្នាក់ ខែ និងឆ្នាំ ដើម្បីពិនិត្យស្ថានភាព
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

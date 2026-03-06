"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import {
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  BookOpen,
  LayoutList,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { reportsApi, type MonthlyReportData } from "@/lib/api/reports";
import { formatReportDate } from "@/lib/khmerDateUtils";
import { paginateReports } from "@/lib/reportPagination";
import { sortSubjectsByOrder } from "@/lib/subjectOrder";

// Import existing components
import KhmerMonthlyReport from "@/components/reports/KhmerMonthlyReport";
import KhmerSemesterOneReport from "@/components/reports/KhmerSemesterOneReport";
import SubjectDetailsReport from "@/components/reports/SubjectDetailsReport";
import MonthlyReportSettings from "@/components/reports/MonthlyReportSettings";
import { getAcademicYearOptionsCustom } from "@/utils/academicYear";

// Helper functions
import {
  getSubjectAbbr,
  monthOptions,
  getMonthDisplayName,
  getCurrentKhmerMonth,
} from "@/lib/reportHelpers";

interface SemesterReportRow {
  student: {
    id: string;
    lastName: string;
    firstName: string;
    gender: "male" | "female";
    className: string;
  };
  permission: number;
  absent: number;
  totalAbsent: number;
  preSemesterAverage: number;
  preSemesterRank: number;
  examTotal: number;
  examAverage: number;
  examRank: number;
  finalAverage: number;
  finalRank: number;
  finalGrade: string;
}

const SEMESTER_PREVIOUS_MONTHS = ["វិច្ឆិកា", "ធ្នូ", "មករា"] as const;

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const router = useRouter();

  // ✅ Filter classes based on role - Show both homeroom (INSTRUCTOR) and teaching classes (TEACHER)
  const availableClasses = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      // From teacherClasses (classes where teacher teaches subjects)
      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
        });
      }

      // From homeroom class (class the teacher manages as INSTRUCTOR)
      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }

      const teacherClassIds = Array.from(classIdsSet);
      return classes.filter((c) => teacherClassIds.includes(c.id));
    }

    return [];
  }, [currentUser, classes]);

  const currentMonth = getCurrentKhmerMonth();

  // State management
  const [reportType, setReportType] = useState<"single" | "grade-wide">(
    "single"
  );
  const [reportFormat, setReportFormat] = useState<
    "summary" | "detailed" | "semester-1"
  >("summary");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return month >= 10 ? year : year - 1;
  });
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [semesterSourceReports, setSemesterSourceReports] = useState<
    MonthlyReportData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDetailedReport, setShowDetailedReport] = useState(true);

  // Sort state
  const [sortBy, setSortBy] = useState<"rank" | "name" | "average">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Report Settings
  const [showSettings, setShowSettings] = useState(false);
  const [province, setProvince] = useState(
    "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"
  );
  const [examCenter, setExamCenter] = useState("វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ");
  const [schoolName, setSchoolName] = useState("ស្វាយធំ");
  const [roomNumber, setRoomNumber] = useState("01");
  const [reportTitle, setReportTitle] = useState("តារាងលទ្ធផលប្រចាំខែ");
  const [examSession, setExamSession] = useState(
    "សប្តាហ៍ទី ១២៖ ខែមករា ២០២៥-២០២៦"
  );
  const [principalName, setPrincipalName] = useState("នាយកសាលា");
  const [teacherName, setTeacherName] = useState("គ្រូបន្ទុកថ្នាក់");
  const [reportDate, setReportDate] = useState(
    "ថ្ងៃទី.       ....        ខែ.      ....      ឆ្នាំ២០២៥"
  );
  const [autoCircle, setAutoCircle] = useState(true);
  const [showCircles, setShowCircles] = useState(true);
  const [studentsPerPage] = useState(28);
  const [firstPageStudentCount, setFirstPageStudentCount] = useState(28);
  const [secondPageStudentCount, setSecondPageStudentCount] = useState(40);
  const [tableFontSize, setTableFontSize] = useState(10);
  const [useAutoDate, setUseAutoDate] = useState(true);

  // Column visibility
  const [showDateOfBirth, setShowDateOfBirth] = useState(false);
  const [showGrade, setShowGrade] = useState(true);
  const [showOther, setShowOther] = useState(true);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showTotal, setShowTotal] = useState(true);
  const [showAverage, setShowAverage] = useState(true);
  const [showGradeLevel, setShowGradeLevel] = useState(true);
  const [showRank, setShowRank] = useState(true);
  const [showRoomNumber, setShowRoomNumber] = useState(true);
  const [showClassName, setShowClassName] = useState(true);

  // ✅ NEW: Subject filter state
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(new Set());

  const reportRef = useRef<HTMLDivElement>(null);

  // Get unique grades from available classes
  const grades = Array.from(
    new Set(availableClasses.map((c) => c.grade))
  ).sort();
  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសកម្រិតថ្នាក់" },
    ...grades.map((g) => ({ value: g, label: `ថ្នាក់ទី${g} ទាំងអស់` })),
  ];

  // ✅ UPDATED:  Fetch report data from API
  const fetchReport = async () => {
    if (reportType === "single" && !selectedClassId) return;
    if (reportType === "grade-wide" && !selectedGrade) return;

    setLoading(true);
    setError(null);
    setReportData(null);
    setSemesterSourceReports([]);

    try {
      if (reportType === "single") {
        const requests: Promise<MonthlyReportData>[] = [
          reportsApi.getMonthlyReport(selectedClassId, selectedMonth, selectedYear),
        ];

        if (reportFormat === "semester-1") {
          requests.push(
            ...SEMESTER_PREVIOUS_MONTHS.map((month) =>
              reportsApi.getMonthlyReport(selectedClassId, month, selectedYear)
            )
          );
        }

        const [report, ...previousReports] = await Promise.all(requests);

        setReportData(report);
        setSemesterSourceReports(previousReports);
        console.log("✅ Report loaded");
      } else {
        const requests: Promise<MonthlyReportData>[] = [
          reportsApi.getGradeWideReport(selectedGrade, selectedMonth, selectedYear),
        ];

        if (reportFormat === "semester-1") {
          requests.push(
            ...SEMESTER_PREVIOUS_MONTHS.map((month) =>
              reportsApi.getGradeWideReport(selectedGrade, month, selectedYear)
            )
          );
        }

        const [data, ...previousReports] = await Promise.all(requests);
        setReportData(data);
        setSemesterSourceReports(previousReports);
        console.log("✅ Grade-wide report loaded");
      }
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Proactively refresh classes if empty
  useEffect(() => {
    if (
      isAuthenticated &&
      !authLoading &&
      classes.length === 0 &&
      !isLoadingClasses
    ) {
      console.log("📚 Classes array is empty, fetching classes...");
      refreshClasses();
    }
  }, [
    isAuthenticated,
    authLoading,
    classes.length,
    isLoadingClasses,
    refreshClasses,
  ]);

  // Auto-update exam session when month/year changes
  useEffect(() => {
    setExamSession(
      `សប្តាហ៍ទី ១២៖ ខែ${getMonthDisplayName(selectedMonth)} ${selectedYear}-${selectedYear + 1}`
    );
  }, [selectedMonth, selectedYear]);

  // Reset selections when report type changes
  useEffect(() => {
    setSelectedClassId("");
    setSelectedGrade("");
    setReportData(null);
  }, [reportType]);

  // Auto-update date
  useEffect(() => {
    if (useAutoDate) {
      setReportDate(formatReportDate(schoolName));
    }
  }, [useAutoDate, schoolName]);

  // Auto-adjust settings when report format changes
  useEffect(() => {
    if (reportFormat === "detailed") {
      setShowSubjects(true);
      setTableFontSize(10);
      setFirstPageStudentCount(37);
      setReportTitle("តារាងលទ្ធផលប្រចាំខែ");
    } else if (reportFormat === "semester-1") {
      setSelectedMonth("កុម្ភៈ");
      setShowSubjects(false);
      setTableFontSize(10);
      setFirstPageStudentCount(28);
      setSecondPageStudentCount(36);
      setReportTitle("តារាងលទ្ធផលប្រចាំឆមាសទី១");
    } else {
      setShowSubjects(false);
      setTableFontSize(10);
      setFirstPageStudentCount(28);
      setSecondPageStudentCount(36);
      setReportTitle("តារាងលទ្ធផលប្រចាំខែ");
    }
  }, [reportFormat]);

  // ✅ Sort subjects based on grade level - MUST be before any early returns!
  const sortedSubjects = useMemo(() => {
    if (!reportData || !reportData.subjects) return [];
    const grade = reportData.grade;
    const sorted = sortSubjectsByOrder(reportData.subjects, grade);
    return sorted;
  }, [reportData]);

  // ✅ NEW: Get active (not hidden) subjects
  const activeSubjects = useMemo(() => {
    return sortedSubjects.filter(s => !hiddenSubjects.has(s.id));
  }, [sortedSubjects, hiddenSubjects]);

  // ✅ NEW: Reset hidden subjects when report data changes
  useEffect(() => {
    setHiddenSubjects(new Set());
  }, [reportData]);

  // ✅ NEW: Calculate grade level from average
  const calculateGradeLevel = (average: number): string => {
    if (average >= 45) return "A";
    if (average >= 40) return "B";
    if (average >= 35) return "C";
    if (average >= 30) return "D";
    if (average >= 25) return "E";
    return "F";
  };

  const normalizeDigits = (value: string) => {
    const khmerDigitMap: Record<string, string> = {
      "០": "0",
      "១": "1",
      "២": "2",
      "៣": "3",
      "៤": "4",
      "៥": "5",
      "៦": "6",
      "៧": "7",
      "៨": "8",
      "៩": "9",
    };
    return value.replace(/[០-៩]/g, (digit) => khmerDigitMap[digit] || digit);
  };

  const reportGradeNumber = reportData?.grade
    ? parseInt(normalizeDigits(reportData.grade), 10)
    : NaN;
  const normalizedReportMonth = reportData?.month?.trim();
  const shouldUseSemesterOneEnglishRule =
    (normalizedReportMonth === "កុម្ភៈ" ||
      normalizedReportMonth === "ឆមាសទី១") &&
    (reportGradeNumber === 9 || reportGradeNumber === 12);

  const isEnglishSubject = (subject: {
    code?: string;
    nameKh?: string;
    nameEn?: string;
    name?: string;
  }) => {
    const code = subject.code?.toUpperCase() || "";
    if (code.startsWith("ENG")) return true;

    const khmerName = `${subject.nameKh || ""}${subject.name || ""}`;
    if (khmerName.includes("អង់គ្លេស")) return true;

    const englishName = `${subject.nameEn || ""}${subject.name || ""}`.toLowerCase();
    return englishName.includes("english");
  };

  const calculateStudentSummary = (
    student: MonthlyReportData["students"][number],
    calculationSubjects: MonthlyReportData["subjects"]
  ) => {
    let totalScore = 0;
    let totalCoefficient = 0;
    let englishBonus = 0;

    calculationSubjects.forEach((subject) => {
      const score = student.grades[subject.id];
      if (score === null || score === undefined) return;

      if (shouldUseSemesterOneEnglishRule && isEnglishSubject(subject)) {
        englishBonus += Math.max(score - 25, 0);
        return;
      }

      totalScore += score;
      totalCoefficient += subject.coefficient;
    });

    const adjustedTotalScore = totalScore + englishBonus;
    const average =
      totalCoefficient > 0 ? adjustedTotalScore / totalCoefficient : 0;

    return {
      totalScore: adjustedTotalScore,
      average,
      gradeLevel: calculateGradeLevel(average),
    };
  };

  // ✅ NEW: Toggle subject visibility
  const toggleSubject = (subjectId: string) => {
    setHiddenSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  // ✅ NEW: Show all subjects
  const showAllSubjectsHandler = () => {
    setHiddenSubjects(new Set());
  };

  // ✅ NEW: Hide all subjects
  const hideAllSubjectsHandler = () => {
    setHiddenSubjects(new Set(sortedSubjects.map(s => s.id)));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const classOptions = isLoadingClasses
    ? [{ value: "", label: "កំពុងផ្ទុក... - Loading..." }]
    : [
        { value: "", label: "ជ្រើសរើសថ្នាក់" },
        ...availableClasses.map((c) => ({ value: c.id, label: c.name })),
      ];

  const yearOptions = getAcademicYearOptionsCustom(2, 2);

  const selectedClass =
    reportData && reportType === "single"
      ? {
          id: reportData.classId!,
          name: reportData.className!,
          grade: reportData.grade!,
        }
      : reportData && reportType === "grade-wide"
      ? {
          id: "grade-wide",
          name: `ថ្នាក់ទី${reportData.grade}`,
          grade: reportData.grade!,
        }
      : null;

  // Transform API data - use activeSubjects (filtered subjects) and recalculate if needed
  const studentReports = reportData
    ? (() => {
        // If no subjects are hidden, use original data
        if (hiddenSubjects.size === 0) {
          const transformedStudents = reportData.students.map((student) => {
            const gradesArray = sortedSubjects.map((subject) => {
              const score = student.grades[subject.id];
              return {
                id: `grade_${student.studentId}_${subject.id}`,
                studentId: student.studentId,
                subjectId: subject.id,
                score: score,
                month: reportData.month,
              };
            });

            const calculatedSummary = shouldUseSemesterOneEnglishRule
              ? calculateStudentSummary(student, sortedSubjects)
              : null;

            return {
              student: {
                id: student.studentId,
                lastName: student.studentName.split(" ")[0] || "",
                firstName: student.studentName.split(" ").slice(1).join(" ") || "",
                gender: student.gender.toLowerCase() as "male" | "female",
                dateOfBirth: "",
                className: student.className || "",
              },
              grades: gradesArray,
              total: calculatedSummary
                ? calculatedSummary.totalScore
                : parseFloat(student.totalScore),
              average: calculatedSummary
                ? calculatedSummary.average
                : parseFloat(student.average),
              letterGrade: calculatedSummary
                ? calculatedSummary.gradeLevel
                : student.gradeLevel,
              rank: student.rank,
              absent: student.absent,
              permission: student.permission,
            };
          });

          if (!shouldUseSemesterOneEnglishRule) {
            return transformedStudents;
          }

          const sorted = [...transformedStudents].sort(
            (a, b) => b.average - a.average
          );
          return transformedStudents.map((student) => ({
            ...student,
            rank:
              sorted.findIndex((s) => s.student.id === student.student.id) + 1,
          }));
        }

        // Recalculate with filtered subjects
        const recalculated = reportData.students.map((student) => {
          const calculatedSummary = calculateStudentSummary(
            student,
            activeSubjects
          );

          // Build grades array with only active subjects
          const gradesArray = activeSubjects.map((subject) => {
            const score = student.grades[subject.id];
            return {
              id: `grade_${student.studentId}_${subject.id}`,
              studentId: student.studentId,
              subjectId: subject.id,
              score: score,
              month: reportData.month,
            };
          });

          return {
            student: {
              id: student.studentId,
              lastName: student.studentName.split(" ")[0] || "",
              firstName: student.studentName.split(" ").slice(1).join(" ") || "",
              gender: student.gender.toLowerCase() as "male" | "female",
              dateOfBirth: "",
                className: student.className || "",
              },
              grades: gradesArray,
              total: calculatedSummary.totalScore,
              average: calculatedSummary.average,
              letterGrade: calculatedSummary.gradeLevel,
              rank: 0, // Will be recalculated
              absent: student.absent,
              permission: student.permission,
            };
        });

        // Recalculate ranks based on new averages
        const sorted = [...recalculated].sort((a, b) => b.average - a.average);
        return recalculated.map((student) => {
          const rankIndex = sorted.findIndex(s => s.student.id === student.student.id);
          return {
            ...student,
            rank: rankIndex + 1,
          };
        });
      })()
    : [];

  // Sort reports
  const sortedReports = [...studentReports].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "rank" || sortBy === "average") {
      comparison = b.average - a.average;
    } else if (sortBy === "name") {
      const nameA = `${a.student.lastName} ${a.student.firstName}`;
      const nameB = `${b.student.lastName} ${b.student.firstName}`;
      comparison = nameA.localeCompare(nameB, "km");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const semesterReports: SemesterReportRow[] =
    reportData && reportFormat === "semester-1"
      ? (() => {
          const previousMonthAverageMaps = semesterSourceReports.map((monthData) => {
            const map = new Map<string, number>();
            monthData.students.forEach((student) => {
              const avg = parseFloat(student.average);
              map.set(student.studentId, Number.isFinite(avg) ? avg : 0);
            });
            return map;
          });

          const rows = reportData.students.map((student) => {
            const preMonthAverages = previousMonthAverageMaps
              .map((monthMap) => monthMap.get(student.studentId))
              .filter((avg): avg is number => avg !== undefined);

            const preSemesterAverage =
              preMonthAverages.length > 0
                ? preMonthAverages.reduce((sum, value) => sum + value, 0) /
                  preMonthAverages.length
                : 0;

            const calculatedSummary = shouldUseSemesterOneEnglishRule
              ? calculateStudentSummary(student, sortedSubjects)
              : null;
            const examAverageRaw = calculatedSummary
              ? calculatedSummary.average
              : parseFloat(student.average);
            const examTotalRaw = calculatedSummary
              ? calculatedSummary.totalScore
              : parseFloat(student.totalScore);
            const examAverage = Number.isFinite(examAverageRaw) ? examAverageRaw : 0;
            const examTotal = Number.isFinite(examTotalRaw) ? examTotalRaw : 0;
            const finalAverage = (preSemesterAverage + examAverage) / 2;

            return {
              student: {
                id: student.studentId,
                lastName: student.studentName.split(" ")[0] || "",
                firstName: student.studentName.split(" ").slice(1).join(" ") || "",
                gender: student.gender.toLowerCase() as "male" | "female",
                className: student.className || "",
              },
              permission: student.permission || 0,
              absent: student.absent || 0,
              totalAbsent: (student.permission || 0) + (student.absent || 0),
              preSemesterAverage,
              preSemesterRank: 0,
              examTotal,
              examAverage,
              examRank: 0,
              finalAverage,
              finalRank: 0,
              finalGrade: calculateGradeLevel(finalAverage),
            };
          });

          const preSemesterSorted = [...rows].sort(
            (a, b) => b.preSemesterAverage - a.preSemesterAverage
          );
          const examSorted = [...rows].sort((a, b) => b.examAverage - a.examAverage);
          const finalSorted = [...rows].sort((a, b) => b.finalAverage - a.finalAverage);

          const rankedRows = rows.map((row) => ({
            ...row,
            preSemesterRank:
              preSemesterSorted.findIndex((s) => s.student.id === row.student.id) + 1,
            examRank: examSorted.findIndex((s) => s.student.id === row.student.id) + 1,
            finalRank: finalSorted.findIndex((s) => s.student.id === row.student.id) + 1,
          }));

          return [...rankedRows].sort((a, b) => {
            let comparison = 0;
            if (sortBy === "name") {
              const nameA = `${a.student.lastName} ${a.student.firstName}`;
              const nameB = `${b.student.lastName} ${b.student.firstName}`;
              comparison = nameA.localeCompare(nameB, "km");
            } else if (sortBy === "average") {
              comparison = b.finalAverage - a.finalAverage;
            } else {
              comparison = a.finalRank - b.finalRank;
            }
            return sortOrder === "asc" ? comparison : -comparison;
          });
        })()
      : [];

  // Transform subjects - use activeSubjects when subjects are hidden
  const subjects = (hiddenSubjects.size > 0 ? activeSubjects : sortedSubjects).map((s) => ({
    id: s.id,
    name: s.nameKh,
    code: s.code,
    nameKh: s.nameKh,
    nameEn: s.nameEn || "",
    maxScore: s.maxScore,
    coefficient: s.coefficient,
  }));

  // ✅ Dynamic pagination for BOTH formats
  const paginatedReports =
    reportFormat === "detailed"
      ? paginateReports(
          sortedReports,
          {
            subjectCount: subjects.length,
            hasAttendance: showAttendance,
            hasClassName: reportType === "grade-wide" && showClassName,
            isFirstPage: true,
            tableFontSize: tableFontSize,
          },
          firstPageStudentCount,
          secondPageStudentCount
        )
      : (() => {
          const pages = [];
          if (sortedReports.length > 0) {
            pages.push(sortedReports.slice(0, firstPageStudentCount));
            for (
              let i = firstPageStudentCount;
              i < sortedReports.length;
              i += secondPageStudentCount
            ) {
              pages.push(sortedReports.slice(i, i + secondPageStudentCount));
            }
          }
          return pages;
        })();

  const semesterPaginatedReports: SemesterReportRow[][] = (() => {
    const pages: SemesterReportRow[][] = [];
    if (semesterReports.length > 0) {
      pages.push(semesterReports.slice(0, firstPageStudentCount));
      for (
        let i = firstPageStudentCount;
        i < semesterReports.length;
        i += secondPageStudentCount
      ) {
        pages.push(semesterReports.slice(i, i + secondPageStudentCount));
      }
    }
    return pages;
  })();

  const exportToExcel = () => {
    const data =
      reportFormat === "semester-1"
        ? semesterReports.map((report, index) => {
            const row: any = {
              "ល. រ": index + 1,
              "គោត្តនាម និងនាម": `${report.student.lastName} ${report.student.firstName}`,
            };

            if (reportType === "grade-wide" && showClassName) {
              row["ថ្នាក់"] = report.student.className;
            }

            row["អវត្តមានច"] = report.permission;
            row["អវត្តមានអច្ប"] = report.absent;
            row["អវត្តមានសរុប"] = report.totalAbsent;
            row["លទ្ធផលមុនឆមាស ម.ភាគ"] = report.preSemesterAverage.toFixed(2);
            row["លទ្ធផលមុនឆមាស ចំ.ថ្នាក់"] = report.preSemesterRank;
            row["ប្រឡងឆមាស ពិន្ទុសរុប"] = report.examTotal.toFixed(0);
            row["ប្រឡងឆមាស ម.ភាគ"] = report.examAverage.toFixed(2);
            row["ប្រឡងឆមាស ចំ.ថ្នាក់"] = report.examRank;
            row["លទ្ធផលប្រចាំឆមាស ម.ភាគ"] = report.finalAverage.toFixed(2);
            row["លទ្ធផលប្រចាំឆមាស ចំ.ថ្នាក់"] = report.finalRank;
            row["លទ្ធផលប្រចាំឆមាស និទ្ទេស"] = report.finalGrade;

            return row;
          })
        : sortedReports.map((report, index) => {
            const row: any = {
              "ល.  រ": index + 1,
              "គោត្តនាម និងនាម": `${report.student.lastName} ${report.student.firstName}`,
              ភេទ: report.student.gender === "male" ? "ប្រុស" : "ស្រី",
            };

            if (reportType === "grade-wide" && showClassName) {
              row["ថ្នាក់"] = report.student.className;
            }

            if (reportFormat === "detailed") {
              subjects.forEach((subject) => {
                const grade = report.grades.find((g) => g.subjectId === subject.id);
                row[subject.name] = grade?.score || "-";
              });
            }

            if (showAttendance) {
              row["អវត្តមានមានច្បាប់"] = report.permission;
              row["អវត្តមានអត់ច្បាប់"] = report.absent;
              row["អវត្តមានសរុប"] = report.permission + report.absent;
            }

            if (showTotal) row["ពិន្ទុសរុប"] = report.total.toFixed(2);
            if (showAverage) row["មធ្យមភាគ"] = report.average.toFixed(2);
            if (showRank) row["ចំណាត់ថ្នាក់"] = `#${report.rank}`;
            if (showGradeLevel) row["និទ្ទេស"] = report.letterGrade;

            return row;
          });

    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => row[h]).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    const fileName =
      reportType === "single"
        ? `របាយការណ៍_${reportData?.className}_${getMonthDisplayName(selectedMonth)}_${selectedYear}.csv`
        : `របាយការណ៍_ថ្នាក់ទី${reportData?.grade}_${getMonthDisplayName(selectedMonth)}_${selectedYear}.csv`;

    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen print-wrapper bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ✅ UPDATED: Print CSS - Hide everything except report */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm 3mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            height: auto !important;
            overflow: visible !important;
          }

          /* ✅ Completely remove hidden elements from print flow */
          .no-print,
          .print-hide {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            left: -9999px !important;
          }

          /* ✅ Show only the report - override hidden class */
          .print-show {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            height: auto !important;
            width: 100% !important;
          }

          /* ✅ Reset the entire page structure for print */
          .print-wrapper {
            display: block !important;
            background: white !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-wrapper > * {
            display: none !important;
          }

          .print-wrapper .print-show {
            display: block !important;
          }

          /* ✅ Override flex layout on print */
          .flex-1.flex.flex-col,
          .flex-1 {
            display: block !important;
            height: auto !important;
            width: 100% !important;
          }

          main {
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="no-print flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="no-print">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto min-h-0 p-6 animate-fadeIn">
          {/* Professional Page Header */}
          <div className="mb-6 no-print">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  របាយការណ៍ប្រចាំខែ
                </h1>
                <p className="text-gray-600 font-medium">Monthly Report</p>
              </div>
            </div>
          </div>

          {/* Clean Controls Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 no-print">
            {/* ...  existing controls (same as before) ... */}
            {/* I'll keep this section unchanged for brevity */}

            {/* Report Format Selector */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ទម្រង់របាយការណ៍ Report Format
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setReportFormat("summary")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportFormat === "summary"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  សង្ខេប (Summary)
                </button>
                <button
                  onClick={() => setReportFormat("detailed")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportFormat === "detailed"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  លម្អិតមុខវិជ្ជា (Details)
                </button>
                <button
                  onClick={() => setReportFormat("semester-1")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportFormat === "semester-1"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  ឆមាសទី១
                </button>
              </div>
            </div>

            {/* Report Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ប្រភេទរបាយការណ៍ Report Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setReportType("single")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportType === "single"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover: bg-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  តាមថ្នាក់នីមួយៗ
                </button>
                <button
                  onClick={() => setReportType("grade-wide")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportType === "grade-wide"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  រួមទាំងកម្រិតថ្នាក់
                </button>
              </div>
            </div>

            {/* Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {reportType === "single" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ថ្នាក់ Class
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={isLoadingClasses}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    កម្រិតថ្នាក់ Grade Level
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover: border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {gradeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ខែ Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={reportFormat === "semester-1"}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus: ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ឆ្នាំ Year
                </label>
                <select
                  value={selectedYear.toString()}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  បង្កើតរបាយការណ៍
                </label>
                <button
                  onClick={fetchReport}
                  disabled={
                    loading ||
                    (reportType === "single" && !selectedClassId) ||
                    (reportType === "grade-wide" && !selectedGrade)
                  }
                  className="w-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>កំពុងផ្ទុក... </span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>បង្កើត</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Settings & Actions */}
            {((reportType === "single" && selectedClassId) ||
              (reportType === "grade-wide" && selectedGrade)) &&
              reportData && (
                <div className="border-t pt-4 space-y-4">
                  <MonthlyReportSettings
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    province={province}
                    setProvince={setProvince}
                    examCenter={examCenter}
                    setExamCenter={setExamCenter}
                    schoolName={schoolName}
                    setSchoolName={setSchoolName}
                    roomNumber={roomNumber}
                    setRoomNumber={setRoomNumber}
                    reportTitle={reportTitle}
                    setReportTitle={setReportTitle}
                    examSession={examSession}
                    setExamSession={setExamSession}
                    reportDate={reportDate}
                    setReportDate={setReportDate}
                    teacherName={teacherName}
                    setTeacherName={setTeacherName}
                    principalName={principalName}
                    setPrincipalName={setPrincipalName}
                    showCircles={showCircles}
                    setShowCircles={setShowCircles}
                    autoCircle={autoCircle}
                    setAutoCircle={setAutoCircle}
                    showDateOfBirth={showDateOfBirth}
                    setShowDateOfBirth={setShowDateOfBirth}
                    showGrade={showGrade}
                    setShowGrade={setShowGrade}
                    showOther={showOther}
                    setShowOther={setShowOther}
                    showSubjects={showSubjects}
                    setShowSubjects={
                      reportFormat === "summary" ? setShowSubjects : () => {}
                    }
                    showAttendance={showAttendance}
                    setShowAttendance={setShowAttendance}
                    showTotal={showTotal}
                    setShowTotal={setShowTotal}
                    showAverage={showAverage}
                    setShowAverage={setShowAverage}
                    showGradeLevel={showGradeLevel}
                    setShowGradeLevel={setShowGradeLevel}
                    showRank={showRank}
                    setShowRank={setShowRank}
                    showRoomNumber={showRoomNumber}
                    setShowRoomNumber={setShowRoomNumber}
                    showClassName={
                      reportType === "grade-wide" ? showClassName : undefined
                    }
                    setShowClassName={
                      reportType === "grade-wide" ? setShowClassName : undefined
                    }
                    firstPageStudentCount={firstPageStudentCount}
                    setFirstPageStudentCount={setFirstPageStudentCount}
                    secondPageStudentCount={secondPageStudentCount}
                    setSecondPageStudentCount={setSecondPageStudentCount}
                    tableFontSize={tableFontSize}
                    setTableFontSize={setTableFontSize}
                    useAutoDate={useAutoDate}
                    setUseAutoDate={setUseAutoDate}
                    reportFormat={reportFormat}
                  />

                  {/* ✅ NEW: Subject Filter Section */}
                  {sortedSubjects.length > 0 &&
                    showSettings &&
                    reportFormat !== "semester-1" && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-khmer-body text-sm font-bold text-purple-800 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          ជ្រើសរើសមុខវិជ្ជា Subject Selection
                          {hiddenSubjects.size > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                              {activeSubjects.length}/{sortedSubjects.length}
                            </span>
                          )}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={showAllSubjectsHandler}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-khmer-body text-xs font-bold hover:bg-green-200 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            បង្ហាញទាំងអស់
                          </button>
                          <button
                            onClick={hideAllSubjectsHandler}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-khmer-body text-xs font-bold hover:bg-red-200 transition-all"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            លាក់ទាំងអស់
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {sortedSubjects.map((subject) => {
                          const isActive = !hiddenSubjects.has(subject.id);
                          return (
                            <button
                              key={subject.id}
                              onClick={() => toggleSubject(subject.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                                isActive
                                  ? "bg-white border-2 border-green-400 text-green-800 shadow-sm"
                                  : "bg-gray-100 border-2 border-gray-200 text-gray-400"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                isActive ? "bg-green-500" : "bg-gray-300"
                              }`}>
                                <Check className={`w-3.5 h-3.5 text-white ${isActive ? "" : "opacity-0"}`} />
                              </div>
                              <span className="font-khmer-body text-xs font-bold truncate">
                                {subject.nameKh}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {hiddenSubjects.size > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="font-khmer-body text-xs text-amber-700">
                            <strong>ចំណាំ:</strong> ពិន្ទុសរុប មធ្យមភាគ កម្រិត និង ចំណាត់ថ្នាក់ ត្រូវបានគណនាឡើងវិញដោយផ្អែកលើ {activeSubjects.length} មុខវិជ្ជាដែលបានជ្រើសរើសប៉ុណ្ណោះ
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-10 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="rank">តម្រៀបតាមចំណាត់ថ្នាក់</option>
                        <option value="name">តម្រៀបតាមឈ្មោះ</option>
                        <option value="average">តម្រៀបតាមមធ្យមភាគ</option>
                      </select>

                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="h-10 px-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-indigo-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortOrder === "asc" ? "ឡើង" : "ចុះ"}
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePrint}
                        className="h-10 px-6 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover: border-indigo-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        បោះពុម្ព
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="h-10 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm mb-6 no-print">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">មានបញ្ហា</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Detailed Report Section - SHOW ON PRINT */}
          {reportData && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden print-hide">
              <button
                onClick={() => setShowDetailedReport(!showDetailedReport)}
                className="w-full p-5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 flex items-center justify-between transition-colors border-b-2 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black text-gray-900 block">
                      📄 របាយការណ៍លម្អិត
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      Detailed Report - Print Ready
                    </span>
                  </div>
                </div>
                {showDetailedReport ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>
              {showDetailedReport && (
                <div ref={reportRef}>
                  {reportFormat === "summary" ? (
                    <KhmerMonthlyReport
                      paginatedReports={paginatedReports}
                      selectedClass={selectedClass}
                      subjects={subjects}
                      province={province}
                      examCenter={examCenter}
                      roomNumber={roomNumber}
                      reportTitle={reportTitle}
                      examSession={examSession}
                      reportDate={reportDate}
                      teacherName={reportData?.teacherName || teacherName}
                      principalName={principalName}
                      showCircles={showCircles}
                      autoCircle={autoCircle}
                      showDateOfBirth={showDateOfBirth}
                      showGrade={showGrade}
                      showOther={showOther}
                      studentsPerPage={studentsPerPage}
                      firstPageStudentCount={firstPageStudentCount}
                      tableFontSize={tableFontSize}
                      getSubjectAbbr={getSubjectAbbr}
                      showSubjects={showSubjects}
                      showAttendance={showAttendance}
                      showTotal={showTotal}
                      showAverage={showAverage}
                      showGradeLevel={showGradeLevel}
                      showRank={showRank}
                      showRoomNumber={showRoomNumber}
                      selectedYear={selectedYear}
                      isGradeWide={reportType === "grade-wide"}
                      showClassName={showClassName}
                    />
                  ) : reportFormat === "detailed" ? (
                    <SubjectDetailsReport
                      paginatedReports={paginatedReports}
                      selectedClass={selectedClass}
                      subjects={subjects}
                      province={province}
                      examCenter={examCenter}
                      roomNumber={roomNumber}
                      reportTitle={reportTitle}
                      examSession={examSession}
                      reportDate={reportDate}
                      teacherName={reportData?.teacherName || teacherName}
                      principalName={principalName}
                      showCircles={showCircles}
                      autoCircle={autoCircle}
                      studentsPerPage={studentsPerPage}
                      firstPageStudentCount={firstPageStudentCount}
                      tableFontSize={tableFontSize}
                      showAttendance={showAttendance}
                      showTotal={showTotal}
                      showAverage={showAverage}
                      showGradeLevel={showGradeLevel}
                      showRank={showRank}
                      selectedYear={selectedYear}
                      isGradeWide={reportType === "grade-wide"}
                      showClassName={showClassName}
                      selectedMonth={getMonthDisplayName(selectedMonth)}
                    />
                  ) : (
                    <KhmerSemesterOneReport
                      paginatedReports={semesterPaginatedReports}
                      selectedClass={selectedClass}
                      province={province}
                      examCenter={examCenter}
                      reportTitle={reportTitle}
                      reportDate={reportDate}
                      teacherName={reportData?.teacherName || teacherName}
                      principalName={principalName}
                      selectedYear={selectedYear}
                      isGradeWide={reportType === "grade-wide"}
                      showClassName={showClassName}
                      firstPageStudentCount={firstPageStudentCount}
                      studentsPerPage={studentsPerPage}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ Print-Only Version (Hidden on screen, shown on print) */}
          {reportData && (
            <div className="hidden print-show">
              {reportFormat === "summary" ? (
                <KhmerMonthlyReport
                  paginatedReports={paginatedReports}
                  selectedClass={selectedClass}
                  subjects={subjects}
                  province={province}
                  examCenter={examCenter}
                  roomNumber={roomNumber}
                  reportTitle={reportTitle}
                  examSession={examSession}
                  reportDate={reportDate}
                  teacherName={reportData?.teacherName || teacherName}
                  principalName={principalName}
                  showCircles={showCircles}
                  autoCircle={autoCircle}
                  showDateOfBirth={showDateOfBirth}
                  showGrade={showGrade}
                  showOther={showOther}
                  studentsPerPage={studentsPerPage}
                  firstPageStudentCount={firstPageStudentCount}
                  tableFontSize={tableFontSize}
                  getSubjectAbbr={getSubjectAbbr}
                  showSubjects={showSubjects}
                  showAttendance={showAttendance}
                  showTotal={showTotal}
                  showAverage={showAverage}
                  showGradeLevel={showGradeLevel}
                  showRank={showRank}
                  showRoomNumber={showRoomNumber}
                  selectedYear={selectedYear}
                  isGradeWide={reportType === "grade-wide"}
                  showClassName={showClassName}
                />
              ) : reportFormat === "detailed" ? (
                <SubjectDetailsReport
                  paginatedReports={paginatedReports}
                  selectedClass={selectedClass}
                  subjects={subjects}
                  province={province}
                  examCenter={examCenter}
                  roomNumber={roomNumber}
                  reportTitle={reportTitle}
                  examSession={examSession}
                  reportDate={reportDate}
                  teacherName={reportData?.teacherName || teacherName}
                  principalName={principalName}
                  showCircles={showCircles}
                  autoCircle={autoCircle}
                  studentsPerPage={studentsPerPage}
                  firstPageStudentCount={firstPageStudentCount}
                  tableFontSize={tableFontSize}
                  showAttendance={showAttendance}
                  showTotal={showTotal}
                  showAverage={showAverage}
                  showGradeLevel={showGradeLevel}
                  showRank={showRank}
                  selectedYear={selectedYear}
                  isGradeWide={reportType === "grade-wide"}
                  showClassName={showClassName}
                  selectedMonth={getMonthDisplayName(selectedMonth)}
                />
              ) : (
                <KhmerSemesterOneReport
                  paginatedReports={semesterPaginatedReports}
                  selectedClass={selectedClass}
                  province={province}
                  examCenter={examCenter}
                  reportTitle={reportTitle}
                  reportDate={reportDate}
                  teacherName={reportData?.teacherName || teacherName}
                  principalName={principalName}
                  selectedYear={selectedYear}
                  isGradeWide={reportType === "grade-wide"}
                  showClassName={showClassName}
                  firstPageStudentCount={firstPageStudentCount}
                  studentsPerPage={studentsPerPage}
                />
              )}
            </div>
          )}

          {/* Empty State */}
          {!(
            (reportType === "single" && selectedClassId) ||
            (reportType === "grade-wide" && selectedGrade)
          ) &&
            !loading && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  សូមជ្រើសរើស
                  {reportType === "single" ? "ថ្នាក់" : "កម្រិតថ្នាក់"}
                  ដើម្បីមើលរបាយការណ៍
                </p>
                <p className="text-gray-500">
                  Please select a{" "}
                  {reportType === "single" ? "class" : "grade level"} to view
                  the report
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import {
  reportsApi,
  type MonthlyReportData,
  type MonthlyStatisticsData,
} from "@/lib/api/reports";
import { formatReportDate } from "@/lib/khmerDateUtils";
import { paginateReports } from "@/lib/reportPagination";
import { sortSubjectsByOrder } from "@/lib/subjectOrder";

// Import existing components
import KhmerMonthlyReport from "@/components/reports/KhmerMonthlyReport";
import SubjectDetailsReport from "@/components/reports/SubjectDetailsReport";
import MonthlyReportSettings from "@/components/reports/MonthlyReportSettings";
import MonthlyStatisticsDashboard from "@/components/reports/MonthlyStatisticsDashboard";

// Helper functions
import {
  getSubjectAbbr,
  monthOptions,
  getCurrentKhmerMonth,
} from "@/lib/reportHelpers";

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes } = useData();
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
  const [reportFormat, setReportFormat] = useState<"summary" | "detailed">(
    "summary"
  );
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [statisticsData, setStatisticsData] =
    useState<MonthlyStatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: Collapsible sections
  const [showStatistics, setShowStatistics] = useState(true);
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

  const reportRef = useRef<HTMLDivElement>(null);

  // Get unique grades from available classes
  const grades = Array.from(new Set(availableClasses.map((c) => c.grade))).sort();
  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសកម្រិតថ្នាក់" },
    ...grades.map((g) => ({ value: g, label: `ថ្នាក់ទី${g} ទាំងអស់` })),
  ];

  // ✅ UPDATED:  Fetch report data AND statistics from API
  const fetchReport = async () => {
    if (reportType === "single" && !selectedClassId) return;
    if (reportType === "grade-wide" && !selectedGrade) return;

    setLoading(true);
    setError(null);
    setReportData(null);
    setStatisticsData(null);

    try {
      console.log("📊 Fetching report and statistics...");

      if (reportType === "single") {
        // ✅ Fetch both report and statistics in parallel
        const [report, stats] = await Promise.all([
          reportsApi.getMonthlyReport(
            selectedClassId,
            selectedMonth,
            selectedYear
          ),
          reportsApi.getMonthlyStatistics(
            selectedClassId,
            selectedMonth,
            selectedYear
          ),
        ]);

        setReportData(report);
        setStatisticsData(stats);
        console.log("✅ Report and statistics loaded");
      } else {
        // For grade-wide, only fetch report (no statistics endpoint yet)
        const data = await reportsApi.getGradeWideReport(
          selectedGrade,
          selectedMonth,
          selectedYear
        );
        setReportData(data);
        console.log("✅ Grade-wide report loaded");
      }
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-update exam session when month/year changes
  useEffect(() => {
    setExamSession(
      `សប្តាហ៍ទី ១២៖ ខែ${selectedMonth} ${selectedYear}-${selectedYear + 1}`
    );
  }, [selectedMonth, selectedYear]);

  // Reset selections when report type changes
  useEffect(() => {
    setSelectedClassId("");
    setSelectedGrade("");
    setReportData(null);
    setStatisticsData(null);
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
      setFirstPageStudentCount(35);
      setReportTitle("តារាងលទ្ធផលប្រចាំខែ");
    } else {
      setShowSubjects(false);
      setTableFontSize(10);
      setFirstPageStudentCount(28);
      setSecondPageStudentCount(36);
      setReportTitle("តារាងលទ្ធផលប្រចាំខែ");
    }
  }, [reportFormat]);

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

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់" },
    ...availableClasses.map((c) => ({ value: c.id, label: c.name })),
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

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

  // ✅ Sort subjects based on grade level
  const sortedSubjects = useMemo(() => {
    if (!reportData || !reportData.subjects) return [];
    const grade = reportData.grade;
    const sorted = sortSubjectsByOrder(reportData.subjects, grade);
    return sorted;
  }, [reportData]);

  // Transform API data - use sortedSubjects
  const studentReports = reportData
    ? reportData.students.map((student) => {
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
          total: parseFloat(student.totalScore),
          average: parseFloat(student.average),
          letterGrade: student.gradeLevel,
          rank: student.rank,
          absent: student.absent,
          permission: student.permission,
        };
      })
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

  // Transform subjects - use sortedSubjects
  const subjects = sortedSubjects.map((s) => ({
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

  const exportToExcel = () => {
    const data = sortedReports.map((report, index) => {
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
        ? `របាយការណ៍_${reportData?.className}_${selectedMonth}_${selectedYear}.csv`
        : `របាយការណ៍_ថ្នាក់ទី${reportData?.grade}_${selectedMonth}_${selectedYear}.csv`;

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
    <div className="flex min-h-screen print-wrapper bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ✅ UPDATED: Print CSS - Hide everything except report */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: ${reportFormat === "detailed" ? "8mm" : "0"};
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* ✅ Hide sidebar, header, controls, and dashboard */
          .no-print,
          .print-hide {
            display: none !important;
          }

          /* ✅ Show only the report */
          .print-show {
            display: block !important;
          }

          /* ✅ Ensure report takes full width */
          .print-wrapper {
            background: white !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Sidebar />
      </div>
      <div className="flex-1">
        <div className="no-print">
          <Header />
        </div>
        <main className="p-6 animate-fadeIn">
          {/* Professional Page Header */}
          <div className="mb-6 no-print">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  របាយការណ៍ប្រចាំខែ
                </h1>
                <p className="text-gray-600 font-medium">
                  Monthly Report - Grade & Attendance Summary
                </p>
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
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus: ring-indigo-500 focus:border-transparent"
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

          {/* ✅ Statistics Dashboard Section - HIDE ON PRINT */}
          {statisticsData && reportType === "single" && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6 print-hide">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="w-full p-5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 flex items-center justify-between transition-colors border-b-2 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black text-gray-900 block">
                      📊 ស្ថិតិ និង វិភាគ
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      Statistics & Analysis Dashboard
                    </span>
                  </div>
                </div>
                {showStatistics ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>
              {showStatistics && (
                <div className="p-6">
                  <MonthlyStatisticsDashboard data={statisticsData} />
                </div>
              )}
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
                      teacherName={teacherName}
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
                  ) : (
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
                      teacherName={teacherName}
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
                      selectedMonth={selectedMonth}
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
                  teacherName={teacherName}
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
              ) : (
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
                  teacherName={teacherName}
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
                  selectedMonth={selectedMonth}
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

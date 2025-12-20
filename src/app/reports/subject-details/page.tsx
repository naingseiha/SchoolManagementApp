"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  BookOpen,
} from "lucide-react";
import { reportsApi, type MonthlyReportData } from "@/lib/api/reports";
import { formatReportDate } from "@/lib/khmerDateUtils";

// Import components
import SubjectDetailsReport from "@/components/reports/SubjectDetailsReport";
import MonthlyReportSettings from "@/components/reports/MonthlyReportSettings";

// Helper functions
import {
  getSubjectAbbr,
  monthOptions,
  getCurrentKhmerMonth,
} from "@/lib/reportHelpers";

export default function SubjectDetailsReportPage() {
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
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [reportTitle, setReportTitle] = useState(
    "តារាងលទ្ធផលប្រចាំខែ (បង្ហាញលម្អិតមុខវិជ្ជា)"
  );
  const [examSession, setExamSession] = useState(
    "សប្តាហ៍ទី ១២៖ ខែមករា ២០២៥-២០២៦"
  );
  const [principalName, setPrincipalName] = useState("នាយកសាលា");
  const [teacherName, setTeacherName] = useState("គ្រូបន្ទុកថ្នាក់");
  const [reportDate, setReportDate] = useState(
    "ថ្ងៃទី.   ....    ខែ.  ....  ឆ្នាំ២០២៥"
  );
  const [autoCircle, setAutoCircle] = useState(true);
  const [showCircles, setShowCircles] = useState(true);
  const [studentsPerPage] = useState(20);
  const [firstPageStudentCount, setFirstPageStudentCount] = useState(38);
  const [tableFontSize, setTableFontSize] = useState(8);
  const [useAutoDate, setUseAutoDate] = useState(true);

  // Column visibility - Force show subjects
  const [showDateOfBirth] = useState(false);
  const [showGrade] = useState(true);
  const [showOther] = useState(true);
  const [showSubjects] = useState(true); // ✅ Always true
  const [showAttendance, setShowAttendance] = useState(true);
  const [showTotal, setShowTotal] = useState(true);
  const [showAverage, setShowAverage] = useState(true);
  const [showGradeLevel, setShowGradeLevel] = useState(true);
  const [showRank, setShowRank] = useState(true);
  const [showRoomNumber, setShowRoomNumber] = useState(false);
  const [showClassName, setShowClassName] = useState(true);

  const reportRef = useRef<HTMLDivElement>(null);

  // Get unique grades from classes
  const grades = Array.from(new Set(availableClasses.map((c) => c.grade))).sort();
  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសកម្រិតថ្នាក់" },
    ...grades.map((g) => ({ value: g, label: `ថ្នាក់ទី${g} ទាំងអស់` })),
  ];

  // Fetch report data from API
  const fetchReport = async () => {
    if (reportType === "single" && !selectedClassId) return;
    if (reportType === "grade-wide" && !selectedGrade) return;

    setLoading(true);
    setError(null);
    try {
      let data;
      if (reportType === "single") {
        data = await reportsApi.getMonthlyReport(
          selectedClassId,
          selectedMonth,
          selectedYear
        );
      } else {
        data = await reportsApi.getGradeWideReport(
          selectedGrade,
          selectedMonth,
          selectedYear
        );
      }
      setReportData(data);
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
  }, [reportType]);

  // Auto-update date
  useEffect(() => {
    if (useAutoDate) {
      setReportDate(formatReportDate(schoolName));
    }
  }, [useAutoDate, schoolName]);

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

  // Transform API data
  const studentReports = reportData
    ? reportData.students.map((student) => {
        const gradesArray = reportData.subjects.map((subject) => {
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

  // Paginate reports
  const paginatedReports = [];
  if (sortedReports.length > 0) {
    paginatedReports.push(sortedReports.slice(0, firstPageStudentCount));
    for (
      let i = firstPageStudentCount;
      i < sortedReports.length;
      i += studentsPerPage
    ) {
      paginatedReports.push(sortedReports.slice(i, i + studentsPerPage));
    }
  }

  // Transform subjects
  const subjects = reportData
    ? reportData.subjects.map((s) => ({
        id: s.id,
        name: s.nameKh,
        code: s.code,
        nameKh: s.nameKh,
        nameEn: s.nameEn || "",
        maxScore: s.maxScore,
        coefficient: s.coefficient,
      }))
    : [];

  const exportToExcel = () => {
    const data = sortedReports.map((report, index) => {
      const row: any = {
        "ល. រ": index + 1,
        "គោត្តនាម និងនាម": `${report.student.lastName} ${report.student.firstName}`,
        ភេទ: report.student.gender === "male" ? "ប្រុស" : "ស្រី",
      };

      if (reportType === "grade-wide" && showClassName) {
        row["ថ្នាក់"] = report.student.className;
      }

      subjects.forEach((subject) => {
        const grade = report.grades.find((g) => g.subjectId === subject.id);
        row[subject.name] = grade?.score || "-";
      });

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
        ? `របាយការណ៍លម្អិត_${reportData?.className}_${selectedMonth}_${selectedYear}.csv`
        : `របាយការណ៍លម្អិត_ថ្នាក់ទី${reportData?.grade}_${selectedMonth}_${selectedYear}.csv`;

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
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
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
          {/* Page Header */}
          <div className="mb-6 no-print">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  របាយការណ៍លម្អិតមុខវិជ្ជា
                </h1>
                <p className="text-gray-600 font-medium">
                  Subject Details Report - All Subjects Display
                </p>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 no-print">
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
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  តាមថ្នាក់នីមួយៗ
                </button>
                <button
                  onClick={() => setReportType("grade-wide")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportType === "grade-wide"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
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
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full h-11 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
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
                    setShowDateOfBirth={() => {}}
                    showGrade={showGrade}
                    setShowGrade={() => {}}
                    showOther={showOther}
                    setShowOther={() => {}}
                    showSubjects={showSubjects}
                    setShowSubjects={() => {}} // Disabled - always true
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
                    tableFontSize={tableFontSize}
                    setTableFontSize={setTableFontSize}
                    useAutoDate={useAutoDate}
                    setUseAutoDate={setUseAutoDate}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-10 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="rank">តម្រៀបតាមចំណាត់ថ្នាក់</option>
                        <option value="name">តម្រៀបតាមឈ្មោះ</option>
                        <option value="average">តម្រៀបតាមមធ្យមភាគ</option>
                      </select>

                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="h-10 px-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-blue-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortOrder === "asc" ? "ឡើង" : "ចុះ"}
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePrint}
                        className="h-10 px-6 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-blue-400 hover:bg-gray-50 transition-all flex items-center gap-2"
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

          {/* Report Display */}
          {reportData && (
            <div ref={reportRef} className="animate-scaleIn">
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
            </div>
          )}

          {/* Empty State */}
          {!(
            (reportType === "single" && selectedClassId) ||
            (reportType === "grade-wide" && selectedGrade)
          ) &&
            !loading && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  សូមជ្រើសរើស
                  {reportType === "single" ? "ថ្នាក់" : "កម្រិតថ្នាក់"}
                  ដើម្បីមើលរបាយការណ៍
                </p>
                <p className="text-gray-500">
                  Please select a{" "}
                  {reportType === "single" ? "class" : "grade level"} to view
                  the subject details report
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

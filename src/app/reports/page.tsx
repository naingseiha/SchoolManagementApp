"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { calculateAverage, getLetterGrade } from "@/lib/gradeUtils";
import { GRADE_SCALE } from "@/lib/constants";
import { Printer, FileSpreadsheet, ArrowUpDown } from "lucide-react";

// Import components
import KhmerMonthlyReport from "@/components/reports/KhmerMonthlyReport";
import HonorTemplate1 from "@/components/reports/HonorTemplates/HonorTemplate1";
import HonorTemplate2 from "@/components/reports/HonorTemplates/HonorTemplate2";
import HonorTemplate3 from "@/components/reports/HonorTemplates/HonorTemplate3";
import HonorTemplate4 from "@/components/reports/HonorTemplates/HonorTemplate4";
import HonorTemplate5 from "@/components/reports/HonorTemplates/HonorTemplate5";
import StatisticsReport from "@/components/reports/StatisticsReport";
import ReportSettings from "@/components/reports/ReportSettings";
import MonthlyReportSettings from "@/components/reports/MonthlyReportSettings";

// Import helper functions
import {
  getSubjectAbbr,
  getMonthName,
  getMedalEmoji,
  monthOptions,
  reportTypeOptions,
  certificateTemplates,
} from "@/lib/reportHelpers";

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades } = useData();
  const router = useRouter();

  // State management
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedStatsMonth, setSelectedStatsMonth] = useState("1");
  const [selectedHonorMonth, setSelectedHonorMonth] = useState("1");
  const [reportType, setReportType] = useState("monthly");
  const [certificateTemplate, setCertificateTemplate] = useState<
    "template1" | "template2" | "template3" | "template4" | "template5"
  >("template1");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "average">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Report Settings
  const [showSettings, setShowSettings] = useState(false);
  const [province, setProvince] = useState("ភ្នំពេញ");
  const [examCenter, setExamCenter] = useState("សាលារៀនអន្តរជាតិ");
  const [roomNumber, setRoomNumber] = useState("01");
  const [reportTitle, setReportTitle] = useState(
    "បញ្ជីរាយនាមបេក្ខជនប្រឡងប្រចាំខែ/ឆមាស"
  );
  const [examSession, setExamSession] = useState("ប្រចាំខែ មករា");
  const [principalName, setPrincipalName] = useState("នាយកសាលា");
  const [teacherName, setTeacherName] = useState("គ្រូបន្ទុកថ្នាក់");
  const [reportDate, setReportDate] = useState("ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៥");
  const [autoCircle, setAutoCircle] = useState(true);
  const [showCircles, setShowCircles] = useState(true);
  const [studentsPerPage] = useState(22);

  // Honor Certificate Settings
  const [honorPeriod, setHonorPeriod] = useState("ប្រចាំខែ មករា");
  const [honorSchoolName, setHonorSchoolName] = useState("សាលារៀនអន្តរជាតិ");
  const [maxHonorStudents, setMaxHonorStudents] = useState(6);
  const [showBorder, setShowBorder] = useState(false);
  const [pageMargin, setPageMargin] = useState("1.5cm");
  const [showStudentPhotos, setShowStudentPhotos] = useState(false);

  // Column visibility
  const [showDateOfBirth, setShowDateOfBirth] = useState(true);
  const [showGrade, setShowGrade] = useState(true);
  const [showOther, setShowOther] = useState(true);

  const reportRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Calculate reports based on selected month
  const calculateReports = (month: string) => {
    return classStudents.map((student) => {
      const studentGrades = grades.filter(
        (g) => g.studentId === student.id && g.month === month
      );
      const total = studentGrades.reduce(
        (sum, g) => sum + parseFloat(g.score || "0"),
        0
      );
      const average = studentGrades.length > 0 ? total / subjects.length : 0;
      const letterGrade = getLetterGrade(average, GRADE_SCALE);
      return { student, grades: studentGrades, total, average, letterGrade };
    });
  };

  const studentReports = calculateReports(selectedMonth);
  const statsReports = calculateReports(selectedStatsMonth);
  const honorReports = calculateReports(selectedHonorMonth);

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

  const sortedHonorReports = [...honorReports].sort(
    (a, b) => b.average - a.average
  );

  const paginatedReports = [];
  for (let i = 0; i < sortedReports.length; i += studentsPerPage) {
    paginatedReports.push(sortedReports.slice(i, i + studentsPerPage));
  }

  const topStudents = sortedHonorReports.slice(
    0,
    Math.min(maxHonorStudents, sortedHonorReports.length)
  );

  const exportToExcel = () => {
    const data = sortedReports.map((report, index) => {
      const row: any = {
        "ល.រ": index + 1,
        "គោត្តនាម និងនាម": `${report.student.lastName} ${report.student.firstName}`,
        ភេទ: report.student.gender === "male" ? "ប្រុស" : "ស្រី",
      };
      subjects.forEach((subject) => {
        const grade = report.grades.find((g) => g.subjectId === subject.id);
        row[subject.name] = grade ? grade.score : "-";
      });
      row["សរុប"] = report.total.toFixed(2);
      row["មធ្យមភាគ"] = report.average.toFixed(2);
      row["និទ្ទេស"] = report.letterGrade;
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
    link.setAttribute(
      "download",
      `Report_${selectedClass?.name}_Month${selectedMonth}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen print-wrapper">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .honor-certificate {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            page-break-inside: avoid;
            display: block;
            overflow: hidden;
          }
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
        @media screen {
          .honor-certificate {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              របាយការណ៍ Reports
            </h1>
            <p className="text-gray-600">
              របាយការណ៍ពិន្ទុសិស្ស និងតារាងកិត្តិយស
            </p>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 no-print animate-slideUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="ជ្រើសរើសថ្នាក់ Select Class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classOptions}
              />
              <Select
                label="ប្រភេទរបាយការណ៍ Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={reportTypeOptions}
              />
              {reportType === "monthly" && (
                <Select
                  label="ខែ Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthOptions}
                />
              )}
              {reportType === "statistics" && (
                <Select
                  label="ខែ Month (Statistics)"
                  value={selectedStatsMonth}
                  onChange={(e) => setSelectedStatsMonth(e.target.value)}
                  options={monthOptions}
                />
              )}
              {reportType === "honor" && (
                <Select
                  label="ខែ Month (Honor)"
                  value={selectedHonorMonth}
                  onChange={(e) => setSelectedHonorMonth(e.target.value)}
                  options={monthOptions}
                />
              )}
            </div>

            {/* Honor Certificate Settings */}
            {selectedClassId && reportType === "honor" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Select
                    label="គំរូតារាងកិត្តិយស Template"
                    value={certificateTemplate}
                    onChange={(e) =>
                      setCertificateTemplate(e.target.value as any)
                    }
                    options={certificateTemplates}
                  />
                </div>
                <ReportSettings
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
                  honorSchoolName={honorSchoolName}
                  setHonorSchoolName={setHonorSchoolName}
                  honorPeriod={honorPeriod}
                  setHonorPeriod={setHonorPeriod}
                  maxHonorStudents={maxHonorStudents}
                  setMaxHonorStudents={setMaxHonorStudents}
                  reportDate={reportDate}
                  setReportDate={setReportDate}
                  teacherName={teacherName}
                  setTeacherName={setTeacherName}
                  principalName={principalName}
                  setPrincipalName={setPrincipalName}
                  showBorder={showBorder}
                  setShowBorder={setShowBorder}
                  showStudentPhotos={showStudentPhotos}
                  setShowStudentPhotos={setShowStudentPhotos}
                  pageMargin={pageMargin}
                  setPageMargin={setPageMargin}
                />
              </div>
            )}

            {/* Monthly Report Settings */}
            {selectedClassId && reportType === "monthly" && (
              <div className="mt-4 space-y-4">
                <MonthlyReportSettings
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
                  province={province}
                  setProvince={setProvince}
                  examCenter={examCenter}
                  setExamCenter={setExamCenter}
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
                />
                <div className="flex items-center gap-4">
                  <Select
                    label="តម្រៀបតាម Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    options={[
                      { value: "rank", label: "ចំណាត់ថ្នាក់ Rank" },
                      { value: "name", label: "ឈ្មោះ Name" },
                      { value: "average", label: "មធ្យមភាគ Average" },
                    ]}
                  />
                  <Button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    variant="secondary"
                    size="sm"
                    className="mt-6"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {sortOrder === "asc" ? "ឡើង Asc" : "ចុះ Desc"}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedClassId && (
              <div className="flex gap-3 mt-6 justify-end">
                <Button onClick={handlePrint} variant="secondary">
                  <Printer className="w-4 h-4 mr-2" />
                  បោះពុម្ព Print
                </Button>
                <Button onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            )}
          </div>

          {/* Monthly Report Display */}
          {selectedClassId && reportType === "monthly" && (
            <div ref={reportRef} className="animate-scaleIn">
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
                getSubjectAbbr={getSubjectAbbr}
              />
            </div>
          )}

          {/* Honor Certificate Display */}
          {selectedClassId && reportType === "honor" && (
            <div ref={reportRef} className="animate-scaleIn">
              {certificateTemplate === "template1" && (
                <HonorTemplate1
                  topStudents={topStudents}
                  selectedClass={selectedClass}
                  honorSchoolName={honorSchoolName}
                  honorPeriod={honorPeriod}
                  showStudentPhotos={showStudentPhotos}
                  showBorder={showBorder}
                  pageMargin={pageMargin}
                  reportDate={reportDate}
                  teacherName={teacherName}
                  principalName={principalName}
                />
              )}
              {certificateTemplate === "template2" && (
                <HonorTemplate2
                  topStudents={topStudents}
                  selectedClass={selectedClass}
                  honorSchoolName={honorSchoolName}
                  honorPeriod={honorPeriod}
                  showStudentPhotos={showStudentPhotos}
                  showBorder={showBorder}
                  pageMargin={pageMargin}
                  reportDate={reportDate}
                  teacherName={teacherName}
                  principalName={principalName}
                />
              )}
              {certificateTemplate === "template3" && (
                <HonorTemplate3
                  topStudents={topStudents}
                  selectedClass={selectedClass}
                  honorSchoolName={honorSchoolName}
                  honorPeriod={honorPeriod}
                  showStudentPhotos={showStudentPhotos}
                  showBorder={showBorder}
                  pageMargin={pageMargin}
                  reportDate={reportDate}
                  teacherName={teacherName}
                  principalName={principalName}
                />
              )}
              {certificateTemplate === "template4" && (
                <HonorTemplate4
                  topStudents={topStudents}
                  selectedClass={selectedClass}
                  honorSchoolName={honorSchoolName}
                  honorPeriod={honorPeriod}
                  showStudentPhotos={showStudentPhotos}
                  showBorder={showBorder}
                  pageMargin={pageMargin}
                  reportDate={reportDate}
                  teacherName={teacherName}
                  principalName={principalName}
                />
              )}
              {certificateTemplate === "template5" && (
                <HonorTemplate5
                  topStudents={topStudents}
                  selectedClass={selectedClass}
                  honorSchoolName={honorSchoolName}
                  honorPeriod={honorPeriod}
                  showStudentPhotos={showStudentPhotos}
                  showBorder={showBorder}
                  pageMargin={pageMargin}
                  reportDate={reportDate}
                  teacherName={teacherName}
                  principalName={principalName}
                />
              )}
            </div>
          )}

          {/* Statistics Report Display */}
          {selectedClassId && reportType === "statistics" && (
            <div ref={reportRef} className="animate-scaleIn">
              <StatisticsReport
                statsReports={statsReports}
                selectedClass={selectedClass}
                subjects={subjects}
                selectedStatsMonth={selectedStatsMonth}
                teacherName={teacherName}
                principalName={principalName}
                getMonthName={getMonthName}
                getMedalEmoji={getMedalEmoji}
                getSubjectAbbr={getSubjectAbbr}
              />
            </div>
          )}

          {/* Empty State */}
          {!selectedClassId && (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-500 mb-2">
                សូមជ្រើសរើសថ្នាក់ដើម្បីមើលរបាយការណ៍
              </p>
              <p className="text-gray-400">
                Please select a class to view the report
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

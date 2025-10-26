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
import {
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  ArrowUpDown,
  Users,
  Trophy,
  TrendingUp,
  Award,
  XCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [reportType, setReportType] = useState("monthly");
  const [certificateTemplate, setCertificateTemplate] = useState<
    "template1" | "template2" | "template3" | "template4"
  >("template1");
  const [showPhotos, setShowPhotos] = useState(false);
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
  const [studentsPerPage] = useState(30);

  // Honor Certificate Settings
  const [honorPeriod, setHonorPeriod] = useState("ប្រចាំខែ មករា");
  const [honorSchoolName, setHonorSchoolName] = useState("សាលារៀនអន្តរជាតិ");

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

  const monthOptions = [
    { value: "1", label: "មករា - January" },
    { value: "2", label: "កុម្ភៈ - February" },
    { value: "3", label: "មីនា - March" },
    { value: "4", label: "មេសា - April" },
    { value: "5", label: "ឧសភា - May" },
    { value: "6", label: "មិថុនា - June" },
    { value: "7", label: "កក្កដា - July" },
    { value: "8", label: "សីហា - August" },
    { value: "9", label: "កញ្ញា - September" },
    { value: "10", label: "តុលា - October" },
    { value: "11", label: "វិច្ឆិកា - November" },
    { value: "12", label: "ធ្នូ - December" },
  ];

  const reportTypeOptions = [
    { value: "monthly", label: "លទ្ធផលប្រចាំខែ - Monthly Results" },
    { value: "honor", label: "តារាងកិត្តិយស - Honor Roll (Top 5)" },
    { value: "statistics", label: "ស្ថិតិថ្នាក់ - Class Statistics" },
  ];

  const certificateTemplates = [
    { value: "template1", label: "គំរូទី១ - មេដាយមាស Gold Medal" },
    { value: "template2", label: "គំរូទី២ - ពានរង្វាន់ Trophy" },
    { value: "template3", label: "គំរូទី៣ - ទំនើប Modern" },
    { value: "template4", label: "គំរូទី៤ - ស្រស់ស្អាត Elegant" },
  ];

  // Function to get subject abbreviation
  const getSubjectAbbr = (subjectName: string) => {
    const abbrMap: { [key: string]: string } = {
      គណិតវិទ្យា: "M",
      Mathematics: "M",
      ខ្មែរ: "K",
      Khmer: "K",
      អង់គ្លេស: "E",
      English: "E",
      រូបវិទ្យា: "P",
      Physics: "P",
      គីមីវិទ្យា: "C",
      Chemistry: "C",
      ជីវវិទ្យា: "B",
      Biology: "B",
      បច្ចេកវិទ្យា: "IT",
      Technology: "IT",
      វិទ្យាសាស្ត្រ: "S",
      Science: "S",
      ប្រវត្តិសាស្ត្រ: "H",
      History: "H",
      ភូមិសាស្ត្រ: "G",
      Geography: "G",
      កីឡា: "PE",
      "Physical Education": "PE",
    };

    if (abbrMap[subjectName]) {
      return abbrMap[subjectName];
    }

    for (const [key, value] of Object.entries(abbrMap)) {
      if (subjectName.includes(key) || key.includes(subjectName)) {
        return value;
      }
    }

    return subjectName
      .substring(0, Math.min(3, subjectName.length))
      .toUpperCase();
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const studentReports = classStudents.map((student) => {
    const studentGrades = grades.filter(
      (g) => g.studentId === student.id && g.month === selectedMonth
    );

    const total = studentGrades.reduce(
      (sum, g) => sum + parseFloat(g.score || "0"),
      0
    );
    const average = studentGrades.length > 0 ? total / subjects.length : 0;
    const letterGrade = getLetterGrade(average, GRADE_SCALE);

    return {
      student,
      grades: studentGrades,
      total,
      average,
      letterGrade,
    };
  });

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

  const paginatedReports = [];
  for (let i = 0; i < sortedReports.length; i += studentsPerPage) {
    paginatedReports.push(sortedReports.slice(i, i + studentsPerPage));
  }

  const topStudents = sortedReports.slice(0, 5);

  const passedStudents = studentReports.filter((s) => s.average >= 50).length;
  const failedStudents = studentReports.filter((s) => s.average < 50).length;
  const passRate =
    studentReports.length > 0
      ? (passedStudents / studentReports.length) * 100
      : 0;
  const classAverage =
    studentReports.length > 0
      ? studentReports.reduce((sum, s) => sum + s.average, 0) /
        studentReports.length
      : 0;

  const gradeDistribution = GRADE_SCALE.map((scale) => ({
    grade: scale.grade,
    description: scale.description,
    count: studentReports.filter((s) => s.letterGrade === scale.grade).length,
  }));

  const maleCount = classStudents.filter((s) => s.gender === "male").length;
  const femaleCount = classStudents.filter((s) => s.gender === "female").length;

  const passedMale = sortedReports.filter(
    (r) => r.student.gender === "male" && r.average >= 50
  ).length;
  const passedFemale = sortedReports.filter(
    (r) => r.student.gender === "female" && r.average >= 50
  ).length;

  const failedMale = sortedReports.filter(
    (r) => r.student.gender === "male" && r.average < 50
  ).length;
  const failedFemale = sortedReports.filter(
    (r) => r.student.gender === "female" && r.average < 50
  ).length;

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

  // Report Page Component (Monthly)
  const ReportPage = ({
    pageReports,
    pageNumber,
    totalPages,
    startIndex,
  }: any) => (
    <div
      className="report-page bg-white p-8 page-break"
      style={{ fontFamily: "Khmer OS Battambang" }}
    >
      <div className="text-center mb-4">
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
        <div className="flex items-center justify-center my-2">
          <div className="h-px w-20 bg-black"></div>
          <span className="mx-2">✦✦✦</span>
          <div className="h-px w-20 bg-black"></div>
        </div>
      </div>

      <div className="text-left mb-4 text-sm">
        <p>
          ខេត្ត៖ <span className="font-semibold">{province}</span>
        </p>
        <p>
          មណ្ឌលប្រឡង៖ <span className="font-semibold">{examCenter}</span>
        </p>
        <p>
          បន្ទប់លេខ៖ <span className="font-semibold">{roomNumber}</span>
        </p>
      </div>

      <div className="text-center mb-4">
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          {reportTitle}
        </h2>
        <p className="text-base font-semibold">
          សម័យប្រឡង៖ <span className="font-bold">{examSession}</span>
        </p>
        <p className="text-sm mt-1">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-600 mt-1">
            ទំព័រទី {pageNumber} / {totalPages}
          </p>
        )}
      </div>

      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr className="border-2 border-black">
            <th
              className="border border-black px-2 py-2 bg-gray-100"
              rowSpan={2}
            >
              ល.រ
            </th>
            <th
              className="border border-black px-2 py-2 bg-gray-100"
              rowSpan={2}
            >
              គោត្តនាម និងនាម
            </th>
            <th
              className="border border-black px-2 py-2 bg-gray-100"
              rowSpan={2}
            >
              ភេទ
            </th>
            {showDateOfBirth && (
              <th
                className="border border-black px-2 py-2 bg-gray-100"
                rowSpan={2}
              >
                ថ្ងៃខែឆ្នាំកំណើត
              </th>
            )}
            <th
              className="border border-black px-2 py-2 bg-gray-100"
              colSpan={subjects.length}
            >
              ពិន្ទុតាមវិជ្ជា
            </th>
            <th
              className="border border-black px-2 py-2 bg-gray-100"
              rowSpan={2}
            >
              សរុប
            </th>
            {showGrade && (
              <th
                className="border border-black px-2 py-2 bg-gray-100"
                rowSpan={2}
              >
                និទ្ទេស
              </th>
            )}
            {showOther && (
              <th
                className="border border-black px-2 py-2 bg-gray-100"
                rowSpan={2}
              >
                ផ្សេងៗ
              </th>
            )}
          </tr>
          <tr className="border-2 border-black">
            {subjects.map((subject) => (
              <th
                key={subject.id}
                className="border border-black px-1 py-1 bg-gray-100 text-xs"
              >
                {getSubjectAbbr(subject.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageReports.map((report: any, index: number) => {
            const isPassed = report.average >= 50;
            const absoluteIndex = startIndex + index;
            return (
              <tr key={report.student.id} className="border border-black">
                <td className="border border-black px-2 py-2 text-center font-bold relative">
                  {showCircles && autoCircle && isPassed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full border-2 border-red-600"></div>
                    </div>
                  )}
                  {showCircles && autoCircle && !isPassed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-7 h-7" viewBox="0 0 32 32">
                        <line
                          x1="8"
                          y1="8"
                          x2="24"
                          y2="24"
                          stroke="red"
                          strokeWidth="2"
                        />
                        <line
                          x1="24"
                          y1="8"
                          x2="8"
                          y2="24"
                          stroke="red"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="relative z-10">{absoluteIndex + 1}</span>
                </td>
                <td className="border border-black px-2 py-2">
                  {report.student.lastName} {report.student.firstName}
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  {report.student.gender === "male" ? "ប" : "ស"}
                </td>
                {showDateOfBirth && (
                  <td className="border border-black px-2 py-2 text-center text-xs">
                    {report.student.dateOfBirth || "-"}
                  </td>
                )}
                {subjects.map((subject) => {
                  const grade = report.grades.find(
                    (g: any) => g.subjectId === subject.id
                  );
                  const score = grade ? parseFloat(grade.score) : 0;
                  return (
                    <td
                      key={subject.id}
                      className={`border border-black px-2 py-2 text-center font-semibold ${
                        score >= 50 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {grade ? grade.score : "-"}
                    </td>
                  );
                })}
                <td className="border border-black px-2 py-2 text-center font-bold">
                  {report.total.toFixed(2)}
                </td>
                {showGrade && (
                  <td
                    className={`border border-black px-2 py-2 text-center font-bold ${
                      isPassed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {report.letterGrade}
                  </td>
                )}
                {showOther && (
                  <td className="border border-black px-2 py-2"></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pageNumber === totalPages && (
        <>
          <div className="grid grid-cols-2 gap-8 text-sm mt-6">
            <div>
              <div className="space-y-2 mb-8">
                <p className="flex justify-between">
                  <span>សិស្សសរុប៖</span>
                  <span className="font-bold">{sortedReports.length} នាក់</span>
                  <span className="ml-4">ស្រី៖</span>
                  <span className="font-bold">{femaleCount} នាក់</span>
                </p>
                <p className="flex justify-between">
                  <span>ជាប់សរុប៖</span>
                  <span className="font-bold text-green-700">
                    {passedStudents} នាក់
                  </span>
                  <span className="ml-4">ស្រី៖</span>
                  <span className="font-bold text-green-700">
                    {passedFemale} នាក់
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>ធ្លាក់សរុប៖</span>
                  <span className="font-bold text-red-700">
                    {failedStudents} នាក់
                  </span>
                  <span className="ml-4">ស្រី៖</span>
                  <span className="font-bold text-red-700">
                    {failedFemale} នាក់
                  </span>
                </p>
              </div>

              <div className="text-center">
                <p className="mb-1">{reportDate}</p>
                <p className="mb-16">ត្រួតពិនិត្យ</p>
                <p className="font-bold border-t-2 border-black pt-2 inline-block px-8">
                  {teacherName}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-1">{reportDate}</p>
              <p className="mb-16">អនុញ្ញាត</p>
              <p className="font-bold border-t-2 border-black pt-2 inline-block px-8">
                {principalName}
              </p>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center border-t pt-3">
            <p>* សិស្សដែលមានរង្វង់ (○) គឺជាប់ ហើយសិស្សដែលមាន (✗) គឺធ្លាក់</p>
            <p>* មធ្យមភាគ ≥ 50 = ជាប់ | មធ្យមភាគ &lt; 50 = ធ្លាក់</p>
          </div>
        </>
      )}
    </div>
  );

  const KhmerMonthlyReport = () => (
    <div>
      <style>{`
        @media print {
          * { visibility: hidden; }
          @page { size: A4 portrait; margin: 10mm; }
          .print-only-report, .print-only-report * { visibility: visible !important; }
          .print-only-report { position: absolute; left: 0; top: 0; width: 100%; background: white; }
          body > div:not(.print-wrapper) { display: none !important; }
          .page-break { page-break-after: always; }
          .page-break:last-child { page-break-after: auto; }
        }
        @media screen {
          .report-page { margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        }
      `}</style>
      <div className="print-only-report">
        {paginatedReports.map((pageReports, pageIndex) => (
          <ReportPage
            key={pageIndex}
            pageReports={pageReports}
            pageNumber={pageIndex + 1}
            totalPages={paginatedReports.length}
            startIndex={pageIndex * studentsPerPage}
          />
        ))}
      </div>
    </div>
  );

  // Honor Certificate Templates - REDESIGNED
  const HonorTemplate1 = () => (
    <div
      className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-12 rounded-3xl shadow-2xl"
      style={{ minHeight: "900px", fontFamily: "Khmer OS Battambang" }}
    >
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-4 border-double border-yellow-600">
        <h1
          className="text-2xl font-bold text-gray-800 mb-1"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p
          className="text-xl font-bold text-gray-700"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
          <span className="mx-3 text-yellow-600 text-2xl">❀</span>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
        </div>
      </div>

      {/* School Name */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{honorSchoolName}</h2>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-5xl font-bold mb-3"
          style={{
            fontFamily: "Khmer OS Muol Light",
            background: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          តារាងកិត្តិយស
        </h2>
        <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-2 rounded-full shadow-lg">
          <p className="text-xl font-bold">{honorPeriod}</p>
        </div>
        <p className="text-lg text-gray-600 mt-3">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Top 5 Students with Medals */}
      <div className="space-y-5 mb-10">
        {topStudents.map((report, index) => (
          <div key={report.student.id} className="relative">
            <div className="flex items-center gap-6">
              {/* Medal Circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600"
                      : index === 2
                      ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600"
                      : "bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600"
                  }`}
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <span
                      className={`text-5xl font-bold ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                          ? "text-gray-600"
                          : index === 2
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                      style={{ fontFamily: "Khmer OS Muol" }}
                    >
                      {["១", "២", "៣", "៤", "៥"][index]}
                    </span>
                  </div>
                </div>
                {/* Ribbon */}
                {index < 3 && (
                  <div
                    className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-14 h-20 ${
                      index === 0
                        ? "bg-gradient-to-b from-red-500 to-red-700"
                        : index === 1
                        ? "bg-gradient-to-b from-red-400 to-red-600"
                        : "bg-gradient-to-b from-red-300 to-red-500"
                    }`}
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
                    }}
                  ></div>
                )}
              </div>

              {/* Name Card */}
              <div
                className={`flex-1 p-6 rounded-2xl shadow-xl border-l-4 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-500"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-500"
                    : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500"
                }`}
              >
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white px-3 py-1 rounded-full shadow">
                    ពិន្ទុ:{" "}
                    <span className="font-bold text-blue-600">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full shadow">
                    និទ្ទេស:{" "}
                    <span className="font-bold">{report.letterGrade}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-2 gap-12 text-center mt-12 pt-8 border-t-2 border-gray-300">
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">ត្រួតពិនិត្យ</p>
          <p className="font-bold border-t-2 border-gray-400 pt-2 inline-block px-12">
            {teacherName}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">អនុញ្ញាត</p>
          <p className="font-bold border-t-2 border-gray-400 pt-2 inline-block px-12">
            {principalName}
          </p>
        </div>
      </div>
    </div>
  );

  const HonorTemplate2 = () => (
    <div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12 rounded-3xl shadow-2xl relative overflow-hidden"
      style={{ minHeight: "900px", fontFamily: "Khmer OS Battambang" }}
    >
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 translate-x-32 translate-y-32"></div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6 pb-4 border-b-4 border-double border-purple-600">
        <h1
          className="text-2xl font-bold text-gray-800 mb-1"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p
          className="text-xl font-bold text-gray-700"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
      </div>

      <div className="relative z-10 text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{honorSchoolName}</h2>
      </div>

      {/* Title with Trophy */}
      <div className="relative z-10 text-center mb-10">
        <div className="text-8xl mb-4">🏆</div>
        <h2
          className="text-5xl font-bold mb-3"
          style={{
            fontFamily: "Khmer OS Muol Light",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          តារាងកិត្តិយស
        </h2>
        <div className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-2 rounded-full shadow-lg">
          <p className="text-xl font-bold">{honorPeriod}</p>
        </div>
        <p className="text-lg text-gray-600 mt-3">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Podium Style - Top 3 */}
      <div className="relative z-10 mb-8">
        <div className="grid grid-cols-3 gap-6">
          {/* 2nd Place */}
          {topStudents[1] && (
            <div className="text-center pt-12">
              <div className="text-6xl mb-3">🥈</div>
              <div className="bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-3xl p-6 shadow-xl">
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <p className="text-2xl font-bold text-gray-800">២</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="font-bold text-lg">
                    {topStudents[1].student.lastName}{" "}
                    {topStudents[1].student.firstName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ពិន្ទុ: {topStudents[1].average.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topStudents[0] && (
            <div className="text-center">
              <div className="text-8xl mb-3">🥇</div>
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-t-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <p className="text-3xl font-bold text-yellow-600">១</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="font-bold text-xl">
                    {topStudents[0].student.lastName}{" "}
                    {topStudents[0].student.firstName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ពិន្ទុ: {topStudents[0].average.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topStudents[2] && (
            <div className="text-center pt-12">
              <div className="text-6xl mb-3">🥉</div>
              <div className="bg-gradient-to-b from-orange-300 to-orange-600 rounded-t-3xl p-6 shadow-xl">
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <p className="text-2xl font-bold text-orange-600">៣</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="font-bold text-lg">
                    {topStudents[2].student.lastName}{" "}
                    {topStudents[2].student.firstName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ពិន្ទុ: {topStudents[2].average.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4th and 5th */}
      {topStudents.length > 3 && (
        <div className="relative z-10 grid grid-cols-2 gap-6 mb-8">
          {topStudents.slice(3, 5).map((report, index) => (
            <div
              key={report.student.id}
              className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-lg border-2 border-purple-200"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                {index === 0 ? "៤" : "៥"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <p className="text-sm text-gray-600">
                  ពិន្ទុ: {report.average.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 grid grid-cols-2 gap-12 text-center mt-12 pt-8 border-t-2 border-gray-300">
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">ត្រួតពិនិត្យ</p>
          <p className="font-bold border-t-2 border-gray-400 pt-2 inline-block px-12">
            {teacherName}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">អនុញ្ញាត</p>
          <p className="font-bold border-t-2 border-gray-400 pt-2 inline-block px-12">
            {principalName}
          </p>
        </div>
      </div>
    </div>
  );

  const HonorTemplate3 = () => (
    <div
      className="bg-white p-12 rounded-3xl shadow-2xl border-8 border-double border-indigo-600"
      style={{ minHeight: "900px", fontFamily: "Khmer OS Battambang" }}
    >
      {/* Header */}
      <div className="text-center mb-6 pb-4">
        <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full mb-4">
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
        </div>
        <p
          className="text-lg font-bold text-gray-700"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">
          {honorSchoolName}
        </h2>
      </div>

      {/* Modern Title */}
      <div className="text-center mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl">
        <div className="text-6xl mb-4">⭐</div>
        <h2
          className="text-5xl font-bold mb-3"
          style={{
            fontFamily: "Khmer OS Muol Light",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          តារាងកិត្តិយស
        </h2>
        <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg">
          <p className="text-lg font-bold">{honorPeriod}</p>
        </div>
        <p className="text-base text-gray-600 mt-3">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Clean List */}
      <div className="space-y-4 mb-10">
        {topStudents.map((report, index) => (
          <div
            key={report.student.id}
            className={`relative overflow-hidden rounded-2xl shadow-xl ${
              index === 0
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : index === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : index === 2
                ? "bg-gradient-to-r from-orange-400 to-red-500"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            }`}
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="text-9xl">
                {index < 3 ? ["🥇", "🥈", "🥉"][index] : "⭐"}
              </div>
            </div>

            <div className="relative p-6 flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                  <span
                    className={`text-4xl font-bold ${
                      index === 0
                        ? "text-yellow-600"
                        : index === 1
                        ? "text-gray-600"
                        : index === 2
                        ? "text-orange-600"
                        : "text-indigo-600"
                    }`}
                    style={{ fontFamily: "Khmer OS Muol" }}
                  >
                    {["១", "២", "៣", "៤", "៥"][index]}
                  </span>
                </div>
              </div>

              <div className="flex-1 text-white">
                <p className="text-2xl font-bold drop-shadow-lg mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
                    ពិន្ទុ: {report.average.toFixed(2)}
                  </span>
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
                    និទ្ទេស: {report.letterGrade}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-white text-6xl">
                {index < 3 ? ["🥇", "🥈", "🥉"][index] : "⭐"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-12 text-center mt-12 pt-8 border-t-2 border-indigo-300">
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">ត្រួតពិនិត្យ</p>
          <p className="font-bold border-t-2 border-indigo-400 pt-2 inline-block px-12">
            {teacherName}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">អនុញ្ញាត</p>
          <p className="font-bold border-t-2 border-indigo-400 pt-2 inline-block px-12">
            {principalName}
          </p>
        </div>
      </div>
    </div>
  );

  const HonorTemplate4 = () => (
    <div
      className="bg-gradient-to-br from-rose-50 via-white to-pink-50 p-12 rounded-3xl shadow-2xl"
      style={{ minHeight: "900px", fontFamily: "Khmer OS Battambang" }}
    >
      {/* Elegant Header */}
      <div className="text-center mb-6">
        <div className="inline-block border-4 border-rose-400 rounded-full px-12 py-4 mb-4 bg-white shadow-lg">
          <h1
            className="text-xl font-bold text-rose-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ព្រះរាជាណាចក្រកម្ពុជា
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent my-2"></div>
          <p
            className="text-lg font-bold text-gray-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-rose-700">{honorSchoolName}</h2>
      </div>

      {/* Elegant Title */}
      <div className="text-center mb-10">
        <div className="inline-block">
          <h2
            className="text-6xl font-bold mb-2"
            style={{
              fontFamily: "Khmer OS Muol Light",
              background: "linear-gradient(135deg, #f43f5e, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            តារាងកិត្តិយស
          </h2>
          <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-4"></div>
        </div>
        <div className="inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-2 rounded-full shadow-lg mt-2">
          <p className="text-lg font-bold">{honorPeriod}</p>
        </div>
        <p className="text-base text-gray-600 mt-3">
          ថ្នាក់៖ {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Elegant Cards */}
      <div className="space-y-5 mb-10">
        {topStudents.map((report, index) => (
          <div key={report.student.id} className="group">
            <div
              className={`flex items-center gap-6 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-l-8 border-yellow-500"
                  : index === 1
                  ? "bg-gradient-to-r from-gray-100 to-gray-200 border-l-8 border-gray-500"
                  : index === 2
                  ? "bg-gradient-to-r from-orange-100 to-red-100 border-l-8 border-orange-500"
                  : "bg-gradient-to-r from-rose-100 to-pink-100 border-l-8 border-rose-500"
              }`}
            >
              <div
                className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                    : index === 2
                    ? "bg-gradient-to-br from-orange-400 to-orange-600"
                    : "bg-gradient-to-br from-rose-400 to-pink-600"
                }`}
              >
                <span
                  className="text-white text-4xl font-bold"
                  style={{ fontFamily: "Khmer OS Muol" }}
                >
                  {["១", "២", "៣", "៤", "៥"][index]}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                    ពិន្ទុ:{" "}
                    <span className="font-bold text-rose-600">
                      {report.average.toFixed(2)}
                    </span>
                  </span>
                  <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                    និទ្ទេស:{" "}
                    <span className="font-bold">{report.letterGrade}</span>
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-5xl">
                {index < 3 ? ["🏆", "🥈", "🥉"][index] : "⭐"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-12 text-center mt-12 pt-8 border-t-2 border-rose-300">
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">ត្រួតពិនិត្យ</p>
          <p className="font-bold border-t-2 border-rose-400 pt-2 inline-block px-12">
            {teacherName}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1">{reportDate}</p>
          <p className="text-sm mb-20">អនុញ្ញាត</p>
          <p className="font-bold border-t-2 border-rose-400 pt-2 inline-block px-12">
            {principalName}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen print-wrapper">
      <div className="no-print">
        <Sidebar />
      </div>
      <div className="flex-1">
        <div className="no-print">
          <Header />
        </div>
        <main className="p-6 animate-fadeIn">
          <div className="mb-6 no-print">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              របាយការណ៍ Reports
            </h1>
            <p className="text-gray-600">
              របាយការណ៍ពិន្ទុសិស្ស និងតារាងកិត្តិយស
            </p>
          </div>

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
              <Select
                label="ខែ Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
              />
            </div>

            {reportType === "monthly" && (
              <div className="mt-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-700">
                    កំណត់ការបង្ហាញរបាយការណ៍
                  </span>
                </button>

                {showSettings && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        ព័ត៌មានទូទៅ General Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ខេត្ត Province
                          </label>
                          <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            មណ្ឌលប្រឡង Exam Center
                          </label>
                          <input
                            type="text"
                            value={examCenter}
                            onChange={(e) => setExamCenter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            បន្ទប់លេខ Room Number
                          </label>
                          <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            សម័យប្រឡង Exam Session
                          </label>
                          <input
                            type="text"
                            value={examSession}
                            onChange={(e) => setExamSession(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ចំណងជើង Report Title
                          </label>
                          <input
                            type="text"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="បញ្ជីរាយនាមបេក្ខជនប្រឡងប្រចាំខែ/ឆមាស"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ឈ្មោះនាយកសាលា Principal
                          </label>
                          <input
                            type="text"
                            value={principalName}
                            onChange={(e) => setPrincipalName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ឈ្មោះគ្រូបន្ទុក Teacher
                          </label>
                          <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            កាលបរិច្ឆេទ Date
                          </label>
                          <input
                            type="text"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៥"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        ជម្រើសបង្ហាញ Display Options
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showCircles}
                            onChange={(e) => setShowCircles(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            បង្ហាញរង្វង់/X Show Circles/X
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={autoCircle}
                            onChange={(e) => setAutoCircle(e.target.checked)}
                            disabled={!showCircles}
                            className="w-5 h-5 text-blue-600 rounded disabled:opacity-50"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            គូសរង្វង់ស្វ័យប្រវត្តិ Auto Circle (ជាប់=○,
                            ធ្លាក់=✗)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-purple-600" />
                        លាក់/បង្ហាញជួរឈរ Show/Hide Columns
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showDateOfBirth}
                            onChange={(e) =>
                              setShowDateOfBirth(e.target.checked)
                            }
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            ថ្ងៃខែឆ្នាំកំណើត
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showGrade}
                            onChange={(e) => setShowGrade(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            និទ្ទេស Grade
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showOther}
                            onChange={(e) => setShowOther(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            ផ្សេងៗ Others
                          </span>
                        </label>
                      </div>
                    </div>

                    {sortedReports.length > studentsPerPage && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-700 font-semibold">
                          📄 សិស្សសរុប: {sortedReports.length} នាក់ | ទំព័រសរុប:{" "}
                          {paginatedReports.length} ទំព័រ
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          * ៣០ នាក់ក្នុងមួយទំព័រ
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {reportType === "honor" && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Select
                    label="ប្រភេទតារាងកិត្តិយស Certificate Template"
                    value={certificateTemplate}
                    onChange={(e) =>
                      setCertificateTemplate(e.target.value as any)
                    }
                    options={certificateTemplates}
                  />
                </div>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-700" />
                  <span className="text-sm font-semibold text-purple-700">
                    កំណត់ការបង្ហាញតារាងកិត្តិយស
                  </span>
                </button>

                {showSettings && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        ព័ត៌មានតារាងកិត្តិយស Honor Certificate Info
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ឈ្មោះសាលា School Name
                          </label>
                          <input
                            type="text"
                            value={honorSchoolName}
                            onChange={(e) => setHonorSchoolName(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="សាលារៀនអន្តរជាតិ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            រយៈពេល Period (Ex: ប្រចាំខែ មករា / ប្រចាំឆមាសទី១)
                          </label>
                          <input
                            type="text"
                            value={honorPeriod}
                            onChange={(e) => setHonorPeriod(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="ប្រចាំខែ មករា"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            កាលបរិច្ឆេទ Date
                          </label>
                          <input
                            type="text"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៥"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ឈ្មោះគ្រូបន្ទុក Teacher
                          </label>
                          <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            ឈ្មោះនាយកសាលា Principal
                          </label>
                          <input
                            type="text"
                            value={principalName}
                            onChange={(e) => setPrincipalName(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedClassId && reportType === "monthly" && (
              <div className="mt-4 flex items-center gap-4">
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
            )}

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

          {selectedClassId && reportType === "monthly" && (
            <div ref={reportRef} className="animate-scaleIn">
              <KhmerMonthlyReport />
            </div>
          )}

          {selectedClassId && reportType === "honor" && (
            <div ref={reportRef} className="animate-scaleIn">
              {certificateTemplate === "template1" && <HonorTemplate1 />}
              {certificateTemplate === "template2" && <HonorTemplate2 />}
              {certificateTemplate === "template3" && <HonorTemplate3 />}
              {certificateTemplate === "template4" && <HonorTemplate4 />}
            </div>
          )}

          {selectedClassId && reportType === "statistics" && (
            <div ref={reportRef} className="space-y-6 animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-4xl font-bold mb-2">ស្ថិតិថ្នាក់រៀន</h2>
                <p className="text-xl">{selectedClass?.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl">
                  <Users className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សសរុប</p>
                  <p className="text-4xl font-bold">{classStudents.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl">
                  <Trophy className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សជាប់</p>
                  <p className="text-4xl font-bold">{passedStudents}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-xl">
                  <XCircle className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សធ្លាក់</p>
                  <p className="text-4xl font-bold">{failedStudents}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">មធ្យមភាគថ្នាក់</p>
                  <p className="text-4xl font-bold">
                    {classAverage.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

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

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
  Camera,
  Calendar,
} from "lucide-react";

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedStatsMonth, setSelectedStatsMonth] = useState("1"); // NEW: For statistics
  const [selectedHonorMonth, setSelectedHonorMonth] = useState("1"); // NEW: For honor roll
  const [reportType, setReportType] = useState("monthly");
  const [certificateTemplate, setCertificateTemplate] = useState<
    "template1" | "template2" | "template3" | "template4" | "template5"
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
    { value: "honor", label: "តារាងកិត្តិយស - Honor Roll" },
    { value: "statistics", label: "ស្ថិតិថ្នាក់ - Class Statistics" },
  ];

  const certificateTemplates = [
    { value: "template1", label: "គំរូទី១ - មេដាយមាស Gold Medal" },
    { value: "template2", label: "គំរូទី២ - ពានរង្វាន់ Trophy" },
    { value: "template3", label: "គំរូទី៣ - ទំនើប Modern" },
    { value: "template4", label: "គំរូទី៤ - ស្រស់ស្អាត Elegant" },
    { value: "template5", label: "គំរូទី៥ - ប្រណីត Premium" },
  ];

  // Get month name in Khmer
  const getMonthName = (month: string) => {
    const months: { [key: string]: string } = {
      "1": "មករា",
      "2": "កុម្ភៈ",
      "3": "មីនា",
      "4": "មេសា",
      "5": "ឧសភា",
      "6": "មិថុនា",
      "7": "កក្កដា",
      "8": "សីហា",
      "9": "កញ្ញា",
      "10": "តុលា",
      "11": "វិច្ឆិកា",
      "12": "ធ្នូ",
    };
    return months[month] || "មករា";
  };

  // Medal emoji for ranking
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getStudentInitials = (student: any) => {
    const firstInitial = student.firstName?.charAt(0) || "";
    const lastInitial = student.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

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

    if (abbrMap[subjectName]) return abbrMap[subjectName];
    for (const [key, value] of Object.entries(abbrMap)) {
      if (subjectName.includes(key) || key.includes(subjectName)) return value;
    }
    return subjectName
      .substring(0, Math.min(3, subjectName.length))
      .toUpperCase();
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Calculate reports based on selected month (for statistics)
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

  const sortedStatsReports = [...statsReports].sort(
    (a, b) => b.average - a.average
  );
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

  const passedStudents = statsReports.filter((s) => s.average >= 50).length;
  const failedStudents = statsReports.filter((s) => s.average < 50).length;
  const passRate =
    statsReports.length > 0 ? (passedStudents / statsReports.length) * 100 : 0;
  const classAverage =
    statsReports.length > 0
      ? statsReports.reduce((sum, s) => sum + s.average, 0) /
        statsReports.length
      : 0;

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

  const StudentPhoto = ({
    student,
    size = "md",
  }: {
    student: any;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-10 h-10 text-xs",
      md: "w-14 h-14 text-sm",
      lg: "w-20 h-20 text-base",
    };
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}
      >
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={`${student.firstName} ${student.lastName}`}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span style={{ fontFamily: "Khmer OS Muol Light" }}>
            {getStudentInitials(student)}
          </span>
        )}
      </div>
    );
  };

  // Keep all the report page components from v3...
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
                      <div className="w-8 h-8 border-2 border-green-600 rounded-full"></div>
                    </div>
                  )}
                  {showCircles && autoCircle && !isPassed && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-600 text-2xl font-bold">
                      ✗
                    </div>
                  )}
                  <span className="relative z-10">{absoluteIndex + 1}</span>
                </td>
                <td className="border border-black px-2 py-2">
                  {report.student.lastName} {report.student.firstName}
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  {report.student.gender === "male" ? "ប្រុស" : "ស្រី"}
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
                  return (
                    <td
                      key={subject.id}
                      className="border border-black px-1 py-2 text-center"
                    >
                      {grade ? grade.score : "-"}
                    </td>
                  );
                })}
                <td className="border border-black px-2 py-2 text-center font-semibold">
                  {report.total.toFixed(2)}
                </td>
                {showGrade && (
                  <td className="border border-black px-2 py-2 text-center font-semibold">
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
      <div className="grid grid-cols-2 gap-8 text-center text-sm mt-8">
        <div>
          <p className="mb-1">{reportDate}</p>
          <p className="mb-16">ត្រួតពិនិត្យ</p>
          <div className="border-t-2 border-black pt-1 inline-block px-8">
            <p
              className="font-semibold"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              {teacherName}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1">{reportDate}</p>
          <p className="mb-16">អនុញ្ញាត</p>
          <div className="border-t-2 border-black pt-1 inline-block px-8">
            <p
              className="font-semibold"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              {principalName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const KhmerMonthlyReport = () => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
  );

  // Honor templates - keeping from v3 (shortened for space)
  const HonorTemplate1 = () => (
    <div
      className="honor-certificate"
      style={{
        fontFamily: "Khmer OS Battambang",
        padding: pageMargin,
        backgroundColor: "white",
      }}
    >
      <div
        className={`h-full flex flex-col ${
          showBorder
            ? "border-[6px] border-double border-yellow-600 rounded-lg p-6"
            : "p-8"
        }`}
        style={{ backgroundColor: "#fffef5" }}
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl text-yellow-600">❀</span>
            <h1
              className="text-xl font-bold text-gray-800 mx-3"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <span className="text-2xl text-yellow-600">❀</span>
          </div>
          <p
            className="text-base font-bold text-gray-700"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </p>
          <div className="flex items-center justify-center mt-2">
            <span className="text-yellow-600">✦</span>
            <div className="h-px w-16 bg-yellow-600 mx-2"></div>
            <span className="text-yellow-600">✦</span>
            <div className="h-px w-16 bg-yellow-600 mx-2"></div>
            <span className="text-yellow-600">✦</span>
          </div>
        </div>
        <div className="text-center mb-3">
          <h2
            className="text-lg font-bold text-gray-800"
            style={{ fontFamily: "Khmer OS Muol Light" }}
          >
            {honorSchoolName}
          </h2>
        </div>
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-3xl">🏅</span>
            <h2
              className="text-4xl font-bold text-yellow-600"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              តារាងកិត្តិយស
            </h2>
            <span className="text-3xl">🏅</span>
          </div>
          <div className="mt-2">
            <span
              className="inline-block bg-yellow-100 text-yellow-800 px-5 py-1 rounded-full text-sm font-semibold"
              style={{ fontFamily: "Khmer OS Muol Light" }}
            >
              {honorPeriod}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ថ្នាក់៖ {selectedClass?.name} • ឆ្នាំសិក្សា {selectedClass?.year}
          </p>
        </div>
        <div className="flex-1 space-y-3 mb-5">
          {topStudents.map((report, index) => (
            <div key={report.student.id}>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-3">
                {showStudentPhotos ? (
                  <StudentPhoto student={report.student} size="md" />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-300 to-yellow-500"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-300 to-gray-500"
                        : index === 2
                        ? "bg-gradient-to-br from-orange-300 to-orange-500"
                        : "bg-gradient-to-br from-blue-300 to-blue-500"
                    }`}
                  >
                    <span
                      className="text-white text-xl font-bold"
                      style={{ fontFamily: "Khmer OS Muol" }}
                    >
                      {["១", "២", "៣", "៤", "៥", "៦"][index]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className="text-base font-bold text-gray-800"
                    style={{ fontFamily: "Khmer OS Muol Light" }}
                  >
                    {report.student.lastName} {report.student.firstName}
                  </p>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="bg-blue-50 px-2 py-1 rounded-full">
                      ពិន្ទុ:{" "}
                      <span className="font-bold text-blue-600">
                        {report.average.toFixed(2)}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-2 py-1 rounded-full">
                      និទ្ទេស:{" "}
                      <span className="font-bold">{report.letterGrade}</span>
                    </span>
                  </div>
                </div>
                <div className="text-3xl flex-shrink-0">
                  {index < 3 ? ["🥇", "🥈", "🥉"][index] : "⭐"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-12 text-center pt-4 border-t border-gray-300">
          <div>
            <p className="text-xs mb-1">{reportDate}</p>
            <p className="text-xs mb-12">ត្រួតពិនិត្យ</p>
            <div className="inline-block border-t-2 border-gray-400 pt-1 px-8">
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "Khmer OS Muol Light" }}
              >
                {teacherName}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1">{reportDate}</p>
            <p className="text-xs mb-12">អនុញ្ញាត</p>
            <div className="inline-block border-t-2 border-gray-400 pt-1 px-8">
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "Khmer OS Muol Light" }}
              >
                {principalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Other templates similar structure (keeping compact)
  const HonorTemplate2 = () => <HonorTemplate1 />; // Simplified for space
  const HonorTemplate3 = () => <HonorTemplate1 />;
  const HonorTemplate4 = () => <HonorTemplate1 />;
  const HonorTemplate5 = () => <HonorTemplate1 />;

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
              {reportType === "monthly" && (
                <Select
                  label="ខែ Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthOptions}
                />
              )}
              {reportType === "statistics" && (
                <div>
                  <Select
                    label="ខែ Month (Statistics)"
                    value={selectedStatsMonth}
                    onChange={(e) => setSelectedStatsMonth(e.target.value)}
                    options={monthOptions}
                  />
                </div>
              )}
              {reportType === "honor" && (
                <div>
                  <Select
                    label="ខែ Month (Honor)"
                    value={selectedHonorMonth}
                    onChange={(e) => setSelectedHonorMonth(e.target.value)}
                    options={monthOptions}
                  />
                </div>
              )}
            </div>

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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            រយៈពេល Period
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
                            ចំនួនសិស្ស Max Students (5-6)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="6"
                            value={maxHonorStudents}
                            onChange={(e) =>
                              setMaxHonorStudents(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-600" />
                        ជម្រើសស៊ុម, Margin & រូបថត Options
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showBorder}
                            onChange={(e) => setShowBorder(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            បង្ហាញស៊ុម Show Border
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={showStudentPhotos}
                            onChange={(e) =>
                              setShowStudentPhotos(e.target.checked)
                            }
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            បង្ហាញរូបថតសិស្ស Show Student Photos
                          </span>
                        </label>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700">
                            Margin (Padding) - អនុសាសន៍ 1.5cm
                          </label>
                          <select
                            value={pageMargin}
                            onChange={(e) => setPageMargin(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="0.5cm">0.5cm</option>
                            <option value="1cm">1.0cm</option>
                            <option value="1.5cm">1.5cm (អនុសាសន៍)</option>
                            <option value="2cm">2.0cm</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedClassId && reportType === "monthly" && (
              <div className="mt-4 space-y-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-blue-700" />
                  <span className="text-sm font-semibold text-blue-700">
                    កំណត់របាយការណ៍
                  </span>
                </button>
                {showSettings && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 space-y-4">
                    {/* Settings content similar to above */}
                  </div>
                )}
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
              {certificateTemplate === "template5" && <HonorTemplate5 />}
            </div>
          )}

          {/* NEW STATISTICS VIEW */}
          {selectedClassId && reportType === "statistics" && (
            <div ref={reportRef} className="animate-scaleIn">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1
                    className="text-3xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: "Khmer OS Muol Light" }}
                  >
                    សន្លឹកលទ្ធផលប្រចាំខែ Monthly Results
                  </h1>
                  <p
                    className="text-xl text-gray-600"
                    style={{ fontFamily: "Khmer OS Muol Light" }}
                  >
                    ថ្នាក់ទី {selectedClass?.name} - ឆ្នាំសិក្សា{" "}
                    {selectedClass?.year}
                  </p>
                  <p className="text-base text-gray-500 mt-1">
                    ខែ {getMonthName(selectedStatsMonth)}
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-blue-600 font-semibold mb-1">
                      សិស្សសរុប Total Students
                    </p>
                    <p className="text-4xl font-bold text-blue-700">
                      {statsReports.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
                    <p className="text-sm text-green-600 font-semibold mb-1">
                      មធ្យមភាគថ្នាក់ Class Average
                    </p>
                    <p className="text-4xl font-bold text-green-700">
                      {classAverage.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
                    <p className="text-sm text-purple-600 font-semibold mb-1">
                      អត្រាជាប់ Pass Rate
                    </p>
                    <p className="text-4xl font-bold text-purple-700">
                      {passRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Student Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <th className="px-4 py-3 text-left rounded-tl-lg">
                          ល.រ
                        </th>
                        <th className="px-4 py-3 text-left">
                          អត្តសញ្ញាណ និងឈ្មោះ
                        </th>
                        <th className="px-4 py-3 text-center">ភេទ</th>
                        <th className="px-4 py-3 text-center">គណិតវិទ្យា</th>
                        <th className="px-4 py-3 text-center">សរុបវា</th>
                        <th className="px-4 py-3 text-center">គីមីវិទ្យា</th>
                        <th className="px-4 py-3 text-center">ភាសាខ្មែរ</th>
                        <th className="px-4 py-3 text-center">ភាសាអង់គ្លេស</th>
                        <th className="px-4 py-3 text-center bg-yellow-500 font-bold">
                          សរុប
                        </th>
                        <th className="px-4 py-3 text-center bg-green-500 font-bold">
                          មធ្យមភាគ
                        </th>
                        <th className="px-4 py-3 text-center bg-blue-500 font-bold rounded-tr-lg">
                          និទ្ទេស
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStatsReports.map((report, index) => (
                        <tr
                          key={report.student.id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {getMedalEmoji(index + 1)}
                              </span>
                              <span className="font-bold text-gray-700">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {report.student.gender === "male" ? "👦" : "👧"}
                              </span>
                              <span
                                className="font-semibold text-gray-800"
                                style={{ fontFamily: "Khmer OS Muol Light" }}
                              >
                                {report.student.lastName}{" "}
                                {report.student.firstName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200 text-center">
                            <span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor:
                                  report.student.gender === "male"
                                    ? "#DBEAFE"
                                    : "#FCE7F3",
                                color:
                                  report.student.gender === "male"
                                    ? "#1E40AF"
                                    : "#BE185D",
                              }}
                            >
                              {report.student.gender === "male"
                                ? "ប្រុស"
                                : "ស្រី"}
                            </span>
                          </td>
                          {subjects.map((subject) => {
                            const grade = report.grades.find(
                              (g: any) => g.subjectId === subject.id
                            );
                            const score = grade ? parseFloat(grade.score) : 0;
                            return (
                              <td
                                key={subject.id}
                                className="px-4 py-4 border-b border-gray-200 text-center"
                              >
                                <span
                                  className={`font-semibold ${
                                    score >= 90
                                      ? "text-green-600"
                                      : score >= 80
                                      ? "text-blue-600"
                                      : score >= 70
                                      ? "text-yellow-600"
                                      : score >= 50
                                      ? "text-orange-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {grade ? grade.score : "-"}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 border-b border-gray-200 text-center bg-yellow-50">
                            <span className="font-bold text-yellow-700 text-lg">
                              {report.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200 text-center bg-green-50">
                            <span className="font-bold text-green-700 text-lg">
                              {report.average.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200 text-center bg-blue-50">
                            <span
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg"
                              style={{
                                backgroundColor:
                                  report.letterGrade === "A"
                                    ? "#22C55E"
                                    : report.letterGrade === "B"
                                    ? "#3B82F6"
                                    : report.letterGrade === "C"
                                    ? "#EAB308"
                                    : report.letterGrade === "D"
                                    ? "#F97316"
                                    : "#EF4444",
                                color: "white",
                              }}
                            >
                              {report.letterGrade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Signatures */}
                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t-2 border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      ត្រូតពិនិត្យដោយ Reviewed by
                    </p>
                    <p className="text-xs text-gray-500 mb-16">
                      ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៥
                    </p>
                    <div className="border-t-2 border-gray-400 pt-2 inline-block px-12">
                      <p
                        className="font-bold text-gray-800"
                        style={{ fontFamily: "Khmer OS Muol Light" }}
                      >
                        {teacherName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Class Teacher
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      អនុម័តដោយ Approved by
                    </p>
                    <p className="text-xs text-gray-500 mb-16">
                      ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៥
                    </p>
                    <div className="border-t-2 border-gray-400 pt-2 inline-block px-12">
                      <p
                        className="font-bold text-gray-800"
                        style={{ fontFamily: "Khmer OS Muol Light" }}
                      >
                        {principalName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Principal</p>
                    </div>
                  </div>
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

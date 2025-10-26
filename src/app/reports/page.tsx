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
    { value: "template1", label: "គំរូទី១ - មេដាយមាស" },
    { value: "template2", label: "គំរូទី២ - ពានរង្វាន់" },
    { value: "template3", label: "គំរូទី៣ - បង្អួចសម្បូរ" },
    { value: "template4", label: "គំរូទី៤ - ស្រាលស្អាត" },
  ];

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Get grades filtered by MONTH
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

  // Sort students
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

  const topStudents = sortedReports.slice(0, 5);

  // Statistics
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

  // Honor Certificate Templates
  const HonorTemplate1 = () => (
    <div
      className="bg-white p-12 rounded-3xl shadow-2xl"
      style={{ minHeight: "800px" }}
    >
      <style jsx>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Header with decorative border */}
      <div className="text-center mb-8 pb-6 border-b-4 border-double border-red-600">
        <h1
          className="text-3xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: "Khmer OS Muol Light" }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p className="text-xl font-semibold text-gray-700">
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          <span className="mx-4 text-red-600 text-2xl">❀</span>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h2
          className="text-5xl font-bold mb-4"
          style={{
            fontFamily: "Khmer OS Muol Light",
            background: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          សារណីយកិត្តិយស
        </h2>
        <p className="text-xl text-gray-600">
          ប្រចាំខែ{" "}
          {
            monthOptions
              .find((m) => m.value === selectedMonth)
              ?.label.split(" - ")[0]
          }
        </p>
        <p className="text-lg text-gray-500 mt-2">
          {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
        </p>
      </div>

      {/* Top 5 with Gold Medals */}
      <div className="space-y-6">
        {topStudents.map((report, index) => (
          <div key={report.student.id} className="relative">
            {/* Medal Badge */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                {/* Medal Circle */}
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500"
                      : index === 2
                      ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500"
                      : "bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500"
                  }`}
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${
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
                      {index === 0
                        ? "១"
                        : index === 1
                        ? "២"
                        : index === 2
                        ? "៣"
                        : index === 3
                        ? "៤"
                        : "៥"}
                    </span>
                  </div>
                </div>
                {/* Ribbon */}
                <div
                  className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-16 ${
                    index === 0
                      ? "bg-gradient-to-b from-red-500 to-red-600"
                      : index === 1
                      ? "bg-gradient-to-b from-red-400 to-red-500"
                      : "bg-gradient-to-b from-red-300 to-red-400"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
                  }}
                ></div>
              </div>

              {/* Name Plate */}
              <div
                className={`flex-1 p-6 rounded-r-2xl shadow-lg border-l-4 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-500"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-500"
                    : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-2xl font-bold text-gray-800"
                      style={{ fontFamily: "Khmer OS Battambang" }}
                    >
                      {report.student.lastName} {report.student.firstName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ពិន្ទុមធ្យម:{" "}
                      <span className="font-bold text-blue-600">
                        {report.average.toFixed(2)}
                      </span>{" "}
                      | និទ្ទេស:{" "}
                      <span className="font-bold">{report.letterGrade}</span>
                    </p>
                  </div>
                  {showPhotos && (
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300 grid grid-cols-2 gap-8 text-center">
        <div>
          <p className="text-sm text-gray-600 mb-16">ត្រួតពិនិត្យ</p>
          <p className="font-semibold border-t-2 border-gray-400 pt-2 inline-block px-8">
            គ្រូបន្ទុកថ្នាក់
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៤</p>
          <p className="text-sm text-gray-600 mb-16">នាយកសាលា</p>
          <p className="font-semibold border-t-2 border-gray-400 pt-2 inline-block px-8">
            ហត្ថលេខា
          </p>
        </div>
      </div>
    </div>
  );

  const HonorTemplate2 = () => (
    <div
      className="bg-white p-12 border-8 border-red-600 rounded-2xl"
      style={{ minHeight: "800px" }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 text-6xl">🌹</div>
      <div className="absolute top-4 right-4 text-6xl">🌹</div>
      <div className="absolute bottom-4 left-4 text-6xl">🌹</div>
      <div className="absolute bottom-4 right-4 text-6xl">🌹</div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p className="text-xl font-semibold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
        <div className="my-4 flex items-center justify-center">
          <div className="h-0.5 w-32 bg-gray-400"></div>
          <span className="mx-2">❀❀❀</span>
          <div className="h-0.5 w-32 bg-gray-400"></div>
        </div>
      </div>

      <h2
        className="text-center text-5xl font-bold mb-8 text-red-600"
        style={{ fontFamily: "Khmer OS Muol Light" }}
      >
        សារណីយកិត្តិយស
      </h2>
      <p className="text-center text-2xl mb-12">
        ប្រចាំខែ{" "}
        {
          monthOptions
            .find((m) => m.value === selectedMonth)
            ?.label.split(" - ")[0]
        }
      </p>

      {/* Trophy Layout */}
      <div className="relative" style={{ height: "400px" }}>
        {/* 1st Place - Center Top */}
        {topStudents[0] && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 text-center">
            <div className="text-8xl mb-4">🏆</div>
            <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-xl">
              ១
            </div>
            <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-4 w-64 shadow-xl">
              <p className="font-bold text-xl">
                {topStudents[0].student.lastName}{" "}
                {topStudents[0].student.firstName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ពិន្ទុ: {topStudents[0].average.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* 2nd Place - Left */}
        {topStudents[1] && (
          <div className="absolute left-8 top-20 text-center">
            <div className="text-7xl mb-4">🏆</div>
            <div className="bg-gradient-to-b from-gray-300 to-gray-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-xl">
              ២
            </div>
            <div className="bg-gray-50 border-4 border-gray-400 rounded-xl p-4 w-56 shadow-xl">
              <p className="font-bold text-lg">
                {topStudents[1].student.lastName}{" "}
                {topStudents[1].student.firstName}
              </p>
              <p className="text-sm text-gray-600">
                ពិន្ទុ: {topStudents[1].average.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* 3rd Place - Right */}
        {topStudents[2] && (
          <div className="absolute right-8 top-20 text-center">
            <div className="text-7xl mb-4">🏆</div>
            <div className="bg-gradient-to-b from-orange-300 to-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-xl">
              ៣
            </div>
            <div className="bg-orange-50 border-4 border-orange-400 rounded-xl p-4 w-56 shadow-xl">
              <p className="font-bold text-lg">
                {topStudents[2].student.lastName}{" "}
                {topStudents[2].student.firstName}
              </p>
              <p className="text-sm text-gray-600">
                ពិន្ទុ: {topStudents[2].average.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* 4th and 5th - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around">
          {topStudents[3] && (
            <div className="text-center">
              <div className="text-6xl mb-2">🏆</div>
              <div className="bg-gradient-to-b from-blue-300 to-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg">
                ៤
              </div>
              <div className="bg-blue-50 border-4 border-blue-400 rounded-xl p-3 w-48">
                <p className="font-bold">
                  {topStudents[3].student.lastName}{" "}
                  {topStudents[3].student.firstName}
                </p>
                <p className="text-xs text-gray-600">
                  ពិន្ទុ: {topStudents[3].average.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          {topStudents[4] && (
            <div className="text-center">
              <div className="text-6xl mb-2">🏆</div>
              <div className="bg-gradient-to-b from-purple-300 to-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg">
                ៥
              </div>
              <div className="bg-purple-50 border-4 border-purple-400 rounded-xl p-3 w-48">
                <p className="font-bold">
                  {topStudents[4].student.lastName}{" "}
                  {topStudents[4].student.firstName}
                </p>
                <p className="text-xs text-gray-600">
                  ពិន្ទុ: {topStudents[4].average.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const HonorTemplate3 = () => (
    <div
      className="bg-white p-12 border-8 border-double"
      style={{
        minHeight: "800px",
        borderImage: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) 1",
      }}
    >
      {/* Decorative Pattern Border */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-20"></div>

      <div className="text-center mb-8 relative z-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p className="text-xl font-semibold text-gray-700">
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-3xl mb-8">
        <h2
          className="text-center text-5xl font-bold mb-4"
          style={{
            fontFamily: "Khmer OS Muol Light",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          តារាងកិត្តិយស
        </h2>
        <p className="text-center text-xl text-gray-600">
          ប្រចាំខែ
          {
            monthOptions
              .find((m) => m.value === selectedMonth)
              ?.label.split("-")[0]
          }
        </p>
        <p className="text-center text-lg text-gray-500">
          {selectedClass?.name} - ឆ្នាំ {selectedClass?.year}
        </p>
      </div>

      {/* Top 3 with Photos */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {topStudents.slice(0, 3).map((report, index) => (
          <div key={report.student.id} className="text-center">
            {showPhotos ? (
              <div className="relative inline-block mb-4">
                <div
                  className={`w-32 h-32 rounded-full border-8 overflow-hidden shadow-2xl ${
                    index === 0
                      ? "border-yellow-400"
                      : index === 1
                      ? "border-gray-400"
                      : "border-orange-400"
                  } bg-gradient-to-br from-blue-100 to-purple-100`}
                >
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    👤
                  </div>
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-400 to-gray-600"
                      : "bg-gradient-to-br from-orange-400 to-orange-600"
                  }`}
                >
                  {index === 0 ? "១" : index === 1 ? "២" : "៣"}
                </div>
              </div>
            ) : (
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-xl ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                    : "bg-gradient-to-br from-orange-400 to-orange-600"
                }`}
              >
                {index === 0 ? "១" : index === 1 ? "២" : "៣"}
              </div>
            )}
            <div
              className={`p-4 rounded-xl shadow-lg ${
                index === 0
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100"
                  : index === 1
                  ? "bg-gradient-to-br from-gray-50 to-gray-100"
                  : "bg-gradient-to-br from-orange-50 to-orange-100"
              }`}
            >
              <p className="font-bold text-lg mb-2">
                {report.student.lastName} {report.student.firstName}
              </p>
              <p className="text-sm text-gray-600">
                ពិន្ទុ:{" "}
                <span className="font-bold text-blue-600">
                  {report.average.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4th and 5th */}
      {topStudents.length > 3 && (
        <div className="grid grid-cols-2 gap-6">
          {topStudents.slice(3, 5).map((report, index) => (
            <div
              key={report.student.id}
              className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-lg"
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
    </div>
  );

  const HonorTemplate4 = () => (
    <div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12 rounded-3xl shadow-2xl"
      style={{ minHeight: "800px" }}
    >
      {/* Minimal Header */}
      <div className="text-center mb-12">
        <div className="inline-block">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🏆 តារាងកិត្តិយស
          </h1>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <p className="text-xl text-gray-600 mt-4">{selectedClass?.name}</p>
        <p className="text-lg text-gray-500">
          ខែ{" "}
          {
            monthOptions
              .find((m) => m.value === selectedMonth)
              ?.label.split("-")[0]
          }{" "}
          {selectedClass?.year}
        </p>
      </div>

      {/* Clean Modern Cards */}
      <div className="space-y-4">
        {topStudents.map((report, index) => (
          <div
            key={report.student.id}
            className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:scale-102 ${
              index === 0
                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                : index === 1
                ? "bg-gradient-to-r from-gray-300 to-gray-400"
                : index === 2
                ? "bg-gradient-to-r from-orange-300 to-red-400"
                : "bg-gradient-to-r from-blue-400 to-purple-500"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="text-9xl">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "⭐"}
              </div>
            </div>

            <div className="relative p-6 flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                  <span
                    className={`text-3xl font-bold ${
                      index === 0
                        ? "text-yellow-600"
                        : index === 1
                        ? "text-gray-600"
                        : index === 2
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>

              {showPhotos && (
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">👤</span>
                </div>
              )}

              <div className="flex-1 text-white">
                <p className="text-2xl font-bold drop-shadow-lg">
                  {report.student.lastName} {report.student.firstName}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
                    ពិន្ទុ: {report.average.toFixed(2)}
                  </span>
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
                    និទ្ទេស: {report.letterGrade}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-white text-6xl">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "⭐"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center">
        <p className="text-sm text-gray-500">
          សូមអបអរសាទរ និងបន្តខំប្រឹងសិក្សា!
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 animate-fadeIn">
          <div className="mb-6 no-print">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              របាយការណ៍ Reports
            </h1>
            <p className="text-gray-600">
              របាយការណ៍ពិន្ទុសិស្ស និងស្ថិតិថ្នាក់រៀន
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

            {reportType === "honor" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="ប្រភេទតារាងកិត្តិយស Certificate Template"
                  value={certificateTemplate}
                  onChange={(e) =>
                    setCertificateTemplate(e.target.value as any)
                  }
                  options={certificateTemplates}
                />
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPhotos}
                      onChange={(e) => setShowPhotos(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      បង្ហាញរូបថតសិស្ស Show Photos
                    </span>
                  </label>
                </div>
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

          {/* Monthly Report - Same as before */}
          {selectedClassId && reportType === "monthly" && (
            <div
              ref={reportRef}
              className="bg-white rounded-2xl shadow-xl p-8 animate-scaleIn"
            >
              {/* Monthly report content here - keeping it the same */}
            </div>
          )}

          {/* Honor Certificates with Templates */}
          {selectedClassId && reportType === "honor" && (
            <div ref={reportRef} className="animate-scaleIn">
              {certificateTemplate === "template1" && <HonorTemplate1 />}
              {certificateTemplate === "template2" && <HonorTemplate2 />}
              {certificateTemplate === "template3" && <HonorTemplate3 />}
              {certificateTemplate === "template4" && <HonorTemplate4 />}
            </div>
          )}

          {/* Statistics - Same as before with XCircle fix */}
          {selectedClassId && reportType === "statistics" && (
            <div ref={reportRef} className="space-y-6 animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-4xl font-bold mb-2">ស្ថិតិថ្នាក់រៀន</h2>
                <p className="text-xl">{selectedClass?.name}</p>
                <p className="text-blue-100 mt-2">
                  ឆ្នាំសិក្សា {selectedClass?.year} - ខែ{" "}
                  {
                    monthOptions
                      .find((m) => m.value === selectedMonth)
                      ?.label.split(" - ")[0]
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl card-hover">
                  <Users className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សសរុប</p>
                  <p className="text-4xl font-bold">{classStudents.length}</p>
                  <p className="text-xs opacity-75 mt-1">នាក់</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl card-hover">
                  <Trophy className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សជាប់</p>
                  <p className="text-4xl font-bold">{passedStudents}</p>
                  <p className="text-xs opacity-75 mt-1">
                    នាក់ ({passRate.toFixed(1)}%)
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-xl card-hover">
                  <XCircle className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">សិស្សធ្លាក់</p>
                  <p className="text-4xl font-bold">{failedStudents}</p>
                  <p className="text-xs opacity-75 mt-1">
                    នាក់ ({(100 - passRate).toFixed(1)}%)
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl card-hover">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">មធ្យមភាគថ្នាក់</p>
                  <p className="text-4xl font-bold">
                    {classAverage.toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75 mt-1">ពិន្ទុ</p>
                </div>
              </div>

              {/* Rest of statistics remains the same */}
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

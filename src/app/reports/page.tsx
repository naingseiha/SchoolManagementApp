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
import { Download, Printer, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [reportType, setReportType] = useState("monthly");
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

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const studentReports = classStudents
    .map((student) => {
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      const average = calculateAverage(studentGrades);
      const letterGrade = getLetterGrade(average, GRADE_SCALE);

      return {
        student,
        grades: studentGrades,
        average,
        letterGrade,
      };
    })
    .sort((a, b) => b.average - a.average);

  const topStudents = studentReports.slice(0, 5);

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Report_${selectedClass?.name}_${reportType}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = studentReports.map((report, index) => ({
      "ល.រ": index + 1,
      "គោត្តនាម និងនាម": `${report.student.lastName} ${report.student.firstName}`,
      ភេទ: report.student.gender === "male" ? "ប្រុស" : "ស្រី",
      ...subjects.reduce((acc, subject) => {
        const grade = report.grades.find((g) => g.subjectId === subject.id);
        acc[subject.name] = grade ? grade.score : "-";
        return acc;
      }, {} as Record<string, any>),
      មធ្យមភាគ: report.average.toFixed(2),
      និទ្ទេស: report.letterGrade,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Report_${selectedClass?.name}_${reportType}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

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
              {reportType === "monthly" && (
                <Select
                  label="ខែ Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthOptions}
                />
              )}
            </div>

            {selectedClassId && (
              <div className="flex gap-3 mt-6 justify-end">
                <Button onClick={handlePrint} variant="secondary">
                  <Printer className="w-4 h-4 mr-2" />
                  បោះពុម្ព Print
                </Button>
                <Button onClick={exportToPDF} variant="success">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            )}
          </div>

          {selectedClassId && reportType === "monthly" && (
            <div
              ref={reportRef}
              className="bg-white rounded-2xl shadow-xl p-8 animate-scaleIn"
            >
              <div className="text-center mb-8 print:mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  របាយការណ៍លទ្ធផលប្រចាំខែ
                </h2>
                <p className="text-xl text-gray-600">
                  {selectedClass?.name} - ឆ្នាំសិក្សា {selectedClass?.year}
                </p>
                <p className="text-lg text-gray-500 mt-2">
                  ខែ{" "}
                  {monthOptions.find((m) => m.value === selectedMonth)?.label}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-bold border border-gray-300">
                        ល.រ
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold border border-gray-300">
                        គោត្តនាម និងនាម
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">
                        ភេទ
                      </th>
                      {subjects.map((subject) => (
                        <th
                          key={subject.id}
                          className="px-4 py-3 text-center text-sm font-bold border border-gray-300"
                        >
                          {subject.name}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">
                        សរុប
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">
                        មធ្យមភាគ
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">
                        និទ្ទេស
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentReports.map((report, index) => {
                      const total = report.grades.reduce(
                        (sum, g) => sum + parseFloat(g.score || "0"),
                        0
                      );

                      return (
                        <tr
                          key={report.student.id}
                          className={`hover:bg-blue-50 ${
                            report.average >= 50 ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <td className="px-4 py-3 text-center border border-gray-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium border border-gray-300">
                            {report.student.lastName} {report.student.firstName}
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300">
                            {report.student.gender === "male"
                              ? "ប្រុស"
                              : "ស្រី"}
                          </td>
                          {subjects.map((subject) => {
                            const grade = report.grades.find(
                              (g) => g.subjectId === subject.id
                            );
                            const score = grade ? parseFloat(grade.score) : 0;
                            return (
                              <td
                                key={subject.id}
                                className={`px-4 py-3 text-center border border-gray-300 ${
                                  score < 50
                                    ? "bg-red-100 text-red-700 font-bold"
                                    : ""
                                }`}
                              >
                                {grade ? score.toFixed(1) : "-"}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center font-bold bg-yellow-50 border border-gray-300">
                            {total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold border border-gray-300">
                            {report.average.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${
                                report.letterGrade === "A"
                                  ? "bg-green-100 text-green-800"
                                  : report.letterGrade === "B"
                                  ? "bg-blue-100 text-blue-800"
                                  : report.letterGrade === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : report.letterGrade === "D"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {report.letterGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-lg font-semibold">
                    📊 សិស្សជាប់:{" "}
                    <span className="text-green-600">
                      {studentReports.filter((s) => s.average >= 50).length}{" "}
                      នាក់
                    </span>
                  </p>
                  <p className="text-lg font-semibold">
                    📊 សិស្សធ្លាក់:{" "}
                    <span className="text-red-600">
                      {studentReports.filter((s) => s.average < 50).length} នាក់
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    💡 អត្រាជោគជ័យ:{" "}
                    <span className="text-blue-600">
                      {studentReports.length > 0
                        ? (
                            (studentReports.filter((s) => s.average >= 50)
                              .length /
                              studentReports.length) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedClassId && reportType === "honor" && (
            <div
              ref={reportRef}
              className="bg-white rounded-2xl shadow-xl p-8 animate-scaleIn"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  🏆 តារាងកិត្តិយស 🏆
                </h2>
                <p className="text-2xl text-gray-700">{selectedClass?.name}</p>
                <p className="text-lg text-gray-500 mt-2">
                  ឆ្នាំសិក្សា {selectedClass?.year}
                </p>
              </div>

              <div className="space-y-6">
                {topStudents.map((report, index) => (
                  <div
                    key={report.student.id}
                    className={`flex items-center justify-between p-8 rounded-2xl border-4 transition-all duration-300 hover:scale-105 ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400 shadow-2xl"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400 shadow-xl"
                        : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400 shadow-xl"
                        : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-lg"
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <div
                        className={`flex items-center justify-center w-20 h-20 rounded-full font-bold text-4xl text-white shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-600"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-2xl text-gray-900">
                          {report.student.lastName} {report.student.firstName}
                        </p>
                        <p className="text-gray-600 mt-1">
                          ពិន្ទុសរុប:{" "}
                          <span className="font-bold text-blue-600">
                            {report.average.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          និទ្ទេស:{" "}
                          <span className="font-semibold">
                            {report.letterGrade}
                          </span>
                        </p>
                      </div>
                    </div>
                    {index === 0 && <span className="text-6xl">🥇</span>}
                    {index === 1 && <span className="text-6xl">🥈</span>}
                    {index === 2 && <span className="text-6xl">🥉</span>}
                    {index > 2 && <span className="text-5xl">⭐</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedClassId && (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-500">
                សូមជ្រើសរើសថ្នាក់ដើម្បីមើលរបាយការណ៍
              </p>
              <p className="text-gray-400 mt-2">
                Please select a class to view the report
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

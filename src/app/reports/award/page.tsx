"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import HonorCertificateMedals from "@/components/reports/HonorCertificateMedals";
import HonorCertificateTrophies from "@/components/reports/HonorCertificateTrophies";
import {
  Printer,
  Loader2,
  Trophy,
  Users,
  FileText,
  Sparkles,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import {
  calculateTopStudentsByClass,
  calculateTopStudentsByGrade,
} from "@/lib/utils/topStudentsCalculator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const monthNames = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export default function AwardReportPage() {
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes } = useData();
  const router = useRouter();

  // ✅ Filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "ADMIN") return classes;
    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();
      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
        });
      }
      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }
      return classes.filter((c) => Array.from(classIdsSet).includes(c.id));
    }
    return [];
  }, [currentUser, classes]);

  const [reportType, setReportType] = useState<"class" | "grade">("class");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("ធ្នូ");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [templateType, setTemplateType] = useState<"medals" | "trophies">(
    "medals"
  );
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const academicYear = `${selectedYear}-${selectedYear + 1}`;

  const grades = Array.from(new Set(classes.map((c) => c.grade))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId && reportType === "class") {
      setSelectedClassId(classes[0].id);
    }
    if (grades.length > 0 && !selectedGrade && reportType === "grade") {
      setSelectedGrade(grades[0]);
    }
  }, [classes, grades, reportType]);

  const fetchSummaries = async () => {
    if (reportType === "class" && !selectedClassId) {
      setError("សូមជ្រើសរើសថ្នាក់");
      return;
    }
    if (reportType === "grade" && !selectedGrade) {
      setError("សូមជ្រើសរើសកម្រិតថ្នាក់");
      return;
    }

    setLoading(true);
    setError(null);
    setReportGenerated(false);

    try {
      const token = localStorage.getItem("token");
      let url: string;
      let gradeValue: string;

      if (reportType === "class") {
        const selectedClass = classes.find((c) => c.id === selectedClassId);
        if (!selectedClass) {
          throw new Error("Selected class not found");
        }
        gradeValue = selectedClass.grade;
        url = `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly/${selectedClassId}?month=${selectedMonth}&year=${selectedYear}`;
      } else {
        gradeValue = selectedGrade;
        url = `${process.env.NEXT_PUBLIC_API_URL}/reports/grade-wide/${selectedGrade}?month=${selectedMonth}&year=${selectedYear}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${errorData.error || "Failed to fetch"}`
        );
      }

      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;

      if (!data.students || !Array.isArray(data.students)) {
        throw new Error("Invalid response:  missing students array");
      }

      const transformedSummaries = data.students.map((student: any) => ({
        student: {
          studentId: student.studentId,
          khmerName: student.studentName,
          firstName:
            student.studentName.split(" ").slice(1).join(" ") ||
            student.studentName,
          lastName: student.studentName.split(" ")[0] || "",
          classId: reportType === "class" ? selectedClassId : null,
          class: {
            name: student.className || data.className || "",
            grade: gradeValue,
          },
        },
        averageScore: parseFloat(student.average) || 0,
        letterGrade: student.gradeLevel || "F",
      }));

      if (transformedSummaries.length === 0) {
        setError("មិនមានទិន្នន័យសម្រាប់ខែនេះទេ");
      }

      setSummaries(transformedSummaries);
      setReportGenerated(true);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message);
      setSummaries([]);
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const getTopStudents = () => {
    if (summaries.length === 0) return [];

    if (reportType === "class" && selectedClassId) {
      return calculateTopStudentsByClass(summaries, selectedClassId);
    } else if (reportType === "grade" && selectedGrade) {
      return calculateTopStudentsByGrade(summaries, selectedGrade);
    }

    return [];
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = async () => {
    const element = document.getElementById("honor-certificate");
    if (!element) {
      alert("រកមិនឃើញតារាងកិត្តិយស");
      return;
    }

    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 15000,
        removeContainer: false,
        letterRendering: true,
        foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        precision: 16,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio,
        undefined,
        "FAST"
      );

      const fileName = `តារាងកិត្តិយស_${
        reportType === "class" ? selectedClass?.name : `Grade_${selectedGrade}`
      }_${selectedMonth}_${academicYear}.pdf`;

      pdf.save(fileName);

      console.log("✅ PDF exported successfully!");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      alert("មានបញ្ហាក្នុងការនាំចេញ PDF។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ NEW: Export as Image (PNG)
  const exportToImage = async () => {
    const element = document.getElementById("honor-certificate");
    if (!element) {
      alert("រកមិនឃើញតារាងកិត្តិយស");
      return;
    }

    setIsExporting(true);
    try {
      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // High-quality canvas
      const canvas = await html2canvas(element, {
        scale: 4, // ✅ Very high quality (4x resolution)
        logging: false,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 15000,
        removeContainer: false,
        letterRendering: true,
        foreignObjectRendering: false,
      });

      // Convert to PNG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("មានបញ្ហាក្នុងការបង្កើតរូបភាព");
            setIsExporting(false);
            return;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const fileName = `តារាងកិត្តិយស_${
            reportType === "class"
              ? selectedClass?.name
              : `Grade_${selectedGrade}`
          }_${selectedMonth}_${academicYear}.png`;

          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          console.log("✅ Image exported successfully!");
          setIsExporting(false);
        },
        "image/png",
        1.0 // Maximum quality
      );
    } catch (error) {
      console.error("❌ Error exporting image:", error);
      alert("មានបញ្ហាក្នុងការនាំចេញរូបភាព។ សូមព្យាយាមម្តងទៀត។");
      setIsExporting(false);
    }
  };

  useEffect(() => {
    setReportGenerated(false);
    setSummaries([]);
    setError(null);
  }, [reportType, selectedClassId, selectedGrade, selectedMonth, selectedYear]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const topStudents = getTopStudents();

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសកម្រិតថ្នាក់" },
    ...grades.map((g) => ({ value: g, label: `ថ្នាក់ទី ${g}` })),
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: `${year}-${year + 1}` };
  });

  return (
    <div className="flex min-h-screen print-wrapper bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          . no-print {
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

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 no-print">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  តារាងកិត្តិយស
                </h1>
                <p className="text-gray-600 font-medium">
                  Honor Roll - Top Students Award
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 no-print">
            {/* Report Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ប្រភេទរបាយការណ៍
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setReportType("class")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportType === "class"
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  តាមថ្នាក់នីមួយៗ
                </button>
                <button
                  onClick={() => setReportType("grade")}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    reportType === "grade"
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  រួមទាំងកម្រិតថ្នាក់
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ជ្រើសរើសម៉ូដតារាងកិត្តិយស
              </label>
              <select
                value={templateType}
                onChange={(e) =>
                  setTemplateType(e.target.value as "medals" | "trophies")
                }
                className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
              >
                <option value="medals">🥇 ម៉ូតមេដាយ (Medals Style)</option>
                <option value="trophies">🏆 ម៉ូតពាន (Trophies Style)</option>
              </select>
            </div>

            {/* Selections */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {reportType === "class" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ថ្នាក់
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
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
                    កម្រិតថ្នាក់
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
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
                  ខែ
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={month}>
                      ខែ{month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ឆ្នាំសិក្សា
                </label>
                <select
                  value={selectedYear.toString()}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500"
                >
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchSummaries}
                  disabled={
                    loading ||
                    (reportType === "class" && !selectedClassId) ||
                    (reportType === "grade" && !selectedGrade)
                  }
                  className="w-full h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      កំពុងបង្កើត...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      បង្កើតតារាង
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info Card */}
            {((reportType === "class" && selectedClassId) ||
              (reportType === "grade" && selectedGrade)) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-yellow-800 font-semibold mb-1">
                      🏆 ការជ្រើសរើស
                    </div>
                    <div className="text-sm font-black text-gray-900">
                      {reportType === "class"
                        ? selectedClass?.name
                        : `ថ្នាក់ទី ${selectedGrade}`}
                    </div>
                    <div className="text-xs text-gray-600">
                      ខែ{selectedMonth} • ឆ្នាំសិក្សា {academicYear} •{" "}
                      {templateType === "medals" ? "🥇 Medals" : "🏆 Trophies"}
                    </div>
                  </div>
                  {reportGenerated && (
                    <div className="text-right">
                      <div className="text-3xl font-black text-yellow-600">
                        {topStudents.length}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        សិស្សពូកែ
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Action Buttons with Image Export */}
            {reportGenerated && topStudents.length > 0 && (
              <div className="mt-4 flex gap-3 justify-end flex-wrap">
                <button
                  onClick={exportToImage}
                  disabled={isExporting}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      កំពុងនាំចេញ...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      នាំចេញរូបភាព PNG
                    </>
                  )}
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      កំពុងនាំចេញ...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      នាំចេញ PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  បោះពុម្ពតារាង
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 no-print">
              <p className="text-sm font-semibold text-red-800">
                មានបញ្ហា៖ {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  កំពុងផ្ទុកទិន្នន័យ...{" "}
                </p>
              </div>
            </div>
          )}

          {/* Certificate Display */}
          {!loading && reportGenerated && (
            <div id="honor-certificate">
              {templateType === "medals" ? (
                <HonorCertificateMedals
                  topStudents={topStudents}
                  reportType={reportType}
                  className={
                    reportType === "class" ? selectedClass?.name : undefined
                  }
                  grade={reportType === "grade" ? selectedGrade : undefined}
                  academicYear={academicYear}
                  month={selectedMonth}
                />
              ) : (
                <HonorCertificateTrophies
                  topStudents={topStudents}
                  reportType={reportType}
                  className={
                    reportType === "class" ? selectedClass?.name : undefined
                  }
                  grade={reportType === "grade" ? selectedGrade : undefined}
                  academicYear={academicYear}
                  month={selectedMonth}
                />
              )}
            </div>
          )}

          {/* Initial Empty State */}
          {!loading && !reportGenerated && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                សូមជ្រើសរើសហើយចុច "បង្កើតតារាង"
              </p>
              <p className="text-gray-500">
                Select your options and click "Generate" to create award report
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

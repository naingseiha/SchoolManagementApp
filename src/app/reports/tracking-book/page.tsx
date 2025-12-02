"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Printer,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react";
import { reportsApi, type StudentTrackingBookData } from "@/lib/api/reports";
import StudentTranscript from "@/components/reports/StudentTranscript";

const getCurrentKhmerMonth = (): string => {
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
  return monthNames[new Date().getMonth()];
};

export default function TrackingBookPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes, subjects: allSubjects } = useData();
  const router = useRouter();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [trackingData, setTrackingData] =
    useState<StudentTrackingBookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "all">("single");

  const reportRef = useRef<HTMLDivElement>(null);

  // ✅ Pass month parameter to API
  const fetchTrackingBook = async () => {
    if (!selectedClassId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getStudentTrackingBook(
        selectedClassId,
        selectedYear,
        selectedMonth || undefined, // ✅ Pass selected month
        selectedSubjectId || undefined
      );
      setTrackingData(data);
      setSelectedStudentIndex(0);
    } catch (err: any) {
      console.error("Error fetching tracking book:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const monthOptions = [
    { value: "", label: "ទាំងអស់ (All Months)" },
    { value: "មករា", label: "មករា (January)" },
    { value: "កុម្ភៈ", label: "កុម្ភៈ (February)" },
    { value: "មីនា", label: "មីនា (March)" },
    { value: "មេសា", label: "មេសា (April)" },
    { value: "ឧសភា", label: "ឧសភា (May)" },
    { value: "មិថុនា", label: "មិថុនា (June)" },
    { value: "កក្កដា", label: "កក្កដា (July)" },
    { value: "សីហា", label: "សីហា (August)" },
    { value: "កញ្ញា", label: "កញ្ញា (September)" },
    { value: "តុលា", label: "តុលា (October)" },
    { value: "វិច្ឆិកា", label: "វិច្ឆិកា (November)" },
    { value: "ធ្នូ", label: "ធ្នូ (December)" },
  ];

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const availableSubjects = selectedClass
    ? allSubjects.filter((s) => s.grade === selectedClass.grade && s.isActive)
    : [];

  const subjectOptions = [
    { value: "", label: "ទាំងអស់មុខវិជ្ជា (All Subjects)" },
    ...availableSubjects.map((s) => ({ value: s.id, label: s.nameKh })),
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!trackingData) return;

    const filename = selectedMonth
      ? `សៀវភៅតាមដាន_${trackingData.className}_${selectedMonth}_${selectedYear}`
      : `សៀវភៅតាមដាន_${trackingData.className}_${selectedYear}`;

    reportsApi.exportToExcel("tracking-book", trackingData, filename);
  };

  const currentStudent = trackingData?.students[selectedStudentIndex];

  // ✅ Transform data for transcript (new structure)
  const getTranscriptData = (student: any) => {
    if (!trackingData) return null;

    return {
      studentData: {
        studentId: student.studentId,
        studentName: student.studentName,
        studentNumber: `${String(
          trackingData.students.indexOf(student) + 1
        ).padStart(4, "0")}`,
        dateOfBirth: student.dateOfBirth || "01-01-2010",
        placeOfBirth: "ភ្នំពេញ - ក្រុងតាកែវ - ខេត្តស្វាយរៀង",
        gender: student.gender,
        fatherName: "ឪពុក",
        motherName: "ម្តាយ",
        address: "ភ្នំពេញ - ក្រុងតាកែវ - ខេត្តស្វាយរៀង",
        className: trackingData.className,
        grade: trackingData.grade,
      },
      subjects: trackingData.subjects,
      subjectScores: student.subjectScores, // ✅ New structure
      summary: {
        totalScore: parseFloat(student.totalScore),
        averageScore: parseFloat(student.averageScore),
        gradeLevel: student.gradeLevel,
        gradeLevelKhmer: student.gradeLevelKhmer,
        rank: student.rank,
      },
      attendance: student.attendance || {
        totalAbsent: 0,
        permission: 0,
        withoutPermission: 0,
      },
      year: trackingData.year,
      month: trackingData.month,
      teacherName: trackingData.teacherName,
      principalName: "នាយកសាលា",
      schoolName: "វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ",
      province: "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប",
    };
  };

  const transcriptData = currentStudent
    ? getTranscriptData(currentStudent)
    : null;

  return (
    <div className="flex min-h-screen print-wrapper bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          . print-page-break {
            page-break-after: always;
          }
          .print-page-break:last-child {
            page-break-after: auto;
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
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  សៀវភៅតាមដានសិស្ស
                </h1>
                <p className="text-gray-600 font-medium">
                  Student Tracking Book - Individual Transcript
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 no-print">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ថ្នាក់ Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSubjectId("");
                    setTrackingData(null);
                  }}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  ខែ Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  មុខវិជ្ជា Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={!selectedClassId}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  បង្កើតសៀវភៅ
                </label>
                <button
                  onClick={fetchTrackingBook}
                  disabled={loading || !selectedClassId || !selectedMonth}
                  className="w-full h-11 px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>កំពុងផ្ទុក...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>បង្កើត</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {selectedMonth && trackingData && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  📅 <strong>កំពុងបង្ហាញ:</strong> ខែ{selectedMonth} ឆ្នាំ
                  {selectedYear}
                  {selectedSubjectId &&
                    ` - មុខវិជ្ជា: ${
                      availableSubjects.find((s) => s.id === selectedSubjectId)
                        ?.nameKh
                    }`}
                </p>
              </div>
            )}

            {trackingData && trackingData.students.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">
                      របៀបមើល:
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("single")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          viewMode === "single"
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        ម្នាក់
                      </button>
                      <button
                        onClick={() => setViewMode("all")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          viewMode === "all"
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        ទាំងអស់
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                    📊 សរុប:{" "}
                    <span className="font-bold">
                      {trackingData.students.length}
                    </span>{" "}
                    សិស្ស
                  </div>
                </div>

                {viewMode === "single" && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-700">
                        ជ្រើសរើសសិស្ស:
                      </label>
                      <select
                        value={selectedStudentIndex}
                        onChange={(e) =>
                          setSelectedStudentIndex(parseInt(e.target.value))
                        }
                        className="h-10 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        {trackingData.students.map((student, index) => (
                          <option key={student.studentId} value={index}>
                            {index + 1}. {student.studentName} (ចំណាត់ថ្នាក់: #
                            {student.rank || "N/A"})
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600">
                        ({selectedStudentIndex + 1} /{" "}
                        {trackingData.students.length})
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setSelectedStudentIndex(
                            Math.max(0, selectedStudentIndex - 1)
                          )
                        }
                        disabled={selectedStudentIndex === 0}
                        className="h-10 px-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-green-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← មុន
                      </button>
                      <button
                        onClick={() =>
                          setSelectedStudentIndex(
                            Math.min(
                              trackingData.students.length - 1,
                              selectedStudentIndex + 1
                            )
                          )
                        }
                        disabled={
                          selectedStudentIndex ===
                          trackingData.students.length - 1
                        }
                        className="h-10 px-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-green-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        បន្ទាប់ →
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={handlePrint}
                    className="h-10 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    {viewMode === "all" ? "បោះពុម្ពទាំងអស់" : "បោះពុម្ព"}
                  </button>
                  <button
                    onClick={handleExport}
                    className="h-10 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </button>
                </div>
              </div>
            )}
          </div>

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

          {trackingData && (
            <div ref={reportRef}>
              {viewMode === "single" ? (
                transcriptData && (
                  <div className="animate-scaleIn">
                    <StudentTranscript {...transcriptData} />
                  </div>
                )
              ) : (
                <div className="space-y-8">
                  {trackingData.students.map((student, index) => {
                    const studentTranscriptData = getTranscriptData(student);
                    if (!studentTranscriptData) return null;

                    return (
                      <div
                        key={student.studentId}
                        className={`animate-scaleIn ${
                          index < trackingData.students.length - 1
                            ? "print-page-break"
                            : ""
                        }`}
                      >
                        <StudentTranscript {...studentTranscriptData} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!selectedClassId && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                សូមជ្រើសរើសថ្នាក់ដើម្បីមើលសៀវភៅតាមដាន
              </p>
              <p className="text-gray-500">
                Please select a class to view student tracking book
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

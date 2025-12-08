"use client";

import { useState, useRef, useMemo } from "react";
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
import { sortSubjectsByOrder } from "@/lib/subjectOrder";

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

  // ✅ Sort subjects based on grade level
  const sortedTrackingData = useMemo(() => {
    if (!trackingData) return null;

    // Extract grade number from grade string
    const gradeNum = parseInt(trackingData.grade);

    console.log("📊 [Tracking Book] Sorting subjects for grade:", gradeNum);
    console.log(
      "📋 [Tracking Book] Original subjects:",
      trackingData.subjects.map((s) => s.nameKh)
    );

    // Sort subjects
    const sortedSubjects = sortSubjectsByOrder(trackingData.subjects, gradeNum);

    console.log(
      "✅ [Tracking Book] Sorted subjects:",
      sortedSubjects.map((s) => s.nameKh)
    );

    // Return new tracking data with sorted subjects
    return {
      ...trackingData,
      subjects: sortedSubjects,
    };
  }, [trackingData]);

  // ✅ Pass month parameter to API
  const fetchTrackingBook = async () => {
    if (!selectedClassId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getStudentTrackingBook(
        selectedClassId,
        selectedYear,
        selectedMonth || undefined,
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

  const monthOptions = [
    { value: "", label: "ទាំងអស់" },
    { value: "មករា", label: "មករា" },
    { value: "កុម្ភៈ", label: "កុម្ភៈ" },
    { value: "មីនា", label: "មីនា" },
    { value: "មេសា", label: "មេសា" },
    { value: "ឧសភា", label: "ឧសភា" },
    { value: "មិថុនា", label: "មិថុនា" },
    { value: "កក្កដា", label: "កក្កដា" },
    { value: "សីហា", label: "សីហា" },
    { value: "កញ្ញា", label: "កញ្ញា" },
    { value: "តុលា", label: "តុលា" },
    { value: "វិច្ឆិកា", label: "វិច្ឆិកា" },
    { value: "ធ្នូ", label: "ធ្នូ" },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  // ✅ Get subjects for selected class
  const classSubjects = selectedClassId
    ? allSubjects.filter((s) => {
        const selectedClass = classes.find((c) => c.id === selectedClassId);
        if (!selectedClass) return false;
        return s.grade === selectedClass.grade;
      })
    : [];

  const subjectOptions = [
    { value: "", label: "មុខវិជ្ជាទាំងអស់" },
    ...classSubjects.map((s) => ({
      value: s.id,
      label: s.nameKh || s.name,
    })),
  ];

  // ✅ Transform data for StudentTranscript with sorted subjects
  const transcriptData = sortedTrackingData
    ? sortedTrackingData.students.map((student) => ({
        studentData: {
          // ✅ Wrap in studentData object
          studentId: student.studentId,
          studentName: student.studentName,
          studentNumber: `${String(
            sortedTrackingData.students.indexOf(student) + 1
          ).padStart(4, "0")}`,
          dateOfBirth: student.dateOfBirth || "01-01-2010",
          placeOfBirth: "សៀមរាប",
          gender: student.gender,
          fatherName: "ឪពុក",
          motherName: "ម្តាយ",
          address: "សៀមរាប",
          className: sortedTrackingData.className,
          grade: sortedTrackingData.grade,
        },
        subjects: sortedTrackingData.subjects,
        subjectScores: student.subjectScores,
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
        year: sortedTrackingData.year,
        month: sortedTrackingData.month,
        teacherName: sortedTrackingData.teacherName,
        principalName: "នាយកសាលា",
        schoolName: "វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ",
        province: "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប", // ✅ Add province
      }))
    : [];

  const currentStudent = transcriptData[selectedStudentIndex];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!sortedTrackingData) return;

    const headers = [
      "ល. រ",
      "គោត្តនាម និងនាម",
      "ភេទ",
      ...sortedTrackingData.subjects.map((s) => s.nameKh),
      "ពិន្ទុសរុប",
      "មធ្យមភាគ",
      "និទ្ទេស",
      "ចំណាត់ថ្នាក់",
      "អវត្តមានសរុប",
    ];

    const rows = sortedTrackingData.students.map((student, index) => {
      const row = [
        (index + 1).toString(),
        student.studentName,
        student.gender === "male" ? "ប្រុស" : "ស្រី",
        ...sortedTrackingData.subjects.map((subject) => {
          const score = student.subjectScores[subject.id];
          return score?.score !== null && score?.score !== undefined
            ? score.score.toString()
            : "-";
        }),
        student.totalScore,
        student.averageScore,
        student.gradeLevel,
        student.rank.toString(),
        student.attendance.totalAbsent.toString(),
      ];
      return row;
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `សៀវភៅតាមដាន_${sortedTrackingData.className}_${selectedYear}. csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
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

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 no-print">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  សៀវភៅតាមដានការសិក្សា
                </h1>
                <p className="text-gray-600 font-medium">
                  Student Tracking Book - Individual Progress Report
                </p>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 no-print">
            {/* Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ថ្នាក់ Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setTrackingData(null);
                  }}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  មុខវិជ្ជា Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  បង្កើតរបាយការណ៍
                </label>
                <button
                  onClick={fetchTrackingBook}
                  disabled={loading || !selectedClassId}
                  className="w-full h-11 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
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

            {/* View Mode & Actions */}
            {sortedTrackingData && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">
                      របៀបមើល:
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("single")}
                        className={`h-10 px-4 rounded-lg font-semibold transition-all ${
                          viewMode === "single"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400"
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        មួយៗ
                      </button>
                      <button
                        onClick={() => setViewMode("all")}
                        className={`h-10 px-4 rounded-lg font-semibold transition-all ${
                          viewMode === "all"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400"
                        }`}
                      >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        ទាំងអស់
                      </button>
                    </div>
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
                      onClick={handleExport}
                      className="h-10 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>
                </div>

                {/* Student Navigation (Single View) */}
                {viewMode === "single" && transcriptData.length > 0 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <button
                      onClick={() =>
                        setSelectedStudentIndex(
                          Math.max(0, selectedStudentIndex - 1)
                        )
                      }
                      disabled={selectedStudentIndex === 0}
                      className="h-10 px-6 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-blue-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← មុន
                    </button>

                    <div className="text-sm font-semibold text-gray-700">
                      សិស្ស {selectedStudentIndex + 1} / {transcriptData.length}
                      {currentStudent && (
                        <span className="ml-2 text-blue-600">
                          ({currentStudent.studentName})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setSelectedStudentIndex(
                          Math.min(
                            transcriptData.length - 1,
                            selectedStudentIndex + 1
                          )
                        )
                      }
                      disabled={
                        selectedStudentIndex === transcriptData.length - 1
                      }
                      className="h-10 px-6 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:border-blue-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      បន្ទាប់ →
                    </button>
                  </div>
                )}
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
          {sortedTrackingData && (
            <div ref={reportRef}>
              {viewMode === "single" && currentStudent ? (
                <StudentTranscript {...currentStudent} />
              ) : viewMode === "all" ? (
                <div className="space-y-8">
                  {transcriptData.map((student, index) => (
                    <StudentTranscript key={index} {...student} />
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Empty State */}
          {!selectedClassId && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                សូមជ្រើសរើសថ្នាក់ដើម្បីមើលសៀវភៅតាមដាន
              </p>
              <p className="text-gray-500">
                Please select a class to view tracking book
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

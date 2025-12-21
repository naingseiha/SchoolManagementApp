// 📂 src/components/mobile/reports/MobileMonthlyReport. tsx

"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  Loader2,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  Filter,
  Download,
  ArrowLeft,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";
import { useRouter, useSearchParams } from "next/navigation";

interface StudentReport {
  studentId: string;
  studentName: string;
  gender: string;
  average: number;
  gradeLevel: string;
  gradeLevelKh: string;
  rank: number;
  totalScore: number;
  totalMaxScore: number;
  percentage: number;
  absent: number;
  permission: number;
}

interface ClassReport {
  classId: string;
  className: string;
  grade: string;
  month: string;
  year: number;
  students: StudentReport[];
  classAverage: number;
  totalStudents: number;
}

const MONTHS = [
  { value: "មករា", label: "មករា", number: 1 },
  { value: "កុម្ភៈ", label: "កុម្ភៈ", number: 2 },
  { value: "មីនា", label: "មីនា", number: 3 },
  { value: "មេសា", label: "មេសា", number: 4 },
  { value: "ឧសភា", label: "ឧសភា", number: 5 },
  { value: "មិថុនា", label: "មិថុនា", number: 6 },
  { value: "កក្កដា", label: "កក្កដា", number: 7 },
  { value: "សីហា", label: "សីហា", number: 8 },
  { value: "កញ្ញា", label: "កញ្ញា", number: 9 },
  { value: "តុលា", label: "តុលា", number: 10 },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា", number: 11 },
  { value: "ធ្នូ", label: "ធ្នូ", number: 12 },
];

const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1;
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

const getAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -1; i <= 2; i++) {
    const year = currentYear + i;
    years.push({
      value: year.toString(),
      label: `${year}-${year + 1}`,
    });
  }
  return years;
};

const getCurrentAcademicYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 9 ? year : year - 1;
};

export default function MobileMonthlyReport() {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL if coming from dashboard
  const classParam = searchParams.get("class");
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const [selectedClass, setSelectedClass] = useState(classParam || "");
  const [selectedMonth, setSelectedMonth] = useState(
    monthParam || getCurrentKhmerMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    yearParam ? parseInt(yearParam) : getCurrentAcademicYear()
  );
  const [reportData, setReportData] = useState<ClassReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(!classParam);

  const getGradeBadge = (gradeLevel: string, gradeLevelKh: string) => {
    const grades: Record<
      string,
      { bg: string; text: string; border: string; icon: string }
    > = {
      A: {
        bg: "bg-gradient-to-r from-green-500 to-emerald-600",
        text: "text-white",
        border: "border-green-400",
        icon: "🏆",
      },
      B: {
        bg: "bg-gradient-to-r from-blue-500 to-cyan-600",
        text: "text-white",
        border: "border-blue-400",
        icon: "⭐",
      },
      C: {
        bg: "bg-gradient-to-r from-yellow-500 to-amber-600",
        text: "text-white",
        border: "border-yellow-400",
        icon: "✨",
      },
      D: {
        bg: "bg-gradient-to-r from-orange-500 to-orange-600",
        text: "text-white",
        border: "border-orange-400",
        icon: "📊",
      },
      E: {
        bg: "bg-gradient-to-r from-red-400 to-rose-500",
        text: "text-white",
        border: "border-red-400",
        icon: "📈",
      },
      F: {
        bg: "bg-gradient-to-r from-gray-500 to-gray-600",
        text: "text-white",
        border: "border-gray-400",
        icon: "📉",
      },
    };
    return grades[gradeLevel] || grades["F"];
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return {
        icon: "🥇",
        bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
        text: "text-yellow-900",
      };
    if (rank === 2)
      return {
        icon: "🥈",
        bg: "bg-gradient-to-r from-gray-300 to-gray-400",
        text: "text-gray-900",
      };
    if (rank === 3)
      return {
        icon: "🥉",
        bg: "bg-gradient-to-r from-orange-400 to-amber-600",
        text: "text-orange-900",
      };
    return {
      icon: `#${rank}`,
      bg: "bg-gradient-to-r from-indigo-100 to-purple-100",
      text: "text-indigo-700",
    };
  };

  const getKhmerGradeLevel = (level: string): string => {
    const levels: Record<string, string> = {
      A: "ល្អប្រសើរ",
      B: "ល្អ",
      C: "ល្អបុរេ",
      D: "មធ្យម",
      E: "ខ្សោយ",
      F: "ខ្សោយបំផុត",
    };
    return levels[level] || "N/A";
  };

  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // Auto-load if coming from dashboard
  useEffect(() => {
    if (classParam && monthParam && yearParam && !reportData) {
      loadReport();
    }
  }, [classParam, monthParam, yearParam]);

  const loadReport = async () => {
    if (!selectedClass) {
      alert("សូមជ្រើសរើសថ្នាក់");
      return;
    }

    setLoading(true);
    try {
      console.log("📊 Loading report:", {
        classId: selectedClass,
        month: selectedMonth,
        year: selectedYear,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly/${selectedClass}? month=${selectedMonth}&year=${selectedYear}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: មានបញ្ហា`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load report");
      }

      const students = result.data.students;
      const classAverage =
        students.reduce(
          (sum: number, s: any) => sum + parseFloat(s.average),
          0
        ) / students.length;

      setReportData({
        classId: result.data.classId,
        className: result.data.className,
        grade: result.data.grade,
        month: result.data.month,
        year: result.data.year,
        students: students.map((s: any) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          gender: s.gender,
          average: parseFloat(s.average),
          gradeLevel: s.gradeLevel,
          gradeLevelKh: s.gradeLevelKhmer || getKhmerGradeLevel(s.gradeLevel),
          rank: s.rank,
          totalScore: parseFloat(s.totalScore),
          totalMaxScore: parseFloat(s.totalMaxScore || "0"),
          percentage: (parseFloat(s.average) / 50) * 100,
          absent: s.absent || 0,
          permission: s.permission || 0,
        })),
        classAverage,
        totalStudents: students.length,
      });

      setShowFilters(false);
    } catch (error: any) {
      console.error("❌ Error loading report:", error);
      alert(`មានបញ្ហា:  ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/reports/mobile");
  };

  return (
    <MobileLayout title="របាយការណ៍ • Monthly Report">
      <div className="flex flex-col h-full bg-gray-50">
        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white shadow-lg border-b border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                របាយការណ៍ប្រចាំខែ
              </h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1. 5 uppercase tracking-wide">
                ថ្នាក់ • Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isLoadingClasses}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus: ring-indigo-500"
                style={{ fontSize: "16px" }}
              >
                <option value="">
                  {isLoadingClasses ? "កំពុងផ្ទុក..." : "-- ជ្រើសរើសថ្នាក់ --"}
                </option>
                {!isLoadingClasses &&
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  ខែ • Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  style={{ fontSize: "16px" }}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  ឆ្នាំ • Year
                </label>
                <select
                  value={selectedYear.toString()}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  style={{ fontSize: "16px" }}
                >
                  {getAcademicYearOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={loadReport}
              disabled={!selectedClass || loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">កំពុងបង្កើត...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">បង្កើតរបាយការណ៍</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Report Content */}
        {reportData ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Class Info */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handleBackToDashboard}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                <div className="flex-1 text-center">
                  <h3 className="text-white text-lg font-bold">
                    {reportData.className}
                  </h3>
                  <p className="text-indigo-100 text-xs mt-0.5">
                    {reportData.month} {reportData.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
                >
                  <Filter className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-xs text-indigo-100 font-medium">
                      សិស្សសរុប
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {reportData.totalStudents}
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">Students</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-indigo-100 font-medium">
                      មធ្យមភាគថ្នាក់
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {reportData.classAverage.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">
                    Class Average
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Students Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 border-b border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                  Top Performers
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {reportData.students.slice(0, 3).map((student) => {
                  const rankBadge = getRankBadge(student.rank);
                  return (
                    <div
                      key={student.studentId}
                      className="flex-shrink-0 w-40 bg-white rounded-lg p-2.5 shadow-md border-2 border-amber-200"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 ${rankBadge.bg} rounded-full flex items-center justify-center text-sm font-bold ${rankBadge.text} shadow-md`}
                        >
                          {rankBadge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {student.studentName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-indigo-600">
                          {student.average.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">/50</span>
                      </div>
                      <div className="mt-1">
                        {(() => {
                          const badge = getGradeBadge(
                            student.gradeLevel,
                            student.gradeLevelKh
                          );
                          return (
                            <div
                              className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-xs font-bold shadow-sm`}
                            >
                              <span>{badge.icon}</span>
                              <span>{student.gradeLevel}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {reportData.students.map((student, index) => {
                const gradeBadge = getGradeBadge(
                  student.gradeLevel,
                  student.gradeLevelKh
                );
                const rankBadge = getRankBadge(student.rank);
                const isTopThree = student.rank <= 3;

                return (
                  <div
                    key={student.studentId}
                    className={`bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
                      isTopThree
                        ? "border-amber-300 bg-gradient-to-r from-amber-50/30 to-yellow-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-10 h-10 ${rankBadge.bg} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
                          >
                            <span
                              className={`text-sm font-bold ${rankBadge.text}`}
                            >
                              {rankBadge.icon}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-gray-900 truncate">
                                {student.studentName}
                              </h4>
                              {student.gender === "FEMALE" && (
                                <span className="text-pink-500">♀</span>
                              )}
                              {student.gender === "MALE" && (
                                <span className="text-blue-500">♂</span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-gray-600 font-medium">
                                មធ្យមភាគ:
                              </span>
                              <span className="text-lg font-bold text-indigo-600">
                                {student.average.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">/50</span>
                            </div>

                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1. 5 overflow-hidden">
                              <div
                                className={`h-full ${gradeBadge.bg} transition-all duration-500`}
                                style={{
                                  width: `${Math.min(
                                    (student.average / 50) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className={`ml-3 px-3 py-2 ${gradeBadge.bg} rounded-lg shadow-md flex-shrink-0`}
                        >
                          <div className="text-center">
                            <div
                              className={`text-lg font-bold ${gradeBadge.text} leading-none`}
                            >
                              {gradeBadge.icon}
                            </div>
                            <div
                              className={`text-xl font-bold ${gradeBadge.text} leading-none mt-1`}
                            >
                              {student.gradeLevel}
                            </div>
                            <div
                              className={`text-[10px] ${gradeBadge.text} mt-1 opacity-90`}
                            >
                              {student.gradeLevelKh}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-0.5">
                            Score
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {student.totalScore.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-center border-l border-r border-gray-200">
                          <div className="text-xs text-red-600 mb-0.5">
                            អវត្តមាន
                          </div>
                          <div className="text-sm font-bold text-red-600">
                            {student.absent + student.permission}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-0.5">
                            Rank
                          </div>
                          <div className="text-sm font-bold text-indigo-600">
                            #{student.rank}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBackToDashboard}
                  className="h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => window.print()}
                  className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">
                សូមជ្រើសរើសថ្នាក់ និងខែ ដើម្បីបង្កើតរបាយការណ៍
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

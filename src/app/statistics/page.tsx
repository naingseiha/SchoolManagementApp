"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Calendar,
  ChevronRight,
  ChevronDown,
  Filter,
  Trophy,
  Target,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { dashboardApi, ComprehensiveStats } from "@/lib/api/dashboard";

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
      label: `${year}`,
    });
  }
  return years;
};

const getCurrentAcademicYear = () => {
  return new Date().getFullYear();
};

export default function StatisticsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [expandedClassSubjects, setExpandedClassSubjects] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getComprehensiveStats(
        selectedMonth,
        selectedYear
      );
      setStats(data);
    } catch (err) {
      console.error("Error loading comprehensive stats:", err);
      setError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "from-green-500 to-emerald-500",
      B: "from-blue-500 to-indigo-500",
      C: "from-yellow-500 to-orange-500",
      D: "from-orange-500 to-red-500",
      E: "from-red-500 to-rose-500",
      F: "from-rose-500 to-pink-500",
    };
    return colors[grade] || "from-gray-400 to-gray-500";
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="font-khmer-title text-3xl text-gray-900 mb-3">
                មានបញ្ហា
              </h2>
              <p className="font-khmer-body text-gray-600 mb-8 font-medium">
                {error}
              </p>
              <button
                onClick={() => loadStats()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-khmer-body font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all active:scale-95"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-6" />
              <p className="font-khmer-body text-gray-600 text-lg font-bold">
                កំពុងផ្ទុក...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalStudents = stats.grades.reduce(
    (sum, g) => sum + g.totalStudents,
    0
  );
  const totalMale = stats.grades.reduce((sum, g) => sum + g.maleStudents, 0);
  const totalFemale = stats.grades.reduce(
    (sum, g) => sum + g.femaleStudents,
    0
  );
  const totalPassed = stats.grades.reduce((sum, g) => sum + g.passedCount, 0);
  const totalFailed = stats.grades.reduce((sum, g) => sum + g.failedCount, 0);
  const totalWithGrades = totalPassed + totalFailed;
  const overallPassPercentage =
    totalWithGrades > 0 ? (totalPassed / totalWithGrades) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-khmer-title text-4xl text-gray-900">
                    ស្ថិតិទូទៅ
                  </h1>
                  <p className="font-khmer-body text-gray-500 font-medium">
                    Comprehensive Statistics
                  </p>
                </div>
              </div>

              {/* Month & Year Selector */}
              <div className="flex gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200 min-w-[200px]">
                  <label className="block font-khmer-body text-xs text-gray-600 font-bold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    ខែ
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full h-12 px-4 text-sm font-khmer-body font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                    style={{ fontSize: "16px" }}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200 min-w-[150px]">
                  <label className="block font-khmer-body text-xs text-gray-600 font-bold mb-2">
                    ឆ្នាំ
                  </label>
                  <select
                    value={selectedYear.toString()}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full h-12 px-4 text-sm font-khmer-body font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
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
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <p className="font-khmer-body text-sm text-gray-600 font-bold">
                  សិស្សសរុប
                </p>
              </div>
              <p className="font-black text-5xl text-gray-900 mb-2">
                {totalStudents}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-khmer-body text-sm text-blue-600 font-bold">
                  ប្រុស: {totalMale}
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-khmer-body text-sm text-pink-600 font-bold">
                  ស្រី: {totalFemale}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-green-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <p className="font-khmer-body text-sm text-gray-600 font-bold">
                  អត្រាជាប់
                </p>
              </div>
              <p className="font-black text-5xl text-green-600 mb-2">
                {overallPassPercentage.toFixed(1)}%
              </p>
              <span className="font-khmer-body text-sm text-green-600 font-bold">
                {totalPassed} នាក់
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-red-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <p className="font-khmer-body text-sm text-gray-600 font-bold">
                  អត្រាធ្លាក់
                </p>
              </div>
              <p className="font-black text-5xl text-red-600 mb-2">
                {((totalFailed / totalStudents) * 100).toFixed(1)}%
              </p>
              <span className="font-khmer-body text-sm text-red-600 font-bold">
                {totalFailed} នាក់
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <p className="font-khmer-body text-sm text-gray-600 font-bold">
                  ថ្នាក់សរុប
                </p>
              </div>
              <p className="font-black text-5xl text-gray-900 mb-2">
                {stats.grades.reduce((sum, g) => sum + g.totalClasses, 0)}
              </p>
              <span className="font-khmer-body text-sm text-gray-600 font-bold">
                ថ្នាក់សកម្ម
              </span>
            </div>
          </div>

          {/* Top Performing Classes */}
          {stats.topPerformingClasses.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-7 h-7 text-orange-500" />
                <h3 className="font-khmer-title text-2xl text-gray-900">
                  ថ្នាក់ល្អបំផុត
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topPerformingClasses.slice(0, 6).map((cls, index) => (
                  <div
                    key={cls.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-400"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-300 to-orange-400"
                            : "bg-gradient-to-br from-blue-500 to-indigo-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-khmer-body text-base font-black text-gray-900 mb-1">
                          {cls.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-khmer-body text-xs text-gray-500 font-medium">
                            {cls.studentCount} សិស្ស
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-khmer-body text-xs text-blue-600 font-medium">
                            ប: {cls.maleCount}
                          </span>
                          <span className="font-khmer-body text-xs text-pink-600 font-medium">
                            ស: {cls.femaleCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="font-khmer-body text-xs text-gray-600 font-bold">
                        អត្រាជាប់
                      </span>
                      <span className="font-black text-2xl text-green-600">
                        {cls.passPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grade Statistics */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-7 h-7 text-gray-600" />
              <h3 className="font-khmer-title text-2xl text-gray-900">
                ស្ថិតិតាមថ្នាក់
              </h3>
            </div>

            <div className="space-y-4">
              {stats.grades.map((grade) => (
                <div
                  key={grade.grade}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                >
                  {/* Grade Header */}
                  <button
                    onClick={() =>
                      setExpandedGrade(
                        expandedGrade === grade.grade ? null : grade.grade
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-2xl">
                          {grade.grade}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-khmer-title text-xl text-gray-900">
                          ថ្នាក់ទី{grade.grade}
                        </p>
                        <p className="font-khmer-body text-sm text-gray-500 font-medium">
                          {grade.totalStudents} សិស្ស • {grade.totalClasses}{" "}
                          ថ្នាក់
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-black text-3xl text-green-600">
                          {grade.passPercentage.toFixed(1)}%
                        </p>
                        <p className="font-khmer-body text-xs text-gray-500 font-medium">
                          អត្រាជាប់
                        </p>
                      </div>
                      {expandedGrade === grade.grade ? (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedGrade === grade.grade && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      {/* Pass/Fail Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                          <p className="font-khmer-body text-sm text-green-700 font-bold mb-3">
                            ជាប់
                          </p>
                          <p className="font-black text-4xl text-green-600 mb-4">
                            {grade.passedCount}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-khmer-body text-sm text-green-600 font-medium">
                                ប្រុស:
                              </span>
                              <span className="font-black text-lg text-green-700">
                                {grade.passedMale} ({grade.malePassPercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-khmer-body text-sm text-green-600 font-medium">
                                ស្រី:
                              </span>
                              <span className="font-black text-lg text-green-700">
                                {grade.passedFemale} ({grade.femalePassPercentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200">
                          <p className="font-khmer-body text-sm text-red-700 font-bold mb-3">
                            ធ្លាក់
                          </p>
                          <p className="font-black text-4xl text-red-600 mb-4">
                            {grade.failedCount}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-khmer-body text-sm text-red-600 font-medium">
                                ប្រុស:
                              </span>
                              <span className="font-black text-lg text-red-700">
                                {grade.failedMale}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-khmer-body text-sm text-red-600 font-medium">
                                ស្រី:
                              </span>
                              <span className="font-black text-lg text-red-700">
                                {grade.failedFemale}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grade Distribution */}
                      <div className="mb-6">
                        <p className="font-khmer-body text-sm text-gray-600 font-bold mb-4">
                          ការចែកចាយពិន្ទុ
                        </p>
                        <div className="space-y-3">
                          {Object.entries(grade.gradeDistribution).map(
                            ([letter, dist]) => (
                              <div
                                key={letter}
                                className="flex items-center gap-4"
                              >
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getGradeColor(
                                    letter
                                  )} text-white font-black text-lg shadow-lg`}
                                >
                                  {letter}
                                </div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${getGradeColor(
                                        letter
                                      )} transition-all`}
                                      style={{
                                        width: `${
                                          grade.totalStudents > 0
                                            ? (dist.total /
                                                grade.totalStudents) *
                                              100
                                            : 0
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-right min-w-[150px]">
                                  <p className="font-khmer-body text-sm text-gray-900 font-bold">
                                    {dist.total} ({dist.male}ប / {dist.female}ស)
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Class Statistics */}
                      {grade.classes.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-khmer-body text-sm text-gray-600 font-bold">
                              ស្ថិតិតាមថ្នាក់
                            </p>
                            <span className="font-khmer-body text-xs text-gray-500 font-medium">
                              {grade.classes.length} ថ្នាក់
                            </span>
                          </div>
                          <div className="space-y-4">
                            {grade.classes.map((cls) => (
                              <div
                                key={cls.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
                              >
                                {/* Class Header */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                      <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-khmer-body text-base font-black text-gray-900">
                                        {cls.name}
                                      </h4>
                                      <p className="font-khmer-body text-xs text-gray-500 font-medium">
                                        {cls.studentCount} សិស្ស • ប: {cls.maleCount} • ស: {cls.femaleCount}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-2xl text-green-600">
                                      {cls.passPercentage.toFixed(1)}%
                                    </p>
                                    <p className="font-khmer-body text-xs text-gray-500 font-medium">
                                      អត្រាជាប់
                                    </p>
                                  </div>
                                </div>

                                {/* Teacher Info */}
                                {cls.teacherName && (
                                  <div className="mb-4 flex items-center gap-2 text-sm">
                                    <span className="font-khmer-body text-gray-500 font-medium">
                                      គ្រូប្រចាំថ្នាក់:
                                    </span>
                                    <span className="font-khmer-body text-gray-900 font-bold">
                                      {cls.teacherName}
                                    </span>
                                  </div>
                                )}

                                {/* Pass/Fail Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                                    <p className="font-khmer-body text-xs text-green-700 font-bold mb-1">
                                      ជាប់
                                    </p>
                                    <p className="font-black text-xl text-green-600">
                                      {cls.passedCount}
                                    </p>
                                    <p className="font-khmer-body text-xs text-green-600 font-medium">
                                      ប: {cls.gradeDistribution.A.male + cls.gradeDistribution.B.male + cls.gradeDistribution.C.male + cls.gradeDistribution.D.male + cls.gradeDistribution.E.male} •
                                      ស: {cls.gradeDistribution.A.female + cls.gradeDistribution.B.female + cls.gradeDistribution.C.female + cls.gradeDistribution.D.female + cls.gradeDistribution.E.female}
                                    </p>
                                  </div>

                                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-200">
                                    <p className="font-khmer-body text-xs text-red-700 font-bold mb-1">
                                      ធ្លាក់
                                    </p>
                                    <p className="font-black text-xl text-red-600">
                                      {cls.failedCount}
                                    </p>
                                    <p className="font-khmer-body text-xs text-red-600 font-medium">
                                      ប: {cls.gradeDistribution.F.male} • ស: {cls.gradeDistribution.F.female}
                                    </p>
                                  </div>
                                </div>

                                {/* Grade Distribution for this class */}
                                <div>
                                  <p className="font-khmer-body text-xs text-gray-600 font-bold mb-3">
                                    ការចែកចាយពិន្ទុ
                                  </p>
                                  <div className="space-y-2">
                                    {Object.entries(cls.gradeDistribution).map(
                                      ([letter, dist]) => (
                                        <div
                                          key={letter}
                                          className="flex items-center gap-3"
                                        >
                                          <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${getGradeColor(
                                              letter
                                            )} text-white font-black text-sm shadow-sm`}
                                          >
                                            {letter}
                                          </div>
                                          <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full bg-gradient-to-r ${getGradeColor(
                                                  letter
                                                )} transition-all`}
                                                style={{
                                                  width: `${
                                                    cls.studentCount > 0
                                                      ? (dist.total /
                                                          cls.studentCount) *
                                                        100
                                                      : 0
                                                  }%`,
                                                }}
                                              />
                                            </div>
                                          </div>
                                          <div className="text-right min-w-[120px]">
                                            <p className="font-khmer-body text-xs text-gray-900 font-bold">
                                              {dist.total} ({dist.male}ប / {dist.female}ស)
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Subject-level Statistics */}
                                {cls.subjectStats && cls.subjectStats.length > 0 && (
                                  <div className="mt-6 pt-4 border-t border-gray-100">
                                    <button
                                      onClick={() =>
                                        setExpandedClassSubjects(
                                          expandedClassSubjects === cls.id ? null : cls.id
                                        )
                                      }
                                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        <span className="font-khmer-body text-sm text-gray-900 font-bold">
                                          ស្ថិតិតាមមុខវិជ្ជា ({cls.subjectStats.length} មុខវិជ្ជា)
                                        </span>
                                      </div>
                                      {expandedClassSubjects === cls.id ? (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                      )}
                                    </button>

                                    {expandedClassSubjects === cls.id && (
                                      <div className="mt-4 space-y-4">
                                        {cls.subjectStats.map((subject) => (
                                          <div
                                            key={subject.subjectId}
                                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200"
                                          >
                                            {/* Subject Header */}
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                              <div>
                                                <h5 className="font-khmer-body text-sm font-black text-gray-900">
                                                  {subject.subjectName}
                                                </h5>
                                                <p className="font-khmer-body text-xs text-gray-500 font-medium">
                                                  កូដ: {subject.subjectCode} • ពិន្ទុសរុប: {subject.maxScore} • មេគុណ: {subject.coefficient}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-khmer-body text-xs text-gray-500 font-medium">
                                                  សិស្សដែលមានពិន្ទុ
                                                </p>
                                                <p className="font-black text-lg text-indigo-600">
                                                  {subject.totalStudentsWithGrades}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Subject Grade Distribution */}
                                            <div className="space-y-2">
                                              {Object.entries(subject.gradeDistribution).map(
                                                ([letter, dist]) => (
                                                  <div
                                                    key={letter}
                                                    className="flex items-center gap-3"
                                                  >
                                                    <div
                                                      className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getGradeColor(
                                                        letter
                                                      )} text-white font-black text-xs shadow-sm`}
                                                    >
                                                      {letter}
                                                    </div>
                                                    <div className="flex-1">
                                                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                          className={`h-full bg-gradient-to-r ${getGradeColor(
                                                            letter
                                                          )} transition-all`}
                                                          style={{
                                                            width: `${
                                                              subject.totalStudentsWithGrades > 0
                                                                ? (dist.total /
                                                                    subject.totalStudentsWithGrades) *
                                                                  100
                                                                : 0
                                                            }%`,
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="text-right min-w-[110px]">
                                                      <p className="font-khmer-body text-xs text-gray-900 font-bold">
                                                        {dist.total} ({dist.male}ប / {dist.female}ស)
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Additional Stats */}
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                                  <div className="text-center">
                                    <p className="font-khmer-body text-xs text-gray-500 font-medium mb-1">
                                      មធ្យមភាគ
                                    </p>
                                    <p className="font-black text-lg text-indigo-600">
                                      {cls.averageScore.toFixed(1)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-khmer-body text-xs text-gray-500 font-medium mb-1">
                                      ប្រុស
                                    </p>
                                    <p className="font-black text-lg text-blue-600">
                                      {cls.malePassPercentage.toFixed(1)}%
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-khmer-body text-xs text-gray-500 font-medium mb-1">
                                      ស្រី
                                    </p>
                                    <p className="font-black text-lg text-pink-600">
                                      {cls.femalePassPercentage.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

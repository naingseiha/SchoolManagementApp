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
  Trophy,
  Target,
  XCircle,
  GitCompare,
  PieChart,
  Medal,
  Download,
  FileText,
  Image,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { dashboardApi, ComprehensiveStats } from "@/lib/api/dashboard";
import { getCurrentAcademicYear, getAcademicYearOptions } from "@/utils/academicYear";
import { CustomBarChart, CustomPieChart } from "@/components/charts";
import { exportUtils } from "@/lib/exportUtils";

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

type TabType = "overview" | "pass-fail" | "performance" | "distribution" | "rankings";

// Class Details Card Component
function ClassDetailsCard({ classData }: { classData: any }) {
  const [expandedClass, setExpandedClass] = useState(false);
  
  const getGradeColor = (letter: string) => {
    const colors: Record<string, string> = {
      A: 'from-green-500 to-green-600',
      B: 'from-blue-500 to-blue-600',
      C: 'from-yellow-500 to-yellow-600',
      D: 'from-orange-500 to-orange-600',
      E: 'from-red-500 to-red-600',
      F: 'from-red-600 to-red-700',
    };
    return colors[letter] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-md transition-all">
      {/* Class Header */}
      <button
        onClick={() => setExpandedClass(!expandedClass)}
        className="w-full p-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg">
              {classData.section}
            </span>
          </div>
          <div className="text-left">
            <p className="font-khmer-body text-lg font-black text-gray-900">
              {classData.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-khmer-body text-sm text-gray-600 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {classData.studentCount} សិស្ស
              </span>
              {classData.teacherName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="font-khmer-body text-xs text-gray-500">
                    គ្រូ: {classData.teacherName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <p className="font-black text-2xl text-green-600 leading-none">
              {classData.passPercentage.toFixed(1)}%
            </p>
            <p className="font-khmer-body text-xs text-green-700 font-semibold mt-0.5">
              ជាប់
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            {expandedClass ? (
              <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Class Details */}
      {expandedClass && (
        <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
          {/* Class Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="font-khmer-body text-xs text-blue-600 font-semibold mb-1">មធ្យមភាគ</p>
              <p className="font-black text-xl text-blue-600">{classData.averageScore.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="font-khmer-body text-xs text-green-600 font-semibold mb-1">ជាប់</p>
              <p className="font-black text-xl text-green-600">{classData.passedCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="font-khmer-body text-xs text-red-600 font-semibold mb-1">ធ្លាក់</p>
              <p className="font-black text-xl text-red-600">{classData.failedCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="font-khmer-body text-xs text-purple-600 font-semibold mb-1">ប្រុស/ស្រី</p>
              <p className="font-black text-xl text-purple-600">{classData.maleCount}/{classData.femaleCount}</p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-5">
            <h5 className="font-khmer-body text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              ការចែកចាយពិន្ទុ
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(classData.gradeDistribution).map(([letter, dist]: [string, any]) => (
                <div key={letter} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getGradeColor(letter)} text-white font-black text-sm shadow`}>
                    {letter}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg text-gray-900">{dist.total}</p>
                    <p className="font-khmer-body text-xs text-gray-500">
                      {classData.studentCount > 0 ? ((dist.total / classData.studentCount) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          {classData.subjectStats && classData.subjectStats.length > 0 && (
            <div>
              <h5 className="font-khmer-body text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                មុខវិជ្ជាទាំងអស់ ({classData.subjectStats.length} មុខវិជ្ជា)
              </h5>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {classData.subjectStats.map((subject: any) => (
                  <div key={subject.subjectId} className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h6 className="font-khmer-body text-base font-black text-gray-900">
                          {subject.subjectName}
                        </h6>
                        <p className="font-mono text-xs text-gray-500 font-semibold mt-0.5">
                          {subject.subjectCode} • Max: {subject.maxScore} • Coefficient: {subject.coefficient}
                        </p>
                      </div>
                      <div className="text-right px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="font-black text-lg text-indigo-600">{subject.totalStudentsWithGrades}</p>
                        <p className="font-khmer-body text-xs text-indigo-700 font-semibold">សិស្សមានពិន្ទុ</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                      {Object.entries(subject.gradeDistribution).map(([letter, dist]: [string, any]) => (
                        <div key={letter} className={`text-center p-2 rounded-lg bg-gradient-to-br ${getGradeColor(letter)}`}>
                          <p className="text-white font-black text-xs mb-0.5">{letter}</p>
                          <p className="text-white font-black text-base">{dist.total}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentKhmerMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareMonth, setCompareMonth] = useState(getCurrentKhmerMonth());
  const [compareStats, setCompareStats] = useState<ComprehensiveStats | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [selectedDistributionGrade, setSelectedDistributionGrade] = useState<string>("all");
  const [selectedDistributionClass, setSelectedDistributionClass] = useState<string>("all");

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

  const loadCompareStats = useCallback(async () => {
    if (!comparisonMode) return;
    
    try {
      const data = await dashboardApi.getComprehensiveStats(
        compareMonth,
        selectedYear
      );
      setCompareStats(data);
    } catch (err) {
      console.error("Error loading comparison stats:", err);
    }
  }, [comparisonMode, compareMonth, selectedYear]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (comparisonMode) {
      loadCompareStats();
    }
  }, [comparisonMode, loadCompareStats]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportUtils.exportToPDF('statistics-content', `statistics-${selectedMonth}-${selectedYear}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPNG = async () => {
    setExporting(true);
    try {
      await exportUtils.exportToPNG('statistics-content', `statistics-${selectedMonth}-${selectedYear}.png`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="font-khmer-title text-2xl text-gray-900 mb-3">
                មានបញ្ហា
              </h2>
              <p className="font-khmer-body text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => loadStats()}
                className="w-full bg-indigo-600 text-white font-khmer-body font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors"
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
      <div className="flex min-h-screen bg-gray-50">
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

  const totalStudents = stats.grades.reduce((sum, g) => sum + g.totalStudents, 0);
  const totalMale = stats.grades.reduce((sum, g) => sum + g.maleStudents, 0);
  const totalFemale = stats.grades.reduce((sum, g) => sum + g.femaleStudents, 0);
  const totalPassed = stats.grades.reduce((sum, g) => sum + g.passedCount, 0);
  const totalFailed = stats.grades.reduce((sum, g) => sum + g.failedCount, 0);
  const totalWithGrades = totalPassed + totalFailed;
  const overallPassPercentage = totalWithGrades > 0 ? (totalPassed / totalWithGrades) * 100 : 0;
  const totalClasses = stats.grades.reduce((sum, g) => sum + g.totalClasses, 0);

  const tabs = [
    { id: "overview" as TabType, label: "ទិដ្ឋភាពទូទៅ", icon: BarChart3 },
    { id: "pass-fail" as TabType, label: "ជាប់/ធ្លាក់", icon: Target },
    { id: "performance" as TabType, label: "ការអនុវត្ត", icon: TrendingUp },
    { id: "distribution" as TabType, label: "ការចែកចាយពិន្ទុ", icon: PieChart },
    { id: "rankings" as TabType, label: "ចំណាត់ថ្នាក់", icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="font-khmer-title text-3xl text-gray-900">
                    ស្ថិតិទូទៅ
                  </h1>
                  <p className="font-khmer-body text-gray-500 text-sm">
                    Comprehensive Statistics
                  </p>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-khmer-body font-bold text-sm">Export PDF</span>
                </button>
                <button
                  onClick={handleExportPNG}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image className="w-4 h-4" />
                  <span className="font-khmer-body font-bold text-sm">Export PNG</span>
                </button>
              </div>
            </div>

            {/* Month & Year Selector */}
            <div className="flex gap-4 items-end flex-wrap">
              {!comparisonMode ? (
                <>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 min-w-[180px]">
                    <label className="block font-khmer-body text-xs text-gray-600 font-bold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      ខែ
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full h-10 px-3 text-sm font-khmer-body font-bold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 min-w-[140px]">
                    <label className="block font-khmer-body text-xs text-gray-600 font-bold mb-2">
                      ឆ្នាំ
                    </label>
                    <select
                      value={selectedYear.toString()}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full h-10 px-3 text-sm font-khmer-body font-bold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {getAcademicYearOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setComparisonMode(true)}
                    className="h-10 px-5 bg-blue-600 text-white font-khmer-body font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <GitCompare className="w-4 h-4" />
                    ប្រៀបធៀប
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-400 min-w-[180px]">
                    <label className="block font-khmer-body text-xs text-blue-600 font-bold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      ខែទី១
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full h-10 px-3 text-sm font-khmer-body font-bold bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-xl font-bold text-gray-400">vs</div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-orange-400 min-w-[180px]">
                    <label className="block font-khmer-body text-xs text-orange-600 font-bold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      ខែទី២
                    </label>
                    <select
                      value={compareMonth}
                      onChange={(e) => setCompareMonth(e.target.value)}
                      className="w-full h-10 px-3 text-sm font-khmer-body font-bold bg-orange-50 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 min-w-[140px]">
                    <label className="block font-khmer-body text-xs text-gray-600 font-bold mb-2">
                      ឆ្នាំ
                    </label>
                    <select
                      value={selectedYear.toString()}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full h-10 px-3 text-sm font-khmer-body font-bold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {getAcademicYearOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setComparisonMode(false);
                      setCompareStats(null);
                    }}
                    className="h-10 px-5 bg-gray-600 text-white font-khmer-body font-bold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    បិទការប្រៀបធៀប
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-khmer-body font-bold transition-colors relative ${
                      activeTab === tab.id
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content - wrapped for export */}
          <div id="statistics-content" className="bg-white p-6 rounded-xl">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-khmer-body text-sm text-gray-600 font-bold">
                        សិស្សសរុប
                      </p>
                    </div>
                    <p className="font-black text-4xl text-gray-900 mb-2">
                      {totalStudents}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-khmer-body text-blue-600 font-bold">
                        ប្រុស: {totalMale}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-khmer-body text-pink-600 font-bold">
                        ស្រី: {totalFemale}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-khmer-body text-sm text-gray-600 font-bold">
                        អត្រាជាប់
                      </p>
                    </div>
                    <p className="font-black text-4xl text-green-600 mb-2">
                      {overallPassPercentage.toFixed(1)}%
                    </p>
                    <span className="font-khmer-body text-sm text-green-600 font-bold">
                      {totalPassed} នាក់
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-khmer-body text-sm text-gray-600 font-bold">
                        អត្រាធ្លាក់
                      </p>
                    </div>
                    <p className="font-black text-4xl text-red-600 mb-2">
                      {((totalFailed / totalStudents) * 100).toFixed(1)}%
                    </p>
                    <span className="font-khmer-body text-sm text-red-600 font-bold">
                      {totalFailed} នាក់
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-khmer-body text-sm text-gray-600 font-bold">
                        ថ្នាក់សរុប
                      </p>
                    </div>
                    <p className="font-black text-4xl text-gray-900 mb-2">
                      {totalClasses}
                    </p>
                    <span className="font-khmer-body text-sm text-gray-600 font-bold">
                      ថ្នាក់សកម្ម
                    </span>
                  </div>
                </div>

                {/* Top Performing Classes */}
                {stats.topPerformingClasses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-6 h-6 text-orange-500" />
                      <h3 className="font-khmer-title text-xl text-gray-900">
                        ថ្នាក់ល្អបំផុត
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stats.topPerformingClasses.slice(0, 6).map((cls, index) => (
                        <div
                          key={cls.id}
                          className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md ${
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
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-khmer-body text-gray-500 font-medium">
                                  {cls.studentCount} សិស្ស
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="font-khmer-body text-blue-600 font-medium">
                                  ប: {cls.maleCount}
                                </span>
                                <span className="font-khmer-body text-pink-600 font-medium">
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
              </div>
            )}

            {activeTab === "pass-fail" && (
              <div className="space-y-8">
                {/* Modern Comparison Chart Section */}
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-transparent rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-100/50 to-transparent rounded-full blur-3xl"></div>
                  
                  <div className="relative p-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-khmer-title text-3xl font-bold text-gray-900 mb-2">
                        ស្ថិតិជាប់និងធ្លាក់
                      </h3>
                      <p className="font-khmer-body text-gray-500 text-sm max-w-2xl mx-auto mb-6">
                        ការប្រៀបធៀបចំនួនសិស្សជាប់និងធ្លាក់សម្រាប់ថ្នាក់ទី 7 ដល់ថ្នាក់ទី 12
                      </p>
                      
                      {/* Grade Filter Selector */}
                      <div className="inline-flex items-center gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-200">
                        <span className="font-khmer-body text-sm text-gray-600 font-medium pl-3">ជ្រើសរើសថ្នាក់:</span>
                        <select
                          value={selectedGradeFilter}
                          onChange={(e) => setSelectedGradeFilter(e.target.value)}
                          className="font-khmer-body px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-emerald-300"
                        >
                          <option value="all">ទាំងអស់</option>
                          {stats.grades.map(g => (
                            <option key={g.grade} value={g.grade}>ថ្នាក់ទី{g.grade}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Chart with modern styling */}
                    <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-2xl p-6">
                      <CustomBarChart
                        data={selectedGradeFilter === "all" 
                          ? stats.grades.map(g => ({
                              grade: `ថ្នាក់${g.grade}`,
                              'ជាប់': g.passedCount,
                              'ធ្លាក់': g.failedCount,
                            }))
                          : (() => {
                              const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                              return selectedGrade?.classes.map(c => ({
                                grade: c.name,
                                'ជាប់': c.passedCount,
                                'ធ្លាក់': c.failedCount,
                              })) || [];
                            })()
                        }
                        xKey="grade"
                        yKey={['ជាប់', 'ធ្លាក់']}
                        colors={['#10b981', '#ef4444']}
                        height={420}
                        showLegend={true}
                        yAxisLabel="ចំនួនសិស្ស"
                        tooltipFormatter={(value) => `${value} នាក់`}
                      />
                    </div>
                  </div>
                </div>

                {/* Modern Grade/Class Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedGradeFilter === "all" ? (
                    // Show all grades
                    stats.grades.map(grade => {
                      const total = grade.passedCount + grade.failedCount;
                      const passPercentage = total > 0 ? (grade.passedCount / total * 100) : 0;
                      const failPercentage = total > 0 ? (grade.failedCount / total * 100) : 0;

                      return (
                        <div 
                          key={grade.grade} 
                          className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 overflow-hidden"
                        >
                          {/* Decorative corner accent */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full"></div>
                          
                          <div className="relative">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-black text-lg">{grade.grade}</span>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                  <p className="font-khmer-body text-xs text-gray-500">ថ្នាក់ទី</p>
                                  <h4 className="font-khmer-title text-xl font-bold text-gray-900">
                                    {grade.grade}
                                  </h4>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 font-khmer-body">សិស្សសរុប</p>
                                <p className="text-2xl font-black text-gray-900">{grade.totalStudents}</p>
                              </div>
                            </div>

                            {/* Pass/Fail Comparison */}
                            <div className="space-y-4 mb-6">
                              {/* Pass */}
                              <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-khmer-body text-sm text-gray-600">ជាប់</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-khmer-body text-gray-500">{passPercentage.toFixed(1)}%</span>
                                    <span className="text-xl font-black text-green-600">{grade.passedCount}</span>
                                  </div>
                                </div>
                                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                                    style={{ width: `${passPercentage}%` }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Fail */}
                              <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="font-khmer-body text-sm text-gray-600">ធ្លាក់</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-khmer-body text-gray-500">{failPercentage.toFixed(1)}%</span>
                                    <span className="text-xl font-black text-red-600">{grade.failedCount}</span>
                                  </div>
                                </div>
                                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                                    style={{ width: `${failPercentage}%` }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Pass Rate Badge */}
                            <div className={`flex items-center justify-between p-4 rounded-xl ${
                              passPercentage >= 75 ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                              passPercentage >= 50 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' :
                              'bg-gradient-to-r from-red-50 to-rose-50'
                            }`}>
                              <span className="font-khmer-body text-sm font-medium text-gray-700">អត្រាជាប់</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  passPercentage >= 75 ? 'bg-green-500' :
                                  passPercentage >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}>
                                  {passPercentage >= 75 ? (
                                    <TrendingUp className="w-4 h-4 text-white" />
                                  ) : passPercentage >= 50 ? (
                                    <Target className="w-4 h-4 text-white" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className={`text-2xl font-black ${
                                  passPercentage >= 75 ? 'text-green-600' :
                                  passPercentage >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {passPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Show classes of selected grade
                    (() => {
                      const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                      return selectedGrade?.classes.map(cls => {
                        const total = cls.passedCount + cls.failedCount;
                        const passPercentage = total > 0 ? (cls.passedCount / total * 100) : 0;
                        const failPercentage = total > 0 ? (cls.failedCount / total * 100) : 0;

                        return (
                          <div 
                            key={cls.id} 
                            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 overflow-hidden"
                          >
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full"></div>
                            
                            <div className="relative">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                      <span className="text-white font-black text-sm">{cls.section}</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                  </div>
                                  <div>
                                    <p className="font-khmer-body text-xs text-gray-500">ថ្នាក់</p>
                                    <h4 className="font-khmer-title text-xl font-bold text-gray-900">
                                      {cls.name}
                                    </h4>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 font-khmer-body">សិស្សសរុប</p>
                                  <p className="text-2xl font-black text-gray-900">{cls.studentCount}</p>
                                </div>
                              </div>

                              {/* Pass/Fail Comparison */}
                              <div className="space-y-4 mb-6">
                                {/* Pass */}
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-khmer-body text-sm text-gray-600">ជាប់</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-khmer-body text-gray-500">{passPercentage.toFixed(1)}%</span>
                                      <span className="text-xl font-black text-green-600">{cls.passedCount}</span>
                                    </div>
                                  </div>
                                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                                      style={{ width: `${passPercentage}%` }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Fail */}
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      <span className="font-khmer-body text-sm text-gray-600">ធ្លាក់</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-khmer-body text-gray-500">{failPercentage.toFixed(1)}%</span>
                                      <span className="text-xl font-black text-red-600">{cls.failedCount}</span>
                                    </div>
                                  </div>
                                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                                      style={{ width: `${failPercentage}%` }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Pass Rate Badge */}
                              <div className={`flex items-center justify-between p-4 rounded-xl ${
                                passPercentage >= 75 ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                                passPercentage >= 50 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' :
                                'bg-gradient-to-r from-red-50 to-rose-50'
                              }`}>
                                <span className="font-khmer-body text-sm font-medium text-gray-700">អត្រាជាប់</span>
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    passPercentage >= 75 ? 'bg-green-500' :
                                    passPercentage >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}>
                                    {passPercentage >= 75 ? (
                                      <TrendingUp className="w-4 h-4 text-white" />
                                    ) : passPercentage >= 50 ? (
                                      <Target className="w-4 h-4 text-white" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className={`text-2xl font-black ${
                                    passPercentage >= 75 ? 'text-green-600' :
                                    passPercentage >= 50 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {passPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }) || [];
                    })()
                  )}
                </div>

                {/* Modern Summary Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Students */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-white mb-1">
                            {selectedGradeFilter === "all" 
                              ? stats.grades.reduce((sum, g) => sum + g.totalStudents, 0)
                              : (() => {
                                  const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                                  return selectedGrade?.totalStudents || 0;
                                })()
                            }
                          </p>
                          <p className="text-xs text-white/70 font-khmer-body">នាក់</p>
                        </div>
                      </div>
                      <p className="font-khmer-body text-sm text-white/90 font-medium">សិស្សសរុប</p>
                    </div>
                  </div>

                  {/* Total Passed */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-white mb-1">
                            {selectedGradeFilter === "all" 
                              ? stats.grades.reduce((sum, g) => sum + g.passedCount, 0)
                              : (() => {
                                  const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                                  return selectedGrade?.passedCount || 0;
                                })()
                            }
                          </p>
                          <p className="text-xs text-white/70 font-khmer-body">នាក់</p>
                        </div>
                      </div>
                      <p className="font-khmer-body text-sm text-white/90 font-medium">ជាប់សរុប</p>
                    </div>
                  </div>

                  {/* Total Failed */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <XCircle className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-white mb-1">
                            {selectedGradeFilter === "all" 
                              ? stats.grades.reduce((sum, g) => sum + g.failedCount, 0)
                              : (() => {
                                  const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                                  return selectedGrade?.failedCount || 0;
                                })()
                            }
                          </p>
                          <p className="text-xs text-white/70 font-khmer-body">នាក់</p>
                        </div>
                      </div>
                      <p className="font-khmer-body text-sm text-white/90 font-medium">ធ្លាក់សរុប</p>
                    </div>
                  </div>

                  {/* Overall Pass Rate */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-white mb-1">
                            {selectedGradeFilter === "all" 
                              ? overallPassPercentage.toFixed(1)
                              : (() => {
                                  const selectedGrade = stats.grades.find(g => g.grade === selectedGradeFilter);
                                  return selectedGrade?.passPercentage.toFixed(1) || '0.0';
                                })()
                            }
                          </p>
                          <p className="text-xs text-white/70 font-khmer-body">%</p>
                        </div>
                      </div>
                      <p className="font-khmer-body text-sm text-white/90 font-medium">អត្រាជាប់</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-8">
                {/* Enhanced Bar Chart Section */}
                <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-khmer-title text-2xl font-bold text-gray-900">
                          ការចែកចាយពិន្ទុតាមថ្នាក់រៀន
                        </h3>
                        <p className="font-khmer-body text-sm text-gray-500 mt-1">
                          ការវិភាគពិន្ទុ A-F សម្រាប់ថ្នាក់ទី 7 ដល់ថ្នាក់ទី 12
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Chart with better styling */}
                  <div className="bg-white rounded-2xl p-8 shadow-inner border border-gray-100">
                    <CustomBarChart
                      data={stats.grades.map(g => ({
                        grade: `ថ្នាក់${g.grade}`,
                        'A': g.gradeDistribution.A.total,
                        'B': g.gradeDistribution.B.total,
                        'C': g.gradeDistribution.C.total,
                        'D': g.gradeDistribution.D.total,
                        'E': g.gradeDistribution.E.total,
                        'F': g.gradeDistribution.F.total,
                      }))}
                      xKey="grade"
                      yKey={['A', 'B', 'C', 'D', 'E', 'F']}
                      colors={['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#dc2626']}
                      height={480}
                      showLegend={true}
                      yAxisLabel="ចំនួនសិស្ស"
                      tooltipFormatter={(value) => `${value} នាក់`}
                    />
                  </div>
                </div>

                {/* Redesigned Grade Distribution Cards */}
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-khmer-title text-2xl font-bold text-gray-900">
                      ការវិភាគលម្អិត
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                    {stats.grades.map(grade => {
                      const totalWithGrades = grade.passedCount + grade.failedCount;
                      const gradeData = [
                        { letter: 'A', count: grade.gradeDistribution.A.total, color: 'from-green-500 to-green-600', borderColor: 'border-green-200', iconBg: 'bg-green-500' },
                        { letter: 'B', count: grade.gradeDistribution.B.total, color: 'from-blue-500 to-blue-600', borderColor: 'border-blue-200', iconBg: 'bg-blue-500' },
                        { letter: 'C', count: grade.gradeDistribution.C.total, color: 'from-yellow-500 to-yellow-600', borderColor: 'border-yellow-200', iconBg: 'bg-yellow-500' },
                        { letter: 'D', count: grade.gradeDistribution.D.total, color: 'from-orange-500 to-orange-600', borderColor: 'border-orange-200', iconBg: 'bg-orange-500' },
                        { letter: 'E', count: grade.gradeDistribution.E.total, color: 'from-red-500 to-red-600', borderColor: 'border-red-200', iconBg: 'bg-red-500' },
                        { letter: 'F', count: grade.gradeDistribution.F.total, color: 'from-red-600 to-red-700', borderColor: 'border-red-300', iconBg: 'bg-red-600' },
                      ];

                      return (
                        <div key={grade.grade} className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                          {/* Cleaner Header */}
                          <div className="mb-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-khmer-body text-xl font-black text-gray-900">
                                ថ្នាក់ទី{grade.grade}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-sm font-khmer-body">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-500 font-medium">
                                {grade.totalStudents} នាក់
                              </span>
                            </div>
                          </div>

                          {/* Clean Grade Distribution */}
                          <div className="space-y-2.5 mb-5">
                            {gradeData.map(item => {
                              const percentage = totalWithGrades > 0 ? (item.count / totalWithGrades * 100) : 0;
                              return (
                                <div key={item.letter} className="group">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 ${item.iconBg} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                        <span className="text-white font-bold text-xs">{item.letter}</span>
                                      </div>
                                      <span className="font-khmer-body text-xs text-gray-500 font-medium">
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                    <span className="font-black text-lg text-gray-900">
                                      {item.count}
                                    </span>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Clean Pass Rate Footer */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="font-khmer-body text-xs text-gray-500 font-semibold">
                                អត្រាជាប់
                              </span>
                              <div className="flex items-center gap-1.5">
                                {grade.passPercentage >= 75 ? (
                                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                  </div>
                                ) : grade.passPercentage >= 50 ? (
                                  <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Target className="w-3 h-3 text-yellow-600" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                  </div>
                                )}
                                <span className={`font-black text-base ${
                                  grade.passPercentage >= 75 ? 'text-green-600' : 
                                  grade.passPercentage >= 50 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {grade.passPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Overall Statistics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-7 h-7" />
                      </div>
                      <span className="text-4xl font-black">
                        {stats.grades.reduce((sum, g) => sum + g.totalStudents, 0)}
                      </span>
                    </div>
                    <p className="font-khmer-body text-sm opacity-90 font-medium">សិស្សសរុប</p>
                  </div>

                  <div className="group bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <span className="text-4xl font-black">
                        {stats.grades.reduce((sum, g) => sum + g.passedCount, 0)}
                      </span>
                    </div>
                    <p className="font-khmer-body text-sm opacity-90 font-medium">សិស្សជាប់</p>
                  </div>

                  <div className="group bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="w-7 h-7" />
                      </div>
                      <span className="text-4xl font-black">
                        {stats.grades.reduce((sum, g) => sum + g.failedCount, 0)}
                      </span>
                    </div>
                    <p className="font-khmer-body text-sm opacity-90 font-medium">សិស្សធ្លាក់</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className="space-y-6">
                {/* Grade Distribution with Filter */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="w-6 h-6 text-purple-500" />
                    <h3 className="font-khmer-title text-xl text-gray-900">
                      ការចែកចាយពិន្ទុ A-F
                    </h3>
                  </div>

                  {/* Filter Controls */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Grade Selector */}
                      <div className="flex items-center gap-3">
                        <span className="font-khmer-body text-sm text-gray-700 font-semibold">ជ្រើសរើសថ្នាក់:</span>
                        <select
                          value={selectedDistributionGrade}
                          onChange={(e) => {
                            setSelectedDistributionGrade(e.target.value);
                            setSelectedDistributionClass("all"); // Reset class when grade changes
                          }}
                          className="font-khmer-body px-4 py-2 bg-white border-2 border-purple-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-purple-300"
                        >
                          <option value="all">ទាំងអស់</option>
                          {stats.grades.map(g => (
                            <option key={g.grade} value={g.grade}>ថ្នាក់ទី{g.grade}</option>
                          ))}
                        </select>
                      </div>

                      {/* Class Selector - Only show when a specific grade is selected */}
                      {selectedDistributionGrade !== "all" && (() => {
                        const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                        if (!selectedGrade) return null;
                        
                        return (
                          <div className="flex items-center gap-3">
                            <span className="font-khmer-body text-sm text-gray-700 font-semibold">ជ្រើសរើសថ្នាក់រៀន:</span>
                            <select
                              value={selectedDistributionClass}
                              onChange={(e) => setSelectedDistributionClass(e.target.value)}
                              className="font-khmer-body px-4 py-2 bg-white border-2 border-purple-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-purple-300"
                            >
                              <option value="all">ទាំងអស់</option>
                              {selectedGrade.classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div>
                      <h4 className="font-khmer-body text-base font-bold text-gray-900 mb-4">
                        {selectedDistributionGrade === "all" 
                          ? "ការចែកចាយពិន្ទុសរុប" 
                          : selectedDistributionClass === "all"
                          ? `ការចែកចាយពិន្ទុថ្នាក់ទី${selectedDistributionGrade}`
                          : `ការចែកចាយពិន្ទុថ្នាក់ ${stats.grades.find(g => g.grade === selectedDistributionGrade)?.classes.find(c => c.id === selectedDistributionClass)?.name || ''}`
                        }
                      </h4>
                      <CustomPieChart
                        data={(() => {
                          let distribution: any;
                          
                          if (selectedDistributionGrade === "all") {
                            // Show all grades combined
                            const totalDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
                            stats.grades.forEach(grade => {
                              Object.entries(grade.gradeDistribution).forEach(([letter, dist]: [string, any]) => {
                                totalDistribution[letter as keyof typeof totalDistribution] += dist.total;
                              });
                            });
                            distribution = totalDistribution;
                          } else if (selectedDistributionClass === "all") {
                            // Show specific grade (all classes combined)
                            const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                            distribution = selectedGrade?.gradeDistribution || { A: {total: 0}, B: {total: 0}, C: {total: 0}, D: {total: 0}, E: {total: 0}, F: {total: 0} };
                          } else {
                            // Show specific class
                            const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                            const selectedClass = selectedGrade?.classes.find(c => c.id === selectedDistributionClass);
                            distribution = selectedClass?.gradeDistribution || { A: {total: 0}, B: {total: 0}, C: {total: 0}, D: {total: 0}, E: {total: 0}, F: {total: 0} };
                          }

                          return Object.entries(distribution).map(([letter, data]: [string, any]) => ({
                            name: `ពិន្ទុ ${letter}`,
                            value: typeof data === 'number' ? data : data.total,
                            letter,
                          }));
                        })()}
                        nameKey="name"
                        valueKey="value"
                        colors={['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#dc2626']}
                        height={300}
                      />
                    </div>

                    {/* Gender Breakdown Details - Compact Grid Layout */}
                    <div>
                      <h4 className="font-khmer-body text-base font-bold text-gray-900 mb-4">
                        ការចែកចាយតាមភេទ
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {(() => {
                          let distribution: any;
                          
                          if (selectedDistributionGrade === "all") {
                            // Show all grades combined
                            const totalDistribution = { 
                              A: {total: 0, male: 0, female: 0}, 
                              B: {total: 0, male: 0, female: 0}, 
                              C: {total: 0, male: 0, female: 0}, 
                              D: {total: 0, male: 0, female: 0}, 
                              E: {total: 0, male: 0, female: 0}, 
                              F: {total: 0, male: 0, female: 0} 
                            };
                            stats.grades.forEach(grade => {
                              Object.entries(grade.gradeDistribution).forEach(([letter, dist]: [string, any]) => {
                                const key = letter as keyof typeof totalDistribution;
                                totalDistribution[key].total += dist.total;
                                totalDistribution[key].male += dist.male;
                                totalDistribution[key].female += dist.female;
                              });
                            });
                            distribution = totalDistribution;
                          } else if (selectedDistributionClass === "all") {
                            // Show specific grade
                            const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                            distribution = selectedGrade?.gradeDistribution || {};
                          } else {
                            // Show specific class
                            const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                            const selectedClass = selectedGrade?.classes.find(c => c.id === selectedDistributionClass);
                            distribution = selectedClass?.gradeDistribution || {};
                          }

                          const gradeLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                          const colors: Record<string, string> = {
                            A: 'from-green-500 to-green-600',
                            B: 'from-blue-500 to-blue-600',
                            C: 'from-yellow-500 to-yellow-600',
                            D: 'from-orange-500 to-orange-600',
                            E: 'from-red-500 to-red-600',
                            F: 'from-red-600 to-red-700',
                          };
                          
                          const bgColors: Record<string, string> = {
                            A: 'bg-green-500',
                            B: 'bg-blue-500',
                            C: 'bg-yellow-500',
                            D: 'bg-orange-500',
                            E: 'bg-red-500',
                            F: 'bg-red-600',
                          };

                          return gradeLetters.map(letter => {
                            const data = distribution[letter] || { total: 0, male: 0, female: 0 };
                            const malePercent = data.total > 0 ? ((data.male / data.total) * 100).toFixed(1) : '0.0';
                            const femalePercent = data.total > 0 ? ((data.female / data.total) * 100).toFixed(1) : '0.0';

                            return (
                              <div key={letter} className="bg-white rounded-lg border-2 border-gray-100 p-3 hover:shadow-lg transition-all hover:border-gray-200">
                                {/* Header with Grade Letter */}
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                  <div className={`w-8 h-8 ${bgColors[letter]} rounded-lg flex items-center justify-center shadow-sm`}>
                                    <span className="text-white font-black text-base">{letter}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-khmer-body text-xs text-gray-500">ពិន្ទុ {letter}</p>
                                    <p className="font-black text-xl text-gray-900 leading-tight">{data.total}</p>
                                  </div>
                                </div>

                                {/* Compact Gender Stats */}
                                <div className="space-y-1.5">
                                  {/* Male - Horizontal Layout */}
                                  <div className="flex items-center justify-between bg-blue-50 rounded-md px-2 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-[10px] font-bold">♂</span>
                                      </div>
                                      <span className="font-khmer-body text-xs text-gray-700 font-medium">ប្រុស</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="font-black text-base text-gray-900">{data.male}</span>
                                      <span className="text-[10px] text-gray-500 font-semibold">({malePercent}%)</span>
                                    </div>
                                  </div>

                                  {/* Female - Horizontal Layout */}
                                  <div className="flex items-center justify-between bg-pink-50 rounded-md px-2 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-[10px] font-bold">♀</span>
                                      </div>
                                      <span className="font-khmer-body text-xs text-gray-700 font-medium">ស្រី</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="font-black text-base text-gray-900">{data.female}</span>
                                      <span className="text-[10px] text-gray-500 font-semibold">({femalePercent}%)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade Distribution by Gender - More Relevant Visualization */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                    <h3 className="font-khmer-title text-xl text-gray-900">
                      ការចែកចាយពិន្ទុតាមភេទ
                    </h3>
                  </div>
                  
                  {/* Stacked Bar Chart showing Grade Distribution by Gender */}
                  <div>
                    <h4 className="font-khmer-body text-base font-bold text-gray-900 mb-4">
                      ការប្រៀបធៀបពិន្ទុ A-F តាមភេទ
                    </h4>
                    <CustomBarChart
                      data={(() => {
                        let distribution: any;
                        
                        if (selectedDistributionGrade === "all") {
                          // All grades combined
                          const totalDistribution = { 
                            A: {male: 0, female: 0}, 
                            B: {male: 0, female: 0}, 
                            C: {male: 0, female: 0}, 
                            D: {male: 0, female: 0}, 
                            E: {male: 0, female: 0}, 
                            F: {male: 0, female: 0} 
                          };
                          stats.grades.forEach(grade => {
                            Object.entries(grade.gradeDistribution).forEach(([letter, dist]: [string, any]) => {
                              const key = letter as keyof typeof totalDistribution;
                              totalDistribution[key].male += dist.male;
                              totalDistribution[key].female += dist.female;
                            });
                          });
                          distribution = totalDistribution;
                        } else if (selectedDistributionClass === "all") {
                          // Specific grade
                          const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                          distribution = selectedGrade?.gradeDistribution || {};
                        } else {
                          // Specific class
                          const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                          const selectedClass = selectedGrade?.classes.find(c => c.id === selectedDistributionClass);
                          distribution = selectedClass?.gradeDistribution || {};
                        }

                        return ['A', 'B', 'C', 'D', 'E', 'F'].map(letter => ({
                          grade: `ពិន្ទុ ${letter}`,
                          'ប្រុស': distribution[letter]?.male || 0,
                          'ស្រី': distribution[letter]?.female || 0,
                        }));
                      })()}
                      xKey="grade"
                      yKey={['ប្រុស', 'ស្រី']}
                      colors={['#3b82f6', '#ec4899']}
                      height={350}
                      showLegend={true}
                      yAxisLabel="ចំនួនសិស្ស"
                      tooltipFormatter={(value) => `${value} នាក់`}
                    />
                  </div>

                  {/* Summary Statistics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {/* Total Students */}
                    {(() => {
                      let totalStudents = 0;
                      let totalMaleStudents = 0;
                      let totalFemaleStudents = 0;
                      
                      if (selectedDistributionGrade === "all") {
                        stats.grades.forEach(grade => {
                          Object.values(grade.gradeDistribution).forEach((dist: any) => {
                            totalStudents += dist.total;
                            totalMaleStudents += dist.male;
                            totalFemaleStudents += dist.female;
                          });
                        });
                      } else if (selectedDistributionClass === "all") {
                        const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                        if (selectedGrade) {
                          Object.values(selectedGrade.gradeDistribution).forEach((dist: any) => {
                            totalStudents += dist.total;
                            totalMaleStudents += dist.male;
                            totalFemaleStudents += dist.female;
                          });
                        }
                      } else {
                        const selectedGrade = stats.grades.find(g => g.grade === selectedDistributionGrade);
                        const selectedClass = selectedGrade?.classes.find(c => c.id === selectedDistributionClass);
                        if (selectedClass) {
                          Object.values(selectedClass.gradeDistribution).forEach((dist: any) => {
                            totalStudents += dist.total;
                            totalMaleStudents += dist.male;
                            totalFemaleStudents += dist.female;
                          });
                        }
                      }

                      return (
                        <>
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                            <p className="font-khmer-body text-xs opacity-90 mb-1">សរុប</p>
                            <p className="text-3xl font-black">{totalStudents}</p>
                            <p className="font-khmer-body text-xs opacity-75 mt-1">សិស្សសរុប</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                            <p className="font-khmer-body text-xs opacity-90 mb-1">ប្រុស</p>
                            <p className="text-3xl font-black">{totalMaleStudents}</p>
                            <p className="font-khmer-body text-xs opacity-75 mt-1">
                              {totalStudents > 0 ? ((totalMaleStudents / totalStudents) * 100).toFixed(1) : '0.0'}%
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                            <p className="font-khmer-body text-xs opacity-90 mb-1">ស្រី</p>
                            <p className="text-3xl font-black">{totalFemaleStudents}</p>
                            <p className="font-khmer-body text-xs opacity-75 mt-1">
                              {totalStudents > 0 ? ((totalFemaleStudents / totalStudents) * 100).toFixed(1) : '0.0'}%
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                            <p className="font-khmer-body text-xs opacity-90 mb-1">ភាពខុសគ្នា</p>
                            <p className="text-3xl font-black">
                              {Math.abs(totalMaleStudents - totalFemaleStudents)}
                            </p>
                            <p className="font-khmer-body text-xs opacity-75 mt-1">
                              {totalMaleStudents > totalFemaleStudents ? 'ប្រុស​ច្រើន​ជាង' : totalFemaleStudents > totalMaleStudents ? 'ស្រី​ច្រើន​ជាង' : 'ស្មើ​គ្នា'}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rankings" && (
              <div className="space-y-6">
                {/* Detailed Grade Statistics */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-8 border border-gray-200">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-khmer-title text-2xl font-black text-gray-900">
                          ស្ថិតិលម្អិតតាមថ្នាក់
                        </h3>
                        <p className="font-khmer-body text-sm text-gray-600 mt-1">
                          ទិន្នន័យពេញលេញសម្រាប់ថ្នាក់ ថ្នាក់រៀន និងមុខវិជ្ជា
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-200">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="font-khmer-body text-sm font-semibold text-indigo-700">
                        {selectedMonth} {selectedYear}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {stats.grades.map((grade) => (
                      <div
                        key={grade.grade}
                        className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Grade Header */}
                        <button
                          onClick={() =>
                            setExpandedGrade(
                              expandedGrade === grade.grade ? null : grade.grade
                            )
                          }
                          className="w-full p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <span className="text-white font-black text-2xl">
                                {grade.grade}
                              </span>
                            </div>
                            <div className="text-left">
                              <p className="font-khmer-title text-xl font-black text-gray-900">
                                ថ្នាក់ទី{grade.grade}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="font-khmer-body text-sm text-gray-600 font-medium flex items-center gap-1.5">
                                  <Users className="w-4 h-4" />
                                  {grade.totalStudents} សិស្ស
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="font-khmer-body text-sm text-gray-600 font-medium">
                                  {grade.totalClasses} ថ្នាក់រៀន
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right px-5 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                              <p className="font-black text-3xl text-green-600 leading-none">
                                {grade.passPercentage.toFixed(1)}%
                              </p>
                              <p className="font-khmer-body text-xs text-green-700 font-semibold mt-1">
                                អត្រាជាប់
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              {expandedGrade === grade.grade ? (
                                <ChevronDown className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" />
                              ) : (
                                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded Grade Details */}
                        {expandedGrade === grade.grade && (
                          <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                            <div className="p-6">
                              {/* Grade Summary Stats */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                                  <div className="flex items-center gap-3 mb-3">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <p className="font-khmer-body text-sm text-blue-700 font-bold">
                                      មធ្យមភាគសរុប
                                    </p>
                                  </div>
                                  <p className="font-black text-4xl text-blue-600">
                                    {grade.averageScore.toFixed(1)}
                                  </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                                  <div className="flex items-center gap-3 mb-3">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <p className="font-khmer-body text-sm text-green-700 font-bold">
                                      ជាប់
                                    </p>
                                  </div>
                                  <p className="font-black text-4xl text-green-600 mb-2">
                                    {grade.passedCount}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="font-khmer-body text-green-600">
                                      ប្រុស: <span className="font-black">{grade.passedMale}</span>
                                    </span>
                                    <span className="font-khmer-body text-green-600">
                                      ស្រី: <span className="font-black">{grade.passedFemale}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200">
                                  <div className="flex items-center gap-3 mb-3">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                    <p className="font-khmer-body text-sm text-red-700 font-bold">
                                      ធ្លាក់
                                    </p>
                                  </div>
                                  <p className="font-black text-4xl text-red-600 mb-2">
                                    {grade.failedCount}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="font-khmer-body text-red-600">
                                      ប្រុស: <span className="font-black">{grade.failedMale}</span>
                                    </span>
                                    <span className="font-khmer-body text-red-600">
                                      ស្រី: <span className="font-black">{grade.failedFemale}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Grade Distribution Chart */}
                              <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
                                <h4 className="font-khmer-body text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <PieChart className="w-5 h-5 text-indigo-600" />
                                  ការចែកចាយពិន្ទុថ្នាក់ទី{grade.grade}
                                </h4>
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
                                          )} text-white font-black text-lg shadow-md`}
                                        >
                                          {letter}
                                        </div>
                                        <div className="flex-1">
                                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <div
                                              className={`h-full bg-gradient-to-r ${getGradeColor(
                                                letter
                                              )} transition-all duration-500`}
                                              style={{
                                                width: `${
                                                  grade.totalStudents > 0
                                                    ? ((dist as any).total / grade.totalStudents) * 100
                                                    : 0
                                                }%`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 min-w-[160px] justify-end">
                                          <span className="font-black text-2xl text-gray-900">
                                            {(dist as any).total}
                                          </span>
                                          <span className="font-khmer-body text-sm text-gray-500 font-medium">
                                            ({grade.totalStudents > 0 ? (((dist as any).total / grade.totalStudents) * 100).toFixed(1) : 0}%)
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Classes List */}
                              <div>
                                <h4 className="font-khmer-body text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-indigo-600" />
                                  ថ្នាក់រៀនទាំងអស់ ({grade.classes.length} ថ្នាក់)
                                </h4>
                                <div className="space-y-3">
                                  {grade.classes.map((cls) => (
                                    <ClassDetailsCard key={cls.id} classData={cls} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

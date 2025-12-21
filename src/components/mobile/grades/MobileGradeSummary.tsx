"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import MobileLayout from "@/components/layout/MobileLayout";
import ImportGradesModal from "@/components/modals/ImportGradesModal";
import {
  Upload,
  Download,
  Loader2,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";
import { gradeApi, type StudentSummary } from "@/lib/api/grades";
import type { Class } from "@/lib/api/classes";

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

export default function MobileGradeSummary() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("មករា");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [summaries, setSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [isAuthenticated, authLoading, classes.length, isLoadingClasses, refreshClasses]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGradeSummary();
    }
  }, [selectedClassId, selectedMonth, selectedYear]);

  const fetchGradeSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gradeApi.getMonthlySummary(
        selectedClassId,
        selectedMonth,
        selectedYear
      );
      setSummaries(data);
    } catch (err: any) {
      console.error("Error fetching summary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchGradeSummary();
  };

  const handleExport = async () => {
    if (!selectedClassId) return;

    try {
      const blob = await gradeApi.exportGrades(
        selectedClassId,
        selectedMonth,
        selectedYear
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grades_${selectedClassId}_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`❌ Export failed: ${err.message}`);
    }
  };

  if (authLoading) {
    return (
      <MobileLayout title="Grades">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </MobileLayout>
    );
  }

  if (!isAuthenticated) return null;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const getGradeLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      A: "bg-green-500",
      "B+": "bg-blue-500",
      B: "bg-cyan-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-400",
      F: "bg-red-600",
    };
    return colors[level] || "bg-gray-500";
  };

  const stats =
    summaries.length > 0
      ? {
          avgScore:
            summaries.reduce((sum, s) => sum + s.average, 0) / summaries.length,
          highest: Math.max(...summaries.map((s) => s.average)),
          lowest: Math.min(...summaries.map((s) => s.average)),
          passRate:
            (summaries.filter((s) => s.average >= 50).length /
              summaries.length) *
            100,
        }
      : null;

  return (
    <MobileLayout title="ពិន្ទុប្រចាំខែ • Grades">
      <div className="p-4 space-y-4 pb-24">
        {/* Header with Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between touch-feedback"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">
                {selectedClass?.name || "ជ្រើសរើសថ្នាក់"}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || !selectedClassId}
            className="bg-white rounded-xl shadow-sm p-3 touch-feedback disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Filters (Collapsible) */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                ថ្នាក់ • Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={isLoadingClasses}
                className="w-full h-12 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
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
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  ខែ • Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-12 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  ឆ្នាំ • Year
                </label>
                <select
                  value={selectedYear.toString()}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-12 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ fontSize: "16px" }}
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                disabled={!selectedClassId}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 touch-feedback text-sm"
              >
                <Upload className="w-4 h-4" />
                នាំចូល
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedClassId || summaries.length === 0}
                className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 touch-feedback text-sm"
              >
                <Download className="w-4 h-4" />
                នាំចេញ
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : selectedClassId ? (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 opacity-80" />
                    <p className="text-xs font-medium opacity-90">មធ្យមភាគថ្នាក់</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgScore.toFixed(2)}</p>
                  <p className="text-xs opacity-80 mt-1">Class Average</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 opacity-80" />
                    <p className="text-xs font-medium opacity-90">ពិន្ទុខ្ពស់</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.highest.toFixed(2)}</p>
                  <p className="text-xs opacity-80 mt-1">Highest</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 opacity-80" />
                    <p className="text-xs font-medium opacity-90">ពិន្ទុទាប</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.lowest.toFixed(2)}</p>
                  <p className="text-xs opacity-80 mt-1">Lowest</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 opacity-80" />
                    <p className="text-xs font-medium opacity-90">អត្រាជាប់</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</p>
                  <p className="text-xs opacity-80 mt-1">Pass Rate</p>
                </div>
              </div>
            )}

            {/* Student List */}
            {summaries.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-gray-700">
                    បញ្ជីសិស្ស • Students ({summaries.length})
                  </h3>
                </div>

                {summaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="bg-white rounded-xl shadow-sm p-4 space-y-3"
                  >
                    {/* Student Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-purple-700">
                            #{summary.classRank}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {summary.student.khmerName ||
                              `${summary.student.lastName} ${summary.student.firstName}`}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {summary.student.gender === "MALE" ? "ប្រុស • Male" : "ស្រី • Female"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${getGradeLevelColor(
                          summary.gradeLevel
                        )}`}
                      >
                        {summary.gradeLevel}
                      </span>
                    </div>

                    {/* Student Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {summary.totalScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-400">
                          / {summary.totalMaxScore}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Average</p>
                        <p className="text-lg font-bold text-purple-600">
                          {summary.average.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Rank</p>
                        <p className="text-sm font-semibold text-gray-900">
                          #{summary.classRank}
                        </p>
                        <p className="text-xs text-gray-400">
                          of {summaries.length}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  មិនមានទិន្នន័យពិន្ទុសម្រាប់ខែនេះ
                </p>
                <p className="text-xs text-gray-500">
                  No grade data for this month
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              សូមជ្រើសរើសថ្នាក់ដើម្បីមើលពិន្ទុ
            </p>
            <p className="text-xs text-gray-500">
              Select a class to view grades
            </p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {selectedClass && (
        <ImportGradesModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          classData={selectedClass}
          month={selectedMonth}
          year={selectedYear}
          onImportSuccess={handleRefresh}
        />
      )}
    </MobileLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ImportGradesModal from "@/components/modals/ImportGradesModal";
import {
  Upload,
  Download,
  Loader2,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { gradeApi, type StudentSummary } from "@/lib/api/grades";
import type { Class } from "@/lib/api/classes";

const MONTHS = [
  { value: "មករា", label: "មករា - January", number: 1 },
  { value: "កុម្ភៈ", label: "កុម្ភៈ - February", number: 2 },
  { value: "មីនា", label: "មីនា - March", number: 3 },
  { value: "មេសា", label: "មេសា - April", number: 4 },
  { value: "ឧសភា", label: "ឧសភា - May", number: 5 },
  { value: "មិថុនា", label: "មិថុនា - June", number: 6 },
  { value: "កក្កដា", label: "កក្កដា - July", number: 7 },
  { value: "សីហា", label: "សីហា - August", number: 8 },
  { value: "កញ្ញា", label: "កញ្ញា - September", number: 9 },
  { value: "តុលា", label: "តុលា - October", number: 10 },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា - November", number: 11 },
  { value: "ធ្នូ", label: "ធ្នូ - December", number: 12 },
];

export default function GradesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();

  // State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("មករា");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [summaries, setSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch summary when class/month changes
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

      // Download file
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

  // Show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">កំពុងពិនិត្យ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const monthOptions = MONTHS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const yearOptions = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

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

  // Calculate stats
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                ពិន្ទុប្រចាំខែ • Monthly Grades
              </h1>
              <p className="text-gray-600 mt-1">
                មើល និងគ្រប់គ្រងពិន្ទុសិស្សតាមខែ
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>ផ្ទុកឡើងវិញ</span>
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="ថ្នាក់"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classOptions}
              />
              <Select
                label="ខែ"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
              />
              <Select
                label="ឆ្នាំ"
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                options={yearOptions}
              />
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  disabled={!selectedClassId}
                  className="flex-1"
                >
                  <Upload className="w-5 h-5" />
                  <span>នាំចូល</span>
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!selectedClassId || summaries.length === 0}
                  variant="secondary"
                  className="flex-1"
                >
                  <Download className="w-5 h-5" />
                  <span>នាំចេញ</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
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
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">មធ្យមភាគថ្នាក់</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.avgScore.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">ពិន្ទុខ្ពស់បំផុត</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.highest.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">ពិន្ទុទាបបំផុត</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.lowest.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">អត្រាជាប់</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.passRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Table */}
              {summaries.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          ល.រ
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          គោត្តនាម.នាម
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                          ភេទ
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                          ពិន្ទុសរុប
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                          មធ្យមភាគ
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                          ចំ.ថ្នាក់
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                          និទ្ទេស
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {summaries.map((summary, index) => (
                        <tr key={summary.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">
                            {summary.student.khmerName ||
                              `${summary.student.lastName} ${summary.student.firstName}`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {summary.student.gender === "MALE"
                              ? "ប្រុស"
                              : "ស្រី"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {summary.totalScore.toFixed(2)} /{" "}
                            {summary.totalMaxScore}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-lg">
                            {summary.average.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100">
                              #{summary.classRank}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white ${getGradeLevelColor(
                                summary.gradeLevel
                              )}`}
                            >
                              {summary.gradeLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    មិនមានទិន្នន័យពិន្ទុសម្រាប់ខែនេះ
                  </p>
                  <Button
                    onClick={() => setIsImportModalOpen(true)}
                    className="mt-4"
                  >
                    <Upload className="w-5 h-5" />
                    <span>នាំចូលពិន្ទុ</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-600">សូមជ្រើសរើសថ្នាក់ដើម្បីមើលពិន្ទុ</p>
            </div>
          )}
        </main>
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
    </div>
  );
}

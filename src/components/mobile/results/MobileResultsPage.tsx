// 📂 src/components/mobile/results/MobileResultsPage.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Trophy,
  Users,
  Award,
  TrendingUp,
  ArrowLeft,
  ArrowUpDown,
  SortAsc,
  User,
  Medal,
  Star,
  Sparkles,
  BarChart3,
  Target,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { classesApi, Class } from "@/lib/api/classes";
import { reportsApi, MonthlyReportData } from "@/lib/api/reports";

const GRADES = ["7", "8", "9", "10", "11", "12"];
const CURRENT_MONTH = "ធ្នូ"; // December
const CURRENT_YEAR = new Date().getFullYear();

type ViewMode = "byClass" | "byGrade";
type SortBy = "rank" | "name" | "average" | "total";

export default function MobileResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(
    searchParams?.get("grade") || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("byClass");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [gradeWideData, setGradeWideData] = useState<MonthlyReportData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("rank");

  // Load all classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classesApi.getAllLightweight();
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  // Filter classes by selected grade
  const filteredClasses = useMemo(() => {
    if (!selectedGrade) return [];
    return classes
      .filter((c) => c.grade === selectedGrade)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [classes, selectedGrade]);

  // Count students by grade
  const gradeStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    GRADES.forEach((grade) => {
      const gradeClasses = classes.filter((c) => c.grade === grade);
      const totalStudents = gradeClasses.reduce(
        (sum, c) => sum + (c._count?.students || 0),
        0
      );
      counts[grade] = totalStudents;
    });
    return counts;
  }, [classes]);

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setViewMode("byClass");
    setSelectedClass(null);
    setReportData(null);
    setGradeWideData(null);
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "byGrade" && selectedGrade && !gradeWideData) {
      // Load grade-wide data
      setIsLoading(true);
      try {
        const data = await reportsApi.getGradeWideReport(
          selectedGrade,
          CURRENT_MONTH,
          CURRENT_YEAR
        );
        setGradeWideData(data);
      } catch (error) {
        console.error("Error loading grade-wide report:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClassSelect = async (classData: Class) => {
    setSelectedClass(classData);
    setIsLoading(true);
    try {
      const data = await reportsApi.getMonthlyReport(
        classData.id,
        CURRENT_MONTH,
        CURRENT_YEAR
      );
      setReportData(data);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedClass) {
      setSelectedClass(null);
      setReportData(null);
    } else if (selectedGrade) {
      setSelectedGrade(null);
      setGradeWideData(null);
    } else {
      router.back();
    }
  };

  // Sort students
  const sortedStudents = useMemo(() => {
    const students =
      viewMode === "byGrade"
        ? gradeWideData?.students || []
        : reportData?.students || [];

    if (students.length === 0) return [];

    const studentsCopy = [...students];

    switch (sortBy) {
      case "rank":
        return studentsCopy.sort((a, b) => a.rank - b.rank);
      case "name":
        return studentsCopy.sort((a, b) =>
          a.studentName.localeCompare(b.studentName)
        );
      case "average":
        return studentsCopy.sort(
          (a, b) => parseFloat(b.average) - parseFloat(a.average)
        );
      case "total":
        return studentsCopy.sort(
          (a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore)
        );
      default:
        return studentsCopy;
    }
  }, [reportData, gradeWideData, viewMode, sortBy]);

  const getGradeColor = (gradeLevel: string) => {
    const colors: Record<string, string> = {
      A: "from-green-500 to-emerald-500",
      B: "from-blue-500 to-indigo-500",
      C: "from-yellow-500 to-orange-500",
      D: "from-orange-500 to-red-500",
      E: "from-red-500 to-rose-500",
      F: "from-gray-500 to-gray-600",
    };
    return colors[gradeLevel] || "from-gray-400 to-gray-500";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return {
        icon: <Trophy className="w-5 h-5" />,
        color: "from-yellow-400 to-orange-500",
        text: "text-yellow-900",
        glow: "shadow-yellow-300/50",
        borderColor: "border-l-yellow-400",
      };
    if (rank === 2)
      return {
        icon: <Medal className="w-5 h-5" />,
        color: "from-gray-300 to-gray-400",
        text: "text-gray-900",
        glow: "shadow-gray-300/50",
        borderColor: "border-l-gray-400",
      };
    if (rank === 3)
      return {
        icon: <Award className="w-5 h-5" />,
        color: "from-orange-300 to-orange-400",
        text: "text-orange-900",
        glow: "shadow-orange-300/50",
        borderColor: "border-l-orange-400",
      };
    if (rank === 4)
      return {
        icon: <Star className="w-4 h-4" />,
        color: "from-blue-300 to-blue-400",
        text: "text-blue-900",
        glow: "shadow-blue-300/40",
        borderColor: "border-l-blue-400",
      };
    if (rank === 5)
      return {
        icon: <Star className="w-4 h-4" />,
        color: "from-purple-300 to-purple-400",
        text: "text-purple-900",
        glow: "shadow-purple-300/40",
        borderColor: "border-l-purple-400",
      };
    return {
      icon: <Star className="w-4 h-4" />,
      color: "from-gray-200 to-gray-300",
      text: "text-gray-700",
      glow: "shadow-gray-200/30",
      borderColor: "border-l-gray-200",
    };
  };

  // Render Grade Selector (Level 1)
  if (!selectedGrade) {
    return (
      <MobileLayout title="លទ្ធផល • Results">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 pb-24">
          {/* Header */}
          <div className="bg-white px-5 pt-6 pb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="font-koulen text-xl text-gray-900 leading-tight">
                  លទ្ធផលប្រលង
                </h1>
                <p className="font-battambang text-xs text-gray-500 mt-0.5">
                  ជ្រើសរើសកម្រិតសិក្សា • {CURRENT_MONTH} {CURRENT_YEAR}
                </p>
              </div>
            </div>
          </div>

          {/* Grade Grid with improved design */}
          <div className="px-5 pt-6">
            <div className="grid grid-cols-2 gap-4">
              {GRADES.map((grade, index) => {
                const studentCount = gradeStudentCounts[grade] || 0;
                const gradients = [
                  "from-blue-500 to-indigo-600",
                  "from-purple-500 to-pink-600",
                  "from-orange-500 to-red-600",
                  "from-teal-500 to-cyan-600",
                  "from-green-500 to-emerald-600",
                  "from-violet-500 to-purple-600",
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <button
                    key={grade}
                    onClick={() => handleGradeSelect(grade)}
                    disabled={studentCount === 0}
                    className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden active:scale-95 transition-all duration-300 ${
                      studentCount === 0
                        ? "opacity-50 cursor-not-allowed border-gray-200"
                        : "border-transparent hover:shadow-xl"
                    }`}
                  >
                    {/* Gradient Header */}
                    <div
                      className={`bg-gradient-to-br ${gradient} p-4 relative overflow-hidden`}
                    >
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full"></div>
                      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 border border-white/30">
                          <span className="text-white font-koulen text-3xl">
                            {grade}
                          </span>
                        </div>
                        <h3 className="font-koulen text-white text-lg">
                          ថ្នាក់ទី{grade}
                        </h3>
                      </div>
                    </div>

                    {/* Student Count */}
                    <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 bg-gradient-to-br ${gradient} rounded-xl`}
                          >
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-koulen text-2xl text-gray-900 leading-none">
                              {studentCount}
                            </p>
                            <p className="font-battambang text-[10px] text-gray-500">
                              សិស្ស
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Render View Mode Selector (Level 2)
  if (selectedGrade && !selectedClass && viewMode === "byClass") {
    return (
      <MobileLayout title={`លទ្ធផល • ថ្នាក់ទី${selectedGrade}`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 pb-24">
          {/* Header - Now scrolls with content */}
          <div className="bg-white px-5 pt-6 pb-5 shadow-sm">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-gray-600 active:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-battambang text-sm font-semibold">
                ត្រលប់ក្រោយ
              </span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-koulen text-2xl">
                  {selectedGrade}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="font-koulen text-lg text-gray-900 leading-tight">
                  ថ្នាក់ទី{selectedGrade}
                </h1>
                <p className="font-battambang text-xs text-gray-500">
                  {filteredClasses.length} ថ្នាក់ •{" "}
                  {gradeStudentCounts[selectedGrade] || 0} សិស្ស
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => handleViewModeChange("byClass")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-battambang text-xs font-bold transition-all ${
                  viewMode === "byClass"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                <Users className="w-4 h-4" />
                តាមថ្នាក់
              </button>
              <button
                onClick={() => handleViewModeChange("byGrade")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-battambang text-xs font-bold transition-all ${
                  viewMode === "byGrade"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                តាមកម្រិត
              </button>
            </div>
          </div>

          {/* Class List with improved design */}
          <div className="px-5 pt-4 space-y-3">
            {filteredClasses.map((classData, index) => {
              const gradients = [
                "from-blue-500 to-indigo-600",
                "from-purple-500 to-pink-600",
                "from-orange-500 to-red-600",
                "from-teal-500 to-cyan-600",
                "from-green-500 to-emerald-600",
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <button
                  key={classData.id}
                  onClick={() => handleClassSelect(classData)}
                  className="w-full bg-white rounded-3xl shadow-lg border-2 border-transparent hover:shadow-xl active:scale-98 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Class Icon */}
                    <div
                      className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                      <Users className="w-8 h-8 text-white relative z-10" />
                    </div>

                    {/* Class Info */}
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-battambang text-base font-bold text-gray-900 mb-1 truncate">
                        {classData.name}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`p-1 bg-gradient-to-br ${gradient} rounded-lg`}
                          >
                            <Users className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-battambang text-xs font-semibold text-gray-700">
                            {classData._count?.students || 0} សិស្ស
                          </span>
                        </div>
                        {classData.track && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-battambang font-bold">
                            {classData.track === "science"
                              ? "វិទ្យាសាស្ត្រ"
                              : "សង្គម"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Render Grade-Wide Results (Level 2 - By Grade View)
  if (selectedGrade && viewMode === "byGrade") {
    return (
      <MobileLayout title={`លទ្ធផល • ថ្នាក់ទី${selectedGrade} (រួម)`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 pb-24">
          {/* Header - Now scrolls with content */}
          <div className="bg-white px-5 pt-6 pb-4 shadow-sm">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-gray-600 active:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-battambang text-sm font-semibold">
                ត្រលប់ក្រោយ
              </span>
            </button>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-koulen text-lg text-gray-900 leading-tight">
                    ថ្នាក់ទី{selectedGrade} • ចំណាត់ថ្នាក់រួម
                  </h1>
                  <p className="font-battambang text-xs text-gray-500">
                    {CURRENT_MONTH} {CURRENT_YEAR}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-koulen text-2xl text-purple-600">
                  {sortedStudents.length}
                </p>
                <p className="font-battambang text-[10px] text-gray-500">
                  សិស្ស
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-3">
              <button
                onClick={() => setViewMode("byClass")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-battambang text-xs font-bold transition-all ${
                  viewMode === "byClass"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                <Users className="w-4 h-4" />
                តាមថ្នាក់
              </button>
              <button
                onClick={() => handleViewModeChange("byGrade")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-battambang text-xs font-bold transition-all ${
                  viewMode === "byGrade"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                តាមកម្រិត
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setSortBy("rank")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "rank"
                    ? "bg-purple-100 text-purple-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                ចំណាត់ថ្នាក់
              </button>
              <button
                onClick={() => setSortBy("average")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "average"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                មធ្យមភាគ
              </button>
              <button
                onClick={() => setSortBy("total")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "total"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                ពិន្ទុសរុប
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "name"
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <SortAsc className="w-3.5 h-3.5" />
                ឈ្មោះ
              </button>
            </div>
          </div>

          {/* Student Results List */}
          {isLoading ? (
            <div className="px-5 pt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 shadow-md animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 pt-4 space-y-3">
              {sortedStudents.map((student, index) => {
                const rankBadge = getRankBadge(student.rank);
                const isTop5 = student.rank <= 5;
                return (
                  <div
                    key={`${student.studentId}-${index}`}
                    className={`group relative bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.12)] border-l-4 ${rankBadge.borderColor} border-y border-r border-gray-100/80 p-4 overflow-hidden transition-all duration-300 active:scale-[0.99]`}
                  >
                    {/* Subtle Background Glow for Top 5 */}
                    {isTop5 && (
                      <div
                        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${rankBadge.color} opacity-[0.06] rounded-full blur-2xl`}
                      ></div>
                    )}

                    <div className="relative z-10">
                      {/* Top Row: Rank Badge + Name + Grade Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Rank Badge - Left Side, Larger & More Prominent */}
                        <div
                          className={`relative w-[60px] h-12 bg-gradient-to-br ${rankBadge.color} rounded-[14px] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${rankBadge.glow} flex-shrink-0 transform transition-transform group-hover:scale-105`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-[14px]"></div>
                          {isTop5 ? (
                            <div className="flex items-center gap-1.5 relative z-10 px-1">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {rankBadge.icon}
                              </div>
                              <p
                                className={`font-koulen text-xl ${rankBadge.text} leading-none font-bold`}
                              >
                                {student.rank}
                              </p>
                            </div>
                          ) : (
                            <p
                              className={`font-koulen text-2xl ${rankBadge.text} font-bold relative z-10`}
                            >
                              {student.rank}
                            </p>
                          )}
                        </div>

                        {/* Name Section - Center, Larger Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-koulen text-md font-bold text-gray-900 truncate leading-tight mb-0.5">
                            {student.studentName}
                          </h3>
                          {/* Class Badge Under Name */}
                          {student.className && (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 text-indigo-700 text-[10px] font-battambang font-bold shadow-sm">
                              <Users className="w-2.5 h-2.5 mr-1" />
                              {student.className}
                            </div>
                          )}
                        </div>

                        {/* Grade Badge - Right Side, Larger */}
                        <div
                          className={`relative w-12 h-12 rounded-[14px] bg-gradient-to-br ${getGradeColor(
                            student.gradeLevel
                          )} flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.2)] flex-shrink-0 transform transition-transform group-hover:scale-105`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-[14px]"></div>
                          <span className="text-white font-koulen text-2xl font-bold relative z-10">
                            {student.gradeLevel}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid: 4 Columns - More Spacious */}
                      <div className="grid grid-cols-4 gap-2">
                        {/* Average Box - Most Important */}
                        <div className="relative bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-2 border-indigo-200/70 rounded-[12px] p-2 shadow-md overflow-hidden">
                          <div className="absolute top-0 right-0 w-10 h-10 bg-indigo-300/30 rounded-full blur-xl"></div>
                          <p className="font-battambang text-[9px] text-indigo-600 font-bold mb-1 relative z-10">
                            មធ្យម
                          </p>
                          <p className="font-koulen text-xl text-indigo-700 leading-none relative z-10 font-bold">
                            {student.average}
                          </p>
                        </div>

                        {/* Total Score Box */}
                        <div className="relative bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50 border-2 border-orange-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-orange-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-orange-600 font-bold mb-1 relative z-10">
                            សរុប
                          </p>
                          <p className="font-battambang text-[16px] font-extrabold text-orange-700 leading-none relative z-10">
                            {student.totalScore}
                          </p>
                        </div>

                        {/* Absent Box */}
                        <div className="relative bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50 border-2 border-red-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-red-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-red-600 font-bold mb-1 relative z-10">
                            អត់ច្បាប់
                          </p>
                          <p className="font-koulen text-lg text-red-700 leading-none relative z-10 font-bold">
                            {student.absent}
                          </p>
                        </div>

                        {/* Permission Box */}
                        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50 border-2 border-amber-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-amber-600 font-bold mb-1 relative z-10">
                            មានច្បាប់
                          </p>
                          <p className="font-koulen text-lg text-amber-700 leading-none relative z-10 font-bold">
                            {student.permission}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </MobileLayout>
    );
  }

  // Render Class Results (Level 3 - By Class View)
  if (selectedClass && reportData) {
    return (
      <MobileLayout title={`លទ្ធផល • ${selectedClass.name}`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 pb-24">
          {/* Header - Now scrolls with content */}
          <div className="bg-white px-5 pt-6 pb-4 shadow-sm">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-gray-600 active:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-battambang text-sm font-semibold">
                ត្រលប់ក្រោយ
              </span>
            </button>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-koulen text-lg text-gray-900 leading-tight">
                    {selectedClass.name}
                  </h1>
                  <p className="font-battambang text-xs text-gray-500">
                    {CURRENT_MONTH} {CURRENT_YEAR}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-koulen text-2xl text-blue-600">
                  {sortedStudents.length}
                </p>
                <p className="font-battambang text-[10px] text-gray-500">
                  សិស្ស
                </p>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setSortBy("rank")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "rank"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                ចំណាត់ថ្នាក់
              </button>
              <button
                onClick={() => setSortBy("average")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "average"
                    ? "bg-purple-100 text-purple-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                មធ្យមភាគ
              </button>
              <button
                onClick={() => setSortBy("total")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "total"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                ពិន្ទុសរុប
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-battambang text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === "name"
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <SortAsc className="w-3.5 h-3.5" />
                ឈ្មោះ
              </button>
            </div>
          </div>

          {/* Student Results List */}
          {isLoading ? (
            <div className="px-5 pt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 shadow-md animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 pt-4 space-y-3">
              {sortedStudents.map((student, index) => {
                const rankBadge = getRankBadge(student.rank);
                const isTop5 = student.rank <= 5;
                return (
                  <div
                    key={student.studentId}
                    className={`group relative bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.12)] border-l-4 ${rankBadge.borderColor} border-y border-r border-gray-100/80 p-4 overflow-hidden transition-all duration-300 active:scale-[0.99]`}
                  >
                    {/* Subtle Background Glow for Top 5 */}
                    {isTop5 && (
                      <div
                        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${rankBadge.color} opacity-[0.06] rounded-full blur-2xl`}
                      ></div>
                    )}

                    <div className="relative z-10">
                      {/* Top Row: Rank Badge + Name + Grade Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Rank Badge - Left Side, Larger & More Prominent */}
                        <div
                          className={`relative w-[60px] h-12 bg-gradient-to-br ${rankBadge.color} rounded-[14px] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${rankBadge.glow} flex-shrink-0 transform transition-transform group-hover:scale-105`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-[14px]"></div>
                          {isTop5 ? (
                            <div className="flex items-center gap-1.5 relative z-10 px-1">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {rankBadge.icon}
                              </div>
                              <p
                                className={`font-koulen text-xl ${rankBadge.text} leading-none font-bold`}
                              >
                                {student.rank}
                              </p>
                            </div>
                          ) : (
                            <p
                              className={`font-koulen text-2xl ${rankBadge.text} font-bold relative z-10`}
                            >
                              {student.rank}
                            </p>
                          )}
                        </div>

                        {/* Name Section - Center, Larger Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-koulen text-md font-bold text-gray-900 truncate leading-tight">
                            {student.studentName}
                          </h3>
                        </div>

                        {/* Grade Badge - Right Side, Larger */}
                        <div
                          className={`relative w-12 h-12 rounded-[14px] bg-gradient-to-br ${getGradeColor(
                            student.gradeLevel
                          )} flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.2)] flex-shrink-0 transform transition-transform group-hover:scale-105`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-[14px]"></div>
                          <span className="text-white font-koulen text-2xl font-bold relative z-10">
                            {student.gradeLevel}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid: 4 Columns - More Spacious */}
                      <div className="grid grid-cols-4 gap-2">
                        {/* Average Box - Most Important */}
                        <div className="relative bg-gradient-to-br from-blue-50 via-blue-50/90 to-cyan-50 border-2 border-blue-200/70 rounded-[12px] p-2 shadow-md overflow-hidden">
                          <div className="absolute top-0 right-0 w-10 h-10 bg-blue-300/30 rounded-full blur-xl"></div>
                          <p className="font-battambang text-[9px] text-blue-600 font-bold mb-1 relative z-10">
                            មធ្យម
                          </p>
                          <p className="font-koulen text-xl text-blue-700 leading-none relative z-10 font-bold">
                            {student.average}
                          </p>
                        </div>

                        {/* Total Score Box */}
                        <div className="relative bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50 border-2 border-orange-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-orange-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-orange-600 font-bold mb-1 relative z-10">
                            សរុប
                          </p>
                          <p className="font-battambang text-[16px] font-extrabold text-orange-700 leading-none relative z-10">
                            {student.totalScore}
                          </p>
                        </div>

                        {/* Absent Box */}
                        <div className="relative bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50 border-2 border-red-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-red-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-red-600 font-bold mb-1 relative z-10">
                            អត់ច្បាប់
                          </p>
                          <p className="font-koulen text-lg text-red-700 leading-none relative z-10 font-bold">
                            {student.absent}
                          </p>
                        </div>

                        {/* Permission Box */}
                        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50 border-2 border-amber-100/60 rounded-[12px] p-2 shadow-sm overflow-hidden">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-200/30 rounded-full blur-lg"></div>
                          <p className="font-battambang text-[9px] text-amber-600 font-bold mb-1 relative z-10">
                            មានច្បាប់
                          </p>
                          <p className="font-koulen text-lg text-amber-700 leading-none relative z-10 font-bold">
                            {student.permission}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </MobileLayout>
    );
  }

  // Loading state
  return (
    <MobileLayout title="លទ្ធផល • Results">
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30 animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <p className="font-battambang text-gray-600 font-semibold">
            កំពុងផ្ទុក...
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

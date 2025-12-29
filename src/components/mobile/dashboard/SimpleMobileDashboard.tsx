"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Users,
  BookOpen,
  X,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  GraduationCap,
  CheckCircle,
  Mic,
  MapPin,
  Bell,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { dashboardApi, GradeLevelStats, ComprehensiveStats } from "@/lib/api/dashboard";
import DashboardSkeleton from "./DashboardSkeleton";

interface SimpleMobileDashboardProps {
  currentUser: any;
}

export default function SimpleMobileDashboard({
  currentUser,
}: SimpleMobileDashboardProps) {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState("10");
  const [gradeStats, setGradeStats] = useState<ComprehensiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchMoveRef = useRef<number>(0);

  useEffect(() => {
    loadGradeStats();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadGradeStats = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Check if token exists
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ • Not authenticated");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Clear cache if refreshing
      if (refresh) {
        dashboardApi.clearCache();
      }

      // Get current Khmer month
      const monthNames = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ];
      const currentMonth = monthNames[new Date().getMonth()];
      const currentYear = new Date().getFullYear();

      const data = await dashboardApi.getComprehensiveStats(currentMonth, currentYear);

      if (!data || !data.grades) {
        setError("ទិន្នន័យមិនត្រឹមត្រូវ • Invalid data structure");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setGradeStats(data);
      // Select first grade with classes
      const gradeWithClasses = data.grades.find((g) => g.totalClasses > 0);
      if (gradeWithClasses) {
        setSelectedGrade(gradeWithClasses.grade);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setError(error.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Memoized color calculation functions
  const getGradientClass = useCallback((avg: number) => {
    if (avg >= 80) return "from-green-500 to-emerald-500";
    if (avg >= 70) return "from-blue-500 to-indigo-500";
    if (avg >= 60) return "from-yellow-500 to-orange-500";
    if (avg >= 50) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-500";
  }, []);

  const getBgClass = useCallback((avg: number) => {
    if (avg >= 80)
      return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
    if (avg >= 70)
      return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200";
    if (avg >= 60)
      return "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200";
    if (avg >= 50)
      return "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200";
    return "bg-gradient-to-br from-red-50 to-rose-50 border-red-200";
  }, []);

  const getCompletionColor = useCallback((percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-500";
    if (percentage >= 60) return "from-blue-500 to-indigo-500";
    if (percentage >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  }, []);

  const selectedGradeData = useMemo(
    () => gradeStats?.grades.find((g) => g.grade === selectedGrade),
    [gradeStats, selectedGrade]
  );

  // Calculate overall statistics
  const totalStats = useMemo(
    () =>
      gradeStats?.grades.reduce(
        (acc, grade) => ({
          students: acc.students + grade.totalStudents,
          classes: acc.classes + grade.totalClasses,
          avgScore: acc.avgScore + grade.averageScore,
          passCount: acc.passCount + grade.passedCount,
          failCount: acc.failCount + grade.failedCount,
        }),
        { students: 0, classes: 0, avgScore: 0, passCount: 0, failCount: 0 }
      ),
    [gradeStats]
  );

  const overallAvg = useMemo(
    () =>
      totalStats && gradeStats
        ? (totalStats.avgScore / gradeStats.grades.length).toFixed(1)
        : "0",
    [totalStats, gradeStats]
  );

  const overallPassRate = useMemo(
    () => {
      if (!totalStats) return "0";
      const totalWithGrades = totalStats.passCount + totalStats.failCount;
      return totalWithGrades > 0
        ? ((totalStats.passCount / totalWithGrades) * 100).toFixed(1)
        : "0";
    },
    [totalStats]
  );

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/students?search=${encodeURIComponent(searchQuery)}`);
      }
    },
    [searchQuery, router]
  );

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchMoveRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const touchDiff = touchMoveRef.current - touchStartRef.current;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // If user is at top and pulled down more than 100px, refresh
    if (scrollTop === 0 && touchDiff > 100 && !isRefreshing && !isLoading) {
      loadGradeStats(true);
    }

    touchStartRef.current = 0;
    touchMoveRef.current = 0;
  }, [isRefreshing, isLoading, loadGradeStats]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-5">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8 max-w-md w-full text-center border border-white/40">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="font-koulen text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 mb-2 font-bold">
            មានបញ្ហា
          </h2>
          <p className="font-battambang text-gray-700 mb-6 font-medium">{error}</p>
          <button
            onClick={() => loadGradeStats(false)}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-battambang font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-95"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-md border border-white/20 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-battambang text-sm text-gray-800 font-semibold">
            កំពុងបន្ទាន់សម័យ...
          </span>
        </div>
      )}

      {/* Modern Glassmorphic Header */}
      <div className="relative bg-white/60 backdrop-blur-xl px-5 pt-6 pb-5 shadow-md border-b border-white/20">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md animate-pulse">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-koulen text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-sm leading-tight font-bold">
                វិទ្យាល័យ ហ៊ុនសែន ស្វាយធំ
              </p>
              <p className="font-battambang text-[10px] text-gray-600 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3" />
                ខេត្តសៀមរាប
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="font-koulen text-xs text-indigo-600 px-3 py-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl font-bold border border-indigo-100 active:scale-95 transition-transform">
              ខ្មែរ
            </button>
            <button className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform relative">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ស្វែងរកសិស្ស..."
            className="w-full pl-11 pr-11 py-4 rounded-2xl font-koulen text-sm text-gray-900 bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => {}}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            <Mic className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Hero Banner - Stats Display */}
      <div className="relative px-5 pt-5 pb-3">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          {/* Animated Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="font-koulen text-white text-sm font-bold">
                ផ្ទាំងគ្រប់គ្រង
              </p>
            </div>

            <h3 className="font-koulen text-2xl text-white mb-1 leading-tight font-bold">
              សូមស្វាគមន៍
            </h3>
            <p className="font-battambang text-xs text-white/80 mb-5 font-medium">
              {gradeStats?.month} {gradeStats?.year}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-md active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-bold">
                    សិស្សានុសិស្ស
                  </p>
                </div>
                <p className="font-koulen text-3xl text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-600 font-bold">
                  {totalStats?.students || 0}
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-md active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-bold">
                    គ្រូបង្រៀន
                  </p>
                </div>
                <p className="font-koulen text-3xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 font-bold">
                  {totalStats?.classes || 0}
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-md active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-bold">
                    មធ្យមភាគ
                  </p>
                </div>
                <p className="font-koulen text-3xl text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600 font-bold">
                  {overallAvg}
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-md active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-bold">
                    ជាប់
                  </p>
                </div>
                <p className="font-koulen text-3xl text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-amber-600 font-bold">
                  {overallPassRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="relative px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-koulen text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">
            របាយការណ៍តាមផ្នែក
          </h3>
          <button className="font-koulen text-xs text-indigo-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            បង្ហាញបន្ថែម
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => router.push("/students")}
            className="group flex flex-col items-center gap-2.5 p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/40 active:scale-95 transition-all"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-bold text-center leading-tight">
              សិស្ស
            </span>
          </button>

          <button
            onClick={() => router.push("/teachers/mobile")}
            className="group flex flex-col items-center gap-2.5 p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/40 active:scale-95 transition-all"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-bold text-center leading-tight">
              គ្រូ
            </span>
          </button>

          <button
            onClick={() => router.push("/results/mobile")}
            className="group flex flex-col items-center gap-2.5 p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/40 active:scale-95 transition-all"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-bold text-center leading-tight">
              លទ្ធផល
            </span>
          </button>

          <button
            onClick={() => router.push("/statistics/mobile")}
            className="group flex flex-col items-center gap-2.5 p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/40 active:scale-95 transition-all"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-bold text-center leading-tight">
              ស្ថិតិ
            </span>
          </button>
        </div>
      </div>

      {/* Grade Selector */}
      <div className="relative px-5 pt-5 pb-3">
        <h3 className="font-koulen text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 font-bold">
          បច្ចុប្បន្នភាពពិន្ទុតាមថ្នាក់
        </h3>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2">
          {["7", "8", "9", "10", "11", "12"].map((grade) => {
            const gradeData = gradeStats?.grades.find((g) => g.grade === grade);
            const hasClasses = gradeData && gradeData.totalClasses > 0;

            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                disabled={!hasClasses}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-koulen text-sm font-bold transition-all ${
                  selectedGrade === grade
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md scale-105"
                    : hasClasses
                    ? "bg-white/80 backdrop-blur-sm text-gray-700 border border-white/40 shadow-sm active:scale-95"
                    : "bg-gray-100/50 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                ថ្នាក់ {grade}
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Class Cards */}
      {selectedGradeData && selectedGradeData.classes.length > 0 && (
        <div className="relative px-5 pb-6">
          <div className="space-y-4">
            {selectedGradeData.classes.slice(0, 10).map((cls) => {
              const passPercentage = cls.passPercentage;

              return (
                <button
                  key={cls.id}
                  onClick={() => router.push(`/grade-entry?classId=${cls.id}`)}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-md border border-white/40 overflow-hidden transition-all active:scale-[0.98]"
                >
                  {/* Header with Gradient */}
                  <div
                    className={`bg-gradient-to-r ${getCompletionColor(
                      passPercentage
                    )} p-5 relative overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
                    <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full blur-md"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/40">
                          <span className="font-koulen text-white text-base font-bold">
                            {cls.name}
                          </span>
                        </div>
                        <div className="bg-white/30 backdrop-blur-md rounded-xl p-2.5 border border-white/40">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-white/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/40">
                          <span className="font-battambang text-white text-xs font-bold">
                            {cls.studentCount} សិស្ស
                          </span>
                        </div>
                        {cls.teacherName && (
                          <div className="bg-white/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/40">
                            <span className="font-battambang text-white text-xs font-semibold">
                              គ្រូ: {cls.teacherName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4 bg-gradient-to-br from-white/50 to-white/30">
                    {/* Average Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="font-battambang text-sm font-bold text-gray-800">
                          មធ្យមភាគថ្នាក់
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl border-2 font-koulen text-base ${
                          cls.averageScore >= 80
                            ? "text-green-600 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                            : cls.averageScore >= 70
                            ? "text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
                            : cls.averageScore >= 60
                            ? "text-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300"
                            : cls.averageScore >= 50
                            ? "text-orange-600 bg-gradient-to-br from-orange-50 to-red-50 border-orange-300"
                            : "text-red-600 bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                        }`}
                      >
                        {cls.averageScore.toFixed(1)}
                      </div>
                    </div>

                    {/* Pass Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="font-battambang text-sm font-bold text-gray-800">
                            អត្រាជាប់
                          </span>
                        </div>
                        <span className="font-battambang text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
                          {cls.passedCount}/{cls.studentCount}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-3 bg-gray-200/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCompletionColor(
                            passPercentage
                          )} rounded-full transition-all duration-700`}
                          style={{ width: `${passPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <span className="font-koulen text-sm text-gray-700 font-bold">
                          {passPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

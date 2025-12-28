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
import { dashboardApi, GradeLevelStats } from "@/lib/api/dashboard";
import DashboardSkeleton from "./DashboardSkeleton";

interface SimpleMobileDashboardProps {
  currentUser: any;
}

export default function SimpleMobileDashboard({
  currentUser,
}: SimpleMobileDashboardProps) {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState("10");
  const [gradeStats, setGradeStats] = useState<GradeLevelStats | null>(null);
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

      const data = await dashboardApi.getGradeLevelStats();

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
          passRate: acc.passRate + grade.passPercentage,
        }),
        { students: 0, classes: 0, avgScore: 0, passRate: 0 }
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
    () =>
      totalStats && gradeStats
        ? (totalStats.passRate / gradeStats.grades.length).toFixed(1)
        : "0",
    [totalStats, gradeStats]
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="font-koulen text-2xl text-gray-900 mb-2">មានបញ្ហា</h2>
          <p className="font-battambang text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadGradeStats(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-battambang font-semibold py-3 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95"
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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 pb-24"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-battambang text-sm text-gray-700 font-semibold">
            កំពុងបន្ទាន់សម័យ...
          </span>
        </div>
      )}

      {/* Clean Modern Header - Like Mockup */}
      <div className="bg-white px-5 pt-6 pb-5 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-koulen text-orange-500 text-sm leading-tight">
                វិទ្យាល័យ ហ៊ុនសែន ស្វាយធំ
              </p>
              <p className="font-battambang text-[10px] text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                ខេត្តសៀមរាប
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="font-koulen text-xs text-gray-600 px-3 py-1.5 bg-gray-100 rounded-lg font-semibold">
              ខ្មែរ
            </button>
            <button className="w-9 h-9 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Search Bar - Top Priority */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ស្វែងរកសិស្ស..."
            className="w-full pl-11 pr-11 py-3.5 rounded-xl font-koulen text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => {}}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Hero Banner - Stats Display */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100 rounded-3xl p-6 shadow-lg border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="font-koulen text-orange-500 text-sm">
                ផ្ទាំងគ្រប់គ្រង
              </p>
            </div>
            <h3 className="font-koulen text-xl text-gray-900 mb-1 leading-tight">
              សូមស្វាគមន៍
            </h3>
            <p className="font-battambang text-xs text-gray-600 mb-4">
              {gradeStats?.currentMonth} {gradeStats?.currentYear}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-semibold">
                    សិស្សានុសិស្ស
                  </p>
                </div>
                <p className="font-koulen text-3xl text-gray-900">
                  {totalStats?.students || 0}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-semibold">
                    គ្រូបង្រៀន
                  </p>
                </div>
                <p className="font-koulen text-3xl text-gray-900">
                  {totalStats?.classes || 0}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-semibold">
                    មធ្យមភាគ
                  </p>
                </div>
                <p className="font-koulen text-3xl text-gray-900">
                  {overallAvg}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-koulen text-[10px] text-gray-600 font-semibold">
                    ជាប់
                  </p>
                </div>
                <p className="font-koulen text-3xl text-gray-900">
                  {overallPassRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-koulen text-lg text-gray-900">
            របាយការណ៍តាមផ្នែក
          </h3>
          <button className="font-koulen text-xs text-indigo-600 font-semibold flex items-center gap-1">
            បង្ហាញបន្ថែម
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => router.push("/students")}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-semibold text-center leading-tight">
              សិស្ស
            </span>
          </button>

          <button
            onClick={() => router.push("/teachers")}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-semibold text-center leading-tight">
              គ្រូ
            </span>
          </button>

          <button
            onClick={() => router.push("/grade-entry")}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-semibold text-center leading-tight">
              លទ្ធផល
            </span>
          </button>

          <button
            onClick={() => router.push("/reports")}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-koulen text-[10px] text-gray-700 font-semibold text-center leading-tight">
              ស្ថិតិ
            </span>
          </button>
        </div>
      </div>

      {/* Grade Selector */}
      <div className="px-5 pt-4 pb-3">
        <h3 className="font-koulen text-lg text-gray-900 mb-3">
          ថ្នាក់រៀនទាំងអស់
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {["7", "8", "9", "10", "11", "12"].map((grade) => {
            const gradeData = gradeStats?.grades.find((g) => g.grade === grade);
            const hasClasses = gradeData && gradeData.totalClasses > 0;

            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                disabled={!hasClasses}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-koulen text-xs font-bold transition-all ${
                  selectedGrade === grade
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : hasClasses
                    ? "bg-white text-gray-700 border border-gray-200 shadow-sm active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
        <div className="px-5 pb-6">
          <div className="space-y-4">
            {selectedGradeData.classes.slice(0, 10).map((cls) => {
              const completion = cls.completionPercentage;

              return (
                <button
                  key={cls.id}
                  onClick={() => router.push(`/grade-entry?classId=${cls.id}`)}
                  className="w-full bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  {/* Header with Gradient */}
                  <div
                    className={`bg-gradient-to-r ${getCompletionColor(completion)} p-4 relative overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/25 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/30">
                          <span className="font-koulen text-white text-base font-bold">
                            {cls.name}
                          </span>
                        </div>
                        <div className="bg-white/25 backdrop-blur-sm rounded-xl p-2 border border-white/30">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                          <span className="font-battambang text-white text-xs font-semibold">
                            {cls.studentCount} សិស្ស
                          </span>
                        </div>
                        {cls.teacherName && (
                          <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                            <span className="font-battambang text-white text-xs">
                              គ្រូ: {cls.teacherName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {/* Average Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-battambang text-xs font-semibold text-gray-700">
                          មធ្យមភាគថ្នាក់
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl border font-koulen text-base ${
                          cls.averageScore >= 80
                            ? "text-green-600 bg-green-50 border-green-200"
                            : cls.averageScore >= 70
                            ? "text-blue-600 bg-blue-50 border-blue-200"
                            : cls.averageScore >= 60
                            ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                            : cls.averageScore >= 50
                            ? "text-orange-600 bg-orange-50 border-orange-200"
                            : "text-red-600 bg-red-50 border-red-200"
                        }`}
                      >
                        {cls.averageScore.toFixed(1)}
                      </div>
                    </div>

                    {/* Subject Completion */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-battambang text-xs font-semibold text-gray-700">
                            បញ្ចូលពិន្ទុ
                          </span>
                        </div>
                        <span className="font-battambang text-xs font-bold text-gray-600">
                          {cls.completedSubjects}/{cls.totalSubjects}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCompletionColor(completion)} rounded-full transition-all duration-700`}
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-end mt-1.5">
                        <span className="font-koulen text-xs text-gray-600">
                          {completion}%
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {completion === 100 && (
                      <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 rounded-xl py-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-battambang text-xs font-bold text-green-700">
                          បានបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជា
                        </span>
                      </div>
                    )}
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
      `}</style>
    </div>
  );
}

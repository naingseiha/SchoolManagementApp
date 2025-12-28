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
  CheckCircle
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      const gradeWithClasses = data.grades.find(g => g.totalClasses > 0);
      if (gradeWithClasses) {
        setSelectedGrade(gradeWithClasses.grade);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
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
    if (avg >= 80) return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
    if (avg >= 70) return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200";
    if (avg >= 60) return "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200";
    if (avg >= 50) return "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200";
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

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/students?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-khmer-title text-xl font-bold text-gray-900 mb-2">
            មានបញ្ហា
          </h2>
          <p className="font-khmer-body text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => loadGradeStats(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-khmer-body font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
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
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-khmer-body text-sm text-gray-700">កំពុងបន្ទាន់សម័យ...</span>
        </div>
      )}

      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 pt-8 pb-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-khmer-title text-2xl text-white font-bold mb-1">
                ផ្ទាំងគ្រប់គ្រង
              </h1>
              <p className="font-khmer-body text-sm text-indigo-100">
                {gradeStats?.currentMonth} {gradeStats?.currentYear}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">សិស្សសរុប</p>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats?.students || 0}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">ថ្នាក់រៀន</p>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats?.classes || 0}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">មធ្យមភាគ</p>
              </div>
              <p className="text-3xl font-bold text-white">{overallAvg}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">ជាប់</p>
              </div>
              <p className="text-3xl font-bold text-white">{overallPassRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Card - Elevated */}
      <div className="px-4 -mt-16 relative z-20 mb-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកសិស្ស ឬគ្រូ..."
              className="w-full pl-12 pr-24 py-5 rounded-2xl font-khmer-body text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-khmer-body text-sm font-semibold hover:shadow-md transition-all active:scale-95"
              >
                ស្វែងរក
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Grade Performance Indicator */}
      {selectedGradeData && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-khmer-body text-sm text-green-700 mb-1">ថ្នាក់ទី{selectedGrade} - ផលសិក្សា</p>
                <p className="font-bold text-2xl text-green-900">
                  {selectedGradeData.averageScore.toFixed(1)} / 100
                </p>
              </div>
              <div className="text-right">
                <p className="font-khmer-body text-xs text-green-600 mb-1">អត្រាជាប់</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="font-bold text-xl text-green-900">
                    {selectedGradeData.passPercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${selectedGradeData.passPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Tabs - Enhanced with Student Counts */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-gray-600" />
          <h3 className="font-khmer-title text-base font-bold text-gray-900">ជ្រើសរើសកម្រិតថ្នាក់</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {["7", "8", "9", "10", "11", "12"].map((grade) => {
            const gradeData = gradeStats?.grades.find(g => g.grade === grade);
            const hasClasses = gradeData && gradeData.totalClasses > 0;

            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                disabled={!hasClasses}
                className={`flex-shrink-0 px-4 py-3 rounded-xl font-khmer-body text-sm font-bold transition-all duration-200 ${
                  selectedGrade === grade
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                    : hasClasses
                    ? "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-md active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="text-center min-w-max">
                  <div className="mb-1">ថ្នាក់ {grade}</div>
                  {hasClasses && (
                    <div className="text-xs opacity-80 flex items-center gap-1 justify-center">
                      <span>{gradeData.totalClasses} ថ្នាក់</span>
                      <span>•</span>
                      <span>{gradeData.totalStudents} សិស្ស</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Class Cards */}
      {selectedGradeData && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-khmer-title text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              ថ្នាក់រៀនទាំងអស់
            </h2>
            <span className="font-khmer-body text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {selectedGradeData.totalClasses} ថ្នាក់
            </span>
          </div>

          {selectedGradeData.classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-khmer-body text-gray-500 font-medium">
                មិនមានថ្នាក់រៀន
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
              <div className="flex gap-4 pb-2">
                {selectedGradeData.classes.map((cls) => {
                  const completion = cls.completionPercentage;

                  return (
                    <button
                      key={cls.id}
                      onClick={() => router.push(`/grade-entry?classId=${cls.id}`)}
                      className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-100 group"
                    >
                      {/* Header with gradient */}
                      <div
                        className={`bg-gradient-to-r ${getCompletionColor(completion)} p-4 relative overflow-hidden`}
                      >
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                              <span className="font-khmer-title text-white text-sm font-bold">
                                {cls.name}
                              </span>
                            </div>
                            <div className="bg-white/25 backdrop-blur-sm rounded-lg p-1.5 border border-white/30">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                              <span className="font-khmer-body text-white text-xs font-semibold">
                                {cls.studentCount} សិស្ស
                              </span>
                            </div>
                            <div className="bg-white/25 backdrop-blur-sm rounded-full px-2 py-1 border border-white/30">
                              <span className="font-khmer-body text-white text-xs">
                                គ្រូ: {cls.teacherName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">
                        {/* Average Score */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-khmer-body text-xs font-semibold text-gray-700">
                              មធ្យមភាគថ្នាក់
                            </span>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg border font-black text-sm ${
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
                              <div className="p-1.5 bg-purple-100 rounded-lg">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="font-khmer-body text-xs font-semibold text-gray-700">
                                បញ្ចូលពិន្ទុ
                              </span>
                            </div>
                            <span className="font-khmer-body text-xs font-bold text-gray-600">
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
                          <div className="flex items-center justify-end mt-1">
                            <span className="font-black text-xs text-gray-600">
                              {completion}%
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {completion === 100 && (
                          <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 rounded-lg py-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-khmer-body text-xs font-bold text-green-700">
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

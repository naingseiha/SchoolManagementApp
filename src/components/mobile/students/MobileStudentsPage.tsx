"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  User,
  ChevronRight,
  Filter,
  X,
  Users,
  UserCircle2,
  Sparkles,
  GraduationCap,
  School,
  Copy,
  Check,
} from "lucide-react";
import { studentsApi, Student } from "@/lib/api/students";

export default function MobileStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchMoveRef = useRef<number>(0);

  useEffect(() => {
    loadStudents();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadStudents = useCallback(async (refresh = false) => {
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

      const data = await studentsApi.getAllLightweight();
      setStudents(data);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setError(error.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Memoized filtered students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) => {
        const khmerMatch = student.khmerName?.toLowerCase().includes(query);
        const idMatch = student.studentId?.toLowerCase().includes(query);
        const firstNameMatch = student.firstName?.toLowerCase().includes(query);
        const lastNameMatch = student.lastName?.toLowerCase().includes(query);
        const fullNameMatch = `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(query);

        return (
          khmerMatch ||
          idMatch ||
          firstNameMatch ||
          lastNameMatch ||
          fullNameMatch
        );
      });
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter((student) => {
        const className = student.class?.name || "";
        return className.includes(`ទី${selectedGrade}`);
      });
    }

    return filtered;
  }, [students, searchQuery, selectedGrade]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedGrade("all");
  }, []);

  const handleCopy = useCallback((studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(studentId);
    setCopiedId(studentId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

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

    if (scrollTop === 0 && touchDiff > 100 && !isRefreshing && !isLoading) {
      loadStudents(true);
    }

    touchStartRef.current = 0;
    touchMoveRef.current = 0;
  }, [isRefreshing, isLoading, loadStudents]);

  const grades = ["7", "8", "9", "10", "11", "12"];

  // Memoized Statistics
  const stats = useMemo(
    () => ({
      total: students.length,
      male: students.filter((s) => s.gender === "male").length,
      female: students.filter((s) => s.gender === "female").length,
      withClass: students.filter((s) => s.classId).length,
    }),
    [students]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="h-32 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
          {/* Search skeleton */}
          <div className="h-14 bg-white/60 backdrop-blur-sm rounded-xl"></div>
          {/* Filters skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-20 bg-white/60 backdrop-blur-sm rounded-lg"
              ></div>
            ))}
          </div>
          {/* Student cards skeleton */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white/60 backdrop-blur-sm rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

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
          <p className="font-khmer-body text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadStudents(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-khmer-body font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 animate-fadeIn">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-khmer-body text-sm text-gray-700">កំពុងបន្ទាន់សម័យ...</span>
        </div>
      )}
      {/* Modern Header with Stats */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 pt-8 pb-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-khmer-title text-2xl text-white font-bold mb-1">
                សិស្សសរុប
              </h1>
              <p className="font-khmer-body text-sm text-indigo-100">
                Student List • បញ្ជីសិស្ស
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">
                  សិស្សសរុប
                </p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">
                  មានថ្នាក់
                </p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.withClass}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle2 className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">ប្រុស</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.male}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle2 className="w-4 h-4 text-white/80" />
                <p className="font-khmer-body text-xs text-white/80">ស្រី</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.female}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Card - Elevated */}
      <div className="px-4 -mt-12 relative z-20 mb-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          {/* Search Input */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខសម្គាល់..."
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-xl text-base font-khmer-body focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={clearFilters}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Grade Filter Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setSelectedGrade("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-khmer-body transition-all ${
                selectedGrade === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ទាំងអស់
            </button>
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-khmer-body transition-all ${
                  selectedGrade === grade
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ថ្នាក់ {grade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-khmer-title text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            លទ្ធផល
          </h2>
          <span className="font-khmer-body text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {filteredStudents.length} សិស្ស
          </span>
        </div>
      </div>

      {/* Student List */}
      <div className="px-4 space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-khmer-body text-gray-500 font-medium mb-2">
              មិនមានសិស្ស
            </p>
            <p className="font-khmer-body text-xs text-gray-400 mb-4">
              {searchQuery || selectedGrade !== "all"
                ? "សូមសាកល្បងផ្លាស់ប្តូរការស្វែងរក"
                : "មិនមានទិន្នន័យសិស្ស"}
            </p>
            {(searchQuery || selectedGrade !== "all") && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-khmer-body font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                សម្អាតការស្វែងរក
              </button>
            )}
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            const isOdd = index % 2 === 1;
            const gradientClass = isOdd
              ? "from-blue-50 to-indigo-50 border-blue-200"
              : "from-purple-50 to-pink-50 border-purple-200";

            return (
              <button
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className={`w-full bg-gradient-to-br ${gradientClass} border rounded-2xl p-4 hover:shadow-lg transition-all text-left transform hover:scale-[1.02] active:scale-[0.98] animate-fadeIn`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with decorative elements */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                      student.gender === "male"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                        : "bg-gradient-to-br from-pink-500 to-rose-500"
                    }`}
                  >
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/10 rounded-full"></div>
                    <User className="w-7 h-7 text-white relative z-10" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-khmer-body font-bold text-gray-900 truncate text-base">
                      {student.khmerName ||
                        `${student.firstName} ${student.lastName}`}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                        <span>{student.studentId}</span>
                        <button
                          onClick={(e) => handleCopy(student.studentId, e)}
                          className="hover:scale-110 transition-transform"
                        >
                          {copiedId === student.studentId ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-indigo-500" />
                          )}
                        </button>
                      </div>
                      {student.class?.name && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="font-khmer-body text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                            {student.class.name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-khmer-body px-2 py-0.5 rounded-full ${
                          student.gender === "male"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {student.gender === "male" ? "ប្រុស" : "ស្រី"}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            );
          })
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
    </div>
  );
}

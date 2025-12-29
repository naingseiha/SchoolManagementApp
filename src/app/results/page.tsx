"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Award,
  TrendingUp,
  ArrowLeft,
  SortAsc,
  Medal,
  Star,
  Sparkles,
  BarChart3,
  Target,
  ChevronRight,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { classesApi, Class } from "@/lib/api/classes";
import { reportsApi, MonthlyReportData } from "@/lib/api/reports";

const GRADES = ["7", "8", "9", "10", "11", "12"];
const CURRENT_MONTH = "ធ្នូ"; // December
const CURRENT_YEAR = new Date().getFullYear();

type ViewMode = "byClass" | "byGrade";
type SortBy = "rank" | "name" | "average" | "total";

export default function ResultsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
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
        borderColor: "border-l-yellow-400",
      };
    if (rank === 2)
      return {
        icon: <Medal className="w-5 h-5" />,
        color: "from-gray-300 to-gray-400",
        text: "text-gray-900",
        borderColor: "border-l-gray-400",
      };
    if (rank === 3)
      return {
        icon: <Award className="w-5 h-5" />,
        color: "from-orange-300 to-orange-400",
        text: "text-orange-900",
        borderColor: "border-l-orange-400",
      };
    if (rank <= 5)
      return {
        icon: <Star className="w-4 h-4" />,
        color: "from-blue-300 to-blue-400",
        text: "text-blue-900",
        borderColor: "border-l-blue-400",
      };
    return {
      icon: <Star className="w-4 h-4" />,
      color: "from-gray-200 to-gray-300",
      text: "text-gray-700",
      borderColor: "border-l-gray-200",
    };
  };

  // Render Grade Selector (Level 1)
  if (!selectedGrade) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-khmer-title text-4xl text-gray-900">
                    លទ្ធផលប្រលង
                  </h1>
                  <p className="font-khmer-body text-gray-500 mt-1 font-medium">
                    ជ្រើសរើសកម្រិតសិក្សា • {CURRENT_MONTH} {CURRENT_YEAR}
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className={`group relative bg-white rounded-3xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${
                      studentCount === 0
                        ? "opacity-50 cursor-not-allowed border-gray-200"
                        : "border-transparent hover:shadow-2xl transform hover:-translate-y-1"
                    }`}
                  >
                    {/* Gradient Header */}
                    <div
                      className={`bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}
                    >
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/25 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 border border-white/30">
                          <span className="text-white font-black text-5xl">
                            {grade}
                          </span>
                        </div>
                        <h3 className="font-khmer-title text-white text-2xl mb-1">
                          ថ្នាក់ទី{grade}
                        </h3>
                      </div>
                    </div>

                    {/* Student Count */}
                    <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl`}
                          >
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-4xl text-gray-900">
                              {studentCount}
                            </p>
                            <p className="font-khmer-body text-sm text-gray-500 font-medium">
                              សិស្ស
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render View Mode Selector (Level 2)
  if (selectedGrade && !selectedClass && viewMode === "byClass") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-6 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-khmer-body text-sm font-bold">
                ត្រលប់ក្រោយ
              </span>
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <span className="text-white font-black text-3xl">
                      {selectedGrade}
                    </span>
                  </div>
                  <div>
                    <h1 className="font-khmer-title text-3xl text-gray-900">
                      ថ្នាក់ទី{selectedGrade}
                    </h1>
                    <p className="font-khmer-body text-gray-500 font-medium">
                      {filteredClasses.length} ថ្នាក់ •{" "}
                      {gradeStudentCounts[selectedGrade] || 0} សិស្ស
                    </p>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                  <button
                    onClick={() => handleViewModeChange("byClass")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-khmer-body text-sm font-bold transition-all ${
                      viewMode === "byClass"
                        ? "bg-white text-indigo-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    តាមថ្នាក់
                  </button>
                  <button
                    onClick={() => handleViewModeChange("byGrade")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-khmer-body text-sm font-bold transition-all ${
                      viewMode === "byGrade"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    តាមកម្រិត
                  </button>
                </div>
              </div>
            </div>

            {/* Class Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="group relative bg-white rounded-3xl shadow-lg border-2 border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col h-full">
                      {/* Class Icon & Name */}
                      <div
                        className={`relative p-6 bg-gradient-to-br ${gradient} overflow-hidden`}
                      >
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-white/30">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-khmer-body text-xl font-bold text-white mb-1">
                            {classData.name}
                          </h3>
                          {classData.track && (
                            <span className="inline-block px-3 py-1 rounded-lg bg-white/25 backdrop-blur-sm text-white text-xs font-khmer-body font-bold border border-white/30">
                              {classData.track === "science"
                                ? "វិទ្យាសាស្ត្រ"
                                : "សង្គម"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-1 p-6 bg-gradient-to-b from-white to-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 bg-gradient-to-br ${gradient} rounded-lg`}
                            >
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-khmer-body text-sm font-bold text-gray-700">
                              {classData._count?.students || 0} សិស្ស
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Common Student List Component
  const StudentList = ({
    students,
    title,
  }: {
    students: any[];
    title: string;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-khmer-title text-2xl text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="font-khmer-body text-sm text-gray-500 font-medium">
            តម្រៀបតាម:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("rank")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-khmer-body text-xs font-bold transition-all ${
                sortBy === "rank"
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              ចំណាត់ថ្នាក់
            </button>
            <button
              onClick={() => setSortBy("average")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-khmer-body text-xs font-bold transition-all ${
                sortBy === "average"
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              មធ្យមភាគ
            </button>
            <button
              onClick={() => setSortBy("total")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-khmer-body text-xs font-bold transition-all ${
                sortBy === "total"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              ពិន្ទុសរុប
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-khmer-body text-xs font-bold transition-all ${
                sortBy === "name"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <SortAsc className="w-3.5 h-3.5" />
              ឈ្មោះ
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {students.map((student, index) => {
          const rankBadge = getRankBadge(student.rank);
          const isTop5 = student.rank <= 5;

          return (
            <div
              key={`${student.studentId}-${index}`}
              className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border-l-4 ${rankBadge.borderColor} border-y border-r border-gray-100 transition-all duration-300 hover:scale-[1.01]`}
            >
              {isTop5 && (
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${rankBadge.color} opacity-5 rounded-full blur-2xl`}
                ></div>
              )}

              <div className="relative z-10 p-5">
                <div className="flex items-center gap-5">
                  {/* Rank Badge */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${rankBadge.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    {isTop5 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4">{rankBadge.icon}</div>
                        <p className={`font-black text-xl ${rankBadge.text}`}>
                          {student.rank}
                        </p>
                      </div>
                    ) : (
                      <p className={`font-black text-2xl ${rankBadge.text}`}>
                        {student.rank}
                      </p>
                    )}
                  </div>

                  {/* Name Section */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-khmer-body text-lg font-bold text-gray-900 truncate mb-1">
                      {student.studentName}
                    </h3>
                    {student.className && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 text-xs font-khmer-body font-bold">
                        <Users className="w-3 h-3 mr-1" />
                        {student.className}
                      </span>
                    )}
                  </div>

                  {/* Stats - Horizontal Layout */}
                  <div className="flex items-center gap-2.5">
                    {/* Average */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl px-3.5 py-2 w-[95px] text-center">
                      <p className="font-khmer-body text-[11px] text-indigo-600 font-bold mb-0.5">
                        មធ្យម
                      </p>
                      <p className="font-black text-2xl text-indigo-700 leading-none">
                        {student.average}
                      </p>
                    </div>

                    {/* Total Score */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl px-3.5 py-2 w-[95px] text-center">
                      <p className="font-khmer-body text-[11px] text-orange-600 font-bold mb-0.5">
                        សរុប
                      </p>
                      <p className="font-black text-xl text-orange-700 leading-none">
                        {student.totalScore}
                      </p>
                    </div>

                    {/* Absent */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl px-3.5 py-2 w-[85px] text-center">
                      <p className="font-khmer-body text-[11px] text-red-600 font-bold mb-0.5">
                        អត់ច្បាប់
                      </p>
                      <p className="font-black text-xl text-red-700 leading-none">
                        {student.absent}
                      </p>
                    </div>

                    {/* Permission */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl px-3.5 py-2 w-[85px] text-center">
                      <p className="font-khmer-body text-[11px] text-amber-600 font-bold mb-0.5">
                        មានច្បាប់
                      </p>
                      <p className="font-black text-xl text-amber-700 leading-none">
                        {student.permission}
                      </p>
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradeColor(
                      student.gradeLevel
                    )} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <span className="text-white font-black text-3xl">
                      {student.gradeLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Class Results (Level 3)
  if (selectedClass) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-6 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-khmer-body text-sm font-bold">
                ត្រលប់ក្រោយ
              </span>
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="font-khmer-title text-3xl text-gray-900">
                      {selectedClass.name}
                    </h1>
                    <p className="font-khmer-body text-gray-500 font-medium">
                      {CURRENT_MONTH} {CURRENT_YEAR} • {sortedStudents.length}{" "}
                      សិស្ស
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="font-khmer-body text-gray-600 font-bold">
                    កំពុងផ្ទុក...
                  </p>
                </div>
              </div>
            ) : sortedStudents.length > 0 ? (
              <StudentList students={sortedStudents} title="លទ្ធផល" />
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="font-khmer-body text-gray-500 font-bold text-lg">
                    មិនមានទិន្នន័យ
                  </p>
                  <p className="font-khmer-body text-gray-400 text-sm mt-2">
                    សូមបញ្ចូលពិន្ទុសិស្សសិនជាមុន
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Render Grade-Wide Results (Level 2 - By Grade View)
  if (selectedGrade && viewMode === "byGrade") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-6 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-khmer-body text-sm font-bold">
                ត្រលប់ក្រោយ
              </span>
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="font-khmer-title text-3xl text-gray-900">
                      ថ្នាក់ទី{selectedGrade} • ចំណាត់ថ្នាក់រួម
                    </h1>
                    <p className="font-khmer-body text-gray-500 font-medium">
                      {CURRENT_MONTH} {CURRENT_YEAR} • {sortedStudents.length}{" "}
                      សិស្ស
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                  <button
                    onClick={() => setViewMode("byClass")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-khmer-body text-sm font-bold transition-all ${
                      viewMode === "byClass"
                        ? "bg-white text-indigo-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    តាមថ្នាក់
                  </button>
                  <button
                    onClick={() => handleViewModeChange("byGrade")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-khmer-body text-sm font-bold transition-all ${
                      viewMode === "byGrade"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    តាមកម្រិត
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="font-khmer-body text-gray-600 font-bold">
                    កំពុងផ្ទុក...
                  </p>
                </div>
              </div>
            ) : (
              <StudentList students={sortedStudents} title="លទ្ធផល" />
            )}
          </main>
        </div>
      </div>
    );
  }

  return null;
}

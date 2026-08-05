"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ComprehensiveStats } from "@/lib/api/dashboard";
import { useData } from "@/context/DataContext";
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Search,
  Grid,
  List,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  ArrowUpRight,
  Filter,
  Sparkles,
  ChevronRight,
  UserCheck as TeacherIcon,
  ShieldCheck,
} from "lucide-react";

interface DetailedStudentStatsSectionProps {
  comprehensiveStats?: ComprehensiveStats | null;
  isLoading?: boolean;
}

interface ProcessedClassItem {
  id: string;
  name: string;
  grade: string;
  section: string;
  track: string | null;
  studentCount: number;
  femaleCount: number;
  maleCount: number;
  femalePercent: number;
  malePercent: number;
  teacherName: string;
  averageScore?: number;
  passPercentage?: number;
}

interface ProcessedGradeItem {
  grade: string;
  totalStudents: number;
  femaleStudents: number;
  maleStudents: number;
  femalePercent: number;
  totalClasses: number;
  averageScore?: number;
  passPercentage?: number;
  classes: ProcessedClassItem[];
}

export default function DetailedStudentStatsSection({
  comprehensiveStats,
  isLoading,
}: DetailedStudentStatsSectionProps) {
  const router = useRouter();
  const { students = [], classes = [], teachers = [] } = useData();

  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Standard grade list
  const GRADE_LIST = ["7", "8", "9", "10", "11", "12"];

  // Process data from API or fallback to context data
  const processedGradesData = useMemo<ProcessedGradeItem[]>(() => {
    // If comprehensiveStats API data is available
    if (comprehensiveStats && comprehensiveStats.grades && comprehensiveStats.grades.length > 0) {
      return GRADE_LIST.map((g) => {
        const gradeApi = comprehensiveStats.grades.find((item) => String(item.grade) === String(g));

        if (gradeApi) {
          const femalePercent =
            gradeApi.totalStudents > 0
              ? Math.round((gradeApi.femaleStudents / gradeApi.totalStudents) * 100)
              : 0;

          const processedClasses: ProcessedClassItem[] = (gradeApi.classes || []).map((c) => {
            const fCount = c.femaleCount ?? 0;
            const mCount = c.maleCount ?? 0;
            const tot = c.studentCount || fCount + mCount;
            const fPct = tot > 0 ? Math.round((fCount / tot) * 100) : 0;
            const mPct = tot > 0 ? 100 - fPct : 0;

            return {
              id: c.id,
              name: c.name,
              grade: String(c.grade || g),
              section: c.section || "",
              track: c.track || null,
              studentCount: tot,
              femaleCount: fCount,
              maleCount: mCount,
              femalePercent: fPct,
              malePercent: mPct,
              teacherName: c.teacherName || "មិនទាន់មាន",
              averageScore: c.averageScore,
              passPercentage: c.passPercentage,
            };
          });

          return {
            grade: g,
            totalStudents: gradeApi.totalStudents,
            femaleStudents: gradeApi.femaleStudents,
            maleStudents: gradeApi.maleStudents,
            femalePercent,
            totalClasses: gradeApi.totalClasses || processedClasses.length,
            averageScore: gradeApi.averageScore,
            passPercentage: gradeApi.passPercentage,
            classes: processedClasses,
          };
        }

        // Fallback calculation for grade `g` if not in API
        return computeGradeFallback(g, classes, students, teachers);
      });
    }

    // Fallback: Compute from DataContext
    return GRADE_LIST.map((g) => computeGradeFallback(g, classes, students, teachers));
  }, [comprehensiveStats, classes, students, teachers]);

  // Helper function to calculate fallback grade stats from DataContext
  function computeGradeFallback(
    gradeStr: string,
    allClasses: any[],
    allStudents: any[],
    allTeachers: any[]
  ): ProcessedGradeItem {
    const matchingClasses = allClasses.filter((c) => String(c.grade) === String(gradeStr));

    let totalStuds = 0;
    let femaleStuds = 0;
    let maleStuds = 0;

    const processedClasses: ProcessedClassItem[] = matchingClasses.map((cls) => {
      const classStudents = allStudents.filter((s) => s.classId === cls.id);
      const tot = classStudents.length || cls.students?.length || cls._count?.students || 0;

      const fCount = classStudents.filter((s) => {
        const g = String(s.gender || "").toLowerCase();
        return g === "female" || g === "f" || g === "ស្រី";
      }).length;

      const mCount = classStudents.filter((s) => {
        const g = String(s.gender || "").toLowerCase();
        return g === "male" || g === "m" || g === "ប្រុស";
      }).length;

      const fPct = tot > 0 ? Math.round((fCount / tot) * 100) : 0;
      const mPct = tot > 0 ? 100 - fPct : 0;

      // Find teacher
      let tName = "មិនទាន់មាន";
      if (cls.teacher?.khmerName) {
        tName = cls.teacher.khmerName;
      } else if (cls.teacher?.firstName) {
        tName = `${cls.teacher.firstName} ${cls.teacher.lastName || ""}`.trim();
      } else if (cls.teacherId) {
        const foundT = allTeachers.find((t) => t.id === cls.teacherId);
        if (foundT) {
          tName = foundT.khmerName || `${foundT.firstName} ${foundT.lastName || ""}`.trim();
        }
      } else {
        const foundHomeroom = allTeachers.find((t) => t.homeroomClassId === cls.id);
        if (foundHomeroom) {
          tName = foundHomeroom.khmerName || `${foundHomeroom.firstName} ${foundHomeroom.lastName || ""}`.trim();
        }
      }

      totalStuds += tot;
      femaleStuds += fCount;
      maleStuds += mCount;

      return {
        id: cls.id,
        name: cls.name,
        grade: String(cls.grade),
        section: cls.section || "",
        track: cls.track || null,
        studentCount: tot,
        femaleCount: fCount,
        maleCount: mCount,
        femalePercent: fPct,
        malePercent: mPct,
        teacherName: tName,
      };
    });

    const fPercent = totalStuds > 0 ? Math.round((femaleStuds / totalStuds) * 100) : 0;

    return {
      grade: gradeStr,
      totalStudents: totalStuds,
      femaleStudents: femaleStuds,
      maleStudents: maleStuds,
      femalePercent: fPercent,
      totalClasses: matchingClasses.length,
      classes: processedClasses,
    };
  }

  // Calculate Overall Totals across all grades
  const overallTotals = useMemo(() => {
    let totStuds = 0;
    let totFemales = 0;
    let totMales = 0;
    let totClasses = 0;
    let assignedTeachersCount = 0;

    processedGradesData.forEach((g) => {
      totStuds += g.totalStudents;
      totFemales += g.femaleStudents;
      totMales += g.maleStudents;
      totClasses += g.totalClasses;

      g.classes.forEach((c) => {
        if (c.teacherName && c.teacherName !== "មិនទាន់មាន") {
          assignedTeachersCount++;
        }
      });
    });

    const femalePct = totStuds > 0 ? Math.round((totFemales / totStuds) * 100) : 0;

    return {
      totalStudents: totStuds,
      totalFemales: totFemales,
      totalMales: totMales,
      femalePercent: femalePct,
      malePercent: totStuds > 0 ? 100 - femalePct : 0,
      totalClasses: totClasses,
      assignedTeachersCount,
    };
  }, [processedGradesData]);

  // Filter classes based on selected grade and search query
  const filteredClasses = useMemo(() => {
    let list: ProcessedClassItem[] = [];

    if (selectedGrade === "ALL") {
      processedGradesData.forEach((g) => {
        list = list.concat(g.classes);
      });
    } else {
      const targetGrade = processedGradesData.find((g) => g.grade === selectedGrade);
      if (targetGrade) {
        list = targetGrade.classes;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.teacherName.toLowerCase().includes(q) ||
          c.grade.includes(q)
      );
    }

    return list;
  }, [processedGradesData, selectedGrade, searchQuery]);

  // Grade color theme mapping
  const gradeColors: Record<string, { bg: string; text: string; gradient: string; ring: string }> = {
    "7": {
      bg: "bg-rose-50",
      text: "text-rose-600",
      gradient: "from-pink-500 to-rose-600",
      ring: "ring-rose-400",
    },
    "8": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      gradient: "from-purple-500 to-violet-600",
      ring: "ring-purple-400",
    },
    "9": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      gradient: "from-blue-500 to-indigo-600",
      ring: "ring-blue-400",
    },
    "10": {
      bg: "bg-teal-50",
      text: "text-teal-600",
      gradient: "from-teal-500 to-cyan-600",
      ring: "ring-teal-400",
    },
    "11": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      gradient: "from-emerald-500 to-green-600",
      ring: "ring-emerald-400",
    },
    "12": {
      bg: "bg-amber-50",
      text: "text-amber-600",
      gradient: "from-amber-500 to-orange-600",
      ring: "ring-amber-400",
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-100 transition-all duration-300">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="font-khmer-title text-2xl lg:text-3xl text-gray-900 font-bold tracking-tight">
              ស្ថិតិសិស្សលម្អិតតាមកម្រិត និងតាមថ្នាក់
            </h2>
          </div>
          <p className="font-khmer-body text-xs lg:text-sm text-gray-500 font-medium pl-10">
            ទិដ្ឋភាពទូទៅនៃចំនួនសិស្សសរុប សិស្សស្រី សិស្សប្រុស គ្រូប្រចាំថ្នាក់ និងការបែងចែកថ្នាក់រៀន
          </p>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកថ្នាក់ ឬគ្រូប្រចាំថ្នាក់..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-2xl text-xs font-khmer-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200/80">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-md font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-md font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY HERO WIDGETS (STREAMEX-INSPIRED DESIGN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Stats Cards Grid (8 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Card 1: Total Students */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold border border-white/30">
                សរុបទាំងអស់
              </span>
            </div>
            <p className="font-khmer-body text-white/80 text-xs font-medium mb-1">
              សិស្សសរុប
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-moul text-white">{overallTotals.totalStudents}</p>
              <span className="font-khmer-body text-xs text-white/90">នាក់</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between font-khmer-body text-[11px] text-white/90 font-medium">
              <span>👨 {overallTotals.totalMales} ប្រុស</span>
              <span>👩 {overallTotals.totalFemales} ស្រី</span>
            </div>
          </div>

          {/* Card 2: Female Students (Highlighted) */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-bold border border-white/30 text-white">
                {overallTotals.femalePercent}% សិស្សស្រី
              </span>
            </div>
            <p className="font-khmer-body text-white/80 text-xs font-medium mb-1">
              សិស្សស្រីសរុប
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-moul text-white">{overallTotals.totalFemales}</p>
              <span className="font-khmer-body text-xs text-white/90">នាក់</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between font-khmer-body text-[11px] text-white/90 font-medium">
              <span>ភាគរយសិស្សស្រី</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                {overallTotals.femalePercent}%
              </span>
            </div>
          </div>

          {/* Card 3: Classes Count */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-5 border border-cyan-100 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-500 rounded-2xl shadow-md shadow-cyan-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-[11px] font-bold text-cyan-700 bg-cyan-100/80 px-2.5 py-1 rounded-full">
                ថ្នាក់សកម្ម
              </span>
            </div>
            <p className="font-khmer-body text-gray-500 text-xs font-medium mb-1">
              ចំនួនថ្នាក់សរុប
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-moul text-gray-900">{overallTotals.totalClasses}</p>
              <span className="font-khmer-body text-xs text-gray-600">ថ្នាក់</span>
            </div>
          </div>

          {/* Card 4: Homeroom Teachers Assigned */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-md shadow-emerald-500/20">
                <TeacherIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                គ្រូប្រចាំថ្នាក់
              </span>
            </div>
            <p className="font-khmer-body text-gray-500 text-xs font-medium mb-1">
              បានចាត់តាំងគ្រូ
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-moul text-gray-900">{overallTotals.assignedTeachersCount}</p>
              <span className="font-khmer-body text-xs text-gray-600">/ {overallTotals.totalClasses} ថ្នាក់</span>
            </div>
          </div>
        </div>

        {/* Right Side: Donut / Circular Percentage Visual Widget (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="font-khmer-title text-lg text-white font-bold">
                សមាមាត្រភេទសិស្ស (Gender Ratio)
              </h3>
              <p className="font-khmer-body text-xs text-gray-400">
                ការបែងចែករវាងសិស្សស្រី និងសិស្សប្រុស
              </p>
            </div>
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <PieChartIcon className="w-5 h-5 text-pink-400" />
            </div>
          </div>

          {/* SVG Donut Visual Chart */}
          <div className="flex items-center justify-center gap-6 my-2 relative z-10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Male Segment (Blue) */}
                <path
                  className="text-blue-500 transition-all duration-1000"
                  strokeDasharray={`${overallTotals.malePercent}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Female Segment (Pink) */}
                <path
                  className="text-pink-500 transition-all duration-1000"
                  strokeDasharray={`${overallTotals.femalePercent}, 100`}
                  strokeDashoffset={`-${overallTotals.malePercent}`}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-moul text-white">{overallTotals.femalePercent}%</span>
                <span className="font-khmer-body text-[10px] text-pink-300 font-semibold">សិស្សស្រី</span>
              </div>
            </div>

            {/* Donut Legend items */}
            <div className="space-y-3 font-khmer-body text-xs">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
                <div className="w-3 h-3 bg-pink-500 rounded-full shadow-sm shadow-pink-500/50"></div>
                <div>
                  <p className="text-gray-300 text-[11px]">សិស្សស្រី (Female)</p>
                  <p className="font-bold text-white text-sm">
                    {overallTotals.totalFemales} នាក់ ({overallTotals.femalePercent}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></div>
                <div>
                  <p className="text-gray-300 text-[11px]">សិស្សប្រុស (Male)</p>
                  <p className="font-bold text-white text-sm">
                    {overallTotals.totalMales} នាក់ ({overallTotals.malePercent}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between font-khmer-body text-[11px] text-gray-400 relative z-10">
            <span>ប្រព័ន្ធគ្រប់គ្រងសិស្ស</span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ទិន្នន័យត្រឹមត្រូវ
            </span>
          </div>
        </div>
      </div>

      {/* GRADE FILTER TABS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-khmer-title text-lg text-gray-900 font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            ជ្រើសរើសកម្រិតថ្នាក់ (Grade Filter)
          </h3>
          <span className="font-khmer-body text-xs text-gray-500">
            បង្ហាញ {filteredClasses.length} ថ្នាក់
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
          {/* ALL GRADES TAB */}
          <button
            onClick={() => setSelectedGrade("ALL")}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-khmer-body text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
              selectedGrade === "ALL"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25 scale-102"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <span>ថ្នាក់ទាំងអស់</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                selectedGrade === "ALL" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {overallTotals.totalClasses} ថ្នាក់
            </span>
          </button>

          {/* INDIVIDUAL GRADE TABS */}
          {processedGradesData.map((g) => {
            const isSelected = selectedGrade === g.grade;
            const styleTheme = gradeColors[g.grade] || gradeColors["7"];

            return (
              <button
                key={g.grade}
                onClick={() => setSelectedGrade(g.grade)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl font-khmer-body text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? `bg-gradient-to-r ${styleTheme.gradient} text-white border-transparent shadow-lg scale-102`
                    : `bg-gray-50 text-gray-700 hover:${styleTheme.bg} border-gray-200`
                }`}
              >
                <span>ថ្នាក់ទី {g.grade}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {g.totalStudents} សិស្ស ({g.femaleStudents} ស្រី)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CLASS DATA CONTENT VIEW (GRID OR TABLE) */}
      {filteredClasses.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-khmer-title text-gray-700 font-bold text-base mb-1">
            មិនមានទិន្នន័យថ្នាក់រៀន
          </p>
          <p className="font-khmer-body text-xs text-gray-500">
            សូមព្យាយាមស្វែងរកតាមពាក្យគន្លឹះផ្សេងទៀត ឬជ្រើសរើសកម្រិតថ្នាក់ផ្សេង
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => {
            const theme = gradeColors[item.grade] || gradeColors["7"];

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden bg-white rounded-3xl border-2 border-gray-100 hover:border-indigo-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Header Strip with Grade Gradient */}
                <div>
                  <div className={`bg-gradient-to-r ${theme.gradient} p-5 text-white relative overflow-hidden`}>
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-moul text-xl text-white tracking-wide">
                          {item.name}
                        </span>
                        {item.section && (
                          <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-khmer-body font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                            ផ្នែក {item.section}
                          </span>
                        )}
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white/90 font-khmer-body text-xs">
                      <span>ថ្នាក់ទី {item.grade}</span>
                      {item.track && (
                        <>
                          <span>•</span>
                          <span className="bg-white/25 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            {item.track === "science" ? "វិទ្យាសាស្ត្រ" : "សង្គម"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4">
                    {/* Homeroom Teacher Badge */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          👨‍🏫
                        </div>
                        <div>
                          <p className="font-khmer-body text-[10px] text-gray-500 font-semibold">
                            គ្រូប្រចាំថ្នាក់ (Homeroom Teacher)
                          </p>
                          <p className="font-khmer-body text-xs font-bold text-gray-900">
                            {item.teacherName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Student Statistics Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-blue-50/70 rounded-2xl border border-blue-100">
                        <p className="font-khmer-body text-[10px] text-blue-600 font-bold">សរុប</p>
                        <p className="text-xl font-moul text-blue-700">{item.studentCount}</p>
                        <p className="font-khmer-body text-[9px] text-blue-500">សិស្ស</p>
                      </div>

                      <div className="p-2.5 bg-pink-50/70 rounded-2xl border border-pink-100">
                        <p className="font-khmer-body text-[10px] text-pink-600 font-bold">សិស្សស្រី</p>
                        <p className="text-xl font-moul text-pink-700">{item.femaleCount}</p>
                        <p className="font-khmer-body text-[9px] text-pink-500 font-semibold">
                          {item.femalePercent}%
                        </p>
                      </div>

                      <div className="p-2.5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                        <p className="font-khmer-body text-[10px] text-indigo-600 font-bold">សិស្សប្រុស</p>
                        <p className="text-xl font-moul text-indigo-700">{item.maleCount}</p>
                        <p className="font-khmer-body text-[9px] text-indigo-500 font-semibold">
                          {item.malePercent}%
                        </p>
                      </div>
                    </div>

                    {/* Gender Ratio Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-khmer-body font-semibold text-gray-600 mb-1.5">
                        <span className="flex items-center gap-1 text-pink-600">
                          <span className="w-2 h-2 rounded-full bg-pink-500"></span> ស្រី {item.femalePercent}%
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> ប្រុស {item.malePercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-pink-400 to-pink-600 h-full transition-all duration-500"
                          style={{ width: `${item.femalePercent}%` }}
                          title={`ស្រី: ${item.femaleCount} នាក់ (${item.femalePercent}%)`}
                        ></div>
                        <div
                          className="bg-gradient-to-r from-blue-400 to-indigo-600 h-full transition-all duration-500"
                          style={{ width: `${item.malePercent}%` }}
                          title={`ប្រុស: ${item.maleCount} នាក់ (${item.malePercent}%)`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => router.push(`/students?classId=${item.id}`)}
                    className="flex-1 py-2 px-3 bg-white hover:bg-indigo-50 text-indigo-600 border border-gray-200 hover:border-indigo-200 rounded-xl text-xs font-khmer-body font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>មើលសិស្ស</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => router.push(`/grade-entry?classId=${item.id}`)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-khmer-body font-bold transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20"
                  >
                    <span>បញ្ចូលពិន្ទុ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ENTERPRISE TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-gray-100 font-khmer-title text-xs text-gray-700 uppercase">
                <th className="p-4 font-bold">ថ្នាក់រៀន (Class)</th>
                <th className="p-4 font-bold">គ្រូប្រចាំថ្នាក់ (Homeroom Teacher)</th>
                <th className="p-4 font-bold text-center">សិស្សសរុប</th>
                <th className="p-4 font-bold text-center">សិស្សស្រី</th>
                <th className="p-4 font-bold text-center">សិស្សប្រុស</th>
                <th className="p-4 font-bold text-center">សមាមាត្រភេទ (Ratio)</th>
                <th className="p-4 font-bold text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-khmer-body text-xs text-gray-800 bg-white">
              {filteredClasses.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                  {/* Class name */}
                  <td className="p-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-moul text-xs">
                        {item.name}
                      </div>
                      <div>
                        <p className="font-khmer-title font-bold text-sm text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-500">ថ្នាក់ទី {item.grade} {item.section ? `• ផ្នែក ${item.section}` : ""}</p>
                      </div>
                    </div>
                  </td>

                  {/* Homeroom teacher */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👨‍🏫</span>
                      <span className="font-bold text-gray-800">{item.teacherName}</span>
                    </div>
                  </td>

                  {/* Total count */}
                  <td className="p-4 text-center font-bold font-moul text-sm text-gray-900">
                    {item.studentCount}
                  </td>

                  {/* Female count */}
                  <td className="p-4 text-center font-bold text-pink-600 bg-pink-50/50">
                    {item.femaleCount} នាក់ ({item.femalePercent}%)
                  </td>

                  {/* Male count */}
                  <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/50">
                    {item.maleCount} នាក់ ({item.malePercent}%)
                  </td>

                  {/* Ratio bar */}
                  <td className="p-4 text-center min-w-[120px]">
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-pink-500 h-full"
                        style={{ width: `${item.femalePercent}%` }}
                        title={`ស្រី ${item.femalePercent}%`}
                      ></div>
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${item.malePercent}%` }}
                        title={`ប្រុស ${item.malePercent}%`}
                      ></div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/students?classId=${item.id}`)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-all text-xs"
                      >
                        មើលសិស្ស
                      </button>
                      <button
                        onClick={() => router.push(`/grade-entry?classId=${item.id}`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs"
                      >
                        បញ្ចូលពិន្ទុ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hide Scrollbar helper style */}
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

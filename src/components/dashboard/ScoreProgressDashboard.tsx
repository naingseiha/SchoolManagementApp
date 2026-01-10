"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
  ShieldAlert,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { dashboardApi, ScoreProgressData, ClassProgress, SubjectProgress } from "@/lib/api/dashboard";
import { getCurrentAcademicYear, getAcademicYearOptions, formatAcademicYear } from "@/utils/academicYear";

// ============================================
// Type Definitions
// ============================================

type SortOption = "name" | "completion" | "verification" | "students";

// ============================================
// Helper Functions & Constants
// ============================================

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

const STATUS_CONFIG = {
  COMPLETE: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    progressColor: "bg-green-500",
    label: "ពេញលេញ",
  },
  PARTIAL: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    progressColor: "bg-yellow-500",
    label: "មួយផ្នែក",
  },
  STARTED: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    progressColor: "bg-orange-500",
    label: "ចាប់ផ្តើម",
  },
  EMPTY: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    progressColor: "bg-red-500",
    label: "ទទេ",
  },
};

// ============================================
// Main Component
// ============================================

export default function ScoreProgressDashboard() {
  // State management
  const [data, setData] = useState<ScoreProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(KHMER_MONTHS[new Date().getMonth()]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.getScoreProgress({
        month: selectedMonth,
        year: selectedAcademicYear,
        grade: selectedGrade === "all" ? undefined : selectedGrade,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedAcademicYear, selectedGrade]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort classes (optimized with debounced search)
  const filteredAndSortedClasses = useMemo(() => {
    if (!data) return [];

    let allClasses = data.grades.flatMap((grade) => grade.classes);

    // Apply search filter with debounced query
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      allClasses = allClasses.filter((cls) =>
        cls.name.toLowerCase().includes(lowerQuery) ||
        cls.homeroomTeacher?.khmerName?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    allClasses.sort((a, b) => {
      switch (sortBy) {
        case "completion":
          return b.completionStats.completionPercentage - a.completionStats.completionPercentage;
        case "verification":
          return b.completionStats.verificationPercentage - a.completionStats.verificationPercentage;
        case "students":
          return b.studentCount - a.studentCount;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return allClasses;
  }, [data, debouncedSearchQuery, sortBy]);

  // Memoized toggle class expansion
  const toggleClass = useCallback((classId: string) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-khmer-body text-lg font-bold">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="font-khmer-title text-3xl text-gray-900 mb-3">មានបញ្ហា</h3>
          <p className="text-gray-600 mb-8 font-khmer-body font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-khmer-body font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all active:scale-95"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-khmer-title">
            មិនមានទិន្នន័យ
          </h3>
          <p className="text-gray-600 font-khmer-body">
            រកមិនឃើញទិន្នន័យសម្រាប់ខែ និង ឆ្នាំដែលបានជ្រើសរើស
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/30">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-khmer-title text-4xl text-gray-900">
                តារាងពិនិត្យការបញ្ចូលពិន្ទុ
              </h1>
              <p className="font-khmer-body text-gray-500 font-medium">
                ស្ថានភាពការបញ្ចូលពិន្ទុ និង ការផ្ទៀងផ្ទាត់
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl hover:shadow-xl transition-all font-khmer-body font-bold active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            ផ្ទុកឡើងវិញ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <FilterControls
          selectedMonth={selectedMonth}
          selectedAcademicYear={selectedAcademicYear}
          selectedGrade={selectedGrade}
          onMonthChange={setSelectedMonth}
          onAcademicYearChange={setSelectedAcademicYear}
          onGradeChange={setSelectedGrade}
        />

        {/* Search and Sort */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ស្វែងរកថ្នាក់រៀន ឬ គ្រូថ្នាក់..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent font-khmer-body transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent font-khmer-body font-bold transition-all"
          >
            <option value="name">តម្រៀបតាមឈ្មោះ</option>
            <option value="completion">តម្រៀបតាមការបញ្ចូល</option>
            <option value="verification">តម្រៀបតាមការផ្ទៀងផ្ទាត់</option>
            <option value="students">តម្រៀបតាមសិស្ស</option>
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      <OverallStats data={data} />

      {/* Class Cards */}
      <div className="space-y-6">
        {data.grades.map((grade) => (
          <GradeSection
            key={grade.grade}
            grade={grade}
            expandedClasses={expandedClasses}
            onToggleClass={toggleClass}
            searchQuery={debouncedSearchQuery}
          />
        ))}

        {filteredAndSortedClasses.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="font-khmer-body text-gray-500 font-bold text-lg">
              រកមិនឃើញថ្នាក់រៀនដែលស្វែងរក
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

interface FilterControlsProps {
  selectedMonth: string;
  selectedAcademicYear: number;
  selectedGrade: string;
  onMonthChange: (month: string) => void;
  onAcademicYearChange: (year: number) => void;
  onGradeChange: (grade: string) => void;
}

const FilterControls = memo(({
  selectedMonth,
  selectedAcademicYear,
  selectedGrade,
  onMonthChange,
  onAcademicYearChange,
  onGradeChange,
}: FilterControlsProps) => {
  const academicYearOptions = useMemo(() => getAcademicYearOptions(), []);

  return (
    <div className="flex flex-wrap gap-4">
      {/* Month Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-bold text-gray-600 mb-2 font-khmer-body flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          ខែ
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent font-khmer-body font-bold transition-all"
        >
          {KHMER_MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Academic Year Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-bold text-gray-600 mb-2 font-khmer-body">
          ឆ្នាំសិក្សា
        </label>
        <select
          value={selectedAcademicYear}
          onChange={(e) => onAcademicYearChange(parseInt(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent font-khmer-body font-bold transition-all"
        >
          {academicYearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-bold text-gray-600 mb-2 font-khmer-body flex items-center gap-2">
          <Filter className="w-4 h-4" />
          កម្រិត
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => onGradeChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent font-khmer-body font-bold transition-all"
        >
          <option value="all">ទាំងអស់</option>
          {[7, 8, 9, 10, 11, 12].map((grade) => (
            <option key={grade} value={grade.toString()}>
              ថ្នាក់ទី{grade}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

FilterControls.displayName = "FilterControls";

interface OverallStatsProps {
  data: ScoreProgressData;
}

const OverallStats = memo(({ data }: OverallStatsProps) => {
  const stats = [
    {
      label: "ថ្នាក់រៀន",
      value: data.overall.totalClasses,
      icon: Users,
      gradient: "from-cyan-500 to-blue-500",
      borderColor: "border-blue-100",
    },
    {
      label: "មុខវិជ្ជា",
      value: data.overall.totalSubjects,
      icon: BookOpen,
      gradient: "from-purple-500 to-pink-500",
      borderColor: "border-purple-100",
    },
    {
      label: "ការបញ្ចូលពិន្ទុ",
      value: `${data.overall.completionPercentage.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      borderColor: "border-green-100",
    },
    {
      label: "ការផ្ទៀងផ្ទាត់",
      value: `${data.overall.verificationPercentage.toFixed(1)}%`,
      icon: Shield,
      gradient: "from-orange-500 to-amber-500",
      borderColor: "border-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-3xl p-6 shadow-lg border-2 ${stat.borderColor} hover:shadow-2xl transition-all`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
            <p className="font-khmer-body text-sm text-gray-600 font-bold">
              {stat.label}
            </p>
          </div>
          <p className="font-black text-5xl text-gray-900 mb-2">{stat.value}</p>

          {/* Progress bar for percentage stats */}
          {(stat.label.includes("បញ្ចូល") || stat.label.includes("ផ្ទៀងផ្ទាត់")) && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${stat.gradient} transition-all`}
                  style={{
                    width: `${stat.label.includes("បញ្ចូល")
                      ? data.overall.completionPercentage
                      : data.overall.verificationPercentage}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600 font-khmer-body font-bold">
                <span>
                  {stat.label.includes("បញ្ចូល")
                    ? data.overall.completedSubjects
                    : data.overall.verifiedSubjects}
                </span>
                <span>{data.overall.totalSubjects}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

OverallStats.displayName = "OverallStats";

interface GradeSectionProps {
  grade: { grade: string; totalClasses: number; avgCompletion: number; classes: ClassProgress[] };
  expandedClasses: Set<string>;
  onToggleClass: (classId: string) => void;
  searchQuery: string;
}

const GradeSection = memo(({ grade, expandedClasses, onToggleClass, searchQuery }: GradeSectionProps) => {
  // Filter classes based on search (memoized)
  const filteredClasses = useMemo(() => {
    if (!searchQuery) return grade.classes;

    const lowerQuery = searchQuery.toLowerCase();
    return grade.classes.filter((cls) =>
      cls.name.toLowerCase().includes(lowerQuery) ||
      cls.homeroomTeacher?.khmerName?.toLowerCase().includes(lowerQuery)
    );
  }, [grade.classes, searchQuery]);

  if (filteredClasses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Grade Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 border border-indigo-400/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-white font-black text-3xl">
                {grade.grade}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white font-khmer-title">
                ថ្នាក់ទី{grade.grade}
              </h2>
              <p className="text-white/90 font-khmer-body font-medium">
                {filteredClasses.length} ថ្នាក់ • មធ្យមភាគ {grade.avgCompletion.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-white">
              {grade.avgCompletion.toFixed(0)}%
            </div>
            <div className="text-white/90 text-sm font-khmer-body font-bold">ការបញ្ចូលពិន្ទុ</div>
          </div>
        </div>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClasses.map((cls) => (
          <ClassCard
            key={cls.id}
            classData={cls}
            isExpanded={expandedClasses.has(cls.id)}
            onToggle={() => onToggleClass(cls.id)}
          />
        ))}
      </div>
    </div>
  );
});

GradeSection.displayName = "GradeSection";

interface ClassCardProps {
  classData: ClassProgress;
  isExpanded: boolean;
  onToggle: () => void;
}

const ClassCard = memo(({ classData, isExpanded, onToggle }: ClassCardProps) => {
  // Memoize completion color calculation
  const completionColor = useMemo(() => {
    const percentage = classData.completionStats.completionPercentage;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  }, [classData.completionStats.completionPercentage]);

  return (
    <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all">
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all"
      >
        <div className="flex items-center gap-5 flex-1">
          {/* Class Icon */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>

          {/* Class Info */}
          <div className="flex-1 text-left">
            <h3 className="text-xl font-black text-gray-900 font-khmer-title">
              {classData.name}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600 font-khmer-body font-bold">
                {classData.studentCount} សិស្ស
              </span>
              {classData.homeroomTeacher && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600 font-khmer-body font-medium">
                    គ្រូ: {classData.homeroomTeacher.khmerName}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Completion Stats */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl px-4 py-3 border-2 border-green-200 text-center min-w-[100px]">
              <div className={`text-2xl font-black ${completionColor}`}>
                {classData.completionStats.completionPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600 font-khmer-body font-bold">បញ្ចូលពិន្ទុ</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl px-4 py-3 border-2 border-orange-200 text-center min-w-[100px]">
              <div className="text-2xl font-black text-orange-600">
                {classData.completionStats.verificationPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600 font-khmer-body font-bold">ផ្ទៀងផ្ទាត់</div>
            </div>
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content - Subject Details */}
      {isExpanded && (
        <div className="border-t-2 border-gray-100 p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-gray-900 font-khmer-body text-lg">
                មុខវិជ្ជាទាំងអស់ ({classData.subjects.length})
              </h4>
              <div className="text-sm text-gray-600 font-khmer-body font-bold bg-white px-4 py-2 rounded-xl border-2 border-gray-200">
                បញ្ចូលពេញលេញ: {classData.completionStats.completedSubjects}/{classData.completionStats.totalSubjects}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all shadow-sm"
                style={{ width: `${classData.completionStats.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Subject Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classData.subjects.map((subject) => (
              <SubjectItem key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ClassCard.displayName = "ClassCard";

interface SubjectItemProps {
  subject: SubjectProgress;
}

const SubjectItem = memo(({ subject }: SubjectItemProps) => {
  const config = useMemo(() => STATUS_CONFIG[subject.scoreStatus.status], [subject.scoreStatus.status]);
  const StatusIcon = config.icon;

  // Override colors if complete but not verified
  const { borderColor, bgColor } = useMemo(() => {
    if (subject.scoreStatus.status === "COMPLETE" && !subject.verification.isConfirmed) {
      return {
        borderColor: "border-yellow-200",
        bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      };
    }
    return {
      borderColor: config.borderColor,
      bgColor: config.bgColor,
    };
  }, [subject.scoreStatus.status, subject.verification.isConfirmed, config]);

  return (
    <div
      className={`p-5 rounded-2xl border-2 ${borderColor} ${bgColor} hover:shadow-lg transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-black text-gray-900 font-khmer-body text-sm mb-1">
            {subject.nameKh}
          </h5>
          <p className="text-xs text-gray-500 font-mono font-bold">{subject.code}</p>
        </div>
        <div className={`p-2 rounded-xl border ${
          subject.scoreStatus.status === "COMPLETE" && !subject.verification.isConfirmed
            ? "bg-yellow-100 border-yellow-200"
            : `${config.bgColor} ${config.borderColor}`
        }`}>
          <StatusIcon className={`w-5 h-5 ${
            subject.scoreStatus.status === "COMPLETE" && !subject.verification.isConfirmed
              ? "text-yellow-600"
              : config.color
          }`} />
        </div>
      </div>

      {/* Score Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-600 font-khmer-body font-bold">
            {subject.scoreStatus.studentsWithScores}/{subject.scoreStatus.totalStudents} សិស្ស
          </span>
          <span className={`font-black ${config.color}`}>
            {subject.scoreStatus.percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
          <div
            className={`h-2 rounded-full ${config.progressColor} transition-all`}
            style={{ width: `${subject.scoreStatus.percentage}%` }}
          />
        </div>
      </div>

      {/* Verification Badge */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        {subject.verification.isConfirmed ? (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-xl font-khmer-body font-bold border border-green-200">
            <Shield className="w-3.5 h-3.5" />
            ផ្ទៀងផ្ទាត់ហើយ
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-khmer-body font-bold border ${
            subject.scoreStatus.status === "COMPLETE"
              ? "text-yellow-700 bg-yellow-100 border-yellow-200"
              : "text-gray-600 bg-gray-100 border-gray-200"
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            មិនទាន់ផ្ទៀងផ្ទាត់
          </div>
        )}
        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
          subject.scoreStatus.status === "COMPLETE" && !subject.verification.isConfirmed
            ? "text-yellow-700 bg-yellow-100"
            : `${config.color} ${config.bgColor}`
        }`}>
          {config.label}
        </span>
      </div>
    </div>
  );
});

SubjectItem.displayName = "SubjectItem";


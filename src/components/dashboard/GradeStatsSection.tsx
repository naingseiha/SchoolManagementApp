"use client";

import { useState } from "react";
import { ComprehensiveStats } from "@/lib/api/dashboard";
import { BarChart3, Users, Award, TrendingUp } from "lucide-react";
import ClassPerformanceCards from "./ClassPerformanceCards";

interface GradeStatsSectionProps {
  comprehensiveStats: ComprehensiveStats | null;
  isLoading?: boolean;
}

export default function GradeStatsSection({
  comprehensiveStats,
  isLoading,
}: GradeStatsSectionProps) {
  const [selectedGrade, setSelectedGrade] = useState("10");

  if (isLoading || !comprehensiveStats) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl w-32"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const grades = ["7", "8", "9", "10", "11", "12"];
  const gradeColors: Record<string, string> = {
    "7": "from-pink-500 to-rose-500",
    "8": "from-purple-500 to-violet-500",
    "9": "from-blue-500 to-indigo-500",
    "10": "from-cyan-500 to-teal-500",
    "11": "from-green-500 to-emerald-500",
    "12": "from-orange-500 to-amber-500",
  };

  const selectedGradeData = comprehensiveStats.grades.find(
    (g) => g.grade === selectedGrade
  );

  // Calculate totals
  const totalStats = comprehensiveStats.grades.reduce(
    (acc, grade) => ({
      students: acc.students + grade.totalStudents,
      classes: acc.classes + grade.totalClasses,
      passCount: acc.passCount + grade.passedCount,
      failCount: acc.failCount + grade.failedCount,
    }),
    { students: 0, classes: 0, passCount: 0, failCount: 0 }
  );

  const overallPassRate =
    totalStats.passCount + totalStats.failCount > 0
      ? (
          (totalStats.passCount /
            (totalStats.passCount + totalStats.failCount)) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Overall Summary Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-khmer-title text-2xl text-white font-bold">
              ស្ថិតិតាមកម្រិតថ្នាក់
            </h3>
          </div>
          <p className="font-khmer-body text-white/90 text-sm font-medium mb-6">
            {comprehensiveStats.month} {comprehensiveStats.year}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <span className="font-khmer-body text-white/80 text-xs font-bold">
                  សិស្សានុសិស្ស
                </span>
              </div>
              <p className="text-3xl font-black text-white">
                {totalStats.students}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-white" />
                <span className="font-khmer-body text-white/80 text-xs font-bold">
                  ថ្នាក់រៀន
                </span>
              </div>
              <p className="text-3xl font-black text-white">
                {totalStats.classes}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-white" />
                <span className="font-khmer-body text-white/80 text-xs font-bold">
                  អត្រាជាប់
                </span>
              </div>
              <p className="text-3xl font-black text-white">{overallPassRate}%</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="font-khmer-body text-white/80 text-xs font-bold">
                  សរុប
                </span>
              </div>
              <p className="text-3xl font-black text-white">
                {comprehensiveStats.grades.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Selector */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h4 className="font-khmer-title text-lg text-gray-900 mb-4 font-bold">
          ជ្រើសរើសថ្នាក់
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {grades.map((grade) => {
            const gradeData = comprehensiveStats.grades.find(
              (g) => g.grade === grade
            );
            const isSelected = selectedGrade === grade;
            const hasClasses = gradeData && gradeData.totalClasses > 0;
            const colorClass = gradeColors[grade];

            return (
              <button
                key={grade}
                onClick={() => hasClasses && setSelectedGrade(grade)}
                disabled={!hasClasses}
                className={`flex-shrink-0 relative group transition-all duration-300 ${
                  isSelected
                    ? "scale-105"
                    : hasClasses
                    ? "scale-100 hover:scale-102"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                    isSelected ? "shadow-xl ring-4 ring-white" : "shadow-md"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${colorClass} p-5 min-w-[140px]`}
                  >
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>

                    <div className="relative z-10">
                      <span className="font-khmer-body text-white/90 text-xs font-bold block mb-1">
                        ថ្នាក់ទី
                      </span>
                      <span className="font-black text-white text-4xl mb-2 block">
                        {grade}
                      </span>
                      {gradeData && (
                        <div className="space-y-1">
                          <div className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                            <span className="font-khmer-body text-white text-xs font-bold block">
                              {gradeData.totalStudents} សិស្ស
                            </span>
                          </div>
                          <div className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                            <span className="font-khmer-body text-white text-xs font-bold block">
                              {gradeData.totalClasses} ថ្នាក់
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white"></div>
                  )}
                </div>

                {isSelected && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-20 blur-xl -z-10 rounded-2xl`}
                  ></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Statistics */}
      {selectedGradeData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-blue-500 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-xs font-bold text-blue-700">
                សិស្ស
              </span>
            </div>
            <p className="text-4xl font-black text-blue-700 mb-1">
              {selectedGradeData.totalStudents}
            </p>
            <p className="font-khmer-body text-xs text-blue-600">
              ប្រុស: {selectedGradeData.maleStudents} • ស្រី:{" "}
              {selectedGradeData.femaleStudents}
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-purple-500 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-xs font-bold text-purple-700">
                មធ្យមភាគ
              </span>
            </div>
            <p className="text-4xl font-black text-purple-700 mb-1">
              {selectedGradeData.averageScore.toFixed(1)}
            </p>
            <p className="font-khmer-body text-xs text-purple-600">
              ប្រុស: {selectedGradeData.maleAverageScore.toFixed(1)} • ស្រី:{" "}
              {selectedGradeData.femaleAverageScore.toFixed(1)}
            </p>
          </div>

          {/* Pass Percentage */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-green-500 rounded-xl">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-xs font-bold text-green-700">
                អត្រាជាប់
              </span>
            </div>
            <p className="text-4xl font-black text-green-700 mb-1">
              {selectedGradeData.passPercentage.toFixed(1)}%
            </p>
            <p className="font-khmer-body text-xs text-green-600">
              {selectedGradeData.passedCount} /{" "}
              {selectedGradeData.passedCount + selectedGradeData.failedCount}
            </p>
          </div>

          {/* Total Classes */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border-2 border-orange-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-orange-500 rounded-xl">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-khmer-body text-xs font-bold text-orange-700">
                ថ្នាក់រៀន
              </span>
            </div>
            <p className="text-4xl font-black text-orange-700 mb-1">
              {selectedGradeData.totalClasses}
            </p>
            <p className="font-khmer-body text-xs text-orange-600">
              ថ្នាក់សកម្ម
            </p>
          </div>
        </div>
      )}

      {/* Class Performance Cards */}
      {selectedGradeData && (
        <ClassPerformanceCards classes={selectedGradeData.classes} />
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Users, BookOpen, X } from "lucide-react";
import { dashboardApi, GradeLevelStats } from "@/lib/api/dashboard";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadGradeStats();
  }, []);

  const loadGradeStats = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getGradeLevelStats();
      setGradeStats(data);
      // Select first grade with classes
      const gradeWithClasses = data.grades.find(g => g.totalClasses > 0);
      if (gradeWithClasses) {
        setSelectedGrade(gradeWithClasses.grade);
      }
    } catch (error) {
      console.error("Error loading grade stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGradeData = gradeStats?.grades.find(
    (g) => g.grade === selectedGrade
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/students?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-khmer-body text-gray-600">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Simple Header */}
      <div className="bg-indigo-600 px-4 pt-8 pb-6">
        <h1 className="font-khmer-title text-2xl text-white font-bold mb-1">
          ផ្ទាំងគ្រប់គ្រង
        </h1>
        <p className="font-khmer-body text-sm text-indigo-100">
          {gradeStats?.currentMonth} {gradeStats?.currentYear}
        </p>
      </div>

      {/* Search */}
      <div className="px-4 -mt-4 mb-4">
        <div className="relative bg-white rounded-xl shadow-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ស្វែងរកសិស្ស ឬគ្រូ..."
            className="w-full pl-12 pr-10 py-4 rounded-xl font-khmer-body text-gray-900 focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Grade Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-1 flex gap-1 overflow-x-auto hide-scrollbar">
          {["7", "8", "9", "10", "11", "12"].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`flex-1 min-w-[60px] py-2.5 rounded-lg font-khmer-body text-sm font-bold transition-all ${
                selectedGrade === grade
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600"
              }`}
            >
              ថ្នាក់ {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      {selectedGradeData && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-khmer-title text-lg font-bold text-gray-900">
              ថ្នាក់រៀនទាំងអស់
            </h2>
            <span className="font-khmer-body text-sm text-gray-500">
              {selectedGradeData.totalClasses} ថ្នាក់ • {selectedGradeData.totalStudents} សិស្ស
            </span>
          </div>

          {selectedGradeData.classes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-khmer-body text-gray-500">
                មិនមានថ្នាក់រៀន
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedGradeData.classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => router.push(`/grade-entry?classId=${cls.id}`)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                >
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-khmer-title text-lg font-bold text-gray-900 mb-1">
                        {cls.name}
                      </h3>
                      <p className="font-khmer-body text-sm text-gray-600">
                        គ្រូថ្នាក់: {cls.teacherName}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  </div>

                  {/* Class Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-gray-900">
                          {cls.studentCount}
                        </p>
                        <p className="font-khmer-body text-xs text-gray-500">
                          សិស្ស
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-gray-900">
                          {cls.completedSubjects}/{cls.totalSubjects}
                        </p>
                        <p className="font-khmer-body text-xs text-gray-500">
                          មុខវិជ្ជា
                        </p>
                      </div>
                    </div>

                    {cls.averageScore > 0 && (
                      <div className="ml-auto">
                        <p className="font-bold text-base text-indigo-600">
                          {cls.averageScore.toFixed(1)}
                        </p>
                        <p className="font-khmer-body text-xs text-gray-500">
                          មធ្យមភាគ
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
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

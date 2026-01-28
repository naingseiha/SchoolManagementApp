"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Calendar,
  BookOpen,
  Trophy,
  Star,
  Flame,
  Zap,
} from "lucide-react";

interface CourseProgress {
  course: string;
  courseKh: string;
  progress: number;
  grade: number;
  color: string;
}

const mockProgress: CourseProgress[] = [
  { course: "STEM", courseKh: "វិទ្យាសាស្ត្រ", progress: 65, grade: 88, color: "from-orange-400 to-yellow-500" },
  { course: "English", courseKh: "អង់គ្លេស", progress: 80, grade: 92, color: "from-blue-400 to-indigo-500" },
  { course: "Mathematics", courseKh: "គណិតវិទ្យា", progress: 45, grade: 78, color: "from-purple-400 to-pink-500" },
  { course: "Khmer", courseKh: "ខ្មែរ", progress: 90, grade: 95, color: "from-green-400 to-emerald-500" },
];

export default function ProgressPage() {
  const { currentUser, isLoading } = useAuth(); // ✅ FIXED: Use isLoading instead of loading
  const router = useRouter();
  const [progress] = useState<CourseProgress[]>(mockProgress);

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "STUDENT")) {
      router.push("/feed");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const overallAverage = progress.reduce((acc, c) => acc + c.grade, 0) / progress.length;
  const overallProgress = progress.reduce((acc, c) => acc + c.progress, 0) / progress.length;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 font-koulen">ឧត្តុន</h1>
              <p className="text-xs text-gray-500">Learning Progress & Analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Average Grade */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Overall Average</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {overallAverage.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">+5% from last month</span>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Completion</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {Math.round(overallProgress)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl font-black text-gray-900">24</p>
              <p className="text-[10px] text-gray-500 font-medium">Lessons</p>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xl font-black text-gray-900">8</p>
              <p className="text-[10px] text-gray-500 font-medium">Completed</p>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-xl font-black text-gray-900">12</p>
              <p className="text-[10px] text-gray-500 font-medium">Badges</p>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xl font-black text-gray-900">45</p>
              <p className="text-[10px] text-gray-500 font-medium">Day Streak</p>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              Course Performance
            </h2>

            <div className="space-y-6">
              {progress.map((course) => (
                <div key={course.course} className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 font-koulen text-lg">{course.courseKh}</h3>
                      <p className="text-xs text-gray-500">{course.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r ${course.color} bg-clip-text text-transparent">
                        {course.grade}%
                      </p>
                      <p className="text-xs text-gray-500">{course.progress}% complete</p>
                    </div>
                  </div>

                  {/* Single Progress Bar for Grade */}
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${course.color} h-3 rounded-full transition-all duration-500 relative`}
                        style={{ width: `${course.grade}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20"></div>
                      </div>
                    </div>
                    {/* Show completion as text only */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {course.progress}% of course completed
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        Grade: {course.grade}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              Recent Achievements
            </h2>

            <div className="space-y-3">
              {[
                { title: "First Assignment", titleKh: "ការងារទីមួយ", icon: Zap, color: "from-yellow-400 to-orange-500", bgColor: "from-yellow-50 to-orange-50" },
                { title: "Week Streak", titleKh: "សប្តាហ៍ទាន់ពេល", icon: Flame, color: "from-red-400 to-pink-500", bgColor: "from-red-50 to-pink-50" },
                { title: "Perfect Score", titleKh: "ពិន្ទុពេញ", icon: Star, color: "from-blue-400 to-indigo-500", bgColor: "from-blue-50 to-indigo-50" },
              ].map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-gradient-to-r ${achievement.bgColor} rounded-2xl p-4 flex items-center gap-4 border border-gray-100 group hover:shadow-md transition-all`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black font-koulen text-base text-gray-900">{achievement.titleKh}</h3>
                      <p className="text-xs text-gray-600">{achievement.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

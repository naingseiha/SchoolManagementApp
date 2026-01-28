"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Search,
  Star,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  titleKh: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
  duration: string;
  enrolledStudents: number;
  rating: number;
  category: string;
  color: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "STEM Fundamentals",
    titleKh: "គ្រឹះសាស្ត្រវិទ្យា STEM",
    instructor: "លោកគ្រូ សម្បត",
    progress: 65,
    totalLessons: 24,
    completedLessons: 16,
    thumbnail: "🔬",
    duration: "12 weeks",
    enrolledStudents: 234,
    rating: 4.8,
    category: "Science",
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "2",
    title: "English Communication",
    titleKh: "ភាសាអង់គ្លេស",
    instructor: "Teacher John",
    progress: 80,
    totalLessons: 18,
    completedLessons: 14,
    thumbnail: "🗣️",
    duration: "10 weeks",
    enrolledStudents: 156,
    rating: 4.9,
    category: "Language",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "3",
    title: "Mathematics Advanced",
    titleKh: "គណិតវិទ្យាកម្រិតខ្ពស់",
    instructor: "លោកគ្រូ ចន្ទា",
    progress: 45,
    totalLessons: 30,
    completedLessons: 14,
    thumbnail: "📐",
    duration: "14 weeks",
    enrolledStudents: 189,
    rating: 4.7,
    category: "Math",
    color: "from-purple-400 to-pink-500",
  },
];

export default function MyCoursesPage() {
  const { currentUser, isLoading } = useAuth(); // ✅ FIXED: Use isLoading instead of loading
  const router = useRouter();
  const [courses] = useState<Course[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.titleKh.includes(searchQuery)
  );

  const totalProgress =
    courses.reduce((acc, course) => acc + course.progress, 0) / courses.length;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 font-koulen">កម្មវិធីសិក្សា</h1>
              <p className="text-xs text-gray-500">My Learning Courses</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
          {/* Overall Progress Card */}
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Overall Progress</h3>
                <p className="text-xs text-gray-500">Keep going! You're doing great!</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(totalProgress)}%
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">{courses.length}</p>
                <p className="text-[10px] text-gray-500 font-medium">Enrolled</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {courses.reduce((acc, c) => acc + c.completedLessons, 0)}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">Completed</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {(courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">Avg Rating</p>
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-gray-900">Your Courses</h2>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Course Header */}
                <div className={`bg-gradient-to-br ${course.color} p-5 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-7xl opacity-10">{course.thumbnail}</div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white mb-1 font-koulen">{course.titleKh}</h3>
                    <p className="text-sm text-white/90 mb-3">{course.title}</p>
                    <div className="flex items-center gap-3 text-white/80 text-xs">
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrolledStudents}
                      </span>
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Progress</span>
                    <span className="text-sm font-black text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-2">
                    <div
                      className={`bg-gradient-to-r ${course.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </p>

                  {/* Continue Learning Button */}
                  <button className={`w-full bg-gradient-to-r ${course.color} text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02]`}>
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-sm text-gray-600">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

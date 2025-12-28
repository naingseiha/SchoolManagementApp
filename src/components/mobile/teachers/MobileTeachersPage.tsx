// 📂 src/components/mobile/teachers/MobileTeachersPage.tsx

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Filter,
  X,
  Users,
  Sparkles,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  School,
  User,
  Calendar,
} from "lucide-react";
import { teachersApi, Teacher } from "@/lib/api/teachers";
import MobileLayout from "@/components/layout/MobileLayout";

export default function MobileTeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadTeachers();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadTeachers = useCallback(async (refresh = false) => {
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

      const data = await teachersApi.getAllLightweight();
      setTeachers(data);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setError(error.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យគ្រូ");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Memoized filtered teachers
  const filteredTeachers = useMemo(() => {
    let filtered = teachers;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((teacher) => {
        const khmerMatch = teacher.khmerName?.toLowerCase().includes(query);
        const idMatch = teacher.teacherId?.toLowerCase().includes(query);
        const firstNameMatch = teacher.firstName?.toLowerCase().includes(query);
        const lastNameMatch = teacher.lastName?.toLowerCase().includes(query);
        const emailMatch = teacher.email?.toLowerCase().includes(query);
        const phoneMatch = teacher.phone?.includes(query) || teacher.phoneNumber?.includes(query);
        const fullNameMatch = `${teacher.firstName} ${teacher.lastName}`
          .toLowerCase()
          .includes(query);

        return (
          khmerMatch ||
          idMatch ||
          firstNameMatch ||
          lastNameMatch ||
          fullNameMatch ||
          emailMatch ||
          phoneMatch
        );
      });
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((teacher) => teacher.role === selectedRole);
    }

    return filtered;
  }, [teachers, searchQuery, selectedRole]);

  const roleStats = useMemo(() => {
    return {
      all: teachers.length,
      TEACHER: teachers.filter((t) => t.role === "TEACHER").length,
      INSTRUCTOR: teachers.filter((t) => t.role === "INSTRUCTOR").length,
    };
  }, [teachers]);

  const handleTeacherClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const closeTeacherDetails = () => {
    setSelectedTeacher(null);
  };

  if (error) {
    return (
      <MobileLayout title="គ្រូបង្រៀន • Teachers">
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="font-koulen text-2xl text-gray-900 mb-2">
              មានបញ្ហា
            </h2>
            <p className="font-battambang text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => loadTeachers()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-battambang font-semibold py-3 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="គ្រូបង្រៀន • Teachers">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-24">
        {/* Header with Search */}
        <div className="bg-white px-5 pt-6 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-koulen text-orange-500 text-base leading-tight">
                គ្រូបង្រៀន
              </h1>
              <p className="font-battambang text-[10px] text-gray-500">
                {isLoading ? "កំពុងផ្ទុក..." : `${filteredTeachers.length} នាក់`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកគ្រូ... (ឈ្មោះ, អ៊ីមែល, ទូរស័ព្ទ)"
              className="w-full h-12 pl-11 pr-10 bg-gray-50 border border-gray-200 rounded-2xl font-battambang text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              style={{ fontSize: "16px" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSelectedRole("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-battambang text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRole === "all"
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ទាំងអស់ ({roleStats.all})
            </button>
            <button
              onClick={() => setSelectedRole("INSTRUCTOR")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-battambang text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRole === "INSTRUCTOR"
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              គ្រូថ្នាក់ ({roleStats.INSTRUCTOR})
            </button>
            <button
              onClick={() => setSelectedRole("TEACHER")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-battambang text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRole === "TEACHER"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <School className="w-3.5 h-3.5" />
              គ្រូបង្រៀន ({roleStats.TEACHER})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="px-5 pt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-koulen text-xl text-gray-900 mb-2">
              រកមិនឃើញ
            </h3>
            <p className="font-battambang text-sm text-gray-500 text-center">
              {searchQuery
                ? "មិនមានគ្រូដែលត្រូវនឹងការស្វែងរករបស់អ្នក"
                : "មិនមានគ្រូនៅឡើយទេ"}
            </p>
          </div>
        ) : (
          /* Teachers List */
          <div className="px-5 pt-4 space-y-2.5">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => handleTeacherClick(teacher)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                      teacher.role === "INSTRUCTOR"
                        ? "bg-gradient-to-br from-purple-500 to-pink-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}
                  >
                    <User className="w-7 h-7 text-white" />
                  </div>

                  {/* Teacher Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-battambang text-sm font-bold text-gray-900 truncate mb-0.5">
                      {teacher.khmerName || `${teacher.firstName} ${teacher.lastName}`}
                    </h3>

                    {/* Role Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-battambang font-semibold ${
                          teacher.role === "INSTRUCTOR"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {teacher.role === "INSTRUCTOR" ? (
                          <>
                            <GraduationCap className="w-3 h-3" />
                            គ្រូថ្នាក់
                          </>
                        ) : (
                          <>
                            <School className="w-3 h-3" />
                            គ្រូបង្រៀន
                          </>
                        )}
                      </span>

                      {teacher.homeroomClass && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-battambang font-semibold bg-orange-100 text-orange-700">
                          <Briefcase className="w-3 h-3" />
                          {teacher.homeroomClass.name}
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-0.5">
                      {teacher.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="font-battambang text-[11px] text-gray-600 truncate">
                            {teacher.email}
                          </span>
                        </div>
                      )}
                      {(teacher.phone || teacher.phoneNumber) && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="font-battambang text-[11px] text-gray-600">
                            {teacher.phone || teacher.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={closeTeacherDetails}
        >
          <div
            className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-koulen text-lg text-gray-900">
                ព័ត៌មានលម្អិត
              </h2>
              <button
                onClick={closeTeacherDetails}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                    selectedTeacher.role === "INSTRUCTOR"
                      ? "bg-gradient-to-br from-purple-500 to-pink-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-battambang text-base font-bold text-gray-900 mb-1">
                    {selectedTeacher.khmerName ||
                      `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                  </h3>
                  <p className="font-battambang text-xs text-gray-600">
                    {selectedTeacher.firstName} {selectedTeacher.lastName}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Teacher ID */}
                {selectedTeacher.teacherId && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      លេខកូដ
                    </p>
                    <p className="font-battambang text-sm font-semibold text-gray-900">
                      {selectedTeacher.teacherId}
                    </p>
                  </div>
                )}

                {/* Role */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-battambang text-xs text-gray-500 mb-1">
                    តួនាទី
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-battambang font-semibold ${
                      selectedTeacher.role === "INSTRUCTOR"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedTeacher.role === "INSTRUCTOR" ? (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        គ្រូថ្នាក់
                      </>
                    ) : (
                      <>
                        <School className="w-4 h-4" />
                        គ្រូបង្រៀន
                      </>
                    )}
                  </span>
                </div>

                {/* Email */}
                {selectedTeacher.email && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      អ៊ីមែល
                    </p>
                    <a
                      href={`mailto:${selectedTeacher.email}`}
                      className="font-battambang text-sm text-indigo-600 font-semibold"
                    >
                      {selectedTeacher.email}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {(selectedTeacher.phone || selectedTeacher.phoneNumber) && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      លេខទូរស័ព្ទ
                    </p>
                    <a
                      href={`tel:${selectedTeacher.phone || selectedTeacher.phoneNumber}`}
                      className="font-battambang text-sm text-indigo-600 font-semibold"
                    >
                      {selectedTeacher.phone || selectedTeacher.phoneNumber}
                    </a>
                  </div>
                )}

                {/* Homeroom Class */}
                {selectedTeacher.homeroomClass && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      ថ្នាក់ទទួលបន្ទុក
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-battambang text-sm font-semibold text-gray-900">
                        {selectedTeacher.homeroomClass.name}
                      </span>
                      {selectedTeacher.homeroomClass._count && (
                        <span className="font-battambang text-xs text-gray-500">
                          ({selectedTeacher.homeroomClass._count.students} សិស្ស)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Subjects */}
                {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-2">
                      មុខវិជ្ជាបង្រៀន
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.subjects.map((subject) => (
                        <span
                          key={subject.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-battambang text-xs text-gray-700"
                        >
                          {subject.nameKh || subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teaching Classes */}
                {selectedTeacher.teachingClasses &&
                  selectedTeacher.teachingClasses.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-battambang text-xs text-gray-500 mb-2">
                        ថ្នាក់បង្រៀន
                      </p>
                      <div className="space-y-1.5">
                        {selectedTeacher.teachingClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200"
                          >
                            <span className="font-battambang text-xs font-semibold text-gray-900">
                              {cls.name}
                            </span>
                            {cls._count && (
                              <span className="font-battambang text-xs text-gray-500">
                                {cls._count.students} សិស្ស
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Address */}
                {selectedTeacher.address && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      អាសយដ្ឋាន
                    </p>
                    <p className="font-battambang text-sm text-gray-900">
                      {selectedTeacher.address}
                    </p>
                  </div>
                )}

                {/* Position */}
                {selectedTeacher.position && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-battambang text-xs text-gray-500 mb-1">
                      តំណែង
                    </p>
                    <p className="font-battambang text-sm font-semibold text-gray-900">
                      {selectedTeacher.position}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, User, ChevronRight, Filter, X } from "lucide-react";

interface Student {
  id: string;
  studentId: string;
  khmerName: string;
  firstName: string;
  lastName: string;
  gender: string;
  className?: string;
  classId?: string;
}

export default function MobileStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedGrade, students]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/students/lightweight");
      const data = await response.json();
      setStudents(data.data || []);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.khmerName?.toLowerCase().includes(query) ||
          student.studentId?.toLowerCase().includes(query) ||
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query)
      );
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter((student) =>
        student.className?.includes(`ទី${selectedGrade}`)
      );
    }

    setFilteredStudents(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedGrade("all");
  };

  const grades = ["7", "8", "9", "10", "11", "12"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-khmer-title text-xl font-bold text-gray-900">
            សិស្ស
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredStudents.length} សិស្ស
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខសម្គាល់..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-0 rounded-xl text-sm font-khmer-body focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Grade Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedGrade("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedGrade === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            ទាំងអស់
          </button>
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedGrade === grade
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              ថ្នាក់ {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="p-4 space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-khmer-body text-gray-500 font-medium">
              មិនមានសិស្ស
            </p>
            <p className="font-khmer-body text-xs text-gray-400 mt-1">
              សូមសាកល្បងផ្លាស់ប្តូរការស្វែងរក
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => router.push(`/students/${student.id}`)}
              className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    student.gender === "MALE"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-pink-100 text-pink-600"
                  }`}
                >
                  <User className="w-6 h-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-khmer-body font-bold text-gray-900 truncate">
                    {student.khmerName || `${student.firstName} ${student.lastName}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {student.studentId}
                    </span>
                    {student.className && (
                      <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-khmer-body text-xs text-gray-500">
                          {student.className}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          ))
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

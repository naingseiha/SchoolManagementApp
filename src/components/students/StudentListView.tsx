"use client";

import { useState } from "react";
import {
  Search,
  Grid,
  List,
  Database,
  RefreshCw,
  Eye,
  Edit,
  X,
  Loader2,
} from "lucide-react";

interface StudentListViewProps {
  students: any[];
  classes: any[];
  isDataLoaded: boolean;
  onLoadData: () => void;
  onRefresh: () => void;
}

export default function StudentListView({
  students,
  classes,
  isDataLoaded,
  onLoadData,
  onRefresh,
}: StudentListViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "all" || student.classId === selectedClass;

    const matchesGender =
      selectedGender === "all" || student.gender === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  // ✅ Handle load data with loading state
  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      await onLoadData();
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ Handle view student details
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // ✅ Get class name
  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls?.name || "-";
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ No Data State with Loading */}
      {!isDataLoaded ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              ) : (
                <Database className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isLoading
                ? "កំពុងផ្ទុកទិន្នន័យ..."
                : "ទិន្នន័យសិស្សមិនទាន់ផ្ទុក"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {isLoading
                ? "សូមរង់ចាំបន្តិច យើងកំពុងទាញយកទិន្នន័យពីប្រព័ន្ធ"
                : "ចុចប៊ូតុងខាងក្រោម ដើម្បីផ្ទុកទិន្នន័យសិស្សទាំងអស់ពីប្រព័ន្ធ"}
            </p>
            {!isLoading && (
              <button
                onClick={handleLoadData}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                ផ្ទុកទិន្នន័យសិស្ស
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ✅ Filters Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search */}
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Class Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">ថ្នាក់ទាំងអស់</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">ភេទទាំងអស់</option>
                  <option value="male">ប្រុស</option>
                  <option value="female">ស្រី</option>
                </select>
              </div>

              {/* Refresh Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full h-11 px-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "កំពុងផ្ទុក..." : "ផ្ទុកឡើងវិញ"}
                </button>
              </div>
            </div>
          </div>

          {/* ✅ View Mode & Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                បង្ហាញ{" "}
                <strong className="text-gray-900">
                  {filteredStudents.length}
                </strong>{" "}
                នាក់ ពី{" "}
                <strong className="text-gray-900">{students.length}</strong>{" "}
                នាក់
                {searchQuery && (
                  <span className="ml-2 text-blue-600">
                    (ស្វែងរក: "{searchQuery}")
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <List className="w-4 h-4" />
                  តារាង
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  ក្រឡា
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Student List/Grid */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                រកមិនឃើញទិន្នន័យ
              </h3>
              <p className="text-sm text-gray-600">
                សូមព្យាយាមស្វែងរកដោយប្រើពាក្យគន្លឹះផ្សេង
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          លេខ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          អត្តលេខ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          ឈ្មោះ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          ភេទ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          ថ្នាក់
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          ថ្ងៃខែឆ្នាំកំណើត
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">
                            {student.studentId || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                student.gender === "male"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-pink-100 text-pink-700"
                              }`}
                            >
                              {student.gender === "male" ? "ប្រុស" : "ស្រី"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getClassName(student.classId)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(student.dateOfBirth)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleViewStudent(student)}
                              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              មើល
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleViewStudent(student)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {student.studentId || "No ID"}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            student.gender === "male"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {student.gender === "male" ? "ប្រុស" : "ស្រី"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>📚 {getClassName(student.classId)}</div>
                        <div>🎂 {formatDate(student.dateOfBirth)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ✅ Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-sm text-blue-100 mt-1">
                    អត្តលេខ: {selectedStudent.studentId || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">
                    ព័ត៌មានផ្ទាល់ខ្លួន
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600">ភេទ</label>
                      <p className="text-sm font-semibold">
                        {selectedStudent.gender === "male" ? "ប្រុស" : "ស្រី"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        ថ្ងៃខែឆ្នាំកំណើត
                      </label>
                      <p className="text-sm font-semibold">
                        {formatDate(selectedStudent.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">ថ្នាក់</label>
                      <p className="text-sm font-semibold">
                        {getClassName(selectedStudent.classId)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        លេខទូរសព្ទ
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedStudent.phoneNumber ||
                          selectedStudent.phone ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="h-10 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                បិទ
              </button>
              <button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center gap-2">
                <Edit className="w-4 h-4" />
                កែប្រែ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

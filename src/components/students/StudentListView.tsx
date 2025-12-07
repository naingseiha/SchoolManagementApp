"use client";

import { useState, useEffect } from "react";
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
  Phone,
  Mail,
  Calendar,
  MapPin,
  User,
  Save,
  AlertCircle,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Get full name from student object
  const getFullName = (student: any): string => {
    if (student.name) {
      return student.name;
    }

    // Handle firstName + lastName
    const lastName = student.lastName || student.last_name || "";
    const firstName = student.firstName || student.first_name || "";

    if (lastName && firstName) {
      return `${lastName} ${firstName}`;
    }

    if (lastName) return lastName;
    if (firstName) return firstName;

    // Khmer name fallback
    if (student.khmerName) return student.khmerName;

    return "N/A";
  };

  // ✅ Filter students
  const filteredStudents = students.filter((student) => {
    const fullName = getFullName(student);
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "all" || student.classId === selectedClass;

    const matchesGender =
      selectedGender === "all" || student.gender === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  // ✅ Handle load data
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

  // ✅ Handle refresh
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

  // ✅ Handle view student
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // ✅ Handle edit student
  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditFormData({
      name: getFullName(student),
      studentId: student.studentId || "",
      gender: student.gender || "male",
      dateOfBirth: student.dateOfBirth || "",
      classId: student.classId || "",
      phoneNumber: student.phoneNumber || student.phone || "",
      email: student.email || "",
      address: student.address || "",
    });
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  // ✅ Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedStudent || !editFormData.name.trim()) {
      alert("សូមបំពេញឈ្មោះ");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call API to update student
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Refresh data
      await onRefresh();
      setShowEditModal(false);
      alert("កែប្រែទិន្នន័យបានជោគជ័យ!");
    } catch (error: any) {
      console.error("Failed to save:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក: " + error.message);
    } finally {
      setIsSaving(false);
    }
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
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Get column background
  const getColumnBg = (index: number) => {
    const colors = [
      "bg-slate-50",
      "bg-blue-50",
      "bg-rose-50",
      "bg-purple-50",
      "bg-emerald-50",
      "bg-amber-50",
      "bg-cyan-50",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* No Data State */}
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
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
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

          {/* View Mode */}
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

          {/* Table/Grid */}
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
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            0
                          )}`}
                        >
                          លេខ
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            1
                          )}`}
                        >
                          អត្តលេខ
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            2
                          )}`}
                        >
                          គោត្តនាម និង នាម
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            3
                          )}`}
                        >
                          ភេទ
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            4
                          )}`}
                        >
                          ថ្នាក់
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            5
                          )}`}
                        >
                          ថ្ងៃខែឆ្នាំកំណើត
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${getColumnBg(
                            6
                          )}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                        >
                          <td
                            className={`px-4 py-3 text-sm text-gray-600 font-medium ${getColumnBg(
                              0
                            )}`}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={`px-4 py-3 text-sm font-mono text-gray-900 ${getColumnBg(
                              1
                            )}`}
                          >
                            {student.studentId || "-"}
                          </td>
                          <td
                            className={`px-4 py-3 text-sm font-bold text-gray-900 ${getColumnBg(
                              2
                            )}`}
                          >
                            {getFullName(student)}
                          </td>
                          <td className={`px-4 py-3 text-sm ${getColumnBg(3)}`}>
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
                          <td
                            className={`px-4 py-3 text-sm text-gray-600 ${getColumnBg(
                              4
                            )}`}
                          >
                            {getClassName(student.classId)}
                          </td>
                          <td
                            className={`px-4 py-3 text-sm text-gray-600 ${getColumnBg(
                              5
                            )}`}
                          >
                            {formatDate(student.dateOfBirth)}
                          </td>
                          <td className={`px-4 py-3 text-sm ${getColumnBg(6)}`}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewStudent(student)}
                                className="p-1. 5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="មើលព័ត៌មាន"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="កែប្រែ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
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
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">
                            {getFullName(student)}
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
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>📚 {getClassName(student.classId)}</div>
                        <div>🎂 {formatDate(student.dateOfBirth)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="flex-1 h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3. 5 h-3.5" />
                          មើល
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="flex-1 h-9 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          កែប្រែ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ✅ View Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {getFullName(selectedStudent)}
                  </h2>
                  <p className="text-sm text-blue-100">
                    អត្តលេខ: {selectedStudent.studentId || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs font-bold text-blue-900 uppercase">
                      ភេទ
                    </label>
                  </div>
                  <p className="text-base font-bold text-gray-900 ml-10">
                    {selectedStudent.gender === "male" ? "ប្រុស" : "ស្រី"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs font-bold text-amber-900 uppercase">
                      ថ្ងៃខែឆ្នាំកំណើត
                    </label>
                  </div>
                  <p className="text-base font-bold text-gray-900 ml-10">
                    {formatDate(selectedStudent.dateOfBirth)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs font-bold text-emerald-900 uppercase">
                      ថ្នាក់
                    </label>
                  </div>
                  <p className="text-base font-bold text-gray-900 ml-10">
                    {getClassName(selectedStudent.classId)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs font-bold text-purple-900 uppercase">
                      លេខទូរសព្ទ
                    </label>
                  </div>
                  <p className="text-base font-bold text-gray-900 ml-10">
                    {selectedStudent.phoneNumber ||
                      selectedStudent.phone ||
                      "-"}
                  </p>
                </div>

                {selectedStudent.email && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <label className="text-xs font-bold text-cyan-900 uppercase">
                        អ៊ីមែល
                      </label>
                    </div>
                    <p className="text-base font-bold text-gray-900 ml-10 truncate">
                      {selectedStudent.email}
                    </p>
                  </div>
                )}

                {selectedStudent.address && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <label className="text-xs font-bold text-rose-900 uppercase">
                        អាសយដ្ឋាន
                      </label>
                    </div>
                    <p className="text-base font-bold text-gray-900 ml-10">
                      {selectedStudent.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="h-11 px-6 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                បិទ
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditStudent(selectedStudent);
                }}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Edit className="w-4 h-4" />
                កែប្រែ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {showEditModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">កែប្រែទិន្នន័យសិស្ស</h2>
                    <p className="text-sm text-green-100">
                      Edit Student Information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    គោត្តនាម និង នាម *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="គោត្តនាម នាម"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      អត្តលេខ
                    </label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          studentId: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ភេទ *
                    </label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          gender: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="male">ប្រុស</option>
                      <option value="female">ស្រី</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ថ្ងៃខែឆ្នាំកំណើត
                    </label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ថ្នាក់
                    </label>
                    <select
                      value={editFormData.classId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          classId: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    លេខទូរសព្ទ
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phoneNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="012 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    អ៊ីមែល
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    អាសយដ្ឋាន
                  </label>
                  <textarea
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="ភូមិ ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត/រាជធានី"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className="h-11 px-6 bg-white border border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="h-11 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-bold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-green-500/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    កំពុងរក្សាទុក...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    រក្សាទុក
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

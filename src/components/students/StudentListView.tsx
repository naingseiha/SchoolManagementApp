"use client";

import { useState } from "react";
import { RefreshCw, Database, Loader2 } from "lucide-react";
import StudentModal from "./StudentModal";

interface StudentListViewProps {
  students: any[];
  classes: any[];
  loading: boolean;
  isDataLoaded: boolean;
  onLoadData: () => void;
  onRefresh: () => void;
}

export default function StudentListView({
  students,
  classes,
  loading,
  isDataLoaded,
  onLoadData,
  onRefresh,
}: StudentListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // ✅ NEW: Modal state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.khmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "all" || student.classId === selectedClass;

    const matchesGender =
      selectedGender === "all" || student.gender === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  // ✅ NEW: Handle view/edit student
  const handleViewStudent = (student: any, mode: "view" | "edit" = "view") => {
    setSelectedStudent(student);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleStudentUpdated = () => {
    // Refresh data after update
    onRefresh();
    setShowModal(false);
    setSelectedStudent(null);
  };

  // ✅ Initial Empty State
  if (!isDataLoaded && !loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300">
          <div className="bg-white p-6 rounded-full shadow-lg mb-6">
            <Database className="w-16 h-16 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            ទិន្នន័យសិស្សមិនទាន់ផ្ទុក
          </h3>
          <p className="text-gray-600 font-medium mb-6 text-center max-w-md">
            ចុចប៊ូតុងខាងក្រោម ដើម្បីផ្ទុកទិន្នន័យសិស្សទាំងអស់ពីប្រព័ន្ធ
          </p>
          <button
            onClick={onLoadData}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Database className="w-5 h-5" />
            ផ្ទុកទិន្នន័យសិស្ស
          </button>
          <p className="text-sm text-gray-500 mt-4">
            💡 ការផ្ទុកទិន្នន័យគ្រាន់តែម្តងប៉ុណ្ណោះ ហើយនឹងត្រូវរក្សាទុកក្នុង
            cache
          </p>
        </div>
      </div>
    );
  }

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">កំពុងផ្ទុកទិន្នន័យ...</p>
          <p className="text-sm text-gray-500 mt-2">សូមរង់ចាំមួយភ្លែត</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Refresh Button Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">
              ទិន្នន័យត្រូវបានផ្ទុករួច ({students.length} សិស្ស)
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-sm border border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            ធ្វើបច្ចុប្បន្នភាព
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">ថ្នាក់ទាំងអស់</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">ភេទទាំងអស់</option>
              <option value="male">ប្រុស</option>
              <option value="female">ស្រី</option>
            </select>
          </div>
        </div>

        {/* View Mode & Stats */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
          <div className="text-sm text-gray-600 font-medium">
            បង្ហាញ{" "}
            <strong className="text-gray-900">{filteredStudents.length}</strong>{" "}
            នាក់ ពី <strong className="text-gray-900">{students.length}</strong>{" "}
            នាក់
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              📊 តារាង
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              🔲 ក្រឡា
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    អត្តលេខ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ឈ្មោះ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ភេទ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ថ្ងៃខែឆ្នាំកំណើត
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ថ្នាក់
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                          🎓
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {student.studentId || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {student.khmerName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.gender === "male"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {student.gender === "male" ? "👦 ប្រុស" : "👧 ស្រី"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      📅 {student.dateOfBirth || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                        {student.class?.name || "មិនមានថ្នាក់"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewStudent(student, "view")}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="មើល"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleViewStudent(student, "edit")}
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="កែសម្រួល"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleViewStudent(student, "view")}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    🎓
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">
                      អត្តលេខ
                    </div>
                    <div className="text-sm font-black text-blue-600">
                      {student.studentId || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-black text-gray-900">
                    {student.khmerName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {student.firstName} {student.lastName}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        student.gender === "male"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {student.gender === "male" ? "👦 ប្រុស" : "👧 ស្រី"}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      {student.class?.name || "N/A"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    📅 {student.dateOfBirth || "N/A"}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student, "view");
                    }}
                    className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-sm"
                  >
                    មើល
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student, "edit");
                    }}
                    className="flex-1 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-semibold text-sm"
                  >
                    កែ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              មិនមានសិស្សទេ
            </h3>
            <p className="text-gray-500">
              សូមបញ្ចូលសិស្សដោយប្រើប៊ូតុង "បញ្ចូលជាបណ្តុំ"
            </p>
          </div>
        )}
      </div>

      {/* ✅ NEW: Student Modal */}
      {showModal && selectedStudent && (
        <StudentModal
          student={selectedStudent}
          mode={modalMode}
          onClose={handleCloseModal}
          onUpdate={handleStudentUpdated}
        />
      )}
    </>
  );
}

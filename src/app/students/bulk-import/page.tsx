"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BulkStudentGrid from "@/components/students/BulkStudentGrid";
import { StudentRowData } from "@/components/students/StudentGridRow";
import { studentsApi, BulkStudentData } from "@/lib/api/students";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
} from "lucide-react";

export default function BulkImportPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { classes } = useData();
  const router = useRouter();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Update grade when class changes
  useEffect(() => {
    if (selectedClassId) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (selectedClass) {
        setSelectedGrade(selectedClass.grade);
      }
    }
  }, [selectedClassId, classes]);

  const handleSave = async (students: StudentRowData[]) => {
    try {
      console.log("🚀 Starting bulk import...");
      console.log(`   Class: ${selectedClassId}`);
      console.log(`   Students: ${students.length}`);

      // Transform StudentRowData to BulkStudentData
      const bulkData: BulkStudentData[] = students.map((row) => ({
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        previousGrade: row.previousGrade,
        previousSchool: row.previousSchool,
        repeatingGrade: row.repeatingGrade,
        transferredFrom: row.transferredFrom,
        remarks: row.remarks,
        // Grade 9 exam
        grade9ExamSession: row.grade9ExamSession,
        grade9ExamCenter: row.grade9ExamCenter,
        grade9ExamRoom: row.grade9ExamRoom,
        grade9ExamDesk: row.grade9ExamDesk,
        // Grade 12 exam
        grade12ExamSession: row.grade12ExamSession,
        grade12ExamCenter: row.grade12ExamCenter,
        grade12ExamRoom: row.grade12ExamRoom,
        grade12ExamDesk: row.grade12ExamDesk,
        grade12Track: row.grade12Track,
      }));

      const result = await studentsApi.bulkCreate(selectedClassId, bulkData);

      setImportResult(result.data);
      setShowResult(true);

      console.log("✅ Bulk import completed:", result);
    } catch (error: any) {
      console.error("❌ Bulk import failed:", error);
      throw error;
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setImportResult(null);
  };

  const downloadTemplate = () => {
    // Create CSV template based on selected grade
    const gradeNum = parseInt(selectedGrade);

    let headers = [
      "ល.រ",
      "គោត្តនាម-នាម",
      "ភេទ",
      "ថ្ងៃខែឆ្នាំកំណើត",
      "ឡើងពីថ្នាក់",
      "មកពីសាលា",
      "ត្រួតថ្នាក់ទី",
      "ផ្ទេរមកពី",
    ];

    if (gradeNum >= 9) {
      headers.push("សម័យប្រឡងទី៩", "មណ្ឌលប្រឡង", "បន្ទប់", "លេខតុ");
    }

    if (gradeNum >= 12) {
      headers.push("សម័យប្រឡងទី១២", "មណ្ឌលប្រឡង", "បន្ទប់", "លេខតុ", "ផ្លូវ");
    }

    headers.push("ផ្សេងៗ");

    // Create sample row
    let sampleRow = [
      "1",
      "សុខ ដារ៉ា",
      "ប",
      "15/05/2010",
      "៦ក",
      "សាលាចាស់",
      "",
      "",
    ];

    if (gradeNum >= 9) {
      sampleRow.push("២០២៤", "មណ្ឌល១", "១", "០១");
    }

    if (gradeNum >= 12) {
      sampleRow.push("២០២៧", "មណ្ឌល១", "១", "០១", "វិទ្យាសាស្ត្រ");
    }

    sampleRow.push("សិស្សពូកែ");

    // Create CSV content
    const csvContent = headers.join(",") + "\n" + sampleRow.join(",") + "\n";

    // Create and download file
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `template_grade_${selectedGrade}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push("/students")}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  បញ្ចូលសិស្សជាបណ្តុំ
                </h1>
                <p className="text-gray-600 font-medium">
                  Bulk Student Import - Excel-like Grid
                </p>
              </div>
            </div>
          </div>

          {/* Class Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ជ្រើសរើសថ្នាក់ *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <div className="flex items-end">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg w-full">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Selected:</strong> {selectedClass.name}
                      <br />
                      <strong>Grade:</strong> {selectedClass.grade}
                      <br />
                      <strong>Section:</strong> {selectedClass.section || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {selectedClass && (
                <div className="flex items-end">
                  <button
                    onClick={downloadTemplate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    Download Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {selectedClassId && selectedGrade ? (
            <BulkStudentGrid
              classId={selectedClassId}
              grade={selectedGrade}
              onSave={handleSave}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                សូមជ្រើសរើសថ្នាក់
              </h3>
              <p className="text-gray-500">
                Please select a class to start importing students
              </p>
            </div>
          )}

          {/* Result Modal */}
          {showResult && importResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Import Complete!</h2>
                      <p className="text-green-100">បញ្ចូលទិន្នន័យបានជោគជ័យ</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {importResult.total}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Total
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {importResult.success}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Success
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {importResult.failed}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Failed
                      </div>
                    </div>
                  </div>

                  {/* Success List */}
                  {importResult.results.success.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Successfully Created (
                        {importResult.results.success.length})
                      </h3>
                      <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {importResult.results.success.map((item: any) => (
                            <div
                              key={item.row}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700">
                                Row {item.row}: {item.name}
                              </span>
                              <span className="font-mono text-green-700 font-semibold">
                                {item.studentId}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Failed List */}
                  {importResult.results.failed.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Failed ({importResult.results.failed.length})
                      </h3>
                      <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {importResult.results.failed.map((item: any) => (
                            <div
                              key={item.row}
                              className="text-sm text-gray-700"
                            >
                              <div className="font-semibold">
                                Row {item.row}: {item.name}
                              </div>
                              <div className="text-red-600 text-xs ml-4">
                                {item.error}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 flex justify-end gap-3">
                  <button
                    onClick={handleCloseResult}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => router.push("/students")}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-md"
                  >
                    View Students
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

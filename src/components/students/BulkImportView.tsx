"use client";

import { useState } from "react";
import BulkStudentGrid from "./BulkStudentGrid";
import { StudentRowData } from "./StudentGridRow";
import { studentsApi, BulkStudentData } from "@/lib/api/students";

interface BulkImportViewProps {
  classes: any[];
  onSuccess: () => void;
}

export default function BulkImportView({
  classes,
  onSuccess,
}: BulkImportViewProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      setSelectedGrade(cls.grade);
    }
  };

  const handleSave = async (students: StudentRowData[]) => {
    try {
      const bulkData: BulkStudentData[] = students.map((row) => ({
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        previousGrade: row.previousGrade,
        previousSchool: row.previousSchool,
        repeatingGrade: row.repeatingGrade,
        transferredFrom: row.transferredFrom,
        remarks: row.remarks,
        grade9ExamSession: row.grade9ExamSession,
        grade9ExamCenter: row.grade9ExamCenter,
        grade9ExamRoom: row.grade9ExamRoom,
        grade9ExamDesk: row.grade9ExamDesk,
        grade12ExamSession: row.grade12ExamSession,
        grade12ExamCenter: row.grade12ExamCenter,
        grade12ExamRoom: row.grade12ExamRoom,
        grade12ExamDesk: row.grade12ExamDesk,
        grade12Track: row.grade12Track,
      }));

      const result = await studentsApi.bulkCreate(selectedClassId, bulkData);
      const resultData = result.data || result;

      setImportResult(resultData);
      setShowResult(true);
    } catch (error: any) {
      console.error("❌ Bulk import failed:", error);
      throw error;
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setImportResult(null);
    onSuccess();
  };

  const downloadTemplate = () => {
    const gradeNum = parseInt(selectedGrade);
    let headers = [
      "ល. រ",
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

    let sampleRow = ["1", "សុខ ដារ៉ា", "ប", "7/5/12", "៦ក", "សាលាចាស់", "", ""];

    if (gradeNum >= 9) {
      sampleRow.push("២០២៤", "មណ្ឌល១", "១", "០១");
    }

    if (gradeNum >= 12) {
      sampleRow.push("២០២៧", "មណ្ឌល១", "១", "០១", "វិទ្យាសាស្ត្រ");
    }

    sampleRow.push("សិស្សពូកែ");

    const csvContent = headers.join(",") + "\n" + sampleRow.join(",") + "\n";
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

  return (
    <div className="p-6 space-y-6">
      {/* Instructions Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 p-3 rounded-xl text-white text-2xl">
            ℹ️
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              📋 របៀបប្រើប្រាស់
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </span>
                <span className="font-medium">ជ្រើសរើសថ្នាក់រៀន</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </span>
                <span className="font-medium">
                  ទាញយក Template (ប្រសិនបើត្រូវការ)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </span>
                <span className="font-medium">
                  Copy ទិន្នន័យពី Excel (Ctrl+C)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  4
                </span>
                <span className="font-medium">Paste ទៅក្នុង Grid (Ctrl+V)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  5
                </span>
                <span className="font-medium">
                  ពិនិត្យទិន្នន័យ (បំពេញ fields ដែលមាន *)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  6
                </span>
                <span className="font-medium">
                  ចុច "Save All" ដើម្បីរក្សាទុក
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ <strong>សម្គាល់:</strong> ទ្រង់ទ្រាយកាលបរិច្ឆេទគឺ DD/MM/YY
                (ឧទាហរណ៍: 7/5/12, 20/2/13)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ជ្រើសរើសថ្នាក់ *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium bg-white"
            >
              <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Grade {cls.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Class Info */}
          {selectedClass && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg text-white text-2xl">
                  👥
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-semibold">
                    ថ្នាក់ដែលបានជ្រើសរើស
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    {selectedClass.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    កម្រិត {selectedClass.grade} • ផ្នែក{" "}
                    {selectedClass.section || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Template Button */}
          {selectedClass && (
            <div className="flex items-end">
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg transition-all transform hover:scale-105"
              >
                📥 ទាញយក Template
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
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">📤</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              សូមជ្រើសរើសថ្នាក់
            </h3>
            <p className="text-gray-600 font-medium mb-6">
              ដើម្បីចាប់ផ្តើមបញ្ចូលទិន្នន័យសិស្សជាបណ្តុំ
              សូមជ្រើសរើសថ្នាក់ពីខាងលើ
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>📊</span>
              <span>គាំទ្រទម្រង់ Excel និង CSV</span>
            </div>
          </div>
        </div>
      )}

      {/* Success/Failure Modal */}
      {showResult && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl text-4xl">
                  ✅
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-1">
                    បញ្ចូលទិន្នន័យបានជោគជ័យ!
                  </h2>
                  <p className="text-green-100 font-medium">
                    Import completed successfully
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-250px)]">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    {importResult.total}
                  </div>
                  <div className="text-sm text-blue-800 font-bold uppercase tracking-wide">
                    សរុបទាំងអស់
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-200">
                  <div className="text-4xl font-black text-green-600 mb-2">
                    {importResult.success}
                  </div>
                  <div className="text-sm text-green-800 font-bold uppercase tracking-wide">
                    ជោគជ័យ
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-2xl border-2 border-red-200">
                  <div className="text-4xl font-black text-red-600 mb-2">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-red-800 font-bold uppercase tracking-wide">
                    បរាជ័យ
                  </div>
                </div>
              </div>

              {/* Success List */}
              {importResult.results.success.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-lg font-black text-green-700">
                      បញ្ជីសិស្សដែលបានបង្កើតជោគជ័យ (
                      {importResult.results.success.length})
                    </h3>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 max-h-64 overflow-y-auto border-2 border-green-200">
                    <div className="space-y-2">
                      {importResult.results.success.map((item: any) => (
                        <div
                          key={item.row}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 text-green-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                              {item.row}
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-green-700 font-bold bg-green-100 px-3 py-1 rounded-lg">
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
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">❌</span>
                    <h3 className="text-lg font-black text-red-700">
                      បញ្ជីសិស្សដែលបរាជ័យ ({importResult.results.failed.length})
                    </h3>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 max-h-64 overflow-y-auto border-2 border-red-200">
                    <div className="space-y-3">
                      {importResult.results.failed.map((item: any) => (
                        <div
                          key={item.row}
                          className="bg-white p-4 rounded-lg border border-red-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {item.row}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-1">
                                {item.name}
                              </div>
                              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                                {item.error}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseResult}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg transition-all transform hover:scale-105"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { teachersApi } from "@/lib/api/teachers";

interface BulkImportViewProps {
  subjects: any[];
  onSuccess: () => void;
}

interface TeacherImportData {
  name: string;
  khmerName: string;
  gender: string;
  dateOfBirth?:  string;
  phoneNumber:  string;
  email?:  string;
  address?: string;
  subjects?:  string;
  hireDate?: string;
  status?: "pending" | "success" | "error";
  errorMessage?: string;
}

export default function BulkImportView({
  subjects,
  onSuccess,
}: BulkImportViewProps) {
  const [importData, setImportData] = useState<TeacherImportData[]>([]);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files? .[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?. result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils. sheet_to_json(worksheet);

        const teachers: TeacherImportData[] = jsonData.map((row: any) => ({
          name:  row["Name (English)"] || row["name"] || "",
          khmerName:  row["Name (Khmer)"] || row["khmerName"] || "",
          gender: 
            row["Gender"] || row["gender"] === "ស្រី" || row["gender"] === "female"
              ? "female"
              : "male",
          dateOfBirth: row["Date of Birth"] || row["dateOfBirth"] || "",
          phoneNumber: String(row["Phone Number"] || row["phoneNumber"] || ""),
          email: row["Email"] || row["email"] || "",
          address: row["Address"] || row["address"] || "",
          subjects: row["Subjects"] || row["subjects"] || "",
          hireDate: row["Hire Date"] || row["hireDate"] || "",
          status: "pending",
        }));

        setImportData(teachers);
        setShowPreview(true);
        setImportResults(null);
      } catch (error) {
        console.error("Failed to parse file:", error);
        alert("បរាជ័យក្នុងការអាន file!  សូមពិនិត្យមើល format របស់ file។");
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateTeacher = (teacher: TeacherImportData): string | null => {
    if (!teacher.name || teacher.name.trim() === "") {
      return "ឈ្មោះជាអក្សរឡាតាំងត្រូវតែមាន";
    }
    if (!teacher.khmerName || teacher.khmerName.trim() === "") {
      return "ឈ្មោះជាអក្សរខ្មែរត្រូវតែមាន";
    }
    if (!teacher. phoneNumber || teacher.phoneNumber.trim() === "") {
      return "លេខទូរស័ព្ទត្រូវតែមាន";
    }
    if (!["male", "female", "ប្រុស", "ស្រី"].includes(teacher.gender)) {
      return "ភេទមិនត្រឹមត្រូវ (ប្រើ male/female ឬ ប្រុស/ស្រី)";
    }
    return null;
  };

  const mapSubjectsToIds = (subjectsString: string): string[] => {
    if (!subjectsString) return [];
    
    const subjectNames = subjectsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    return subjectNames
      .map((name) => {
        const subject = subjects.find(
          (s) =>
            s.khmerName?. toLowerCase() === name.toLowerCase() ||
            s.name?.toLowerCase() === name.toLowerCase()
        );
        return subject?. id;
      })
      .filter((id) => id) as string[];
  };

  const handleImport = async () => {
    setImporting(true);

    let successCount = 0;
    let failedCount = 0;

    const updatedData = [... importData];

    for (let i = 0; i < updatedData.length; i++) {
      const teacher = updatedData[i];

      // Validate
      const validationError = validateTeacher(teacher);
      if (validationError) {
        updatedData[i] = {
          ...teacher,
          status: "error",
          errorMessage: validationError,
        };
        failedCount++;
        continue;
      }

      try {
        // Prepare data
        const teacherData = {
          name: teacher.name. trim(),
          khmerName:  teacher.khmerName.trim(),
          gender: teacher.gender === "ស្រី" ? "female" : teacher.gender === "ប្រុស" ? "male" : teacher.gender,
          dateOfBirth: teacher.dateOfBirth || "",
          phoneNumber: teacher. phoneNumber.trim(),
          email: teacher.email?. trim() || "",
          address:  teacher.address?.trim() || "",
          subjectIds: mapSubjectsToIds(teacher.subjects || ""),
          hireDate: teacher. hireDate || new Date().toISOString().split("T")[0],
        };

        // Create teacher
        await teachersApi.create(teacherData);

        updatedData[i] = {
          ...teacher,
          status: "success",
        };
        successCount++;
      } catch (error:  any) {
        updatedData[i] = {
          ...teacher,
          status: "error",
          errorMessage:  error.message || "បរាជ័យក្នុងការបន្ថែម",
        };
        failedCount++;
      }

      setImportData([...updatedData]);
    }

    setImportResults({
      success: successCount,
      failed: failedCount,
      total: updatedData.length,
    });

    setImporting(false);

    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Name (English)": "John Doe",
        "Name (Khmer)": "ចន ដូ",
        Gender: "male",
        "Date of Birth":  "1985-05-15",
        "Phone Number": "012345678",
        Email: "john@school.com",
        Address: "Phnom Penh",
        Subjects: "គណិតវិទ្យា, រូបវិទ្យា",
        "Hire Date": "2020-01-15",
      },
      {
        "Name (English)": "Jane Smith",
        "Name (Khmer)": "ជែន ស្មីត",
        Gender: "female",
        "Date of Birth": "1990-08-20",
        "Phone Number": "012345679",
        Email:  "jane@school.com",
        Address: "Siem Reap",
        Subjects: "គីមីវិទ្យា",
        "Hire Date": "2021-03-10",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Name (English)
      { wch: 20 }, // Name (Khmer)
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // Phone Number
      { wch: 25 }, // Email
      { wch: 20 }, // Address
      { wch: 30 }, // Subjects
      { wch: 15 }, // Hire Date
    ];

    XLSX.writeFile(workbook, "teacher_import_template.xlsx");
  };

  const getStatusIcon = (status?:  string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "success": 
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            ជោគជ័យ
          </span>
        );
      case "error": 
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            បរាជ័យ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            រង់ចាំ
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              របៀបបញ្ចូលគ្រូបង្រៀនជាបណ្តុំ
            </h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>
                  ទាញយក Template Excel ដោយចុចប៊ូតុង{" "}
                  <span className="font-semibold">"ទាញយក Template"</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>
                  បំពេញព័ត៌មានគ្រូបង្រៀនទាំងអស់ក្នុង Excel file តាម format ដែលបានកំណត់
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>
                  Upload file Excel/CSV ដោយចុចប៊ូតុង{" "}
                  <span className="font-semibold">"ជ្រើសរើស File"</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>
                  ពិនិត្យមើលទិន្នន័យ Preview ហើយចុចប៊ូតុង{" "}
                  <span className="font-semibold">"ចាប់ផ្តើម Import"</span>
                </span>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">ចំណាំសំខាន់: </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>ឈ្មោះជាអក្សរឡាតាំង, ឈ្មោះជាអក្សរខ្មែរ និងលេខទូរស័ព្ទ ត្រូវតែមាន</li>
                    <li>ភេទ:  ប្រើ "male" ឬ "female" (ឬ "ប្រុស" / "ស្រី")</li>
                    <li>
                      មុខវិជ្ជា: ប្រើឈ្មោះមុខវិជ្ជាជាអក្សរខ្មែរ ផ្តាច់ដោយសញ្ញា comma (,)
                    </li>
                    <li>កាលបរិច្ឆេទ: ប្រើ format YYYY-MM-DD (ឧ.  2020-01-15)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadTemplate}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            ទាញយក Template
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            ជ្រើសរើស File
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Available Subjects Reference */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          បញ្ជីមុខវិជ្ជាដែលមាន
        </h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <span
              key={subject.id}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200"
            >
              {subject.khmerName}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 ប្រើឈ្មោះមុខវិជ្ជាទាំងនេះនៅក្នុង Excel file (ផ្តាច់ដោយសញ្ញា comma សម្រាប់ច្រើនមុខវិជ្ជា)
        </p>
      </div>

      {/* Preview Modal */}
      {showPreview && importData.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  ពិនិត្យមើលទិន្នន័យ Import
                </h2>
                <p className="text-sm text-gray-600">
                  សរុប {importData.length} គ្រូបង្រៀន
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setImportData([]);
                  setImportResults(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Results Summary */}
            {importResults && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-600">
                        {importResults.success}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        ជោគជ័យ
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-red-600">
                        {importResults.failed}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        បរាជ័យ
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-600">
                        {importResults.total}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        សរុប
                      </div>
                    </div>
                  </div>
                  {importResults.success > 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">
                        Import រួចរាល់!  កំពុងបិទបង្អួច... 
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        ឈ្មោះ (Latin)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        ឈ្មោះ (ខ្មែរ)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        ភេទ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        ទូរស័ព្ទ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        មុខវិជ្ជា
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        ស្ថានភាព
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {importData.map((teacher, index) => (
                      <tr
                        key={index}
                        className={`${
                          teacher.status === "success"
                            ? "bg-green-50"
                            : teacher.status === "error"
                            ? "bg-red-50"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(teacher.status)}
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {teacher.name || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {teacher.khmerName || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              teacher. gender === "female" || teacher.gender === "ស្រី"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {teacher.gender === "female" || teacher.gender === "ស្រី"
                              ? "ស្រី"
                              : "ប្រុស"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {teacher.phoneNumber || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="max-w-xs truncate">
                            {teacher.subjects || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(teacher.status)}
                            {teacher.errorMessage && (
                              <span className="text-xs text-red-600">
                                {teacher.errorMessage}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setImportData([]);
                  setImportResults(null);
                }}
                className="px-6 py-2. 5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                បោះបង់
              </button>

              {! importResults && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ?  (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      កំពុង Import...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      ចាប់ផ្តើម Import ({importData.length} គ្រូ)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
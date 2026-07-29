"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/useToast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AttendanceGridEditor from "@/components/attendance/AttendanceGridEditor";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import dynamic from "next/dynamic";
import {
  Download,
  Loader2,
  AlertCircle,
  CalendarCheck,
  Info,
  FileText,
  Printer,
} from "lucide-react";
import {
  attendanceApi,
  type AttendanceGridData,
  type BulkSaveAttendanceItem,
} from "@/lib/api/attendance";
import {
  getCurrentAcademicYear,
  getAcademicYearOptions,
} from "@/utils/academicYear";
import { getDynamicMonthOptions } from "@/lib/reportHelpers";

// Dynamic import for mobile component
const MobileAttendance = dynamic(
  () => import("@/components/mobile/attendance/MobileAttendance"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    ),
  }
);

// Dynamic import for PDF report
const AttendanceReportPDF = dynamic(
  () => import("@/components/attendance/AttendanceReportPDF"),
  { ssr: false }
);

const MONTHS = [
  { value: "មករា", label: "មករា", number: 1 },
  { value: "កុម្ភៈ", label: "កុម្ភៈ", number: 2 },
  { value: "មីនា", label: "មីនា", number: 3 },
  { value: "មេសា", label: "មេសា", number: 4 },
  { value: "ឧសភា", label: "ឧសភា", number: 5 },
  { value: "មិថុនា", label: "មិថុនា", number: 6 },
  { value: "កក្កដា", label: "កក្កដា", number: 7 },
  { value: "សីហា", label: "សីហា", number: 8 },
  { value: "កញ្ញា", label: "កញ្ញា", number: 9 },
  { value: "តុលា", label: "តុលា", number: 10 },
  { value: "វិច្ឆិកា", label: "វិច្ឆិកា", number: 11 },
  { value: "ធ្នូ", label: "ធ្នូ", number: 12 },
];

const getCurrentMonth = () => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex]?.value || "ធ្នូ";
};

export default function AttendancePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { success, error: showError, warning, ToastContainer } = useToast();
  const deviceType = useDeviceType();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [gridData, setGridData] = useState<AttendanceGridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // ✅ Signature section fields
  const [signatureLocation, setSignatureLocation] = useState("សៀមរាប");
  const [signatureDay, setSignatureDay] = useState(new Date().getDate().toString());
  const [signatureMonth, setSignatureMonth] = useState(MONTHS[new Date().getMonth()]?.label || "មករា");
  const [signatureYear, setSignatureYear] = useState(new Date().getFullYear().toString());
  const [principalName, setPrincipalName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  // ✅ Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Render mobile version for mobile devices
  if (deviceType === "mobile") {
    return (
      <MobileAttendance
        classId={selectedClassId}
        month={selectedMonth}
        year={selectedYear}
      />
    );
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ Filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) {
            classIdsSet.add(classId);
          }
        });
      }

      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }

      const teacherClassIds = Array.from(classIdsSet);
      return classes.filter((c) => teacherClassIds.includes(c.id));
    }

    return [];
  }, [currentUser, classes]);

  useEffect(() => {
    if (
      isAuthenticated &&
      !authLoading &&
      classes.length === 0 &&
      !isLoadingClasses
    ) {
      console.log("📚 Classes array is empty, fetching classes...");
      refreshClasses();
    }
  }, [
    isAuthenticated,
    authLoading,
    classes.length,
    isLoadingClasses,
    refreshClasses,
  ]);

  // ✅ Handle selection changes with unsaved warning
  const handleClassChange = (newClassId: string) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => setSelectedClassId(newClassId));
      setShowUnsavedWarning(true);
    } else {
      setSelectedClassId(newClassId);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => setSelectedMonth(newMonth));
      setShowUnsavedWarning(true);
    } else {
      setSelectedMonth(newMonth);
    }
  };

  const handleYearChange = (newYear: number) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => setSelectedYear(newYear));
      setShowUnsavedWarning(true);
    } else {
      setSelectedYear(newYear);
    }
  };

  // ✅ Handle warning dialog actions
  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelChange = () => {
    setShowUnsavedWarning(false);
    setPendingAction(null);
  };

  const handleLoadData = async () => {
    if (!selectedClassId || !currentUser) {
      warning("សូមជ្រើសរើសថ្នាក់សិន");
      return;
    }

    setLoading(true);
    setError(null);
    setGridData(null);
    setHasUnsavedChanges(false);

    try {
      const data = await attendanceApi.getAttendanceGrid(
        selectedClassId,
        selectedMonth,
        selectedYear
      );

      setGridData(data);
      success(
        `ផ្ទុកទិន្នន័យបានជោគជ័យ • ${data.daysInMonth} ថ្ងៃ • ${
          data.students?.length || 0
        } សិស្ស`
      );
    } catch (err: any) {
      console.error("❌ Error fetching attendance grid:", err);
      showError(`មានបញ្ហាក្នុងការទាញយកទិន្នន័យ: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Silent auto-save
  const handleSaveAttendance = async (
    attendance: BulkSaveAttendanceItem[],
    isAutoSave: boolean = false
  ) => {
    if (!gridData) return;

    try {
      if (attendance.length === 0) {
        if (!isAutoSave) {
          warning("សូមបញ្ចូលវត្តមានយ៉ាងហោចណាស់មួយ");
        }
        return;
      }

      console.log(
        `💾 Saving ${attendance.length} attendance${
          isAutoSave ? " (AUTO-SAVE - SILENT)" : " (MANUAL)"
        }`
      );

      const result = await attendanceApi.bulkSaveAttendance(
        selectedClassId,
        selectedMonth,
        selectedYear,
        gridData.monthNumber,
        attendance
      );

      const savedCount = result?.savedCount ?? attendance.length;
      const errorCount = result?.errorCount ?? 0;

      if (!isAutoSave) {
        if (errorCount > 0) {
          warning(`រក្សាទុក ${savedCount} ជោគជ័យ, ${errorCount} មានកំហុស`);
        } else {
          success(`រក្សាទុកបានជោគជ័យ ${savedCount} វត្តមាន`);
        }
      } else {
        console.log(`🔇 Auto-saved ${savedCount} silently`);
      }
    } catch (err: any) {
      console.error(`❌ Save failed: `, err);

      if (!isAutoSave) {
        showError(
          `មានបញ្ហាក្នុងការរក្សាទុក:  ${err.message || "Unknown error"}`
        );
        throw err;
      } else {
        console.error("🔇 Auto-save failed silently");
      }
    }
  };

  // Handle print/export PDF
  const handleExportPDF = () => {
    if (!gridData) {
      warning("សូមផ្ទុកទិន្នន័យមុនពេលនាំចេញ PDF");
      return;
    }

    console.log("🖨️ Opening print preview...");
    setShowPrintPreview(true);
  };

  const handlePrintNow = () => {
    console.log("🖨️ Starting print...");
    window.print();
    setTimeout(() => {
      success("បានបោះពុម្ពបានជោគជ័យ");
    }, 100);
  };

  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">កំពុងពិនិត្យ... </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const classOptions = isLoadingClasses
    ? [{ value: "", label: "កំពុងផ្ទុក...  - Loading..." }]
    : [
        { value: "", label: "ជ្រើសរើសថ្នាក់" },
        ...availableClasses.map((c) => ({ value: c.id, label: c.name })),
      ];

  const selectedClassInfo = classes.find((c) => c.id === selectedClassId);
  const selectedClassGrade = selectedClassInfo?.grade || "";
  const monthOptions = getDynamicMonthOptions(selectedClassGrade);

  const yearOptions = getAcademicYearOptions();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="p-6 space-y-6">
            {/* Teacher Info Box */}
            {currentUser.role === "TEACHER" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      ព័ត៌មានគ្រូបង្រៀន • Teacher Information
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <p>
                          <strong>ថ្នាក់រៀន:</strong> {availableClasses.length}{" "}
                          ថ្នាក់
                        </p>
                      </div>
                      <div>
                        {currentUser.teacher?.homeroomClass && (
                          <p>
                            <strong>ថ្នាក់ប្រចាំ:</strong>{" "}
                            {currentUser.teacher.homeroomClass.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-koulen text-gray-900">
                    គ្រប់គ្រងអវត្តមាន
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    រក្សាទុកស្វ័យប្រវត្តិ • គណនាចំនួនភ្លាមៗ
                  </p>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="grid grid-cols-1 md: grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ថ្នាក់
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      handleClassChange(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    disabled={isLoadingClasses}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus: ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {currentUser.role === "TEACHER" &&
                    availableClasses.length === 0 && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        អ្នកមិនទាន់មានថ្នាក់ដែលបានចាត់តាំងទេ
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ខែ
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      handleMonthChange(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus: ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ឆ្នាំ
                  </label>
                  <select
                    value={selectedYear.toString()}
                    onChange={(e) => {
                      handleYearChange(parseInt(e.target.value));
                      setGridData(null);
                      setError(null);
                    }}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {yearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ផ្ទុកទិន្នន័យ
                  </label>
                  <button
                    onClick={handleLoadData}
                    disabled={!selectedClassId || loading}
                    className="w-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>កំពុងផ្ទុក...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>ផ្ទុកទិន្នន័យ</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    នាំចេញ PDF
                  </label>
                  <button
                    onClick={handleExportPDF}
                    disabled={!gridData || loading}
                    className="w-full h-11 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover: shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>បោះពុម្ព</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      មានបញ្ហា
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    កំពុងផ្ទុកទិន្នន័យ...
                  </p>
                </div>
              </div>
            ) : gridData ? (
              <AttendanceGridEditor
                gridData={gridData}
                onSave={handleSaveAttendance}
                isLoading={loading}
                onUnsavedChanges={setHasUnsavedChanges}
              />
            ) : selectedClassId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    ចុច "ផ្ទុកទិន្នន័យ" ដើម្បីចាប់ផ្តើម
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">
                    សូមជ្រើសរើសថ្នាក់ដើម្បីចាប់ផ្តើម
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ✅ Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-koulen text-gray-900">
                  មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក
                </h3>
                <p className="text-sm text-gray-600 mt-1">Unsaved Changes</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              អ្នកមានការផ្លាស់ប្តូរវត្តមានដែលមិនទាន់បានរក្សាទុក។
              តើអ្នកចង់បោះបង់ការផ្លាស់ប្តូរទាំងនេះមែនទេ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelChange}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                បោះបង់ • Cancel
              </button>
              <button
                onClick={handleDiscardChanges}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30"
              >
                បោះបង់ការផ្លាស់ប្តូរ • Discard
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              ចំណាំ: ការផ្លាស់ប្តូរនឹងត្រូវរក្សាទុកស្វ័យប្រវត្តិក្នុងរយៈពេល
              500ms
            </p>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />

      {/* Print Preview Modal */}
      {showPrintPreview && gridData && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    មើលមុនពេលបោះពុម្ព • Print Preview
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrintNow}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      <span>បោះពុម្ព</span>
                    </button>
                    <button
                      onClick={handleClosePrintPreview}
                      className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
                    >
                      បិទ
                    </button>
                  </div>
                </div>

                {/* Signature Fields */}
                <div className="grid grid-cols-6 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ទីកន្លែង</label>
                    <input
                      type="text"
                      value={signatureLocation}
                      onChange={(e) => setSignatureLocation(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ថ្ងៃទី</label>
                    <input
                      type="text"
                      value={signatureDay}
                      onChange={(e) => setSignatureDay(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ខែ</label>
                    <select
                      value={signatureMonth}
                      onChange={(e) => setSignatureMonth(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.label}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ឆ្នាំ</label>
                    <input
                      type="text"
                      value={signatureYear}
                      onChange={(e) => setSignatureYear(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">នាយកសាលា</label>
                    <input
                      type="text"
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="ឈ្មោះ"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">គ្រូទទួលបន្ទុក</label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="ឈ្មោះ"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Print Content Preview */}
              <div className="flex-1 overflow-auto p-6 bg-gray-100">
                <div
                  className="mx-auto bg-white shadow-lg"
                  style={{
                    width: "297mm",
                    padding: "0.5cm",
                    boxSizing: "border-box",
                  }}
                >
                  <AttendanceReportPDF
                    gridData={gridData}
                    grade={selectedClassGrade}
                    schoolName="វិទ្យាល័យ ហ៊ុន សែន យធំ"
                    province="មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"
                    signatureLocation={signatureLocation}
                    signatureDay={signatureDay}
                    signatureMonth={signatureMonth}
                    signatureYear={signatureYear}
                    principalName={principalName}
                    teacherName={teacherName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hidden print content */}
          <div className="print-only">
            <AttendanceReportPDF
              gridData={gridData}
              grade={selectedClassGrade}
              schoolName="វិទ្យាល័យ ហ៊ុន សែន យធំ"
              province="មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"
              signatureLocation={signatureLocation}
              signatureDay={signatureDay}
              signatureMonth={signatureMonth}
              signatureYear={signatureYear}
              principalName={principalName}
              teacherName={teacherName}
            />
          </div>

          {/* Print styles */}
          <style jsx global>{`
            .no-print {
              display: block;
            }

            .print-only {
              display: none;
            }

            @media print {
              @page {
                size: A4 landscape;
                margin: 0 5cm;
              }

              body * {
                visibility: hidden;
              }

              .no-print {
                display: none !important;
              }

              .print-only {
                display: block !important;
                visibility: visible !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }

              .print-only * {
                visibility: visible !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

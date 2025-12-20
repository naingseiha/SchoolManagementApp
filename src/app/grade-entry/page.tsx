"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/useToast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import GradeGridEditor from "@/components/grades/GradeGridEditor";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import dynamic from "next/dynamic";
import {
  Download,
  Loader2,
  AlertCircle,
  BookOpen,
  Info,
  Lock,
  Eye,
} from "lucide-react";
import {
  gradeApi,
  type GradeGridData,
  type BulkSaveGradeItem,
} from "@/lib/api/grades";

// Dynamic import for mobile component (code splitting)
const MobileGradeEntry = dynamic(
  () => import("@/components/mobile/grades/MobileGradeEntry"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    ),
  }
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

const getCurrentYear = () => {
  return new Date().getFullYear();
};

export default function GradeEntryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { success, error: showError, warning, ToastContainer } = useToast();
  const deviceType = useDeviceType();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [gridData, setGridData] = useState<GradeGridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Render mobile version for mobile devices
  if (deviceType === "mobile") {
    return (
      <MobileGradeEntry
        classId={selectedClassId}
        month={selectedMonth}
        year={selectedYear}
      />
    );
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Proactively load classes if empty
  useEffect(() => {
    if (isAuthenticated && !authLoading && classes.length === 0 && !isLoadingClasses) {
      console.log("📚 Classes array is empty, fetching classes...");
      refreshClasses();
    }
  }, [isAuthenticated, authLoading, classes.length, isLoadingClasses, refreshClasses]);

  // ✅ Filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) {
      console.log("⏸️ Waiting for currentUser to load.. .");
      return [];
    }

    if (currentUser.role === "ADMIN") {
      console.log("✅ Admin:  All classes available");
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 DEBUGGING TEACHER DATA STRUCTURE:");
      console.log("Full teacher object:", JSON.stringify(currentUser.teacher, null, 2));
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Extract class IDs from multiple sources
      const classIdsSet = new Set<string>();

      // 1. From teacherClasses (if exists) - This is where teachers teach subjects
      if (currentUser.teacher?.teacherClasses) {
        console.log("📚 Found teacherClasses:", currentUser.teacher.teacherClasses.length);
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) {
            classIdsSet.add(classId);
            console.log("  ✅ Added class from teacherClasses:", classId);
          }
        });
      } else {
        console.log("⚠️ No teacherClasses found");
      }

      // 2. From homeroom class (if exists) - This is the class the teacher manages (INSTRUCTOR role)
      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
        console.log("🏠 Added homeroom class (INSTRUCTOR):", currentUser.teacher.homeroomClassId);
      } else {
        console.log("⚠️ No homeroomClass found (not an INSTRUCTOR)");
      }

      const teacherClassIds = Array.from(classIdsSet);
      console.log("👨‍🏫 Final teacher class IDs:", teacherClassIds);
      console.log("📊 Total classes available:", classes.length);

      const filteredClasses = classes.filter((c) =>
        teacherClassIds.includes(c.id)
      );

      console.log("✅ Filtered classes for teacher:", filteredClasses.length);
      console.log("  Classes:", filteredClasses.map(c => `${c.id}: ${c.name}`));
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return filteredClasses;
    }

    return [];
  }, [currentUser, classes]);

  // ✅ Get teacher's editable subjects by CODE (not ID)
  const teacherEditableSubjects = useMemo(() => {
    if (!currentUser) {
      console.log("⏸️ Waiting for currentUser to load (subjects)...");
      return new Set<string>();
    }

    console.log("🔍 Calculating editable subjects for:", currentUser.role);

    if (currentUser.role === "ADMIN") {
      console.log("✅ Admin mode: All subjects editable");
      return new Set<string>();
    }

    if (currentUser.role === "TEACHER") {
      const subjectTeachers = currentUser.teacher?.subjectTeachers || [];

      // ✅ Extract subject CODES instead of IDs
      const subjectCodes = subjectTeachers
        .map((st: any) => {
          const code = st.subject?.code;
          // Extract base code (before grade suffix)
          // E.g., "MATH-G11-SCIENCE" → "MATH"
          return code ? code.split("-")[0] : null;
        })
        .filter((code): code is string => code !== null);

      console.log("👨‍🏫 Teacher subject assignments (by CODE):", {
        count: subjectTeachers.length,
        subjectCodes,
        homeroomClassId: currentUser.teacher?.homeroomClassId,
        homeroomClassName: currentUser.teacher?.homeroomClass?.name,
        subjectTeachers: subjectTeachers.map((st: any) => ({
          subjectCode: st.subject?.code,
          baseCode: st.subject?.code?.split("-")[0],
          subjectName: st.subject?.nameKh || st.subject?.name,
        })),
      });

      return new Set(subjectCodes);
    }

    console.log("⚠️ Unknown role, no editable subjects");
    return new Set<string>();
  }, [currentUser]);

  // ✅ NEW: Get homeroom class ID
  const teacherHomeroomClassId = useMemo(() => {
    if (currentUser?.role === "TEACHER") {
      const homeroomClassId = currentUser.teacher?.homeroomClassId || null;
      console.log("🏠 Teacher Homeroom Class ID:", homeroomClassId);
      return homeroomClassId;
    }
    return null;
  }, [currentUser]);

  // ✅ Manual load function with Toast notifications
  const handleLoadData = async () => {
    if (!selectedClassId || !currentUser) {
      warning("សូមជ្រើសរើសថ្នាក់សិន");
      return;
    }

    setLoading(true);
    setError(null);
    setGridData(null);

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📥 FETCHING GRID DATA");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 Request Info:", {
        classId: selectedClassId,
        month: selectedMonth,
        year: selectedYear,
        teacherHomeroomClassId,
      });
      console.log("👤 Current User Info:", {
        role: currentUser.role,
        email: currentUser.email,
        phone: currentUser.phone,
        hasTeacherData: !!currentUser.teacher,
      });

      if (currentUser.role === "TEACHER") {
        console.log("👨‍🏫 Teacher Details:", {
          teacherId: currentUser.teacher?.id,
          homeroomClassId: currentUser.teacher?.homeroomClassId,
          homeroomClassName: currentUser.teacher?.homeroomClass?.name,
          subjectTeachers: currentUser.teacher?.subjectTeachers,
          teacherClassesCount: currentUser.teacher?.teacherClasses?.length,
          subjectTeachersCount: currentUser.teacher?.subjectTeachers?.length,
        });

        console.log("📋 Teacher Subject CODES:");
        currentUser.teacher?.subjectTeachers?.forEach(
          (st: any, index: number) => {
            console.log(
              `  ${index + 1}. Code: ${st.subject?.code} → Base: ${
                st.subject?.code?.split("-")[0]
              }`,
              {
                subjectName: st.subject?.nameKh || st.subject?.name,
                fullCode: st.subject?.code,
              }
            );
          }
        );
      }

      console.log("🔍 teacherEditableSubjects Set (by CODE):", {
        size: teacherEditableSubjects.size,
        values: Array.from(teacherEditableSubjects),
      });

      const data = await gradeApi.getGradesGrid(
        selectedClassId,
        selectedMonth,
        selectedYear
      );

      console.log("✅ Grid data received from API:", {
        className: data.className,
        subjectCount: data.subjects?.length,
      });

      console.log("📚 Subjects from API:");
      data.subjects?.forEach((subject, index) => {
        console.log(`  ${index + 1}. ${subject.nameKh || subject.name}`, {
          code: subject.code,
          baseCode: subject.code?.split("-")[0],
        });
      });

      // ✅ Mark subjects as editable based on role
      if (currentUser.role === "ADMIN") {
        console.log("🔓 ADMIN MODE: Marking all subjects as editable");

        data.subjects = data.subjects.map((subject) => ({
          ...subject,
          isEditable: true,
        }));

        console.log("✅ All subjects marked as editable for admin");
      } else if (currentUser.role === "TEACHER") {
        console.log("👨‍🏫 TEACHER MODE: Checking subject permissions by CODE");

        // ✅ NEW: Check if this is the teacher's homeroom class
        const isHomeroomClass = teacherHomeroomClassId === selectedClassId;

        console.log("🏠 Homeroom Check:", {
          teacherHomeroomClassId,
          selectedClassId,
          isHomeroomClass: isHomeroomClass ? "✅ YES - INSTRUCTOR" : "❌ NO",
        });

        data.subjects = data.subjects.map((subject) => {
          // ✅ Extract base code and compare by CODE not ID
          const baseCode = subject.code?.split("-")[0];

          // ✅ NEW: If homeroom class (INSTRUCTOR), all subjects editable
          // Otherwise, only assigned subjects editable
          const isEditable = isHomeroomClass
            ? true // INSTRUCTOR can edit all subjects
            : baseCode
            ? teacherEditableSubjects.has(baseCode)
            : false;

          console.log(`  Checking ${subject.nameKh}: `, {
            subjectCode: subject.code,
            baseCode: baseCode,
            isHomeroomClass,
            inAssignedSubjects: baseCode
              ? teacherEditableSubjects.has(baseCode)
              : false,
            finalIsEditable: isEditable,
            reason: isHomeroomClass
              ? "🏠 HOMEROOM INSTRUCTOR"
              : isEditable
              ? "📚 ASSIGNED SUBJECT"
              : "🚫 NOT ASSIGNED",
          });

          return {
            ...subject,
            isEditable,
          };
        });

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 FINAL SUBJECT PERMISSIONS:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(
          `🏠 Homeroom Class: ${isHomeroomClass ? "✅ YES" : "❌ NO"}`
        );
        console.log(
          `📚 Assigned Subjects: ${Array.from(teacherEditableSubjects).join(
            ", "
          )}`
        );
        console.log("");
        data.subjects.forEach((s, index) => {
          const baseCode = s.code?.split("-")[0];
          console.log(`  ${index + 1}. ${s.nameKh}:`, {
            code: s.code,
            baseCode: baseCode,
            isEditable: s.isEditable ? "✅ EDITABLE" : "❌ VIEW-ONLY",
          });
        });

        const editableCount = data.subjects.filter((s) => s.isEditable).length;
        const viewOnlyCount = data.subjects.length - editableCount;

        console.log("");
        console.log("📈 Summary:", {
          total: data.subjects.length,
          editable: editableCount,
          viewOnly: viewOnlyCount,
          mode: isHomeroomClass
            ? "🏠 HOMEROOM INSTRUCTOR"
            : "📚 SUBJECT TEACHER",
        });
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }

      // ✅ Final verification by CODE
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 FINAL VERIFICATION (by CODE):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(
        "Teacher can edit (codes):",
        Array.from(teacherEditableSubjects)
      );
      console.log("\nGrid subjects:");
      data.subjects.forEach((subject, i) => {
        const baseCode = subject.code?.split("-")[0];
        const match = baseCode ? teacherEditableSubjects.has(baseCode) : false;
        console.log(`${i + 1}. ${subject.nameKh}`, {
          code: subject.code,
          baseCode: baseCode,
          isEditable: subject.isEditable,
          matchesTeacherSet: match,
        });
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      setGridData(data);

      // ✅ Show success toast
      success(
        `ផ្ទុកទិន្នន័យបានជោគជ័យ • ${
          data.subjects?.length || 0
        } មុខវិជ្ជា • ${data.students?.length || 0} សិស្ស`
      );

      console.log("✅ Data loaded successfully!");
    } catch (err: any) {
      console.error("❌ Error fetching grid data:", err);

      // ✅ Show error toast
      showError(`មានបញ្ហាក្នុងការទាញយកទិន្នន័យ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle save grades with silent auto-save
  const handleSaveGrades = async (
    grades: BulkSaveGradeItem[],
    isAutoSave: boolean = false
  ) => {
    try {
      if (grades.length === 0) {
        if (!isAutoSave) {
          warning("សូមបញ្ចូលពិន្ទុយ៉ាងហោចណាស់មួយ");
        }
        return;
      }

      console.log(
        `💾 Saving ${grades.length} grades${
          isAutoSave ? " (AUTO-SAVE - SILENT)" : " (MANUAL)"
        }`
      );

      const result = await gradeApi.bulkSaveGrades(
        selectedClassId,
        selectedMonth,
        selectedYear,
        grades
      );

      // ✅ Safe access to result properties with fallback
      const savedCount = result?.savedCount ?? result?.saved ?? grades.length;
      const errorCount = result?.errorCount ?? result?.errors ?? 0;

      console.log(`✅ Save result: ${savedCount} saved, ${errorCount} errors`);

      // ✅ Only show toast for MANUAL saves (not auto-save)
      if (!isAutoSave) {
        if (errorCount > 0) {
          warning(`រក្សាទុក ${savedCount} ជោគជ័យ, ${errorCount} មានកំហុស`);
        } else {
          success(`រក្សាទុកបានជោគជ័យ ${savedCount} ពិន្ទុ`);
        }
      } else {
        // Silent auto-save (no toast, just console log)
        console.log(`🔇 Auto-saved ${savedCount} grades silently (no toast)`);
      }
    } catch (err: any) {
      console.error(`❌ Save failed (isAutoSave:  ${isAutoSave}):`, err);

      // ✅ Only show error toast for MANUAL saves
      if (!isAutoSave) {
        showError(
          `មានបញ្ហាក្នុងការរក្សាទុក: ${err.message || "Unknown error"}`
        );
        throw err;
      } else {
        // Silent fail for auto-save
        console.error("🔇 Auto-save failed silently (no toast shown)");
      }
    }
  };

  // ✅ Count editable vs view-only subjects
  const subjectStats = useMemo(() => {
    if (!gridData) return null;
    if (!currentUser) return null;
    if (currentUser.role === "ADMIN") return null;

    const editable = gridData.subjects?.filter((s) => s.isEditable).length || 0;
    const viewOnly = (gridData.subjects?.length || 0) - editable;

    return { editable, viewOnly, total: gridData.subjects?.length || 0 };
  }, [gridData, currentUser]);

  // Show loading while auth is checking
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
    ? [{ value: "", label: "កំពុងផ្ទុក... - Loading..." }]
    : [
        { value: "", label: "ជ្រើសរើសថ្នាក់" },
        ...availableClasses.map((c) => ({ value: c.id, label: c.name })),
      ];

  const monthOptions = MONTHS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const yearOptions = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            {/* ✅ TEACHER INFO BOX */}
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
                        <p>
                          <strong>មុខវិជ្ជា:</strong>{" "}
                          {currentUser.teacher?.subjectTeachers?.length || 0}{" "}
                          មុខ
                        </p>
                      </div>
                      <div>
                        {currentUser.teacher?.homeroomClass && (
                          <p>
                            <strong>ថ្នាក់ប្រចាំ:</strong>{" "}
                            {currentUser.teacher.homeroomClass.name}
                          </p>
                        )}
                        {subjectStats && (
                          <p className="mt-1">
                            <Eye className="w-3 h-3 inline mr-1" />
                            <strong>មើលបាន:</strong> {subjectStats.total} មុខ •{" "}
                            <strong className="text-green-700">កែបាន:</strong>{" "}
                            {subjectStats.editable} មុខ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ CLEAN PROFESSIONAL HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    បញ្ចូលពិន្ទុប្រចាំខែ
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    រក្សាទុកស្វ័យប្រវត្តិ • គណនាលទ្ធផលភ្លាមៗ
                  </p>
                </div>
                {/* ✅ Legend for teachers */}
                {currentUser.role === "TEACHER" && gridData && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="font-semibold text-green-800">
                        អាចកែបាន
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <Lock className="w-3 h-3 text-gray-500" />
                      <span className="font-semibold text-gray-600">
                        មើលប៉ុណ្ណោះ
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ CLEAN FILTERS WITH EQUAL HEIGHT */}
              <div className="grid grid-cols-1 md: grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ថ្នាក់
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    disabled={isLoadingClasses}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      setSelectedMonth(e.target.value);
                      setGridData(null);
                      setError(null);
                    }}
                    className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                      setSelectedYear(parseInt(e.target.value));
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
                    className="w-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
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
              </div>
            </div>

            {/* Error Message */}
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
              <GradeGridEditor
                gridData={gridData}
                onSave={handleSaveGrades}
                isLoading={loading}
                currentUser={currentUser}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {selectedClassId
                      ? "សូមចុច 'ផ្ទុកទិន្នន័យ' ដើម្បីចាប់ផ្តើម"
                      : "សូមជ្រើសរើសថ្នាក់ សិនទើបចុច 'ផ្ទុកទិន្នន័យ'"}
                  </p>
                  {selectedClassId && (
                    <p className="text-xs text-gray-500">
                      ថ្នាក់:{" "}
                      {
                        classOptions.find((c) => c.value === selectedClassId)
                          ?.label
                      }{" "}
                      • ខែ: {selectedMonth} • ឆ្នាំ: {selectedYear}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Shield,
  RefreshCw,
  Share2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { gradeApi, type GradeGridData } from "@/lib/api/grades";
import {
  getCurrentAcademicYear,
  getAcademicYearOptions,
} from "@/utils/academicYear";
import ScoreReportTemplate from "./ScoreReportTemplate";

interface Subject {
  id: string;
  nameKh: string;
  nameEn: string;
  code: string;
  maxScore: number;
  coefficient: number;
  isEditable?: boolean;
}

interface StudentGrade {
  studentId: string;
  khmerName: string;
  firstName: string;
  lastName: string;
  gender: string;
  rollNumber?: number;
  score: number | null;
  maxScore: number;
}

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

// Get current Khmer month
const getCurrentKhmerMonth = () => {
  const monthNumber = new Date().getMonth() + 1; // 1-12
  const month = MONTHS.find((m) => m.number === monthNumber);
  return month?.value || "មករា";
};

interface MobileGradeEntryProps {
  classId?: string;
  month?: string;
  year?: number;
}

export default function MobileGradeEntry({
  classId: propClassId,
  month: propMonth,
  year: propYear,
}: MobileGradeEntryProps = {}) {
  const { classes, isLoadingClasses, refreshClasses } = useData();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  // ✅ Read classId from URL params or props
  const urlClassId = searchParams?.get("classId");
  const initialClassId = urlClassId || propClassId || "";

  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [selectedMonth, setSelectedMonth] = useState(
    propMonth || getCurrentKhmerMonth()
  ); // ✅ Auto-select current month
  const [selectedYear, setSelectedYear] = useState(
    propYear || getCurrentAcademicYear()
  );
  const [selectedSubject, setSelectedSubject] = useState("");

  const [gridData, setGridData] = useState<GradeGridData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentGrade[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Auto-save state
  const [savingStudents, setSavingStudents] = useState<Set<string>>(new Set());
  const [savedStudents, setSavedStudents] = useState<Set<string>>(new Set());
  const saveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // ✅ FIX: Add queue for batch saves to prevent concurrent API calls
  const saveQueueRef = useRef<Map<string, number | null>>(new Map());
  const batchSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBatchSavingRef = useRef(false);

  // ✅ NEW: Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);
  const [verificationDiscrepancies, setVerificationDiscrepancies] = useState<
    Set<string>
  >(new Set());
  const [incompleteScores, setIncompleteScores] = useState<Set<string>>(
    new Set()
  );
  const [incompleteCount, setIncompleteCount] = useState(0);

  // ✅ NEW: Confirmation state
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);

  // ✅ NEW: Export state
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportReportRef = useRef<HTMLDivElement>(null);

  // ✅ Load classes if empty
  useEffect(() => {
    if (classes.length === 0 && !isLoadingClasses) {
      refreshClasses();
    }
  }, [classes.length, isLoadingClasses, refreshClasses]);

  // ✅ Auto-load data when class is pre-selected from URL/props
  useEffect(() => {
    if (
      initialClassId &&
      classes.length > 0 &&
      !dataLoaded &&
      !loading &&
      currentUser
    ) {
      handleLoadData();
    }
  }, [initialClassId, classes.length, currentUser]);

  const availableClasses = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === "ADMIN") {
      return classes;
    }

    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();

      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
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

  const teacherEditableSubjects = useMemo(() => {
    if (!currentUser) return new Set<string>();
    if (currentUser.role === "ADMIN") return new Set<string>();

    if (currentUser.role === "TEACHER") {
      const subjectTeachers = currentUser.teacher?.subjectTeachers || [];
      const subjectCodes = subjectTeachers
        .map((st: any) => {
          const code = st.subject?.code;
          return code ? code.split("-")[0] : null;
        })
        .filter((code): code is string => code !== null);

      return new Set(subjectCodes);
    }

    return new Set<string>();
  }, [currentUser]);

  const teacherHomeroomClassId = useMemo(() => {
    if (currentUser?.role === "TEACHER") {
      return currentUser.teacher?.homeroomClassId || null;
    }
    return null;
  }, [currentUser]);

  // ✅ Calculate current subject early for export functions
  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubject);
  }, [subjects, selectedSubject]);

  const handleLoadData = async () => {
    if (!selectedClass || !currentUser) {
      alert("សូមជ្រើសរើសថ្នាក់សិន • Please select a class first");
      return;
    }

    setLoading(true);
    setError(null);
    setGridData(null);
    setSubjects([]);
    setStudents([]);
    setSelectedSubject("");
    setDataLoaded(false);
    setSavedStudents(new Set());
    setSavingStudents(new Set());
    // ✅ Reset confirmation when loading new data
    setIsConfirmed(false);
    setConfirmedAt(null);

    try {
      const data = await gradeApi.getGradesGrid(
        selectedClass,
        selectedMonth,
        selectedYear
      );

      if (currentUser.role === "ADMIN") {
        data.subjects = data.subjects.map((subject) => ({
          ...subject,
          isEditable: true,
        }));
      } else if (currentUser.role === "TEACHER") {
        const isHomeroomClass = teacherHomeroomClassId === selectedClass;

        data.subjects = data.subjects.map((subject) => {
          const baseCode = subject.code?.split("-")[0];
          const isEditable = isHomeroomClass
            ? true
            : baseCode
            ? teacherEditableSubjects.has(baseCode)
            : false;

          return {
            ...subject,
            isEditable,
          };
        });
      }

      const editableSubjects = data.subjects.filter((s) => s.isEditable);

      if (editableSubjects.length === 0) {
        setError(
          "អ្នកមិនមានសិទ្ធិបញ្ចូលពិន្ទុសម្រាប់ថ្នាក់នេះទេ • You don't have permission to enter grades for this class"
        );
        setLoading(false);
        return;
      }

      setGridData(data);
      setSubjects(editableSubjects);
      setDataLoaded(true);

      if (editableSubjects.length === 1) {
        setSelectedSubject(editableSubjects[0].id);
      }
    } catch (err: any) {
      console.error("Error loading grades:", err);
      setError(err.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gridData || !selectedSubject) {
      setStudents([]);
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return;

    const studentGrades: StudentGrade[] = gridData.students.map((student) => {
      const gradeData = student.grades[selectedSubject];
      return {
        studentId: student.studentId,
        khmerName: student.studentName,
        firstName: "",
        lastName: "",
        gender: student.gender,
        rollNumber: undefined,
        score:
          gradeData?.score !== undefined && gradeData?.score !== null
            ? gradeData.score
            : null,
        maxScore: subject.maxScore,
      };
    });

    setStudents(studentGrades);
  }, [gridData, selectedSubject, subjects]);

  // ✅ FIX: Batch save function to save multiple students at once
  const executeBatchSave = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return;
    if (isBatchSavingRef.current) return;
    if (saveQueueRef.current.size === 0) return;

    // ✅ Snapshot the queue
    const studentsToSave = new Map(saveQueueRef.current);
    saveQueueRef.current.clear();

    isBatchSavingRef.current = true;

    // Mark all as saving
    setSavingStudents((prev) => new Set([...prev, ...studentsToSave.keys()]));

    try {
      const gradesToSave = Array.from(studentsToSave.entries()).map(
        ([studentId, score]) => ({
          studentId,
          subjectId: selectedSubject,
          score: score!,
        })
      );

      await gradeApi.bulkSaveGrades(
        selectedClass,
        selectedMonth,
        selectedYear,
        gradesToSave
      );

      // Remove from saving state
      setSavingStudents((prev) => {
        const next = new Set(prev);
        studentsToSave.forEach((_, studentId) => next.delete(studentId));
        return next;
      });

      // Add to saved state
      setSavedStudents((prev) => new Set([...prev, ...studentsToSave.keys()]));

      // Clear saved indicators after 2 seconds
      setTimeout(() => {
        setSavedStudents((prev) => {
          const next = new Set(prev);
          studentsToSave.forEach((_, studentId) => next.delete(studentId));
          return next;
        });
      }, 2000);
    } catch (error: any) {
      setSavingStudents((prev) => {
        const next = new Set(prev);
        studentsToSave.forEach((_, studentId) => next.delete(studentId));
        return next;
      });
      alert(`មានបញ្ហា: ${error.message}`);
    } finally {
      isBatchSavingRef.current = false;

      // ✅ If more changes were queued during save, trigger another batch
      if (saveQueueRef.current.size > 0) {
        batchSaveTimeoutRef.current = setTimeout(executeBatchSave, 500);
      }
    }
  }, [selectedClass, selectedSubject, selectedMonth, selectedYear]);

  // ✅ Auto-save function - now queues for batch save
  const autoSaveScore = useCallback(
    (studentId: string, score: number | null) => {
      if (!selectedClass || !selectedSubject) return;

      // ✅ Add to batch queue
      saveQueueRef.current.set(studentId, score);

      // ✅ Clear existing batch timeout
      if (batchSaveTimeoutRef.current) {
        clearTimeout(batchSaveTimeoutRef.current);
      }

      // ✅ Schedule batch save after 3 seconds of inactivity (increased from 1s to prevent partial saves)
      batchSaveTimeoutRef.current = setTimeout(executeBatchSave, 3000);
    },
    [selectedClass, selectedSubject, executeBatchSave]
  );

  // ✅ Handle score change with auto-save
  const handleScoreChange = useCallback(
    (studentId: string, value: string, maxScore: number) => {
      const score = value === "" ? null : parseFloat(value);

      if (score !== null && score > maxScore) {
        return;
      }

      // Update local state immediately
      setStudents((prev) =>
        prev.map((student) =>
          student.studentId === studentId ? { ...student, score } : student
        )
      );

      // ✅ Reset confirmation when scores change
      setIsConfirmed(false);
      setConfirmedAt(null);

      // ✅ FIX: Remove per-student timeout, use batch queue instead
      if (score !== null) {
        autoSaveScore(studentId, score);
      }
    },
    [autoSaveScore]
  );

  // ✅ Handle blur - trigger immediate save when user leaves input
  const handleBlur = useCallback(
    (studentId: string) => {
      if (saveQueueRef.current.has(studentId)) {
        // Cancel pending timeout and save immediately
        if (batchSaveTimeoutRef.current) {
          clearTimeout(batchSaveTimeoutRef.current);
        }
        executeBatchSave();
      }
    },
    [executeBatchSave]
  );

  // ✅ NEW: Verify scores - reload from database and compare
  const handleVerifyScores = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !gridData) {
      return;
    }

    setIsVerifying(true);
    setVerificationDiscrepancies(new Set());
    setIncompleteScores(new Set());
    setIncompleteCount(0);

    try {
      // Force save any pending changes first
      if (saveQueueRef.current.size > 0) {
        if (batchSaveTimeoutRef.current) {
          clearTimeout(batchSaveTimeoutRef.current);
        }
        await executeBatchSave();
        // Wait a bit for the save to complete
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Reload fresh data from database
      const freshData = await gradeApi.getGradesGrid(
        selectedClass,
        selectedMonth,
        selectedYear
      );

      const discrepancies = new Set<string>();
      const incomplete = new Set<string>();
      let incompleteCounter = 0;

      // Compare fresh data with current state
      students.forEach((currentStudent) => {
        const freshStudent = freshData.students.find(
          (s) => s.studentId === currentStudent.studentId
        );

        if (freshStudent) {
          const freshGrade = freshStudent.grades[selectedSubject];
          const freshScore =
            freshGrade?.score !== undefined && freshGrade?.score !== null
              ? freshGrade.score
              : null;

          // Check if there's a discrepancy
          if (freshScore !== currentStudent.score) {
            discrepancies.add(currentStudent.studentId);
          }

          // ✅ NEW: Check for blank/incomplete scores (null, but not 0)
          if (freshScore === null) {
            incomplete.add(currentStudent.studentId);
            incompleteCounter++;
          }
        }
      });

      // Update students with fresh database values
      const subject = subjects.find((s) => s.id === selectedSubject);
      if (subject) {
        const verifiedStudents: StudentGrade[] = freshData.students.map(
          (student) => {
            const gradeData = student.grades[selectedSubject];
            return {
              studentId: student.studentId,
              khmerName: student.studentName,
              firstName: "",
              lastName: "",
              gender: student.gender,
              rollNumber: undefined,
              score:
                gradeData?.score !== undefined && gradeData?.score !== null
                  ? gradeData.score
                  : null,
              maxScore: subject.maxScore,
            };
          }
        );

        setStudents(verifiedStudents);
        setVerificationDiscrepancies(discrepancies);
        setIncompleteScores(incomplete);
        setIncompleteCount(incompleteCounter);
        setVerifiedAt(new Date());

        // Clear indicators after 5 seconds
        setTimeout(() => {
          setVerificationDiscrepancies(new Set());
          setIncompleteScores(new Set());
        }, 5000);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      alert(`មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  }, [
    selectedClass,
    selectedSubject,
    selectedMonth,
    selectedYear,
    gridData,
    students,
    subjects,
    executeBatchSave,
  ]);

  // ✅ NEW: Handle confirmation
  const handleConfirmScores = useCallback(() => {
    // Check if there are any unsaved changes
    if (saveQueueRef.current.size > 0 || savingStudents.size > 0) {
      alert(
        "សូមរង់ចាំពិន្ទុរក្សាទុករួច • Please wait for all scores to save first"
      );
      return;
    }

    // Check if all students have scores
    const emptyScores = students.filter((s) => s.score === null);
    if (emptyScores.length > 0) {
      const proceed = confirm(
        `មានសិស្ស ${emptyScores.length} នាក់ មិនទាន់បញ្ចូលពិន្ទុ។ តើអ្នកចង់បន្តយ៉ាងណា?\n\nThere are ${emptyScores.length} students without scores. Do you want to continue anyway?`
      );
      if (!proceed) {
        return;
      }
    }

    // Mark as confirmed
    setIsConfirmed(true);
    setConfirmedAt(new Date());
    setShowReviewModal(false);

    // Show success message
    setTimeout(() => {
      alert("ពិន្ទុត្រូវបានបញ្ជាក់ ✓\nScores confirmed successfully!");
    }, 300);
  }, [students, savingStudents]);

  // ✅ NEW: Export as Image (PNG)
  const exportAsImage = useCallback(async () => {
    if (!exportReportRef.current || !currentSubject || !gridData) return;

    setIsExporting(true);
    try {
      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(exportReportRef.current, {
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("មានបញ្ហាក្នុងការបង្កើតរូបភាព • Failed to create image");
          setIsExporting(false);
          return;
        }

        const fileName = `${gridData.className}_${currentSubject.code}_${selectedMonth}_${selectedYear}.png`;

        // Try Web Share API first (best for mobile)
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            const shareData = {
              title: `${gridData.className} - ${currentSubject.nameKh}`,
              text: `ពិន្ទុ ${currentSubject.nameKh} - ${selectedMonth} ${selectedYear}`,
              files: [file],
            };

            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              setIsExporting(false);
              setShowExportOptions(false);
              return;
            }
          } catch (error: any) {
            // User cancelled or error - fall through to download
            if (error.name !== "AbortError") {
              console.log("Share failed, falling back to download");
            }
          }
        }

        // Fallback: Download image
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert("រូបភាពត្រូវបានរក្សាទុក ✓\nImage downloaded successfully!");
        setIsExporting(false);
        setShowExportOptions(false);
      }, "image/png");
    } catch (error: any) {
      console.error("Export error:", error);
      alert(`មានបញ្ហា: ${error.message}`);
      setIsExporting(false);
    }
  }, [currentSubject, gridData, selectedMonth, selectedYear]);

  // ✅ NEW: Export as PDF
  const exportAsPDF = useCallback(async () => {
    if (!exportReportRef.current || !currentSubject || !gridData) return;

    setIsExporting(true);
    try {
      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(exportReportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth;
      const height = width / ratio;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, width, height);

      const fileName = `${gridData.className}_${currentSubject.code}_${selectedMonth}_${selectedYear}.pdf`;

      // Get PDF as blob
      const pdfBlob = pdf.output("blob");

      // Try Web Share API first
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, {
            type: "application/pdf",
          });
          const shareData = {
            title: `${gridData.className} - ${currentSubject.nameKh}`,
            text: `ពិន្ទុ ${currentSubject.nameKh} - ${selectedMonth} ${selectedYear}`,
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setIsExporting(false);
            setShowExportOptions(false);
            return;
          }
        } catch (error: any) {
          // User cancelled or error - fall through to download
          if (error.name !== "AbortError") {
            console.log("Share failed, falling back to download");
          }
        }
      }

      // Fallback: Download PDF
      pdf.save(fileName);
      alert("ឯកសារ PDF ត្រូវបានរក្សាទុក ✓\nPDF downloaded successfully!");
      setIsExporting(false);
      setShowExportOptions(false);
    } catch (error: any) {
      console.error("PDF export error:", error);
      alert(`មានបញ្ហា: ${error.message}`);
      setIsExporting(false);
    }
  }, [currentSubject, gridData, selectedMonth, selectedYear]);

  // ✅ Auto-hide verification banner after 5 seconds
  useEffect(() => {
    if (verifiedAt) {
      const timer = setTimeout(() => {
        setVerifiedAt(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [verifiedAt]);

  // ✅ Auto-hide confirmation success after 5 seconds
  useEffect(() => {
    if (confirmedAt) {
      const timer = setTimeout(() => {
        setConfirmedAt(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [confirmedAt]);

  // ✅ FIX: Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      saveTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      if (batchSaveTimeoutRef.current) {
        clearTimeout(batchSaveTimeoutRef.current);
      }
    };
  }, []);

  if (authLoading) {
    return (
      <MobileLayout title="Grade Entry">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Grade Entry • បញ្ចូលពិន្ទុ">
      {/* Clean Modern Header */}
      <div className="bg-white px-5 pt-6 pb-5 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-koulen text-xl text-gray-900 leading-tight">
              បញ្ចូលពិន្ទុ
            </h1>
            <p className="font-battambang text-xs text-gray-500">
              Grade Entry System
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Modern Filter Cards */}
        <div className="space-y-3">
          {/* Class Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <label className="font-battambang text-sm font-semibold text-gray-700">
                ថ្នាក់ • Class
              </label>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setDataLoaded(false);
                setSelectedSubject("");
              }}
              disabled={isLoadingClasses}
              className="w-full h-12 px-4 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              style={{ fontSize: "16px" }}
            >
              <option value="">
                {isLoadingClasses ? "កំពុងផ្ទុក..." : "-- ជ្រើសរើសថ្នាក់ --"}
              </option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <label className="font-battambang text-sm font-semibold text-gray-700">
                ខែ និងឆ្នាំ • Month & Year
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontSize: "16px" }}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear.toString()}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setDataLoaded(false);
                }}
                className="w-full h-12 px-3 font-battambang bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontSize: "16px" }}
              >
                {getAcademicYearOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Load Button */}
          <button
            onClick={handleLoadData}
            disabled={!selectedClass || loading}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-battambang font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងផ្ទុក...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                ផ្ទុកទិន្នន័យ
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="font-battambang text-sm text-red-700 flex-1 pt-2">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Subject Selector - Modern Design */}
        {dataLoaded && subjects.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="font-battambang text-sm font-bold text-gray-800">
                  មុខវិជ្ជា • Subject
                </label>
                {subjects.length > 1 && (
                  <p className="font-battambang text-xs text-purple-600">
                    {subjects.length} មុខវិជ្ជា
                  </p>
                )}
              </div>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setIsConfirmed(false);
                setConfirmedAt(null);
              }}
              className="w-full h-13 px-4 font-battambang bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
              style={{ fontSize: "16px" }}
            >
              <option value="">-- ជ្រើសរើសមុខវិជ្ជា --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nameKh} ({subject.maxScore} ពិន្ទុ)
                </option>
              ))}
            </select>
            {currentUser?.role === "TEACHER" &&
              teacherHomeroomClassId === selectedClass && (
                <div className="mt-3 bg-green-100 border border-green-200 rounded-xl p-3">
                  <p className="font-battambang text-xs text-green-700 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded-lg flex items-center justify-center">
                      🏠
                    </div>
                    អ្នកគឺជា INSTRUCTOR - អាចបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជា
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Students List - Show ALL students */}
        {selectedSubject && students.length > 0 && currentSubject && (
          <div className="space-y-4">
            {/* Modern Stats Banner */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h1 className="font-koulen text-lg text-white leading-tight">
                          {currentSubject.nameKh}
                        </h1>
                        <p className="font-battambang text-xs text-purple-100">
                          {currentSubject.nameEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                        <p className="font-battambang text-xs text-purple-100">
                          សិស្សសរុប
                        </p>
                        <p className="font-koulen text-lg text-white">
                          {students.length}
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                        <p className="font-battambang text-xs text-purple-100">
                          ពិន្ទុអតិបរមា
                        </p>
                        <p className="font-koulen text-lg text-white">
                          {currentSubject.maxScore}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                      <CheckCircle className="w-6 h-6 text-white mx-auto mb-1" />
                      <p className="font-battambang text-xs text-purple-100 whitespace-nowrap">
                        Auto-Save
                      </p>
                      <p className="font-battambang text-[10px] text-white/90">
                        ស្វ័យប្រវត្តិ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ NEW: Warning Banner for Unconfirmed Scores */}
            {!isConfirmed && students.some((s) => s.score !== null) && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-xl p-4 border-2 border-orange-400">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-battambang text-sm font-bold mb-1">
                      ⚠️ ពិន្ទុមិនទាន់បានបញ្ជាក់
                    </p>
                    <p className="font-battambang text-xs text-orange-50 mb-3">
                      សូមពិនិត្យពិន្ទុម្តងទៀត ហើយបញ្ជាក់ថាពិន្ទុត្រឹមត្រូវ •
                      Please review and confirm all scores are correct
                    </p>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full bg-white text-orange-600 font-battambang font-bold text-sm py-3 px-4 rounded-xl hover:bg-orange-50 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      ពិនិត្យ និងបញ្ជាក់ពិន្ទុ • Review & Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NEW: Confirmation Success Banner */}
            {isConfirmed && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-4 border-2 border-green-400">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-battambang text-sm font-bold mb-0.5">
                      ✓ ពិន្ទុត្រូវបានបញ្ជាក់រួចរាល់
                    </p>
                    <p className="font-battambang text-xs text-green-50">
                      គ្រប់ពិន្ទុត្រឹមត្រូវ • All scores confirmed
                      {confirmedAt && (
                        <span className="ml-2">
                          @{" "}
                          {confirmedAt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NEW: Export Score Report Button */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-sm border-2 border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-sm font-bold text-gray-900 mb-1">
                    ចែករំលែករបាយការណ៍ពិន្ទុ
                  </p>
                  <p className="font-battambang text-xs text-gray-600 mb-3">
                    ផ្ញើរបាយការណ៍ពិន្ទុទៅសិស្សដើម្បីពិនិត្យ • Share score report with
                    students to verify
                  </p>
                  <button
                    onClick={() => setShowExportOptions(true)}
                    disabled={students.filter((s) => s.score !== null).length === 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-battambang font-bold text-sm py-3 px-4 rounded-xl active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    នាំចេញ និងចែករំលែក • Export & Share
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Student Cards */}
            <div className="space-y-2.5">
              {students.map((student, index) => {
                const isSaving = savingStudents.has(student.studentId);
                const isSaved = savedStudents.has(student.studentId);
                const hasDiscrepancy = verificationDiscrepancies.has(
                  student.studentId
                );
                const isIncomplete = incompleteScores.has(student.studentId);

                return (
                  <div
                    key={student.studentId}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-4 hover:shadow-md transition-all ${
                      hasDiscrepancy
                        ? "border-orange-300 bg-orange-50 animate-pulse"
                        : isIncomplete
                        ? "border-yellow-300 bg-yellow-50 animate-pulse"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Student Number Badge */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="font-koulen text-base text-purple-700">
                          {index + 1}
                        </span>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-battambang text-sm font-semibold text-gray-900 truncate mb-0.5">
                          {student.khmerName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-battambang font-medium ${
                              student.gender === "MALE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                          </span>
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="flex-shrink-0 w-20 relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            student.score !== null
                              ? student.score.toString()
                              : ""
                          }
                          onChange={(e) =>
                            handleScoreChange(
                              student.studentId,
                              e.target.value,
                              student.maxScore
                            )
                          }
                          onBlur={() => handleBlur(student.studentId)}
                          disabled={isSaving}
                          className={`w-full h-12 px-2 text-center font-battambang border-2 rounded-xl text-base font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                            student.score === 0
                              ? "bg-red-50 border-red-300 text-red-700"
                              : "bg-purple-50 border-purple-200"
                          }`}
                          placeholder="0"
                          style={{ fontSize: "16px" }}
                        />
                        {/* Absent indicator badge */}
                        {student.score === 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight shadow-md">
                            A
                          </div>
                        )}
                      </div>

                      {/* Save Status Icon */}
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        ) : isSaved ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        ) : student.score !== null ? (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modern Info Footer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-xs text-blue-800 font-semibold mb-0.5">
                    ពិន្ទុរក្សាទុកដោយស្វ័យប្រវត្តិ
                  </p>
                  <p className="font-battambang text-[10px] text-blue-600">
                    Scores automatically save after typing
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Empty State */}
        {!dataLoaded && !loading && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl shadow-sm border border-gray-200 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full opacity-30 blur-2xl"></div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <p className="font-battambang text-sm text-gray-700 mb-2 font-semibold">
                សូមជ្រើសរើសថ្នាក់ ខែ និងឆ្នាំ
              </p>
              <p className="font-battambang text-xs text-gray-500">
                ហើយចុច "ផ្ទុកទិន្នន័យ" ដើម្បីចាប់ផ្តើម
              </p>
              <p className="font-battambang text-[10px] text-gray-400 mt-1">
                Select class, month & year, then click "Load Data"
              </p>
            </div>
          </div>
        )}

        {/* ✅ NEW: Floating Action Buttons */}
        {selectedSubject && students.length > 0 && !loading && (
          <div className="fixed right-5 bottom-24 z-40 flex flex-col items-end gap-3">
            {/* Confirmation Status Badge */}
            {isConfirmed && (
              <div className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-battambang font-medium shadow-lg animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>បានបញ្ជាក់ • Confirmed</span>
                </div>
              </div>
            )}

            {/* Review & Confirm Button - Primary action when not confirmed */}
            {!isConfirmed && students.some((s) => s.score !== null) && (
              <button
                onClick={() => setShowReviewModal(true)}
                disabled={savingStudents.size > 0}
                className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-400"
              >
                <Shield className="w-7 h-7 text-white" />
                {savingStudents.size === 0 && (
                  <span className="absolute inset-0 rounded-full border-4 border-orange-400 opacity-0 animate-ping"></span>
                )}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </button>
            )}

            {/* Verify Database Button - Secondary action */}
            <button
              onClick={handleVerifyScores}
              disabled={isVerifying}
              className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                isVerifying
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"
                  : isConfirmed
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              }`}
            >
              {isVerifying ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <RefreshCw className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        )}

        {/* ✅ NEW: Verification Success Banner - All complete and correct */}
        {verifiedAt &&
          verificationDiscrepancies.size === 0 &&
          incompleteCount === 0 && (
            <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-battambang text-sm font-bold mb-0.5">
                      ពិន្ទុត្រូវបានផ្ទៀងផ្ទាត់ ✓
                    </p>
                    <p className="font-battambang text-xs text-green-50">
                      គ្រប់ពិន្ទុត្រឹមត្រូវនៅក្នុងមូលដ្ឋានទិន្នន័យ • All scores
                      verified in database
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ✅ NEW: Discrepancy Warning Banner */}
        {verificationDiscrepancies.size > 0 && (
          <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-sm font-bold mb-0.5">
                    រកឃើញភាពខុសគ្នា {verificationDiscrepancies.size} ពិន្ទុ
                  </p>
                  <p className="font-battambang text-xs text-orange-50">
                    ពិន្ទុបានធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ • Scores updated
                    automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Incomplete Scores Warning Banner */}
        {incompleteCount > 0 && verificationDiscrepancies.size === 0 && (
          <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-sm font-bold mb-0.5">
                    មានសិស្ស {incompleteCount} នាក់ មិនទាន់បញ្ចូលពិន្ទុ
                  </p>
                  <p className="font-battambang text-xs text-yellow-50">
                    សូមបញ្ចូលពិន្ទុឱ្យគ្រប់សិស្ស • Please fill all student
                    scores
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Combined Warning - Both incomplete and discrepancies */}
        {incompleteCount > 0 && verificationDiscrepancies.size > 0 && (
          <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top duration-500 space-y-2">
            {/* Discrepancy Warning */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-2xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-xs font-bold">
                    រកឃើញភាពខុសគ្នា {verificationDiscrepancies.size} ពិន្ទុ
                  </p>
                  <p className="font-battambang text-[10px] text-orange-50">
                    ពិន្ទុបានធ្វើបច្ចុប្បន្នភាព
                  </p>
                </div>
              </div>
            </div>
            {/* Incomplete Warning */}
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl shadow-2xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-xs font-bold">
                    មានសិស្ស {incompleteCount} នាក់ មិនទាន់បញ្ចូលពិន្ទុ
                  </p>
                  <p className="font-battambang text-[10px] text-yellow-50">
                    សូមបញ្ចូលពិន្ទុឱ្យគ្រប់សិស្ស
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Export Options Modal */}
        {showExportOptions && currentSubject && gridData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 sm:rounded-t-3xl rounded-t-3xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-koulen text-xl text-white">
                        នាំចេញរបាយការណ៍
                      </h2>
                      <p className="font-battambang text-xs text-blue-100">
                        Export Score Report
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExportOptions(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <span className="text-white text-2xl leading-none">×</span>
                  </button>
                </div>
              </div>

              {/* Export Options */}
              <div className="p-6 space-y-3">
                <div className="mb-4">
                  <p className="font-battambang text-sm text-gray-700 mb-1">
                    <strong>{gridData.className}</strong> - {currentSubject.nameKh}
                  </p>
                  <p className="font-battambang text-xs text-gray-500">
                    {selectedMonth} {selectedYear} • {students.length} សិស្ស
                  </p>
                </div>

                {/* Image Export Button */}
                <button
                  onClick={exportAsImage}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl p-4 shadow-lg active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      {isExporting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-battambang font-bold text-base mb-0.5">
                        នាំចេញជារូបភាព (PNG)
                      </p>
                      <p className="font-battambang text-xs text-purple-100">
                        ល្អសម្រាប់ WhatsApp, Telegram • Best for messaging apps
                      </p>
                    </div>
                  </div>
                </button>

                {/* PDF Export Button */}
                <button
                  onClick={exportAsPDF}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl p-4 shadow-lg active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      {isExporting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-battambang font-bold text-base mb-0.5">
                        នាំចេញជា PDF
                      </p>
                      <p className="font-battambang text-xs text-orange-100">
                        ល្អសម្រាប់បោះពុម្ព • Best for printing & archiving
                      </p>
                    </div>
                  </div>
                </button>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
                  <p className="font-battambang text-xs text-blue-800">
                    💡 ជម្រើសសម្រាប់ចែករំលែក៖ ប្រើរូបភាព (PNG) សម្រាប់ផ្ញើតាម
                    messaging apps ឬ PDF សម្រាប់រក្សាទុក
                  </p>
                  <p className="font-battambang text-[10px] text-blue-600 mt-1">
                    Tip: Use PNG for quick sharing, PDF for formal records
                  </p>
                </div>

                {/* Cancel Button */}
                <button
                  onClick={() => setShowExportOptions(false)}
                  disabled={isExporting}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-battambang font-semibold text-sm py-3 px-6 rounded-xl active:scale-[0.98] transition-all"
                >
                  បោះបង់ • Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Review & Confirm Modal */}
        {showReviewModal && currentSubject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:rounded-t-3xl rounded-t-3xl flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-koulen text-xl text-white">
                        ពិនិត្យពិន្ទុ
                      </h2>
                      <p className="font-battambang text-xs text-purple-100">
                        Review & Confirm Scores
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <span className="text-white text-2xl leading-none">×</span>
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="font-koulen text-2xl text-white">
                      {students.length}
                    </p>
                    <p className="font-battambang text-xs text-purple-100">
                      សិស្សសរុប
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="font-koulen text-2xl text-white">
                      {students.filter((s) => s.score !== null).length}
                    </p>
                    <p className="font-battambang text-xs text-purple-100">
                      បានបញ្ចូល
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="font-koulen text-2xl text-white">
                      {students.filter((s) => s.score === null).length}
                    </p>
                    <p className="font-battambang text-xs text-purple-100">
                      មិនទាន់
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Student List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="mb-2">
                  <p className="font-battambang text-sm font-bold text-gray-700 mb-1">
                    {currentSubject.nameKh} • Max: {currentSubject.maxScore}{" "}
                    ពិន្ទុ
                  </p>
                  <p className="font-battambang text-xs text-gray-500">
                    សូមពិនិត្យពិន្ទុនីមួយៗឱ្យបានត្រឹមត្រូវ
                  </p>
                </div>

                {students.map((student, index) => {
                  const isEmpty = student.score === null;
                  const isZero = student.score === 0;
                  const isLow =
                    student.score !== null &&
                    student.score > 0 &&
                    student.score < currentSubject.maxScore * 0.3;
                  const isPerfect = student.score === currentSubject.maxScore;

                  return (
                    <div
                      key={student.studentId}
                      className={`rounded-xl p-3 border-2 ${
                        isEmpty
                          ? "bg-yellow-50 border-yellow-300"
                          : isZero
                          ? "bg-red-50 border-red-300"
                          : isLow
                          ? "bg-orange-50 border-orange-200"
                          : isPerfect
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="font-koulen text-sm text-purple-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-battambang text-sm font-semibold text-gray-900 truncate">
                            {student.khmerName}
                          </p>
                          <p className="font-battambang text-xs text-gray-500">
                            {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {isEmpty ? (
                            <div className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg">
                              <p className="font-battambang text-xs font-bold">
                                ទទេ
                              </p>
                            </div>
                          ) : (
                            <>
                              <p
                                className={`font-koulen text-2xl ${
                                  isZero
                                    ? "text-red-600"
                                    : isLow
                                    ? "text-orange-600"
                                    : isPerfect
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.score}
                              </p>
                              <p className="font-battambang text-[10px] text-gray-500">
                                /{currentSubject.maxScore}
                              </p>
                            </>
                          )}
                        </div>
                        {isZero && (
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                            A
                          </div>
                        )}
                        {isPerfect && (
                          <div className="text-green-500 text-xl">🌟</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warning if incomplete */}
              {students.filter((s) => s.score === null).length > 0 && (
                <div className="px-4 pb-2">
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3">
                    <p className="font-battambang text-xs text-yellow-800">
                      ⚠️ មានសិស្ស{" "}
                      {students.filter((s) => s.score === null).length}{" "}
                      នាក់មិនទាន់បញ្ចូលពិន្ទុ
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
                <button
                  onClick={handleConfirmScores}
                  disabled={savingStudents.size > 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-battambang font-bold text-base py-4 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {savingStudents.size > 0 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      រង់ចាំ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      បញ្ជាក់ថាពិន្ទុត្រឹមត្រូវ • Confirm All Scores
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-battambang font-semibold text-sm py-3 px-6 rounded-xl active:scale-[0.98] transition-all"
                >
                  ត្រឡប់ទៅកែសម្រួល • Back to Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Hidden Score Report Template for Export */}
        {currentSubject && gridData && (
          <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
            <ScoreReportTemplate
              exportRef={exportReportRef}
              className={gridData.className}
              subjectName={currentSubject.nameKh}
              subjectCode={currentSubject.code}
              maxScore={currentSubject.maxScore}
              month={selectedMonth}
              year={selectedYear}
              students={students.map((s) => ({
                studentId: s.studentId,
                khmerName: s.khmerName,
                gender: s.gender,
                score: s.score,
              }))}
              teacherName={
                currentUser?.role === "TEACHER"
                  ? `${currentUser?.teacher?.firstName || ""} ${
                      currentUser?.teacher?.lastName || ""
                    }`.trim() || "N/A"
                  : currentUser?.role === "ADMIN"
                  ? "Administrator"
                  : "N/A"
              }
            />
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Type Definitions
export interface StudentTrackingBookData {
  classId: string;
  className: string;
  grade: string;
  year: number;
  month: string | null;
  teacherName: string;
  subjects: Array<{
    id: string;
    nameKh: string;
    nameEn: string;
    code: string;
    maxScore: number;
    coefficient: number;
  }>;
  months: string[];
  students: Array<{
    studentId: string;
    studentName: string;
    gender: string;
    dateOfBirth: string;
    subjectScores: {
      [subjectId: string]: {
        score: number | null;
        maxScore: number;
        gradeLevel: string; // ✅ NEW
        gradeLevelKhmer: string; // ✅ NEW
        percentage: number; // ✅ NEW
      };
    };
    totalScore: string;
    averageScore: string;
    gradeLevel: string;
    gradeLevelKhmer: string;
    rank: number;
    monthsRecorded: number;
    attendance: {
      totalAbsent: number;
      permission: number;
      withoutPermission: number;
    };
  }>;
}

export interface MonthlyReportData {
  classId?: string;
  className?: string;
  grade?: string;
  classNames?: string;
  totalClasses?: number;
  teacherName?: string | null;
  month: string;
  year: number;
  totalCoefficient: number;
  subjects: Array<{
    id: string;
    nameKh: string;
    nameEn: string;
    code: string;
    maxScore: number;
    coefficient: number;
  }>;
  students: Array<{
    studentId: string;
    studentName: string;
    className?: string;
    gender: string;
    grades: { [subjectId: string]: number | null };
    totalScore: string;
    average: string;
    gradeLevel: string;
    rank: number;
    absent: number;
    permission: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiResponse<T> = await response.json();
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "Invalid API response");
  }

  return result.data;
}

export const reportsApi = {
  /**
   * Get monthly report for a specific class
   */
  async getMonthlyReport(
    classId: string,
    month: string,
    year: number
  ): Promise<MonthlyReportData> {
    try {
      const cleanMonth = month.trim();
      const url = `${API_BASE_URL}/reports/monthly/${classId}?month=${encodeURIComponent(
        cleanMonth
      )}&year=${year}`;

      console.log("📡 Fetching monthly report:", {
        classId,
        month: cleanMonth,
        year,
        url,
      });

      const response = await fetch(url);
      const data = await handleApiResponse<MonthlyReportData>(response);

      console.log("✅ Monthly report received:", data);
      return data;
    } catch (error) {
      console.error("❌ Get monthly report error:", error);
      throw error;
    }
  },

  /**
   * Get grade-wide report
   */
  async getGradeWideReport(
    grade: string,
    month: string,
    year: number
  ): Promise<MonthlyReportData> {
    try {
      const cleanMonth = month.trim();
      const url = `${API_BASE_URL}/reports/grade-wide/${grade}?month=${encodeURIComponent(
        cleanMonth
      )}&year=${year}`;

      console.log("📡 Fetching grade-wide report:", {
        grade,
        month: cleanMonth,
        year,
        url,
      });

      const response = await fetch(url);
      const data = await handleApiResponse<MonthlyReportData>(response);

      console.log("✅ Grade-wide report received:", data);
      return data;
    } catch (error) {
      console.error("❌ Get grade-wide report error:", error);
      throw error;
    }
  },

  /**
   * Get student tracking book
   */
  async getStudentTrackingBook(
    classId: string,
    year: number,
    month?: string,
    subjectId?: string
  ): Promise<StudentTrackingBookData> {
    try {
      // ✅ FIXED: Build params without spread operator
      const params = new URLSearchParams();
      params.append("year", year.toString());

      if (month) {
        params.append("month", month); // ✅ Add month to query
      }

      if (subjectId) {
        params.append("subjectId", subjectId);
      }

      const url = `${API_BASE_URL}/reports/tracking-book/${classId}?${params.toString()}`;

      console.log("📡 Fetching student tracking book:", {
        classId,
        year,
        subjectId,
        url,
      });

      const response = await fetch(url);
      const data = await handleApiResponse<StudentTrackingBookData>(response);

      console.log("✅ Student tracking book received:", data);
      return data;
    } catch (error) {
      console.error("❌ Get student tracking book error:", error);
      throw error;
    }
  },

  /**
   * Export report to Excel/CSV
   */
  exportToExcel(
    reportType: "monthly" | "grade-wide" | "tracking-book",
    reportData: any,
    filename: string
  ): void {
    try {
      let csvContent = "";
      let headers: string[] = [];
      let rows: string[][] = [];

      if (reportType === "monthly" || reportType === "grade-wide") {
        const data = reportData as MonthlyReportData;

        headers = ["ល.រ", "គោត្តនាម និងនាម", "ភេទ"];

        if (reportType === "grade-wide") {
          headers.push("ថ្នាក់");
        }

        headers.push(
          "អវត្តមាន(ច)",
          "អវត្តមាន(អ)",
          "អវត្តមានសរុប",
          "ពិន្ទុសរុប",
          "មធ្យមភាគ",
          "ចំណាត់ថ្នាក់",
          "និទ្ទេស"
        );

        rows = data.students.map((student, index) => {
          const row = [
            (index + 1).toString(),
            student.studentName,
            student.gender === "MALE" ? "ប្រុស" : "ស្រី",
          ];

          if (reportType === "grade-wide") {
            row.push(student.className || "");
          }

          row.push(
            student.permission.toString(),
            student.absent.toString(),
            (student.permission + student.absent).toString(),
            student.totalScore,
            student.average,
            student.rank.toString(),
            student.gradeLevel
          );

          return row;
        });
      } else if (reportType === "tracking-book") {
        const data = reportData as StudentTrackingBookData;

        headers = ["ល.រ", "គោត្តនាម និងនាម", "ភេទ"];

        data.subjects.forEach((s) => {
          headers.push(s.nameKh);
        });

        headers.push("ពិន្ទុសរុប", "មធ្យមភាគ", "ចំណាត់ថ្នាក់", "និទ្ទេស");

        rows = data.students.map((student, index) => {
          const subjectAverages = data.subjects.map((subject) => {
            const monthlyScores =
              student.subjectMonthlyScores[subject.id] || {};
            const scores = Object.values(monthlyScores).filter(
              (s) => s !== null
            ) as number[];
            const avg =
              scores.length > 0
                ? scores.reduce((sum, s) => sum + s, 0) / scores.length
                : 0;
            return avg > 0 ? avg.toFixed(1) : "-";
          });

          return [
            (index + 1).toString(),
            student.studentName,
            student.gender === "MALE" ? "ប្រុស" : "ស្រី",
            ...subjectAverages,
            student.totalScore,
            student.averageScore,
            student.rank.toString(),
            student.gradeLevel,
          ];
        });
      }

      // Build CSV
      csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Download
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Exported to Excel:", filename);
    } catch (error) {
      console.error("❌ Export to Excel error:", error);
      throw error;
    }
  },
};

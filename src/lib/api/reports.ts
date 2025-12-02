const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface MonthlyReportData {
  classId?: string;
  className?: string;
  grade?: string;
  classNames?: string; // ✅ For grade-wide
  totalClasses?: number; // ✅ For grade-wide
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
    className?: string; // ✅ For grade-wide
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

export const reportsApi = {
  async getMonthlyReport(
    classId: string,
    month: string,
    year: number
  ): Promise<MonthlyReportData> {
    const cleanMonth = month.trim();
    const url = `${API_BASE_URL}/reports/monthly/${classId}?month=${encodeURIComponent(
      cleanMonth
    )}&year=${year}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch monthly report");
    }

    const data = await response.json();
    return data.data;
  },

  // ✅ New: Grade-wide report
  async getGradeWideReport(
    grade: string,
    month: string,
    year: number
  ): Promise<MonthlyReportData> {
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

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API Error:", error);
      throw new Error(error.message || "Failed to fetch grade-wide report");
    }

    const data = await response.json();
    console.log("✅ Grade-wide report received:", data);
    return data.data;
  },
};

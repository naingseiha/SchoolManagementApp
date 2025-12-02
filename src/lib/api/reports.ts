const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface MonthlyReportData {
  classId: string;
  className: string;
  grade: string;
  teacherName: string | null;
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
    month: string, // ✅ Should be Khmer name: "មករា", "កុម្ភៈ", etc.
    year: number
  ): Promise<MonthlyReportData> {
    // ✅ Make sure month is Khmer name, not number
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

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API Error:", error);
      throw new Error(error.message || "Failed to fetch monthly report");
    }

    const data = await response.json();
    console.log("✅ Monthly report received:", data);
    return data.data;
  },
};

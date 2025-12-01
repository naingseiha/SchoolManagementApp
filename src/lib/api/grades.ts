import type { Grade, GradeImportResult } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface GradeFormData {
  studentId: string;
  subjectId: string;
  classId: string;
  score: number;
  maxScore: number;
  month: string;
  monthNumber: number;
  year: number;
}

export interface StudentSummary {
  id: string;
  student: {
    id: string;
    khmerName: string;
    firstName: string;
    lastName: string;
    gender: string;
  };
  totalScore: number;
  totalMaxScore: number;
  totalWeightedScore: number;
  totalCoefficient: number;
  average: number;
  classRank: number;
  gradeLevel: string;
}

export const gradeApi = {
  /**
   * Get grades by class and month
   */
  async getGradesByMonth(
    classId: string,
    month: string,
    year: number
  ): Promise<Grade[]> {
    const response = await fetch(
      `${API_BASE_URL}/grades/month/${classId}?month=${month}&year=${year}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch grades");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get monthly summary for class
   */
  async getMonthlySummary(
    classId: string,
    month: string,
    year: number
  ): Promise<StudentSummary[]> {
    const response = await fetch(
      `${API_BASE_URL}/grades/summary/${classId}?month=${month}&year=${year}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch summary");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Create or update grade
   */
  async saveGrade(gradeData: GradeFormData): Promise<Grade> {
    const response = await fetch(`${API_BASE_URL}/grades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gradeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save grade");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Import grades from Excel
   */
  async importGrades(classId: string, file: File): Promise<GradeImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/grades/import/${classId}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to import grades");
    }

    return response.json();
  },

  /**
   * Export grades to Excel (placeholder - implement on backend)
   */
  async exportGrades(
    classId: string,
    month: string,
    year: number
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/grades/export/${classId}?month=${month}&year=${year}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to export grades");
    }

    return response.blob();
  },
};

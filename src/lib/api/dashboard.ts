import { apiClient } from "./client";
import { apiCache } from "../cache";

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    studentsWithClass: number;
    teachersWithClass: number;
    activeSubjects: number;
    studentEnrollmentRate: number;
    teacherAssignmentRate: number;
  };
  recentActivity: {
    recentGradeEntries: number;
    recentAttendanceRecords: number;
  };
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
  };
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  classByGrade: Array<{
    grade: string;
    count: number;
  }>;
  topPerformingClasses: Array<{
    id: string;
    name: string;
    grade: string;
    section: string;
    averageScore: number | null;
    studentCount: number;
  }>;
}

export interface TeacherDashboard {
  teacher: {
    id: string;
    name: string;
    homeroomClass: {
      id: string;
      name: string;
      studentCount: number;
    } | null;
    totalClasses: number;
    totalStudents: number;
    subjects: Array<{
      id: string;
      name: string;
      code: string;
    }>;
  };
  recentActivity: {
    recentGradeEntries: number;
  };
}

export interface StudentDashboard {
  student: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
      grade: string;
    } | null;
    averageGrade: number;
  };
  recentGrades: Array<{
    subject: string;
    score: number | null;
    maxScore: number;
    percentage: number | null;
    month: string;
  }>;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  totalAttendanceRecords: number;
}

export const dashboardApi = {
  /**
   * Get general dashboard statistics (cached for 2 minutes)
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiCache.getOrFetch(
      "dashboard:stats",
      async () => {
        const response = await apiClient.get("/dashboard/stats");
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  /**
   * Get teacher-specific dashboard (cached for 3 minutes)
   */
  getTeacherDashboard: async (teacherId: string): Promise<TeacherDashboard> => {
    return apiCache.getOrFetch(
      `dashboard:teacher:${teacherId}`,
      async () => {
        const response = await apiClient.get(`/dashboard/teacher/${teacherId}`);
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  /**
   * Get student-specific dashboard (cached for 3 minutes)
   */
  getStudentDashboard: async (studentId: string): Promise<StudentDashboard> => {
    return apiCache.getOrFetch(
      `dashboard:student:${studentId}`,
      async () => {
        const response = await apiClient.get(`/dashboard/student/${studentId}`);
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  /**
   * Clear dashboard cache (call after data updates)
   */
  clearCache: () => {
    apiCache.delete("dashboard:stats");
    // Clear all dashboard-related caches
    console.log("🧹 Dashboard cache cleared");
  },
};

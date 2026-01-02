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
    passPercentage: number;
    failPercentage: number;
    passedCount: number;
    failedCount: number;
    totalGradesCount: number;
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

export interface GradeLevelStats {
  currentMonth: string;
  currentYear: number;
  grades: Array<{
    grade: string;
    totalStudents: number;
    totalClasses: number;
    totalSubjects: number;
    averageScore: number;
    passPercentage: number;
    passCount: number;
    failCount: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    };
    subjectCompletionPercentage: number;
    classes: Array<{
      id: string;
      name: string;
      section: string;
      studentCount: number;
      totalSubjects: number;
      completedSubjects: number;
      completionPercentage: number;
      averageScore: number;
      teacherName: string;
    }>;
  }>;
}

export interface SubjectStats {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  maxScore: number;
  coefficient: number;
  totalStudentsWithGrades: number;
  gradeDistribution: {
    A: { total: number; male: number; female: number };
    B: { total: number; male: number; female: number };
    C: { total: number; male: number; female: number };
    D: { total: number; male: number; female: number };
    E: { total: number; male: number; female: number };
    F: { total: number; male: number; female: number };
  };
}

export interface ComprehensiveStats {
  month: string;
  year: number;
  grades: Array<{
    grade: string;
    totalStudents: number;
    maleStudents: number;
    femaleStudents: number;
    totalClasses: number;
    averageScore: number;
    maleAverageScore: number;
    femaleAverageScore: number;
    passPercentage: number;
    malePassPercentage: number;
    femalePassPercentage: number;
    passedCount: number;
    passedMale: number;
    passedFemale: number;
    failedCount: number;
    failedMale: number;
    failedFemale: number;
    gradeDistribution: {
      A: { total: number; male: number; female: number };
      B: { total: number; male: number; female: number };
      C: { total: number; male: number; female: number };
      D: { total: number; male: number; female: number };
      E: { total: number; male: number; female: number };
      F: { total: number; male: number; female: number };
    };
    classes: Array<{
      id: string;
      name: string;
      section: string;
      grade: string;
      track: string | null;
      studentCount: number;
      maleCount: number;
      femaleCount: number;
      averageScore: number;
      passPercentage: number;
      malePassPercentage: number;
      femalePassPercentage: number;
      passedCount: number;
      failedCount: number;
      gradeDistribution: {
        A: { total: number; male: number; female: number };
        B: { total: number; male: number; female: number };
        C: { total: number; male: number; female: number };
        D: { total: number; male: number; female: number };
        E: { total: number; male: number; female: number };
        F: { total: number; male: number; female: number };
      };
      subjectStats: SubjectStats[];
      teacherName: string;
    }>;
  }>;
  topPerformingClasses: Array<{
    id: string;
    name: string;
    section: string;
    grade: string;
    track: string | null;
    studentCount: number;
    maleCount: number;
    femaleCount: number;
    averageScore: number;
    passPercentage: number;
    malePassPercentage: number;
    femalePassPercentage: number;
    passedCount: number;
    failedCount: number;
    gradeDistribution: {
      A: { total: number; male: number; female: number };
      B: { total: number; male: number; female: number };
      C: { total: number; male: number; female: number };
      D: { total: number; male: number; female: number };
      E: { total: number; male: number; female: number };
      F: { total: number; male: number; female: number };
    };
    subjectStats: SubjectStats[];
    teacherName: string;
  }>;
}

export const dashboardApi = {
  /**
   * Get general dashboard statistics (cached for 2 minutes)
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiCache.getOrFetch(
      "dashboard:stats",
      async () => {
        // apiClient.get already unwraps .data, so just return the response directly
        const data = await apiClient.get("/dashboard/stats");
        return data;
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
        // apiClient.get already unwraps .data, so just return the response directly
        const data = await apiClient.get(`/dashboard/teacher/${teacherId}`);
        return data;
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
        // apiClient.get already unwraps .data, so just return the response directly
        const data = await apiClient.get(`/dashboard/student/${studentId}`);
        return data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  /**
   * Get grade-level statistics (cached for 2 minutes)
   */
  getGradeLevelStats: async (): Promise<GradeLevelStats> => {
    return apiCache.getOrFetch(
      "dashboard:grade-stats",
      async () => {
        // apiClient.get already unwraps .data, so just return the response directly
        const data = await apiClient.get("/dashboard/grade-stats");
        console.log("📊 Dashboard API: Data after unwrapping:", data);
        return data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  /**
   * Get comprehensive statistics with month/year filter and gender breakdown
   * ✅ OPTIMIZED: Extended cache for mobile performance
   */
  getComprehensiveStats: async (month?: string, year?: number): Promise<ComprehensiveStats> => {
    const cacheKey = `dashboard:comprehensive-stats:${month || 'current'}:${year || 'current'}`;
    return apiCache.getOrFetch(
      cacheKey,
      async () => {
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (year) params.append('year', year.toString());

        const queryString = params.toString();
        const url = `/dashboard/comprehensive-stats${queryString ? `?${queryString}` : ''}`;

        const data = await apiClient.get(url);
        console.log("📊 Comprehensive Stats API: Data received:", data);
        return data;
      },
      5 * 60 * 1000 // ✅ Extended to 5 minutes cache for better mobile performance
    );
  },

  /**
   * Get lightweight mobile dashboard stats (super fast for initial load)
   * ✅ NEW: Optimized for mobile - loads 5x faster than comprehensive stats
   */
  getMobileStats: async (month?: string, year?: number): Promise<any> => {
    const cacheKey = `dashboard:mobile-stats:${month || 'current'}:${year || 'current'}`;
    return apiCache.getOrFetch(
      cacheKey,
      async () => {
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (year) params.append('year', year.toString());

        const queryString = params.toString();
        const url = `/dashboard/mobile-stats${queryString ? `?${queryString}` : ''}`;

        const data = await apiClient.get(url);
        console.log("📱 Mobile Stats API: Lightweight data received:", data);
        return data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  /**
   * Clear dashboard cache (call after data updates)
   */
  clearCache: () => {
    apiCache.delete("dashboard:stats");
    apiCache.delete("dashboard:grade-stats");
    // Clear all comprehensive stats caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dashboard:comprehensive-stats:') || key.startsWith('dashboard:mobile-stats:')) {
        apiCache.delete(key);
      }
    });
    console.log("🧹 Dashboard cache cleared");
  },
};

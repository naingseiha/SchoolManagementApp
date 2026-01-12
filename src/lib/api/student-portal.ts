// Student Portal API Client
import { apiClient } from "./client";

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  student: {
    id: string;
    studentId: string;
    khmerName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber?: string;
    currentAddress?: string;
    placeOfBirth?: string;
    parentPhone?: string;
    parentOccupation?: string;
    studentRole: string;
    isAccountActive: boolean;
    class?: {
      id: string;
      name: string;
      grade: string;
      section?: string;
      track?: string;
    };
  };
}

export interface Grade {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  month: string;
  monthNumber: number;
  year: number;
  subject: {
    id: string;
    name: string;
    nameKh: string;
    code: string;
    coefficient: number;
    maxScore: number;
  };
  class: {
    id: string;
    name: string;
    grade: string;
  };
}

export interface MonthlySummary {
  id: string;
  month: string;
  monthNumber: number;
  year: number;
  totalScore: number;
  totalMaxScore: number;
  average: number;
  classRank?: number;
  class: {
    id: string;
    name: string;
    grade: string;
  };
}

export interface Attendance {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "PERMISSION" | "LATE";
  session: "MORNING" | "AFTERNOON";
  remarks?: string;
  class?: {
    id: string;
    name: string;
    grade: string;
  };
}

export interface GradesResponse {
  grades: Grade[];
  summaries: MonthlySummary[];
  statistics: {
    totalGrades: number;
    averageScore: number;
  };
}

export interface AttendanceResponse {
  attendance: Attendance[];
  statistics: {
    totalDays: number;
    presentCount: number;
    absentCount: number;
    permissionCount: number;
    lateCount: number;
    attendanceRate: number;
  };
}

// Get student's own profile
export const getMyProfile = async (): Promise<StudentProfile> => {
  const response = await apiClient.get("/student-portal/profile");
  // apiClient.get already unwraps the response
  return response;
};

// Get student's own grades
export const getMyGrades = async (filters?: {
  year?: number;
  month?: string;
}): Promise<GradesResponse> => {
  const params = new URLSearchParams();
  if (filters?.year) params.append("year", filters.year.toString());
  if (filters?.month) params.append("month", filters.month);

  const response = await apiClient.get(
    `/student-portal/grades${params.toString() ? `?${params.toString()}` : ""}`
  );
  
  // The API returns { success, data: { grades, summaries, statistics } }
  // apiClient.get already unwraps to just the data object
  return response;
};

// Get student's own attendance
export const getMyAttendance = async (filters?: {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}): Promise<AttendanceResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.month) params.append("month", filters.month.toString());
  if (filters?.year) params.append("year", filters.year.toString());

  const response = await apiClient.get(
    `/student-portal/attendance${params.toString() ? `?${params.toString()}` : ""}`
  );
  
  // The API returns { success, data: { attendance, statistics } }
  // apiClient.get already unwraps to just the data object
  return response;
};

// Change password
export const changeMyPassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.post("/student-portal/change-password", data);
};

// Update profile
export const updateMyProfile = async (
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneNumber: string;
    currentAddress: string;
    placeOfBirth: string;
    parentPhone: string;
    parentOccupation: string;
  }>
): Promise<StudentProfile> => {
  const response = await apiClient.put("/student-portal/profile", data);
  // apiClient.put already unwraps the response
  return response;
};

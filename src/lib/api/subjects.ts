// Subjects API Service

import { apiClient } from "./client";

export interface Subject {
  id: string;
  name: string;
  nameKh?: string;
  nameEn?: string;
  code: string;
  description?: string;
  grade: string;
  track?: string;
  category: string;
  weeklyHours: number;
  annualHours: number;
  isActive: boolean;
  teacherAssignments?: SubjectTeacherAssignment[];
  _count?: {
    grades: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectTeacherAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subject?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectData {
  name: string;
  nameKh?: string;
  nameEn?: string;
  code: string;
  description?: string;
  grade: string;
  track?: string;
  category?: string;
  weeklyHours?: number;
  annualHours?: number;
  isActive?: boolean;
}

export interface SubjectsResponse {
  success: boolean;
  data: Subject[];
}

export interface SubjectResponse {
  success: boolean;
  data: Subject;
  message?: string;
}

export const subjectsApi = {
  async getAll(): Promise<Subject[]> {
    try {
      // ✅ Response is already the array
      const subjects = await apiClient.get<Subject[]>("/subjects");

      if (!Array.isArray(subjects)) {
        console.error("❌ Expected array but got:", typeof subjects);
        return [];
      }

      return subjects;
    } catch (error) {
      console.error("❌ subjectsApi.getAll error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Subject | null> {
    try {
      const subject = await apiClient.get<Subject>(`/subjects/${id}`);
      return subject;
    } catch (error) {
      console.error("❌ subjectsApi.getById error:", error);
      return null;
    }
  },

  async create(subject: Omit<Subject, "id">): Promise<Subject> {
    const data = await apiClient.post<Subject>("/subjects", subject);
    return data;
  },

  async update(id: string, subject: Partial<Subject>): Promise<Subject> {
    const data = await apiClient.put<Subject>(`/subjects/${id}`, subject);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  },

  async assignTeachers(
    subjectId: string,
    teacherIds: string[]
  ): Promise<Subject> {
    const data = await apiClient.post<Subject>(
      `/subjects/${subjectId}/teachers`,
      { teacherIds }
    );
    return data;
  },

  async removeTeacher(subjectId: string, teacherId: string): Promise<Subject> {
    const data = await apiClient.delete<Subject>(
      `/subjects/${subjectId}/teachers/${teacherId}`
    );
    return data;
  },
};

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
  // Get all subjects
  async getAll(params?: {
    grade?: string;
    track?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<Subject[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.grade) queryParams.append("grade", params.grade);
      if (params?.track) queryParams.append("track", params.track);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", String(params.isActive));

      const url = `/subjects${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get<SubjectsResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching subjects:", error);
      throw new Error(error.message || "Failed to fetch subjects");
    }
  },

  // Get subject by ID
  async getById(id: string): Promise<Subject> {
    try {
      const response = await apiClient.get<SubjectResponse>(`/subjects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching subject:", error);
      throw new Error(error.message || "Failed to fetch subject");
    }
  },

  // Create new subject
  async create(data: CreateSubjectData): Promise<Subject> {
    try {
      console.log("📤 Creating subject:", data);
      const response = await apiClient.post<SubjectResponse>("/subjects", data);
      console.log("✅ Subject created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating subject:", error);
      throw new Error(error.message || "Failed to create subject");
    }
  },

  // Update subject
  async update(id: string, data: Partial<CreateSubjectData>): Promise<Subject> {
    try {
      const response = await apiClient.put<SubjectResponse>(
        `/subjects/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating subject:", error);
      throw new Error(error.message || "Failed to update subject");
    }
  },

  // Delete subject
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>(
        `/subjects/${id}`
      );
    } catch (error: any) {
      console.error("❌ Error deleting subject:", error);
      throw new Error(error.message || "Failed to delete subject");
    }
  },

  // Assign teachers to subject
  async assignTeachers(subjectId: string, teacherIds: string[]): Promise<void> {
    try {
      await apiClient.post(`/subjects/${subjectId}/assign-teachers`, {
        teacherIds,
      });
    } catch (error: any) {
      console.error("❌ Error assigning teachers:", error);
      throw new Error(error.message || "Failed to assign teachers");
    }
  },

  // Remove teacher from subject
  async removeTeacher(subjectId: string, teacherId: string): Promise<void> {
    try {
      await apiClient.delete(`/subjects/${subjectId}/teachers/${teacherId}`);
    } catch (error: any) {
      console.error("❌ Error removing teacher:", error);
      throw new Error(error.message || "Failed to remove teacher");
    }
  },
};

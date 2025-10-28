// Teachers API Service

import { apiClient } from "./client";

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  employeeId?: string;
  classes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  employeeId?: string;
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
  message?: string;
}

export const teachersApi = {
  // Get all teachers
  async getAll(): Promise<Teacher[]> {
    try {
      const response = await apiClient.get<TeachersResponse>("/teachers");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching teachers:", error);
      throw new Error(error.message || "Failed to fetch teachers");
    }
  },

  // Get teacher by ID
  async getById(id: string): Promise<Teacher> {
    try {
      const response = await apiClient.get<TeacherResponse>(`/teachers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching teacher:", error);
      throw new Error(error.message || "Failed to fetch teacher");
    }
  },

  // Create new teacher
  async create(data: CreateTeacherData): Promise<Teacher> {
    try {
      console.log("📤 Creating teacher:", data);
      const response = await apiClient.post<TeacherResponse>("/teachers", data);
      console.log("✅ Teacher created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating teacher:", error);
      throw new Error(error.message || "Failed to create teacher");
    }
  },

  // Update teacher
  async update(id: string, data: Partial<CreateTeacherData>): Promise<Teacher> {
    try {
      const response = await apiClient.put<TeacherResponse>(
        `/teachers/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating teacher:", error);
      throw new Error(error.message || "Failed to update teacher");
    }
  },

  // Delete teacher
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>(
        `/teachers/${id}`
      );
    } catch (error: any) {
      console.error("❌ Error deleting teacher:", error);
      throw new Error(error.message || "Failed to delete teacher");
    }
  },
};

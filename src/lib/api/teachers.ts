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
  subjectAssignments?: any[]; // ✅ KEEP THIS
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
  async getAll(): Promise<Teacher[]> {
    try {
      // ✅ Response is already the array
      const teachers = await apiClient.get<Teacher[]>("/teachers");

      if (!Array.isArray(teachers)) {
        console.error("❌ Expected array but got:", typeof teachers);
        return [];
      }

      return teachers;
    } catch (error) {
      console.error("❌ teachersApi.getAll error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Teacher | null> {
    try {
      const teacher = await apiClient.get<Teacher>(`/teachers/${id}`);
      return teacher;
    } catch (error) {
      console.error("❌ teachersApi.getById error:", error);
      return null;
    }
  },

  async create(teacher: Omit<Teacher, "id">): Promise<Teacher> {
    const data = await apiClient.post<Teacher>("/teachers", teacher);
    return data;
  },

  async update(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
    const data = await apiClient.put<Teacher>(`/teachers/${id}`, teacher);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/teachers/${id}`);
  },
};

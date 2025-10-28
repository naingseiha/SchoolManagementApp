// Classes API Service

import { apiClient } from "./client";

export interface Class {
  id: string;
  name: string;
  grade: string;
  section?: string;
  teacherId?: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  students?: any[];
  _count?: {
    students: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassData {
  name: string;
  grade: string;
  section?: string;
  teacherId?: string;
}

export interface ClassesResponse {
  success: boolean;
  data: Class[];
}

export interface ClassResponse {
  success: boolean;
  data: Class;
  message?: string;
}

export const classesApi = {
  async getAll(): Promise<Class[]> {
    try {
      // ✅ Response is already the array
      const classes = await apiClient.get<Class[]>("/classes");

      if (!Array.isArray(classes)) {
        console.error("❌ Expected array but got:", typeof classes);
        return [];
      }

      return classes;
    } catch (error) {
      console.error("❌ classesApi.getAll error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {
      const classData = await apiClient.get<Class>(`/classes/${id}`);
      return classData;
    } catch (error) {
      console.error("❌ classesApi.getById error:", error);
      return null;
    }
  },

  async create(classData: Omit<Class, "id">): Promise<Class> {
    const data = await apiClient.post<Class>("/classes", classData);
    return data;
  },

  async update(id: string, classData: Partial<Class>): Promise<Class> {
    const data = await apiClient.put<Class>(`/classes/${id}`, classData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },

  async assignStudents(classId: string, studentIds: string[]): Promise<Class> {
    const data = await apiClient.post<Class>(`/classes/${classId}/students`, {
      studentIds,
    });
    return data;
  },

  async removeStudent(classId: string, studentId: string): Promise<Class> {
    const data = await apiClient.delete<Class>(
      `/classes/${classId}/students/${studentId}`
    );
    return data;
  },
};

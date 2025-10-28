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
  // Get all classes
  async getAll(): Promise<Class[]> {
    try {
      const response = await apiClient.get<ClassesResponse>("/classes");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching classes:", error);
      throw new Error(error.message || "Failed to fetch classes");
    }
  },

  // Get class by ID with students
  async getById(id: string): Promise<Class> {
    try {
      const response = await apiClient.get<ClassResponse>(`/classes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching class:", error);
      throw new Error(error.message || "Failed to fetch class");
    }
  },

  // Create new class
  async create(data: CreateClassData): Promise<Class> {
    try {
      const response = await apiClient.post<ClassResponse>("/classes", data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating class:", error);
      throw new Error(error.message || "Failed to create class");
    }
  },

  // Update class
  async update(id: string, data: Partial<CreateClassData>): Promise<Class> {
    try {
      const response = await apiClient.put<ClassResponse>(
        `/classes/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating class:", error);
      throw new Error(error.message || "Failed to update class");
    }
  },

  // Delete class
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>(
        `/classes/${id}`
      );
    } catch (error: any) {
      console.error("❌ Error deleting class:", error);
      throw new Error(error.message || "Failed to delete class");
    }
  },

  // Assign students to class
  async assignStudents(classId: string, studentIds: string[]): Promise<Class> {
    try {
      const response = await apiClient.post<ClassResponse>(
        `/classes/${classId}/assign-students`,
        { studentIds }
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error assigning students:", error);
      throw new Error(error.message || "Failed to assign students");
    }
  },

  // Remove student from class
  async removeStudent(classId: string, studentId: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>(
        `/classes/${classId}/students/${studentId}`
      );
    } catch (error: any) {
      console.error("❌ Error removing student:", error);
      throw new Error(error.message || "Failed to remove student");
    }
  },
};

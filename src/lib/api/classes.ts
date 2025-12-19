// Classes API Service - Connected to Backend

import { apiClient } from "./client";

export interface Class {
  id: string;
  classId?: string;
  name: string;
  grade: string;
  section?: string;
  track?: string | null; // ✅ NEW: "science" | "social" | null
  academicYear: string;
  capacity?: number;
  teacherId?: string;
  teacher?: {
    id: string;
    khmerName?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  students?: Student[];
  _count?: {
    students: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  studentId?: string;
  khmerName?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
  classId?: string;
}

export interface CreateClassData {
  classId?: string;
  name: string;
  grade: string;
  section?: string;
  track?: string | null; // ✅ NEW
  academicYear: string;
  capacity?: number;
  teacherId?: string;
}

export const classesApi = {
  /**
   * Get all classes (LIGHTWEIGHT - fast loading for dropdowns/lists)
   */
  async getAllLightweight(): Promise<Class[]> {
    try {
      console.log("⚡ Fetching classes (lightweight)...");
      const classes = await apiClient.get<Class[]>("/classes/lightweight");

      if (!Array.isArray(classes)) {
        console.error("❌ Expected array but got:", typeof classes);
        return [];
      }

      console.log(`⚡ Fetched ${classes.length} classes (lightweight)`);
      return classes;
    } catch (error) {
      console.error("❌ classesApi.getAllLightweight error:", error);
      return [];
    }
  },

  /**
   * Get all classes (FULL DATA - includes full student list)
   */
  async getAll(): Promise<Class[]> {
    try {
      console.log("📚 Fetching all classes (full data)...");
      const classes = await apiClient.get<Class[]>("/classes");

      if (!Array.isArray(classes)) {
        console.error("❌ Expected array but got:", typeof classes);
        return [];
      }

      console.log(`✅ Fetched ${classes.length} classes from database`);
      return classes;
    } catch (error) {
      console.error("❌ classesApi.getAll error:", error);
      return [];
    }
  },

  /**
   * Get class by ID
   */
  async getById(id: string): Promise<Class | null> {
    try {
      console.log(`📖 Fetching class ${id}...`);
      const classData = await apiClient.get<Class>(`/classes/${id}`);
      console.log("✅ Class fetched:", classData.name);
      return classData;
    } catch (error) {
      console.error("❌ classesApi.getById error:", error);
      return null;
    }
  },

  /**
   * Create new class
   */
  async create(data: CreateClassData): Promise<Class> {
    try {
      console.log("➕ Creating class:", data);
      const classData = await apiClient.post<Class>("/classes", data);
      console.log("✅ Class created:", classData.id);
      return classData;
    } catch (error: any) {
      console.error("❌ classesApi. create error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create class"
      );
    }
  },

  /**
   * Update existing class
   */
  async update(id: string, data: Partial<CreateClassData>): Promise<Class> {
    try {
      console.log(`✏️ Updating class ${id}:`, data);
      const classData = await apiClient.put<Class>(`/classes/${id}`, data);
      console.log("✅ Class updated:", classData.id);
      return classData;
    } catch (error: any) {
      console.error("❌ classesApi.update error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update class"
      );
    }
  },

  /**
   * Delete class
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting class ${id}...`);
      await apiClient.delete(`/classes/${id}`);
      console.log("✅ Class deleted");
    } catch (error: any) {
      console.error("❌ classesApi.delete error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete class"
      );
    }
  },

  /**
   * Assign students to class
   */
  async assignStudents(classId: string, studentIds: string[]): Promise<Class> {
    try {
      console.log(`🔗 Assigning students to class ${classId}:`, studentIds);
      const classData = await apiClient.post<Class>(
        `/classes/${classId}/assign-students`,
        { studentIds }
      );
      console.log("✅ Students assigned");
      return classData;
    } catch (error: any) {
      console.error("❌ classesApi.assignStudents error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to assign students"
      );
    }
  },

  /**
   * Remove student from class
   */
  async removeStudent(classId: string, studentId: string): Promise<void> {
    try {
      console.log(`🔓 Removing student ${studentId} from class ${classId}...`);
      await apiClient.delete(`/classes/${classId}/students/${studentId}`);
      console.log("✅ Student removed");
    } catch (error: any) {
      console.error("❌ classesApi.removeStudent error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to remove student"
      );
    }
  },
  async getByGrade(grade: string, track?: string): Promise<Class[]> {
    try {
      const url = track
        ? `/classes/grade/${grade}?track=${track}`
        : `/classes/grade/${grade}`;

      console.log(
        `📚 Fetching classes for grade ${grade}${track ? ` (${track})` : ""}...`
      );
      const classes = await apiClient.get<Class[]>(url);

      if (!Array.isArray(classes)) {
        console.error("❌ Expected array but got:", typeof classes);
        return [];
      }

      console.log(`✅ Fetched ${classes.length} classes`);
      return classes;
    } catch (error) {
      console.error("❌ classesApi.getByGrade error:", error);
      return [];
    }
  },
};

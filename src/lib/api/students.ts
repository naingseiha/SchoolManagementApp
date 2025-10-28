// Student API Service

import { apiClient } from "./client";

export interface Student {
  id: string;
  studentId?: string;
  khmerName?: string;
  englishName?: string;
  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  placeOfBirth?: string;
  currentAddress?: string;
  phoneNumber?: string;
  // Legacy
  address?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  classId?: string;
  userId?: string;
  class?: {
    id: string;
    classId?: string;
    name: string;
    grade: string;
    section?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentData {
  khmerName?: string;
  englishName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth: string;
  gender: "male" | "female";
  placeOfBirth?: string;
  currentAddress?: string;
  phoneNumber?: string;
  address?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  classId?: string;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  data: Student;
  message?: string;
}

// Helper function to map frontend gender to backend Gender enum
const mapGenderToBackend = (gender: "male" | "female"): string => {
  return gender === "male" ? "MALE" : "FEMALE";
};

// Helper function to map backend Gender enum to frontend
const mapGenderToFrontend = (gender: string): "male" | "female" => {
  return gender === "MALE" ? "male" : "female";
};

// Helper function to transform student data from backend
const transformStudent = (backendStudent: any): Student => {
  return {
    ...backendStudent,
    gender: mapGenderToFrontend(backendStudent.gender),
    // Map new fields to legacy fields for backward compatibility
    firstName:
      backendStudent.firstName ||
      backendStudent.englishName?.split(" ")[0] ||
      "",
    lastName:
      backendStudent.lastName ||
      backendStudent.englishName?.split(" ")[1] ||
      "",
    email: backendStudent.email || `${backendStudent.studentId}@student.com`,
    phone: backendStudent.phone || backendStudent.phoneNumber,
    address: backendStudent.address || backendStudent.currentAddress,
  };
};

// Helper function to transform frontend data to backend format
const transformToBackend = (frontendData: CreateStudentData): any => {
  const payload = {
    firstName: frontendData.firstName?.trim() || "",
    lastName: frontendData.lastName?.trim() || "",
    email: frontendData.email?.trim() || undefined,
    gender: mapGenderToBackend(frontendData.gender),
    dateOfBirth: frontendData.dateOfBirth,
    address: frontendData.address?.trim() || undefined,
    phone: frontendData.phone?.trim() || undefined,
    classId: frontendData.classId?.trim() || undefined,
  };

  console.log("🔄 Transform to backend:", {
    input: frontendData,
    output: payload,
  });

  return payload;
};

export const studentsApi = {
  // Get all students
  async getAll(): Promise<Student[]> {
    try {
      // ✅ apiClient.get already extracts data, so response IS the array
      const students = await apiClient.get<Student[]>("/students");

      console.log("📥 Students received:", students);
      console.log(
        "  - Type:",
        Array.isArray(students) ? "Array ✅" : typeof students
      );
      console.log("  - Count:", students?.length || 0);

      if (!Array.isArray(students)) {
        console.error("❌ Expected array but got:", students);
        return [];
      }

      return students.map(transformStudent);
    } catch (error: any) {
      console.error("❌ Error fetching students:", error);
      return []; // ✅ Return empty array instead of throwing
    }
  },

  // Get student by ID
  async getById(id: string): Promise<Student> {
    try {
      // ✅ apiClient.get returns the student object directly
      const student = await apiClient.get<Student>(`/students/${id}`);
      return transformStudent(student);
    } catch (error: any) {
      console.error("❌ Error fetching student:", error);
      throw new Error(error.message || "Failed to fetch student");
    }
  },

  // Create new student
  async create(data: CreateStudentData): Promise<Student> {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 FRONTEND: Creating student");
      console.log("📥 Input data:", data);

      const backendData = transformToBackend(data);

      console.log("📦 Sending to backend:", backendData);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ✅ apiClient.post returns the student object directly
      const student = await apiClient.post<Student>("/students", backendData);

      console.log("✅ Response from backend:", student);

      return transformStudent(student);
    } catch (error: any) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ FRONTEND ERROR:", error);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw new Error(error.message || "Failed to create student");
    }
  },

  // Update student
  async update(id: string, data: Partial<CreateStudentData>): Promise<Student> {
    try {
      const backendData = transformToBackend(data as CreateStudentData);
      // ✅ apiClient.put returns the student object directly
      const student = await apiClient.put<Student>(
        `/students/${id}`,
        backendData
      );
      return transformStudent(student);
    } catch (error: any) {
      console.error("❌ Error updating student:", error);
      throw new Error(error.message || "Failed to update student");
    }
  },

  // Delete student
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/students/${id}`);
    } catch (error: any) {
      console.error("❌ Error deleting student:", error);
      throw new Error(error.message || "Failed to delete student");
    }
  },

  // Get students by class ID
  async getByClass(classId: string): Promise<Student[]> {
    try {
      const allStudents = await this.getAll();
      return allStudents.filter((student) => student.classId === classId);
    } catch (error: any) {
      console.error("❌ Error fetching students by class:", error);
      return [];
    }
  },
};

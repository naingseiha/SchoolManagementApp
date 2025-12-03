// Student API Service

import { apiClient } from "./client";
import { parseDate } from "../utils/dateParser";

export interface Student {
  id: string;
  studentId?: string;
  khmerName?: string;
  englishName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  placeOfBirth?: string;
  currentAddress?: string;
  phoneNumber?: string;
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

export interface BulkStudentData {
  name: string;
  gender: string;
  dateOfBirth: string;
  previousGrade?: string;
  previousSchool?: string;
  repeatingGrade?: string;
  transferredFrom?: string;
  remarks?: string;
  grade9ExamSession?: string;
  grade9ExamCenter?: string;
  grade9ExamRoom?: string;
  grade9ExamDesk?: string;
  grade9PassStatus?: string;
  grade12ExamSession?: string;
  grade12ExamCenter?: string;
  grade12ExamRoom?: string;
  grade12ExamDesk?: string;
  grade12PassStatus?: string;
  grade12Track?: string;
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    success: number;
    failed: number;
    results: {
      success: Array<{
        row: number;
        studentId: string;
        name: string;
      }>;
      failed: Array<{
        row: number;
        name: string;
        error: string;
      }>;
    };
  };
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

const mapGenderToBackend = (gender: "male" | "female" | string): string => {
  const g = gender.toLowerCase();
  if (g === "male" || g === "m" || g === "ប" || g === "ប្រុស") {
    return "MALE";
  }
  return "FEMALE";
};

const mapGenderToFrontend = (gender: string): "male" | "female" => {
  return gender === "MALE" ? "male" : "female";
};

const transformStudent = (backendStudent: any): Student => {
  return {
    ...backendStudent,
    gender: mapGenderToFrontend(backendStudent.gender),
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

const transformToBackend = (frontendData: CreateStudentData): any => {
  const payload = {
    firstName: frontendData.firstName?.trim() || "",
    lastName: frontendData.lastName?.trim() || "",
    khmerName:
      frontendData.khmerName?.trim() ||
      `${frontendData.firstName} ${frontendData.lastName}`,
    email: frontendData.email?.trim() || undefined,
    gender: mapGenderToBackend(frontendData.gender),
    dateOfBirth: frontendData.dateOfBirth,
    address: frontendData.address?.trim() || undefined,
    phone: frontendData.phone?.trim() || undefined,
    classId: frontendData.classId?.trim() || undefined,
  };

  return payload;
};

export const studentsApi = {
  async getAll(): Promise<Student[]> {
    try {
      const students = await apiClient.get<Student[]>("/students");

      if (!Array.isArray(students)) {
        console.error("❌ Expected array but got:", students);
        return [];
      }

      return students.map(transformStudent);
    } catch (error: any) {
      console.error("❌ Error fetching students:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Student> {
    try {
      const student = await apiClient.get<Student>(`/students/${id}`);
      return transformStudent(student);
    } catch (error: any) {
      console.error("❌ Error fetching student:", error);
      throw new Error(error.message || "Failed to fetch student");
    }
  },

  async create(data: CreateStudentData): Promise<Student> {
    try {
      const backendData = transformToBackend(data);
      const student = await apiClient.post<Student>("/students", backendData);
      return transformStudent(student);
    } catch (error: any) {
      throw new Error(error.message || "Failed to create student");
    }
  },

  async bulkCreate(
    classId: string,
    students: BulkStudentData[]
  ): Promise<BulkImportResponse> {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 FRONTEND: Bulk creating students");
      console.log("📊 Class ID:", classId);
      console.log("👥 Students count:", students.length);

      const payload = {
        classId,
        students: students.map((student, index) => {
          try {
            const parsedDate = parseDate(student.dateOfBirth);

            return {
              name: student.name.trim(),
              gender: student.gender.trim(),
              dateOfBirth: parsedDate,
              previousGrade: student.previousGrade?.trim() || undefined,
              previousSchool: student.previousSchool?.trim() || undefined,
              repeatingGrade: student.repeatingGrade?.trim() || undefined,
              transferredFrom: student.transferredFrom?.trim() || undefined,
              remarks: student.remarks?.trim() || undefined,
              grade9ExamSession: student.grade9ExamSession?.trim() || undefined,
              grade9ExamCenter: student.grade9ExamCenter?.trim() || undefined,
              grade9ExamRoom: student.grade9ExamRoom?.trim() || undefined,
              grade9ExamDesk: student.grade9ExamDesk?.trim() || undefined,
              grade9PassStatus: student.grade9PassStatus?.trim() || undefined,
              grade12ExamSession:
                student.grade12ExamSession?.trim() || undefined,
              grade12ExamCenter: student.grade12ExamCenter?.trim() || undefined,
              grade12ExamRoom: student.grade12ExamRoom?.trim() || undefined,
              grade12ExamDesk: student.grade12ExamDesk?.trim() || undefined,
              grade12PassStatus: student.grade12PassStatus?.trim() || undefined,
              grade12Track: student.grade12Track?.trim() || undefined,
            };
          } catch (error: any) {
            console.error(
              `❌ Row ${index + 1} date parsing error:`,
              error.message
            );
            throw new Error(`Row ${index + 1}: ${error.message}`);
          }
        }),
      };

      console.log("📦 Sending payload.. .");

      // ✅ Call API and get raw response
      const rawResponse = await apiClient.post<any>("/students/bulk", payload);

      console.log("📥 Raw response:", rawResponse);

      // ✅ Handle different response structures
      let response: BulkImportResponse;

      if (rawResponse.success !== undefined && rawResponse.data !== undefined) {
        // Structure: { success, data: { total, success, failed, results } }
        response = {
          success: rawResponse.success,
          message: rawResponse.message || "",
          data: rawResponse.data,
        };
      } else if (rawResponse.total !== undefined) {
        // Structure: { total, success, failed, results } (direct data)
        response = {
          success: true,
          message: "Bulk import completed",
          data: rawResponse,
        };
      } else {
        throw new Error("Invalid response structure");
      }

      console.log("✅ Parsed response:", response);
      console.log(
        `   - Success: ${response.data.success}/${response.data.total}`
      );
      console.log(
        `   - Failed: ${response.data.failed}/${response.data.total}`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return response;
    } catch (error: any) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ BULK IMPORT ERROR:", error);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw new Error(error.message || "Failed to bulk create students");
    }
  },

  async update(id: string, data: Partial<CreateStudentData>): Promise<Student> {
    try {
      const backendData = transformToBackend(data as CreateStudentData);
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

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/students/${id}`);
    } catch (error: any) {
      console.error("❌ Error deleting student:", error);
      throw new Error(error.message || "Failed to delete student");
    }
  },

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

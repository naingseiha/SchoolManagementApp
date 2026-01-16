// Teacher Portal API Service - For teacher/admin self-service profile management

import { apiClient } from "./client";

export interface TeacherProfile {
  id: string;
  teacherId?: string;
  firstName: string;
  lastName: string;
  khmerName?: string;
  englishName?: string;
  email: string;
  phone?: string;
  role: "TEACHER" | "INSTRUCTOR" | "ADMIN";
  gender?: "MALE" | "FEMALE";
  dateOfBirth?: string;
  hireDate?: string;
  address?: string;
  position?: string;
  
  // Homeroom class (for INSTRUCTOR)
  homeroomClass?: {
    id: string;
    name: string;
    grade: string;
    section?: string;
    track?: string;
    _count?: {
      students: number;
    };
  };

  // Teaching classes
  teachingClasses?: Array<{
    id: string;
    name: string;
    grade: string;
    section?: string;
    track?: string;
    _count?: {
      students: number;
    };
  }>;

  // Subjects
  subjects?: Array<{
    id: string;
    name: string;
    nameKh: string;
    code: string;
    grade: string;
    track?: string;
  }>;

  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTeacherProfileData {
  firstName?: string;
  lastName?: string;
  khmerName?: string;
  englishName?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE";
  dateOfBirth?: string;
  address?: string;
  position?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const teacherPortalApi = {
  /**
   * Get current teacher's profile
   */
  async getMyProfile(): Promise<TeacherProfile> {
    try {
      console.log("👨‍🏫 Fetching teacher profile...");
      const profile = await apiClient.get<TeacherProfile>("/teacher-portal/profile");
      console.log("✅ Teacher profile fetched");
      return profile;
    } catch (error) {
      console.error("❌ teacherPortalApi.getMyProfile error:", error);
      throw error;
    }
  },

  /**
   * Update current teacher's profile
   */
  async updateMyProfile(data: UpdateTeacherProfileData): Promise<TeacherProfile> {
    try {
      console.log("📝 Updating teacher profile...", data);
      const updatedProfile = await apiClient.patch<TeacherProfile>(
        "/teacher-portal/profile",
        data
      );
      console.log("✅ Teacher profile updated");
      return updatedProfile;
    } catch (error) {
      console.error("❌ teacherPortalApi.updateMyProfile error:", error);
      throw error;
    }
  },

  /**
   * Change password for current teacher
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      console.log("🔒 Changing teacher password...");
      const result = await apiClient.post<{ message: string }>(
        "/teacher-portal/change-password",
        data
      );
      console.log("✅ Teacher password changed");
      return result;
    } catch (error) {
      console.error("❌ teacherPortalApi.changePassword error:", error);
      throw error;
    }
  },
};

export default teacherPortalApi;

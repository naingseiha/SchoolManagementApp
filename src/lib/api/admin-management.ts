import { apiClient } from "./client";

// Types
export interface AdminAccount {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isDefaultPassword: boolean;
  passwordChangedAt: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  accountSuspendedAt: string | null;
  suspensionReason: string | null;
  loginCount: number;
}

export interface AdminStatistics {
  totalAdmins: number;
  activeAdmins: number;
  suspendedAdmins: number;
  defaultPasswordCount: number;
  inactiveAdmins: number;
}

export interface UpdatePasswordRequest {
  newPassword: string;
  currentPassword?: string;
}

export interface CreateAdminRequest {
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface ToggleStatusRequest {
  isActive: boolean;
  reason?: string;
}

export const adminManagementApi = {
  /**
   * Get all admin accounts
   */
  async getAdminAccounts(): Promise<AdminAccount[]> {
    try {
      console.log("📋 Fetching admin accounts...");
      const data = await apiClient.get<AdminAccount[]>("/admin/admins");
      console.log("✅ Admin accounts fetched:", data.length);
      return data;
    } catch (error: any) {
      console.error("❌ Error fetching admin accounts:", error);
      throw error;
    }
  },

  /**
   * Get admin statistics
   */
  async getAdminStatistics(): Promise<AdminStatistics> {
    try {
      console.log("📊 Fetching admin statistics...");
      const data = await apiClient.get<AdminStatistics>(
        "/admin/admins/statistics"
      );
      console.log("✅ Admin statistics fetched:", data);
      return data;
    } catch (error: any) {
      console.error("❌ Error fetching admin statistics:", error);
      throw error;
    }
  },

  /**
   * Update admin password
   */
  async updateAdminPassword(
    adminId: string,
    request: UpdatePasswordRequest
  ): Promise<{ message: string; adminId: string; passwordChangedAt: string }> {
    try {
      console.log("🔐 Updating admin password...");
      const data = await apiClient.put<{
        message: string;
        adminId: string;
        passwordChangedAt: string;
      }>(`/admin/admins/${adminId}/password`, request);
      console.log("✅ Password updated successfully");
      return data;
    } catch (error: any) {
      console.error("❌ Error updating password:", error);
      throw error;
    }
  },

  /**
   * Create new admin account
   */
  async createAdminAccount(
    request: CreateAdminRequest
  ): Promise<{ admin: AdminAccount; defaultPassword?: string }> {
    try {
      console.log("📝 Creating admin account...");
      const data = await apiClient.post<{
        admin: AdminAccount;
        defaultPassword?: string;
      }>("/admin/admins", request);
      console.log("✅ Admin account created:", data.admin.id);
      return data;
    } catch (error: any) {
      console.error("❌ Error creating admin account:", error);
      throw error;
    }
  },

  /**
   * Toggle admin account status
   */
  async toggleAdminStatus(
    adminId: string,
    request: ToggleStatusRequest
  ): Promise<{ message: string; adminId: string; isActive: boolean }> {
    try {
      console.log("🔄 Toggling admin status...");
      const data = await apiClient.put<{
        message: string;
        adminId: string;
        isActive: boolean;
      }>(`/admin/admins/${adminId}/status`, request);
      console.log("✅ Admin status updated:", data.isActive);
      return data;
    } catch (error: any) {
      console.error("❌ Error toggling admin status:", error);
      throw error;
    }
  },

  /**
   * Delete admin account
   */
  async deleteAdminAccount(
    adminId: string
  ): Promise<{ message: string; adminId: string }> {
    try {
      console.log("🗑️ Deleting admin account...");
      const data = await apiClient.delete<{
        message: string;
        adminId: string;
      }>(`/admin/admins/${adminId}`);
      console.log("✅ Admin account deleted");
      return data;
    } catch (error: any) {
      console.error("❌ Error deleting admin account:", error);
      throw error;
    }
  },
};

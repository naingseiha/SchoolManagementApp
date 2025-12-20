import { apiClient } from "./client";

export interface LoginCredentials {
  identifier: string; // ✅ Phone or Email
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  teacher?: any;
  student?: any;
  permissions?: any;
}

interface LoginResponseData {
  token: string;
  expiresIn: string;
  user: User;
}

export const authApi = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ token: string; user: User; expiresIn: string }> {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 Calling login API...");
      console.log("  - Identifier:", credentials.identifier);
      console.log("  - Remember me:", credentials.rememberMe);

      // ✅ FIX: Transform identifier to email or phone based on format
      const isEmail = credentials.identifier.includes("@");
      const loginPayload = {
        [isEmail ? "email" : "phone"]: credentials.identifier,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      };

      console.log("  - Sending as:", isEmail ? "email" : "phone");

      const data = await apiClient.post<LoginResponseData>(
        "/auth/login",
        loginPayload
      );

      console.log("✅ Login API response received:");
      console.log("  - Token:", data.token ? "Present" : "Missing");
      console.log("  - Token length:", data.token?.length || 0);
      console.log("  - User:", data.user?.email || data.user?.phone);
      console.log("  - Role:", data.user?.role);
      console.log("  - Expires in:", data.expiresIn);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (!data.token) {
        throw new Error("No token received from server");
      }

      if (!data.user) {
        throw new Error("No user data received from server");
      }

      return {
        token: data.token,
        user: data.user,
        expiresIn: data.expiresIn || "7d",
      };
    } catch (error: any) {
      console.error("❌ Login API error:", error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      console.log("📤 Getting current user...");
      const user = await apiClient.get<User>("/auth/me");
      console.log("✅ Current user:", user.email || user.phone);
      return user;
    } catch (error: any) {
      console.error("❌ Get current user error:", error);
      throw error;
    }
  },

  async refreshToken(): Promise<string> {
    try {
      console.log("🔄 Refreshing token...");
      const data = await apiClient.post<{ token: string; expiresIn: string }>(
        "/auth/refresh"
      );
      console.log("✅ Token refreshed");
      return data.token;
    } catch (error: any) {
      console.error("❌ Refresh token error:", error);
      throw error;
    }
  },

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      console.log("🔐 Changing password.. .");
      await apiClient.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      console.log("✅ Password changed");
    } catch (error: any) {
      console.error("❌ Change password error:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log("👋 Logging out...");
      await apiClient.post("/auth/logout", {});
      console.log("✅ Logged out");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  },
};

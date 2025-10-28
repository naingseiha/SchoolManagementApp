import { apiClient } from "./client";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// ✅ This matches backend response structure
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
      console.log("  - Email:", credentials.email);
      console.log("  - Remember me:", credentials.rememberMe);

      // ✅ apiClient.post will extract response.data
      // Backend returns: { success: true, data: { token, user, expiresIn } }
      // apiClient.post returns: { token, user, expiresIn }
      const data = await apiClient.post<LoginResponseData>(
        "/auth/login",
        credentials
      );

      console.log("✅ Login API response received:");
      console.log("  - Token:", data.token ? "Present" : "Missing");
      console.log("  - Token length:", data.token?.length || 0);
      console.log("  - User:", data.user?.email);
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
      console.log("✅ Current user:", user.email);
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
};

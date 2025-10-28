// Authentication API Service

import { apiClient } from "./client";
import { LoginRequest, LoginResponse, User } from "@/types/auth";

export const authApi = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    // Store token in localStorage
    if (response.success && response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      "/auth/me"
    );
    return response.data;
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  },

  // Get stored user
  getStoredUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

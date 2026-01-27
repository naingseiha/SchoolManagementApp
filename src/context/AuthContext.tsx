"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, type LoginCredentials, type User } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (
    credentials: LoginCredentials
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // NEW: Refresh user data
  isLoading: boolean;
  isVerifyingWithServer: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingWithServer, setIsVerifyingWithServer] = useState(false); // ✅ NEW
  const [error, setError] = useState<string | null>(null); // ✅ ADDED
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 Checking authentication on page load...");

      const token = localStorage.getItem("token");
      const cachedUser = localStorage.getItem("user");

      console.log("📦 LocalStorage status:");
      console.log("  - Token exists:", token ? "YES" : "NO");
      console.log("  - Token length:", token?.length || 0);
      console.log("  - Cached user:", cachedUser ? "YES" : "NO");

      if (!token) {
        console.log("⏸️ No token found - user not authenticated");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        setIsLoading(false);
        return;
      }

      // ✅ OPTIMIZATION: Use cached user for instant UI while verifying in background
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          console.log("⚡ Using cached user for instant auth:", parsedUser.email || parsedUser.phone);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          setIsLoading(false); // Set loading to false immediately for better UX
          setIsVerifyingWithServer(true); // ✅ NEW: Indicate server verification in progress
        } catch (e) {
          console.log("⚠️ Failed to parse cached user, will verify with server");
        }
      } else {
        setIsVerifyingWithServer(true); // ✅ NEW: No cache, verifying with server
      }

      try {
        console.log("🔐 Verifying token with server...");

        // ✅ Clear any cached /auth/me responses to ensure fresh data
        if (typeof window !== "undefined") {
          apiClient.clearCache();
        }

        // ✅ Increased timeout to 15s to prevent false timeouts on slow networks
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 15000)
        );

        // Don't use cache for checkAuth - always get fresh data
        const authCheckPromise = authApi.getCurrentUser(false); // Pass false to bypass cache

        const user = await Promise.race([
          authCheckPromise,
          timeoutPromise,
        ]) as User;

        console.log("✅ Server verification complete:", user.email || user.phone);
        // Update with fresh data from server
        setCurrentUser(user);
        setIsAuthenticated(true);
        setError(null);
        setIsVerifyingWithServer(false); // ✅ NEW: Server verification complete
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ Auth state updated with fresh data");

        // ✅ Dispatch auth-ready event for DataContext
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-ready"));
        }
      } catch (error: any) {
        console.error("❌ Auth check failed:", error);

        // ✅ Handle timeout - KEEP token for retry, don't clear it
        if (error.message === "AUTH_TIMEOUT") {
          console.log("⏱️ Auth check timed out - keeping token for retry");
          // If we have cached user, keep them authenticated (optimistic)
          if (!cachedUser) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          setIsVerifyingWithServer(false); // ✅ NEW: Stop verification flag
          setError("មានបញ្ហាក្នុងការភ្ជាប់ទៅ server • Connection timeout - will retry");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return;
        }

        // ✅ Handle different error types
        if (
          error.message?.includes("Invalid token") ||
          error.message?.includes("INVALID_TOKEN") ||
          error.message?.includes("jwt malformed")
        ) {
          console.log("🗑️ Invalid token - clearing storage");
          localStorage.removeItem("token");
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsVerifyingWithServer(false); // ✅ NEW: Stop verification flag
          setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Please login again");
        } else if (
          error.message?.includes("expired") ||
          error.message?.includes("TOKEN_EXPIRED")
        ) {
          console.log("⏰ Token expired - attempting refresh...");

          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
            const response = await fetch(
              `${API_BASE_URL}/auth/refresh`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ token }),
                credentials: "include", // ✅ iOS 16 FIX: Required for PWA mode
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data.token) {
                console.log("✅ Token refreshed successfully");
                localStorage.setItem("token", data.data.token);

                // Retry getting current user
                const user = await authApi.getCurrentUser();
                setCurrentUser(user);
                setIsAuthenticated(true);
                setError(null);
              }
            } else {
              console.log("❌ Refresh failed - clearing storage");
              localStorage.removeItem("token");
              setCurrentUser(null);
              setIsAuthenticated(false);
              setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Session expired");
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            localStorage.removeItem("token");
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsVerifyingWithServer(false); // ✅ NEW: Stop verification flag
            setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Session expired");
          }
        } else {
          // Network error or server down - keep cached user if available
          console.log("⚠️ Network error - keeping token for retry");
          if (!cachedUser) {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
          setIsVerifyingWithServer(false); // ✅ NEW: Stop verification flag
          setError("មានបញ្ហាក្នុងការភ្ជាប់ទៅ server • Connection error - using cached data");
        }
      } finally {
        // Only set loading to false if we haven't already (cached user scenario)
        if (!cachedUser) {
          setIsLoading(false);
        }
        setIsVerifyingWithServer(false); // ✅ NEW: Ensure flag is always cleared
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: {
    identifier: string; // ✅ Phone or Email
    password: string;
  }) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 Login attempt from AuthContext:");
    console.log("  - Identifier:", credentials.identifier);

    setIsLoading(true);
    setError(null); // ✅ Clear previous errors

    try {
      // Add timeout to prevent getting stuck on slow network
      const loginPromise = authApi.login(credentials);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), 15000)
      );

      const result = await Promise.race([loginPromise, timeoutPromise]) as { token: string; user: any; expiresIn: string };

      console.log("✅ Login successful");
      console.log("  - User:", result.user.email || result.user.phone);
      console.log("  - Role:", result.user.role);
      console.log("  - Token received:", result.token ? "YES" : "NO");

      // ✅ Always save token and user (no need for rememberMe checkbox)
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setError(null);

      // Clear any cached data before redirecting
      apiClient.clearCache();

      console.log("📍 Redirecting based on role:", result.user.role);

      // ✅ Role-based redirect with replace to prevent back button issues
      if (result.user.role === "STUDENT") {
        console.log("→ Redirecting student to feed");
        router.prefetch("/feed");
        router.replace("/feed"); // Use replace instead of push
      } else if (result.user.role === "PARENT") {
        console.log("→ Redirecting parent to parent portal");
        router.prefetch("/parent-portal");
        router.replace("/parent-portal"); // Use replace instead of push
      } else {
        console.log("→ Redirecting to feed");
        router.prefetch("/feed");
        router.replace("/feed"); // Use replace instead of push
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (err: any) {
      console.error("❌ Login failed:", err);

      let errorMessage: string;
      if (err.message === "LOGIN_TIMEOUT") {
        errorMessage = "ការភ្ជាប់យឺត សូមព្យាយាមម្តងទៀត\nConnection timeout, please try again";
      } else if (err.message === "Invalid credentials") {
        errorMessage = "លេខទូរស័ព្ទ/អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ\nInvalid phone/email or password";
      } else {
        errorMessage = err.message || "ការចូលប្រើប្រាស់បរាជ័យ\nLogin failed";
      }

      setError(errorMessage);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👋 Logging out...");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear API cache
    apiClient.clearCache();

    setCurrentUser(null);
    setIsAuthenticated(false);
    setError(null);

    // Dispatch custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
    
    console.log("✅ Logged out successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    router.push("/");
  };

  // NEW: Refresh user data
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data...");
      apiClient.clearCache();
      const user = await authApi.getCurrentUser(false);
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("✅ User data refreshed");
    } catch (error) {
      console.error("❌ Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        refreshUser, // NEW: Add refresh function
        isLoading,
        isVerifyingWithServer,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

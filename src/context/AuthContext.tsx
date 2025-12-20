"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, type LoginCredentials, type User } from "@/lib/api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (
    credentials: LoginCredentials & { rememberMe?: boolean }
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null; // ✅ ADDED: Error state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ✅ ADDED
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 Checking authentication on page load...");

      const token = localStorage.getItem("token");
      const rememberMe = localStorage.getItem("rememberMe");

      console.log("📦 LocalStorage status:");
      console.log("  - Token exists:", token ? "YES" : "NO");
      console.log("  - Token length:", token?.length || 0);
      console.log("  - Remember me:", rememberMe ? "YES" : "NO");

      if (!token) {
        console.log("⏸️ No token found - user not authenticated");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔐 Token found, verifying with server...");

        // ✅ Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 10000)
        );

        const user = await Promise.race([
          authApi.getCurrentUser(),
          timeoutPromise,
        ]) as User;

        console.log("✅ User authenticated:", user.email || user.phone);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setError(null); // ✅ Clear any previous errors
        console.log("✅ Auth state set successfully");

        // ✅ Dispatch auth-ready event for DataContext
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-ready"));
        }
      } catch (error: any) {
        console.error("❌ Auth check failed:", error);

        // ✅ Handle timeout
        if (error.message === "AUTH_TIMEOUT") {
          console.log("⏱️ Auth check timed out - clearing token");
          localStorage.removeItem("token");
          localStorage.removeItem("rememberMe");
          setCurrentUser(null);
          setIsAuthenticated(false);
          setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Connection timeout");
          setIsLoading(false);
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
          localStorage.removeItem("rememberMe");
          setCurrentUser(null);
          setIsAuthenticated(false);
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
              localStorage.removeItem("rememberMe");
              setCurrentUser(null);
              setIsAuthenticated(false);
              setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Session expired");
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            localStorage.removeItem("token");
            localStorage.removeItem("rememberMe");
            setCurrentUser(null);
            setIsAuthenticated(false);
            setError("សូមចូលប្រើប្រាស់ម្តងទៀត • Session expired");
          }
        } else {
          // Network error or server down
          console.log("⚠️ Network error - keeping token for retry");
          setCurrentUser(null);
          setIsAuthenticated(false);
          setError("មានបញ្ហាក្នុងការភ្ជាប់ទៅ server • Connection error");
        }
      } finally {
        setIsLoading(false);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: {
    identifier: string; // ✅ Phone or Email
    password: string;
    rememberMe?: boolean;
  }) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 Login attempt from AuthContext:");
    console.log("  - Identifier:", credentials.identifier);
    console.log("  - Remember me:", credentials.rememberMe);

    setIsLoading(true);
    setError(null); // ✅ Clear previous errors

    try {
      const result = await authApi.login(credentials);

      console.log("✅ Login successful");
      console.log("  - User:", result.user.email || result.user.phone);
      console.log("  - Role:", result.user.role);
      console.log("  - Token received:", result.token ? "YES" : "NO");

      // Save token and user
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (credentials.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setError(null);

      console.log("📍 Redirecting based on role:", result.user.role);

      // Redirect to main dashboard (root page)
      console.log("→ Redirecting to dashboard");
      router.push("/");

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (err: any) {
      console.error("❌ Login failed:", err);

      const errorMessage =
        err.message === "Invalid credentials"
          ? "លេខទូរស័ព្ទ/អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ\nInvalid phone/email or password"
          : err.message || "ការចូលប្រើប្រាស់បរាជ័យ\nLogin failed";

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
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setIsAuthenticated(false);
    setError(null);

    // Dispatch custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }

    console.log("✅ Logout complete, redirecting to /login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        isLoading,
        error, // ✅ ADDED:  Provide error
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

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        const user = await authApi.getCurrentUser();
        console.log("✅ User authenticated:", user.email);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log("✅ Auth state set successfully");
      } catch (error: any) {
        console.error("❌ Auth check failed:", error);

        // ✅ IMPORTANT: Don't immediately clear token on network errors
        // Only clear if token is truly invalid
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
        } else if (
          error.message?.includes("expired") ||
          error.message?.includes("TOKEN_EXPIRED")
        ) {
          console.log("⏰ Token expired - attempting refresh...");

          try {
            const response = await fetch(
              "http://localhost:5001/api/auth/refresh",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
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
              }
            } else {
              console.log("❌ Refresh failed - clearing storage");
              localStorage.removeItem("token");
              localStorage.removeItem("rememberMe");
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            localStorage.removeItem("token");
            localStorage.removeItem("rememberMe");
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Network error or server down - keep token but mark as not authenticated
          console.log("⚠️ Network error - keeping token for retry");
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    };

    checkAuth();
  }, []);

  const login = async (
    credentials: LoginCredentials & { rememberMe?: boolean }
  ) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 Logging in...", {
        email: credentials.email,
        rememberMe: credentials.rememberMe,
      });

      const { token, user, expiresIn } = await authApi.login(credentials);

      console.log("✅ Login response received:");
      console.log("  - Token length:", token?.length || 0);
      console.log("  - Expires in:", expiresIn);
      console.log("  - User:", user?.email);

      if (!token) {
        throw new Error("No token received from server");
      }

      console.log("💾 Storing token in localStorage...");
      localStorage.setItem("token", token);

      if (credentials.rememberMe) {
        console.log("✅ Remember me enabled - saving preference");
        localStorage.setItem("rememberMe", "true");
      } else {
        console.log("⏹️ Remember me disabled");
        localStorage.removeItem("rememberMe");
      }

      // ✅ Verify storage
      const storedToken = localStorage.getItem("token");
      console.log("🔍 Verification:");
      console.log("  - Token stored:", storedToken ? "YES" : "NO");
      console.log("  - Matches:", storedToken === token ? "YES" : "NO");

      setCurrentUser(user);
      setIsAuthenticated(true);

      console.log("✅ Auth state updated:");
      console.log("  - isAuthenticated:", true);
      console.log("  - currentUser:", user.email);

      // Dispatch custom event for other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }

      console.log("✅ Login complete, redirecting to dashboard...");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      router.push("/");
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("👋 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    setCurrentUser(null);
    setIsAuthenticated(false);

    // Dispatch custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }

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

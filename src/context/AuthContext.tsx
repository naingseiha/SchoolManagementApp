"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { AuthContextType, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role mapping function - Convert backend roles to frontend roles
const mapBackendRole = (backendRole: string): string => {
  const roleMap: { [key: string]: string } = {
    ADMIN: "superadmin",
    TEACHER: "teacher",
    STUDENT: "student",
    CLASS_TEACHER: "classteacher",
  };
  return roleMap[backendRole] || backendRole.toLowerCase();
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = authApi.getToken();
      const storedUser = authApi.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verify token with backend
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid, clear auth
          console.error("Token verification failed:", error);
          logout();
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      if (response.success) {
        setToken(response.token);
        setUser(response.user);

        // Redirect based on role (using backend role)
        switch (response.user.role) {
          case "ADMIN":
            router.push("/students");
            break;
          case "TEACHER":
          case "CLASS_TEACHER":
            router.push("/grades");
            break;
          case "STUDENT":
            router.push("/schedule");
            break;
          default:
            router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  // Transform user data for sidebar compatibility
  const currentUser = user
    ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: mapBackendRole(user.role), // Map backend role to frontend role
      }
    : null;

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    currentUser, // For backward compatibility with existing components
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

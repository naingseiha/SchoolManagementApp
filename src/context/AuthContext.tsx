"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUserState(parsedUser);
          console.log("✅ User loaded from localStorage:", parsedUser.email);
        } else {
          console.log("⏸️ No saved user found");
        }
      } catch (error) {
        console.error("❌ Error loading user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("token", token);
      console.log("✅ Token saved to localStorage");
    } else {
      localStorage.removeItem("token");
      console.log("🗑️ Token removed from localStorage");
    }
  };

  const setUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserState(newUser);
      console.log("✅ User saved to localStorage:", newUser.email);
    } else {
      localStorage.removeItem("user");
      setUserState(null);
      console.log("🗑️ User removed from localStorage");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔐 Logging in...");
      console.log("📧 Email:", email);

      const response = await authApi.login({ email, password });

      if (response.success) {
        console.log("✅ Login response received:", response);

        // Save token first
        setToken(response.token);
        setUser(response.user);

        console.log("✅ Login successful, token and user saved");

        // Wait a bit for token to be saved to localStorage
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Trigger data reload
        if (typeof window !== "undefined") {
          console.log("🔄 Dispatching auth-change event...");
          window.dispatchEvent(new Event("auth-change"));
        }

        // Small delay before redirect to ensure data loads
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("🔄 Redirecting to dashboard...");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Redirect to Dashboard
        router.push("/");
      }
    } catch (error: any) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ Login error:", error);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚪 Logging out...");

    setToken(null);
    setUser(null);

    // Dispatch auth-change to clear data
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }

    console.log("✅ Logged out successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    router.push("/login");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setToken,
        setUser,
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

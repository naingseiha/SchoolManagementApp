"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not logged in - go to login
      router.replace("/login");
    } else {
      // Logged in - redirect based on role
      if (currentUser?.role === "STUDENT") {
        router.replace("/student-portal");
      } else if (currentUser?.role === "PARENT") {
        router.replace("/parent-portal");
      } else {
        // Teachers, admins, etc. go to feed as main page
        router.replace("/feed");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

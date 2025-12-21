// 📂 src/app/reports/mobile/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import MobileMonthlyReport from "@/components/mobile/reports/MobileMonthlyReport";
import { Loader2 } from "lucide-react";

export default function MobileReportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const deviceType = useDeviceType();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ✅ If accessed from desktop, redirect to desktop reports
  useEffect(() => {
    if (deviceType === "desktop" || deviceType === "tablet") {
      router.push("/reports/monthly");
    }
  }, [deviceType, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">កំពុងពិនិត្យ... </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <MobileMonthlyReport />;
}

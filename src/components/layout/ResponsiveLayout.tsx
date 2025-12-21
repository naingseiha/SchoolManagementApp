"use client";

import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileLayout from "./MobileLayout";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mobileTitle: string;
  className?: string;
}

export default function ResponsiveLayout({
  children,
  mobileTitle,
  className = "p-8",
}: ResponsiveLayoutProps) {
  const deviceType = useDeviceType();

  // Mobile layout (< 768px)
  if (deviceType === "mobile") {
    return <MobileLayout title={mobileTitle}>{children}</MobileLayout>;
  }

  // Desktop layout (>= 768px)
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className={className}>
          {children}
        </main>
      </div>
    </div>
  );
}

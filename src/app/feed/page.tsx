"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FeedPage from "@/components/feed/FeedPage";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Loader2 } from "lucide-react";

export default function FeedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <MobileLayout>
      <FeedPage onProfileClick={handleProfileClick} />
      <MobileBottomNav />
    </MobileLayout>
  );
}

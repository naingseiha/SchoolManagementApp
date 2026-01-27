"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/context/AuthContext";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FeedHeader from "@/components/feed/FeedHeader";

export default function ProfileRoute({ params }: { params: { userId: string } }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === params.userId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <FeedHeader />
      </div>

      {/* Scrollable Profile Content */}
      <div className="flex-1 overflow-y-auto">
        <ProfilePage userId={params.userId} isOwnProfile={isOwnProfile} />
      </div>

      <MobileBottomNav />
    </div>
  );
}

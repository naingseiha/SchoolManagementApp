"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/context/AuthContext";

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

  return <ProfilePage userId={params.userId} isOwnProfile={isOwnProfile} />;
}

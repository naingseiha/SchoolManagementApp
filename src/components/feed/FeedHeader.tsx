"use client";

import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StunityLogo from "@/components/common/StunityLogo";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function FeedHeader() {
  const { currentUser } = useAuth();

  const getUserProfilePicture = () => {
    return currentUser?.profilePictureUrl;
  };

  const getUserInitial = () => {
    if (currentUser?.student?.khmerName) {
      return currentUser.student.khmerName.charAt(0);
    }
    if (currentUser?.teacher?.khmerName) {
      return currentUser.teacher.khmerName.charAt(0);
    }
    return currentUser?.firstName?.charAt(0) || 'U';
  };

  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto">
        {/* Profile Picture */}
        <button className="flex-shrink-0">
          {getUserProfilePicture() ? (
            <img
              src={getUserProfilePicture()}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {getUserInitial()}
            </div>
          )}
        </button>

        {/* Logo & Actions */}
        <div className="flex items-center gap-2">
          <StunityLogo size="sm" showText={true} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

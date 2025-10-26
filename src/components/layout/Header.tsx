"use client";

import React from "react";
import { LogOut, User, Bell, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Welcome Message */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              សូមស្វាគមន៍ Welcome
            </span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀន
          </h2>
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications Button */}
          <button
            className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          {/* Settings Button */}
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            {/* User Avatar */}
            <div className="relative group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <User className="h-5 w-5" />
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            </div>

            {/* User Info */}
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUser?.role}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ចាកចេញ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

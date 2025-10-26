"use client";

import React from "react";
import { LogOut, User } from "lucide-react";
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            សូមស្វាគមន៍ Welcome
          </h2>
          <p className="text-sm text-gray-600">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀន School Management System
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-medium text-gray-800">{currentUser?.name}</div>
            <div className="text-sm text-gray-500 capitalize">
              {currentUser?.role}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

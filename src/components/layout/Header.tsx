"use client";

import React, { useState } from "react";
import { LogOut, User, Bell, Settings, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Khmer+OS+Muol+Light&family=Khmer+OS+Battambang&display=swap');

        .font-khmer-title {
          font-family: 'Khmer OS Muol Light', serif;
        }

        .font-khmer-body {
          font-family: 'Khmer OS Battambang', sans-serif;
        }
      `}</style>

      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        {/* Left Section - Brand & Title */}
        <div className="flex items-center space-x-4">
          {/* Logo/Icon */}
          <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          {/* Title Section */}
          <div className="flex flex-col">
            <h1 className="font-khmer-title text-xl md:text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              ប្រព័ន្ធគ្រប់គ្រងសាលា
            </h1>
          </div>
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-300 hover:scale-110 group"
              aria-label="ការជូនដំណឹង"
            >
              <Bell className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold animate-pulse shadow-lg">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                  <h3 className="font-khmer-body text-white font-semibold flex items-center justify-between">
                    <span>ការជូនដំណឹង</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    {
                      title: "សិស្សថ្មីបានចុះឈ្មោះ",
                      time: "២ នាទីមុន",
                      icon: "👤",
                    },
                    {
                      title: "ពិន្ទុថ្នាក់ទី១០A បានធ្វើបច្ចុប្បន្នភាព",
                      time: "១ ម៉ោងមុន",
                      icon: "📝",
                    },
                    {
                      title: "គ្រូថ្មីបានចាត់តាំងមុខវិជ្ជាគណិតវិទ្យា",
                      time: "៣ ម៉ោងមុន",
                      icon: "👨‍🏫",
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className="p-4 border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{notif.icon}</span>
                        <div className="flex-1">
                          <p className="font-khmer-body text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {notif.title}
                          </p>
                          <p className="font-khmer-body text-xs text-gray-500 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 text-center">
                  <button className="font-khmer-body text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    មើលការជូនដំណឹងទាំងអស់
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => router.push("/settings")}
            className="p-2.5 text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-300 hover:scale-110 group hidden md:block"
            aria-label="ការកំណត់"
          >
            <Settings className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
          </button>

          {/* Divider */}
          <div className="hidden md:block h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* User Avatar */}
            <div className="relative group">
              <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 cursor-pointer">
                <User className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm animate-pulse"></div>
            </div>

            {/* User Info */}
            <div className="hidden lg:block">
              <p className="font-khmer-body text-sm font-semibold text-gray-900 leading-tight">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="font-khmer-body text-xs text-gray-500 font-medium">
                {currentUser?.role === "ADMIN" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              aria-label="ចាកចេញ"
            >
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-khmer-body hidden sm:inline">ចាកចេញ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

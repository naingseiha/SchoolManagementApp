"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/api/notifications";
import { socketClient } from "@/lib/socket";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationBellProps {
  onNotificationClick?: () => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      console.log("New notification received:", notification);
      setUnreadCount((prev) => prev + 1);
      setHasNewNotification(true);
      
      // Show visual feedback
      setTimeout(() => setHasNewNotification(false), 3000);
      
      // Play notification sound (optional)
      playNotificationSound();
      
      if (onNotificationClick) {
        onNotificationClick();
      }
    };

    socketClient.on("notification:new", handleNewNotification);

    return () => {
      socketClient.off("notification:new", handleNewNotification);
    };
  }, [onNotificationClick]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    setHasNewNotification(false);
  };

  const handleNotificationRead = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
  };

  const playNotificationSound = () => {
    // Optional: Play a subtle notification sound
    if (typeof Audio !== "undefined") {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore errors (user interaction may be required)
        });
      } catch (error) {
        // Ignore errors
      }
    }
  };

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          hasNewNotification ? "animate-bounce" : ""
        }`}
        aria-label="Notifications"
      >
        <Bell
          className={`w-6 h-6 ${
            unreadCount > 0 ? "text-blue-600" : "text-gray-600 dark:text-gray-400"
          } ${hasNewNotification ? "animate-pulse" : ""}`}
        />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-900 animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        
        {/* New Notification Indicator */}
        {hasNewNotification && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <NotificationDropdown
          onClose={() => setShowDropdown(false)}
          onNotificationRead={handleNotificationRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </div>
  );
}

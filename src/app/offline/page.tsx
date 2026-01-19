"use client";

import { WifiOff, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OfflinePage() {
  const router = useRouter();
  const [isIOS, setIsIOS] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined" && window.navigator.onLine) {
      router.back();
    } else {
      router.refresh();
    }
  };

  const clearCacheAndReload = async () => {
    setIsClearing(true);
    try {
      // Clear all caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Unregister service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );
      }

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error clearing cache:", error);
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-3xl font-moul text-gray-900 mb-3">
          មានបញ្ហា
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Connection Error
        </p>
        <p className="text-sm text-gray-500 mb-8">
          សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក
        </p>

        {isIOS && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>iPhone/iPad User:</strong> If you keep seeing this error,
              try clearing the app cache below.
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some features may not be available while
            offline. Check your internet connection.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            ព្យាយាមម្តងទៀត (Try Again)
          </button>

          <button
            onClick={clearCacheAndReload}
            disabled={isClearing}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className={`w-5 h-5 ${isClearing ? "animate-spin" : ""}`} />
            {isClearing ? "Clearing..." : "Clear Cache & Reload"}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p className="font-semibold mb-2">Tips for reconnecting:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Check your WiFi or mobile data connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Enable airplane mode and disable it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Restart your router if using WiFi</span>
            </li>
            {isIOS && (
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span className="text-red-600 font-medium">
                  iPhone/iPad: Clear cache if error persists
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            School Management System PWA v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

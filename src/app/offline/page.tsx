"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (typeof window !== "undefined" && window.navigator.onLine) {
      router.back();
    } else {
      router.refresh();
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

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          No internet connection detected
        </p>
        <p className="text-sm text-gray-500 mb-8">
          សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some features may not be available while
            offline. Certain cached pages may still be accessible.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>Tips for reconnecting:</p>
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
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            School Management System PWA
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ScoreProgressDashboard from "@/components/dashboard/ScoreProgressDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

export default function ScoreProgressPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto min-h-0 p-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-6" />
                    <p className="font-khmer-body text-gray-600 text-lg font-bold">
                      កំពុងផ្ទុកទិន្នន័យ...
                    </p>
                  </div>
                </div>
              }
            >
              <ScoreProgressDashboard />
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

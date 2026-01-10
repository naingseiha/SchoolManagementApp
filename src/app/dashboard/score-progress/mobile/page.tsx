// 📂 src/app/dashboard/score-progress/mobile/page.tsx

"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MobileScoreProgressPage from "@/components/mobile/dashboard/MobileScoreProgressPage";

// ✅ Loading fallback component
function ScoreProgressLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600 font-battambang font-bold">កំពុងផ្ទុកទិន្នន័យ...</p>
      </div>
    </div>
  );
}

// ✅ Main page with Suspense boundary
export default function MobileScoreProgressPageWrapper() {
  return (
    <Suspense fallback={<ScoreProgressLoading />}>
      <MobileScoreProgressPage />
    </Suspense>
  );
}

// 📂 src/app/statistics/mobile/page.tsx

"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MobileStatisticsScreen from "@/components/mobile/statistics/MobileStatisticsScreen";

// ✅ Loading fallback component
function StatisticsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600">កំពុងពិនិត្យ...</p>
      </div>
    </div>
  );
}

// ✅ Main page with Suspense boundary
export default function MobileStatisticsPage() {
  return (
    <Suspense fallback={<StatisticsLoading />}>
      <MobileStatisticsScreen />
    </Suspense>
  );
}

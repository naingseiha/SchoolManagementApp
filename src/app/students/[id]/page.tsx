"use client";

import { Suspense } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileStudentDetails from "@/components/mobile/students/MobileStudentDetails";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import { useParams } from "next/navigation";

export default function StudentDetailsPage() {
  const params = useParams();
  const deviceType = useDeviceType();
  const studentId = params?.id as string;

  if (deviceType === "mobile") {
    return (
      <MobileLayout title="ព័ត៌មានសិស្ស">
        <Suspense fallback={<LoadingState />}>
          <MobileStudentDetails studentId={studentId} />
        </Suspense>
      </MobileLayout>
    );
  }

  // Desktop view - for now, redirect or show a simple view
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Student Details</h1>
        <p>Desktop view coming soon. Student ID: {studentId}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-khmer-body text-gray-700 text-lg">កំពុងផ្ទុក...</p>
      </div>
    </div>
  );
}

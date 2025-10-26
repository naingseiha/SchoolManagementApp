"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TeacherScheduleView from "@/components/schedule/TeacherScheduleView";
import Button from "@/components/ui/Button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function TeacherSchedulePage() {
  const { isAuthenticated } = useAuth();
  const { schedules, teachers, subjects, classes } = useData();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between no-print">
            <Link href="/schedule">
              <Button variant="secondary">
                <ArrowLeft className="w-5 h-5 mr-2" />
                ត្រឡប់ក្រោយ Back
              </Button>
            </Link>

            <Button onClick={() => window.print()}>
              <Printer className="w-5 h-5 mr-2" />
              បោះពុម្ព Print
            </Button>
          </div>

          <TeacherScheduleView
            schedules={schedules}
            teachers={teachers}
            subjects={subjects}
            classes={classes}
          />
        </main>
      </div>
    </div>
  );
}

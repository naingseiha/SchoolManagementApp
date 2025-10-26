"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MasterTimetableView from "@/components/schedule/MasterTimetableView";
import Button from "@/components/ui/Button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MasterTimetablePage() {
  const { isAuthenticated } = useAuth();
  const { schedules, classes, teachers, subjects } = useData();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement Excel export
    alert("Excel export feature coming soon!");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between no-print">
            <Link href="/schedule">
              <Button variant="secondary">
                <ArrowLeft className="w-5 h-5 mr-2" />
                ត្រឡប់ក្រោយ Back
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button onClick={handleExport} variant="secondary">
                <Download className="w-5 h-5 mr-2" />
                Export Excel
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="w-5 h-5 mr-2" />
                បោះពុម្ព Print
              </Button>
            </div>
          </div>

          {/* Master Timetable View */}
          <div ref={printRef}>
            <MasterTimetableView
              schedules={schedules}
              classes={classes}
              teachers={teachers}
              subjects={subjects}
            />
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            size: A3 landscape;
            margin: 0.5cm;
          }

          table {
            page-break-inside: avoid;
          }

          .break-before {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}

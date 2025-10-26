"use client";

import ReportPage from "./ReportPage";

interface KhmerMonthlyReportProps {
  paginatedReports: any[][];
  selectedClass: any;
  subjects: any[];
  province: string;
  examCenter: string;
  roomNumber: string;
  reportTitle: string;
  examSession: string;
  reportDate: string;
  teacherName: string;
  principalName: string;
  showCircles: boolean;
  autoCircle: boolean;
  showDateOfBirth: boolean;
  showGrade: boolean;
  showOther: boolean;
  studentsPerPage: number;
  getSubjectAbbr: (name: string) => string;
}

export default function KhmerMonthlyReport({
  paginatedReports,
  selectedClass,
  subjects,
  province,
  examCenter,
  roomNumber,
  reportTitle,
  examSession,
  reportDate,
  teacherName,
  principalName,
  showCircles,
  autoCircle,
  showDateOfBirth,
  showGrade,
  showOther,
  studentsPerPage,
  getSubjectAbbr,
}: KhmerMonthlyReportProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {paginatedReports.map((pageReports, pageIndex) => (
        <ReportPage
          key={pageIndex}
          pageReports={pageReports}
          pageNumber={pageIndex + 1}
          totalPages={paginatedReports.length}
          startIndex={pageIndex * studentsPerPage}
          selectedClass={selectedClass}
          subjects={subjects}
          province={province}
          examCenter={examCenter}
          roomNumber={roomNumber}
          reportTitle={reportTitle}
          examSession={examSession}
          reportDate={reportDate}
          teacherName={teacherName}
          principalName={principalName}
          showCircles={showCircles}
          autoCircle={autoCircle}
          showDateOfBirth={showDateOfBirth}
          showGrade={showGrade}
          showOther={showOther}
          getSubjectAbbr={getSubjectAbbr}
        />
      ))}
    </div>
  );
}

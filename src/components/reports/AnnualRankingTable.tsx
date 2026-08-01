"use client";

import React from "react";

interface AnnualRankingTableProps {
  transcriptData: any[];
  selectedClass: any;
  selectedYear: number;
  province?: string;
  schoolName?: string;
  placeName?: string;
  directorDate?: string;
  teacherDate?: string;
  teacherName?: string;
  principalName?: string;
}

export default function AnnualRankingTable({
  transcriptData,
  selectedClass,
  selectedYear,
  province = "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប",
  schoolName = "វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ",
  placeName = "ស្វាយធំ",
  directorDate = "",
  teacherDate = "",
  teacherName = "",
  principalName = "",
}: AnnualRankingTableProps) {
  // Sort data by Annual Rank (1 to N)
  const sortedData = [...transcriptData].sort((a, b) => {
    const rankA = a.summary?.annualOverallRank || 999;
    const rankB = b.summary?.annualOverallRank || 999;
    return rankA - rankB;
  });

  const toKhmerNum = (num: number | string) => {
    const khmerNums = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return num.toString().replace(/[0-9]/g, (m) => khmerNums[parseInt(m)]);
  };

  const STUDENTS_PER_FIRST_PAGE = 30;
  const STUDENTS_PER_NEXT_PAGE = 35;

  const pages = [];
  if (sortedData.length > 0) {
    pages.push(sortedData.slice(0, STUDENTS_PER_FIRST_PAGE));
    let currentIndex = STUDENTS_PER_FIRST_PAGE;
    while (currentIndex < sortedData.length) {
      pages.push(sortedData.slice(currentIndex, currentIndex + STUDENTS_PER_NEXT_PAGE));
      currentIndex += STUDENTS_PER_NEXT_PAGE;
    }
  } else {
    pages.push([]);
  }

  return (
    <div className="annual-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bokor&family=Moul&family=Siemreap&display=swap');

        .khmer-muol {
          font-family: 'Moul', 'Khmer OS Muol Light', serif !important;
        }
        .khmer-bokor {
          font-family: 'Bokor', 'Khmer OS Bokor', serif !important;
        }
        .khmer-siemreap {
          font-family: 'Siemreap', 'Khmer OS Siem Reap', serif !important;
        }
        .tacteing {
          font-family: "Tacteing", serif;
        }

        @media print {
          .report-page {
            page-break-inside: avoid !important;
            page-break-after: always !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 5mm !important; /* Small margin */
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .report-page:last-child {
            page-break-after: auto !important;
          }
          /* Ensure background colors print */
          .bg-header-gray {
            background-color: #e5e7eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm; /* Small margins for A4 */
          }
        }

        .report-page {
          background: white;
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
          width: 210mm;
          min-height: 297mm;
          margin-left: auto;
          margin-right: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
          vertical-align: middle;
          font-family: 'Siemreap', 'Khmer OS Siem Reap', serif;
          font-size: 12px;
        }
        th {
          font-family: 'Bokor', 'Khmer OS Bokor', serif;
          font-size: 12px;
          font-weight: normal;
        }
        .bg-header-yellow {
          background-color: #fce5cd; /* Light orange/yellow */
        }
        .bg-header-gray {
          background-color: #e5e7eb; /* Light grey */
        }
      `}</style>

      {pages.map((pageData, pageIndex) => (
        <div key={pageIndex} className="report-page relative flex flex-col">
          {/* Header Section - Only on first page */}
          {pageIndex === 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                {/* Left: School info */}
                <div className="text-left khmer-bokor text-blue-700" style={{ paddingTop: "14px" }}>
                  <p className="text-sm" style={{ lineHeight: "1.4" }}>
                    {province}
                  </p>
                  <p className="text-sm font-bold" style={{ lineHeight: "1.4" }}>
                    {schoolName}
                  </p>
                </div>

                {/* Right: Kingdom */}
                <div className="text-center text-blue-700">
                  <p className="font-bold text-sm khmer-muol" style={{ lineHeight: "1.2" }}>
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </p>
                  <p className="font-bold text-sm khmer-muol" style={{ lineHeight: "1.2" }}>
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </p>
                  <p className="text-red-600 text-base mt-0 tacteing" style={{ letterSpacing: "0.1em", fontSize: "24px" }}>
                    3
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mt-4 mb-4 text-black">
                <h1 className="text-lg font-bold mb-1 khmer-muol">
                  តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ
                </h1>
                <p className="text-sm mb-1 khmer-siemreap">
                  ឆ្នាំសិក្សា៖ {toKhmerNum(`${selectedYear}-${selectedYear + 1}`)}
                </p>
                <p className="text-sm font-bold khmer-muol">
                  {selectedClass?.name?.includes("ថ្នាក់ទី") ? selectedClass.name : `ថ្នាក់ទី ${selectedClass?.name || ""}`}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="flex-grow">
            <table className="mb-2 w-full">
              <thead>
                <tr>
                  <th rowSpan={2} className="bg-header-gray w-8">ល.រ</th>
                  <th rowSpan={2} className="bg-header-gray px-2" style={{ width: '130px', textAlign: 'center' }}>គោត្តនាម និងនាម</th>
                  <th colSpan={3} className="bg-header-gray">អវត្តមាន</th>
                  <th colSpan={2} className="bg-header-gray">លទ្ធផលប្រចាំឆមាសទី១</th>
                  <th colSpan={2} className="bg-header-gray">លទ្ធផលប្រចាំឆមាសទី២</th>
                  <th colSpan={3} className="bg-header-gray">លទ្ធផលប្រចាំឆ្នាំ</th>
                </tr>
                <tr>
                  <th className="bg-header-gray w-8">ច្បាប់</th>
                  <th className="bg-header-gray w-8">អ.ច្ប</th>
                  <th className="bg-header-gray w-8">សរុប</th>
                  
                  <th className="bg-header-gray w-10">ម.ភាគ</th>
                  <th className="bg-header-gray w-10">ចំ.ថ្នាក់</th>
                  
                  <th className="bg-header-gray w-10">ម.ភាគ</th>
                  <th className="bg-header-gray w-10">ចំ.ថ្នាក់</th>
                  
                  <th className="bg-header-gray w-10">ម.ភាគ</th>
                  <th className="bg-header-gray w-10">ចំ.ថ្នាក់</th>
                  <th className="bg-header-gray w-10">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((student, index) => {
                  const globalIndex = pageIndex === 0 ? index + 1 : STUDENTS_PER_FIRST_PAGE + (pageIndex - 1) * STUDENTS_PER_NEXT_PAGE + index + 1;
                  const annualAttendance = student.attendance?.annual || { permission: 0, withoutPermission: 0, totalAbsent: 0 };
                  const permission = annualAttendance.permission || 0;
                  const withoutPermission = annualAttendance.withoutPermission || 0;
                  const totalAbsent = annualAttendance.totalAbsent || (permission + withoutPermission);

                  return (
                    <tr key={student.studentData.studentId || index}>
                      <td>{globalIndex}</td>
                      <td className="px-2" style={{ textAlign: 'left' }}>{student.studentData.studentName}</td>
                      
                      <td>{permission > 0 ? permission : "0"}</td>
                      <td>{withoutPermission > 0 ? withoutPermission : "0"}</td>
                      <td>{totalAbsent > 0 ? totalAbsent : "0"}</td>
                      
                      <td>{student.summary?.semester1OverallAverage?.toFixed(2) || "-"}</td>
                      <td className="text-red-600 font-bold">{student.summary?.semester1OverallRank || "-"}</td>
                      
                      <td>{student.summary?.semester2OverallAverage?.toFixed(2) || "-"}</td>
                      <td className="text-red-600 font-bold">{student.summary?.semester2OverallRank || "-"}</td>
                      
                      <td>{student.summary?.annualOverallAverage?.toFixed(2) || "-"}</td>
                      <td className="text-red-600 font-bold">{student.summary?.annualOverallRank || "-"}</td>
                      <td className="font-bold">{student.summary?.gradeLevel || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Signatures - Only on last page */}
          {pageIndex === pages.length - 1 && (
            <div className="grid grid-cols-2 gap-10 mt-8 khmer-muol pb-4">
              <div className="text-center">
                <p className="text-sm mb-1 text-transparent select-none">Date</p>
                <p className="text-sm font-bold mb-10">បានឃើញ និងឯកភាព<br/>នាយក</p>
                <p className="text-sm font-bold khmer-muol">{principalName}</p>
              </div>
              <div className="text-center">
                <p className="text-sm mb-1">ធ្វើនៅ {placeName}, {directorDate || "ថ្ងៃទី.......ខែ.......ឆ្នាំ២០២..."}</p>
                <p className="text-sm font-bold mb-10">គ្រូបន្ទុកថ្នាក់</p>
                <p className="text-sm font-bold khmer-muol">{teacherName}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

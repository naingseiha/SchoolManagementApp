"use client";

import { sortSubjectsByOrder } from "@/lib/subjectOrder";

interface PageConfig {
  id: string;
  studentCount: number;
}

interface KhmerAttendanceReportProps {
  selectedClass: any;
  province: string;
  examCenter: string;
  roomNumber: string;
  reportTitle: string;
  reportDate: string;
  principalName: string;
  teacherName: string;
  selectedYear: number;
  pageConfigs: PageConfig[];
  sortStudents: (students: any[]) => any[];
}

export default function KhmerAttendanceReport({
  selectedClass,
  province,
  examCenter,
  roomNumber,
  reportTitle,
  reportDate,
  principalName,
  teacherName,
  selectedYear,
  pageConfigs,
  sortStudents,
}: KhmerAttendanceReportProps) {
  // Sort students
  const sortedStudents = sortStudents(selectedClass.students || []);

  // Use subjects from the class (already filtered in the page component)
  const sortedSubjects = sortSubjectsByOrder(
    selectedClass.subjects || [], 
    selectedClass.name
  );

  // Debug logging
  console.log("Selected Class:", selectedClass);
  console.log("Class Subjects:", selectedClass.subjects);
  console.log("Sorted Subjects:", sortedSubjects);

  // Create pages array based on page configs
  const pages: { students: any[]; startIndex: number }[] = [];
  let currentIndex = 0;

  pageConfigs.forEach((config) => {
    const pageStudents = sortedStudents.slice(
      currentIndex,
      currentIndex + config.studentCount
    );
    if (pageStudents.length > 0) {
      pages.push({
        students: pageStudents,
        startIndex: currentIndex,
      });
      currentIndex += config.studentCount;
    }
  });

  // Helper to get subject abbreviation
  const getSubjectAbbr = (subjectName: string): string => {
    const abbrMap: { [key: string]: string } = {
      "ភាសាខ្មែរ": "ខ្មែរ",
      "គណិតវិទ្យា": "គណិត",
      "រូបវិទ្យា": "រូប",
      "គីមីវិទ្យា": "គីមី",
      "ជីវវិទ្យា": "ជីវ",
      "ប្រវត្តិវិទ្យា": "ប្រវ",
      "ភូមិវិទ្យា": "ភូមិ",
      "ភាសាអង់គ្លេស": "អង់",
      "សីលធម៌-ពលរដ្ឋ": "សីល",
      "ផែនដីនិងបរិស្ថាន": "ផែន",
      "វិទ្យាសាស្ត្រ": "វិទ្យា",
      "តែងសេចក្ដី": "តែង",
      "សរសេរតាមអាន": "ស.អាន",
    };
    return abbrMap[subjectName] || subjectName.substring(0, 4);
  };

  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: "Khmer OS Muol Light";
          src: local("Khmer OS Muol Light"), local("KhmerOSMuolLight");
        }
        @font-face {
          font-family: "Khmer OS Bokor";
          src: local("Khmer OS Bokor"), local("KhmerOSBokor");
        }
        @font-face {
          font-family: "Khmer OS Siem Reap";
          src: local("Khmer OS Siemreap"), local("KhmerOSSiemreap");
        }
        @font-face {
          font-family: "Tacteing";
          src: local("Tacteing"), local("TacteingA");
        }

        .attendance-report-page {
          page-break-inside: avoid;
          page-break-after: always;
          break-inside: avoid;
          break-after: page;
        }

        .attendance-report-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }

          .attendance-report-page {
            page-break-inside: avoid !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            break-after: page !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 1cm !important;
            box-shadow: none !important;
            background: white !important;
            overflow: visible !important;
          }

          .attendance-report-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          table {
            width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
          }

          th,
          td {
            border: 0.5px solid black !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="attendance-report-page mx-auto mb-8 bg-white p-6 shadow-lg"
          style={{
            width: "210mm",
            minHeight: "297mm",
            fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
          }}
        >
          {/* Header - Same design as exam report */}
          <div className="mb-2">
            {/* Row 1: Kingdom (right) and School info (left) on same level */}
            <div className="flex justify-between items-start mb-1">
              {/* Left: School info */}
              <div
                className="text-left"
                style={{
                  fontFamily: "'Khmer OS Bokor', serif",
                  paddingTop: "14px",
                }}
              >
                <p className="text-xs" style={{ lineHeight: "1.4" }}>
                  {province || "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"}
                </p>
                <p className="text-xs font-bold" style={{ lineHeight: "1.4" }}>
                  {examCenter || "វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ"}
                </p>
              </div>

              {/* Right: Kingdom */}
              <div className="text-center">
                <p
                  className="font-bold text-sm"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                    lineHeight: "1.2",
                  }}
                >
                  ព្រះរាជាណាចក្រកម្ពុជា
                </p>
                <p
                  className="font-bold text-sm"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                    lineHeight: "1.2",
                  }}
                >
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </p>
                <p
                  className="text-red-600 text-base mt-0"
                  style={{
                    fontFamily: "'Tacteing', serif",
                    letterSpacing: "0.1em",
                    fontSize: "24px",
                  }}
                >
                  3
                </p>
              </div>
            </div>

            {/* Row 2: Title in center */}
            <div className="text-center mb-1.5">
              <h1
                className="text-base font-bold mb-0.5"
                style={{
                  fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                }}
              >
                {reportTitle}
              </h1>
              <p
                className="text-xs mb-0.5"
                style={{
                  fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                }}
              >
                ឆ្នាំសិក្សា៖ {selectedYear}-{selectedYear + 1}
              </p>
              <p
                className="text-xs font-bold"
                style={{
                  fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                }}
              >
                បន្ទប់លេខ៖ {String(parseInt(roomNumber) + pageIndex).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Class Label */}
          <div
            className="text-left mb-1 font-bold"
            style={{
              fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              fontSize: "11px",
            }}
          >
            {selectedClass.name}{pageIndex + 1}
          </div>

          {/* Table */}
          <table
            className="w-full"
            style={{
              fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              borderCollapse: "collapse",
              fontSize: "9px",
            }}
          >
            <thead>
              {/* Main header row */}
              <tr>
                <th
                  rowSpan={2}
                  className="px-1 py-1.5 bg-gray-100 align-middle text-center"
                  style={{ 
                    border: "1px solid black", 
                    width: "25px",
                    fontFamily: "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif"
                  }}
                >
                  ល.រ
                </th>
                <th
                  rowSpan={2}
                  className="px-1 py-1.5 bg-gray-100 align-middle"
                  style={{ 
                    border: "1px solid black", 
                    width: "80px",
                    fontFamily: "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif"
                  }}
                >
                  គោត្តនាម និងនាម
                </th>
                <th
                  rowSpan={2}
                  className="px-1 py-1.5 bg-gray-100 align-middle text-center"
                  style={{ 
                    border: "1px solid black", 
                    width: "25px",
                    fontFamily: "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif"
                  }}
                >
                  ភេទ
                </th>
                {/* Subject columns */}
                {sortedSubjects.map((subject: any) => (
                  <th
                    key={subject.id}
                    rowSpan={2}
                    className="px-1 py-1.5 bg-blue-100 align-middle text-center"
                    style={{ 
                      border: "1px solid black", 
                      width: "45px",
                      fontFamily: "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      fontSize: "8px",
                    }}
                  >
                    {getSubjectAbbr(subject.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.students.map((student: any, index: number) => (
                <tr key={student.id} style={{ border: "1px solid black" }}>
                  {/* No */}
                  <td
                    className="px-1 py-1 text-center align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    {page.startIndex + index + 1}
                  </td>
                  {/* Name */}
                  <td
                    className="px-1 py-1 align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    {student.khmerName}
                  </td>
                  {/* Gender */}
                  <td
                    className="px-1 py-1 text-center align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    {student.gender === "male" ? "ប" : "ស"}
                  </td>
                  {/* Subject columns - empty for attendance */}
                  {sortedSubjects.map((subject: any) => (
                    <td
                      key={subject.id}
                      className="px-1 py-1 text-center align-middle"
                      style={{ border: "1px solid black", minHeight: "18px" }}
                    >
                      
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Room Statistics */}
          <div className="mt-2 text-xs">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="font-bold mb-1 text-center text-gray-800">
                ចំនួនសិស្សក្នុងមួយបន្ទប់
              </div>
              <div className="text-xs bg-white p-2 rounded border border-gray-200">
                <span className="font-bold text-purple-700">
                  បន្ទប់ {String(parseInt(roomNumber) + pageIndex).padStart(2, '0')}:
                </span>
                <div className="ml-2 mt-1">
                  <div className="text-blue-600">
                    • {selectedClass.name}{pageIndex + 1}: {page.students.length} នាក់
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures - Only on last page */}
          {pageIndex === pages.length - 1 && (
            <>
              {/* Signatures */}
              <div className="grid grid-cols-2 gap-10 mt-3">
                {/* Principal */}
                <div className="text-center">
                  <p
                    className="text-xs mb-0.5"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    {reportDate}
                  </p>
                  <p
                    className="text-xs font-bold mb-0.5"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    នាយកសាលារៀន
                  </p>
                  <div className="h-12"></div>
                  <p
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    {principalName}
                  </p>
                </div>

                {/* Teacher */}
                <div className="text-center">
                  <p
                    className="text-xs mb-0.5"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    {reportDate}
                  </p>
                  <p
                    className="text-xs font-bold mb-0.5"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    គ្រូបន្ទុកថ្នាក់
                  </p>
                  <div className="h-12"></div>
                  <p
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siem Reap', serif",
                    }}
                  >
                    {teacherName}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
}

"use client";

interface PageConfig {
  id: string;
  class1Count: number;
  class2Count: number;
}

interface KhmerExamReportProps {
  class1: any;
  class2: any;
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

export default function KhmerExamReport({
  class1,
  class2,
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
}: KhmerExamReportProps) {
  // Sort students from both classes
  const sortedStudents1 = sortStudents(class1.students || []);
  const sortedStudents2 = sortStudents(class2.students || []);

  // Create pages based on configuration
  const pages: Array<{
    students1: any[];
    students2: any[];
    startIndex1: number;
    startIndex2: number;
  }> = [];

  let currentIndex1 = 0;
  let currentIndex2 = 0;

  pageConfigs.forEach((config) => {
    const pageStudents1 = sortedStudents1.slice(
      currentIndex1,
      currentIndex1 + config.class1Count,
    );
    const pageStudents2 = sortedStudents2.slice(
      currentIndex2,
      currentIndex2 + config.class2Count,
    );

    // Only add page if there are students to show
    if (pageStudents1.length > 0 || pageStudents2.length > 0) {
      pages.push({
        students1: pageStudents1,
        students2: pageStudents2,
        startIndex1: currentIndex1,
        startIndex2: currentIndex2,
      });

      currentIndex1 += config.class1Count;
      currentIndex2 += config.class2Count;
    }
  });

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

        .exam-report-page {
          page-break-inside: avoid;
          page-break-after: always;
          break-inside: avoid;
          break-after: page;
        }

        .exam-report-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }

          .exam-report-page {
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

          .exam-report-page:last-child {
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

          .two-tables-container {
            display: flex !important;
            gap: 3mm !important;
          }

          .table-wrapper {
            flex: 1 !important;
          }
        }
      `}</style>

      {pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="exam-report-page bg-white mb-8"
          style={{
            width: "210mm",
            minHeight: "auto",
            margin: "0 auto",
            padding: "5mm 3mm",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {/* Header - Show on every page with incremented room number */}
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
                បន្ទប់លេខ៖{" "}
                {String(parseInt(roomNumber) + pageIndex).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Two Tables Side by Side */}
          <div
            className="two-tables-container"
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            {/* Left Table - Class 1 */}
            <div className="table-wrapper" style={{ flex: 1 }}>
              {/* Simple Class Label */}
              <div
                className="text-left mb-0.5 font-bold"
                style={{
                  fontFamily:
                    "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
                  fontSize: "11px",
                }}
              >
                {class1.name}
                {pageIndex + 1}
              </div>
              <table
                className="w-full"
                style={{
                  fontFamily:
                    "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
                  borderCollapse: "collapse",
                  fontSize: "10px",
                }}
              >
                <thead>
                  <tr style={{ border: "1px solid black" }}>
                    <th
                      className="px-1 py-1.5 bg-gray-100 w-10 align-middle text-center"
                      style={{
                        border: "1px solid black",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      លេខតុ
                    </th>
                    <th
                      className="px-2 py-1.5 bg-gray-100 align-middle"
                      style={{
                        border: "1px solid black",
                        minWidth: "120px",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      គោត្តនាម និងនាម
                    </th>
                    <th
                      className="px-1 py-1.5 bg-gray-100 w-12 align-middle text-center"
                      style={{
                        border: "1px solid black",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      ភេទ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.students1.map((student: any, index: number) => (
                    <tr key={student.id} style={{ border: "1px solid black" }}>
                      <td
                        className="px-1 py-1 text-center"
                        style={{ border: "1px solid black" }}
                      >
                        {page.startIndex1 + index + 1}
                      </td>
                      <td
                        className="px-2 py-1"
                        style={{ border: "1px solid black" }}
                      >
                        {student.khmerName ||
                          `${student.lastName} ${student.firstName}`}
                      </td>
                      <td
                        className="px-1 py-1 text-center"
                        style={{ border: "1px solid black" }}
                      >
                        {student.gender === "MALE" || student.gender === "male" ? "ប" : "ស"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Table - Class 2 */}
            <div className="table-wrapper" style={{ flex: 1 }}>
              {/* Simple Class Label */}
              <div
                className="text-left mb-0.5 font-bold"
                style={{
                  fontFamily:
                    "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
                  fontSize: "11px",
                }}
              >
                {class2.name}
                {pageIndex + 1}
              </div>
              <table
                className="w-full"
                style={{
                  fontFamily:
                    "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
                  borderCollapse: "collapse",
                  fontSize: "10px",
                }}
              >
                <thead>
                  <tr style={{ border: "1px solid black" }}>
                    <th
                      className="px-1 py-1.5 bg-gray-100 w-10 align-middle text-center"
                      style={{
                        border: "1px solid black",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      លេខតុ
                    </th>
                    <th
                      className="px-2 py-1.5 bg-gray-100 align-middle"
                      style={{
                        border: "1px solid black",
                        minWidth: "120px",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      គោត្តនាម និងនាម
                    </th>
                    <th
                      className="px-1 py-1.5 bg-gray-100 w-12 align-middle text-center"
                      style={{
                        border: "1px solid black",
                        fontFamily:
                          "'Khmer OS Moul Light', 'Khmer OS Muol Light', serif",
                      }}
                    >
                      ភេទ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.students2.map((student: any, index: number) => (
                    <tr key={student.id} style={{ border: "1px solid black" }}>
                      <td
                        className="px-1 py-1 text-center"
                        style={{ border: "1px solid black" }}
                      >
                        {page.startIndex2 + index + 1}
                      </td>
                      <td
                        className="px-2 py-1"
                        style={{ border: "1px solid black" }}
                      >
                        {student.khmerName ||
                          `${student.lastName} ${student.firstName}`}
                      </td>
                      <td
                        className="px-1 py-1 text-center"
                        style={{ border: "1px solid black" }}
                      >
                        {student.gender === "MALE" || student.gender === "male" ? "ប" : "ស"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Statistics - Show on every page */}
          <div className="mt-2 mb-2">
            <div
              className="text-xs text-center bg-gray-50 py-2 px-4 rounded"
              style={{
                fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              }}
            >
              <span className="font-bold text-gray-800">
                បន្ទប់លេខ{" "}
                {String(parseInt(roomNumber) + pageIndex).padStart(2, "0")}
                ៖{" "}
              </span>
              <span className="text-blue-700 font-semibold">
                {class1.name} ({page.students1.length} នាក់)
              </span>
              <span className="mx-2 text-gray-500">+</span>
              <span className="text-green-700 font-semibold">
                {class2.name} ({page.students2.length} នាក់)
              </span>
              <span className="mx-2 text-gray-500">=</span>
              <span className="font-bold text-purple-700">
                សរុប {page.students1.length + page.students2.length} នាក់
              </span>
            </div>
          </div>

          {/* Current Room Breakdown - Show on every page */}
          <div className="mb-3 mt-1">
            <div
              className="text-xs bg-blue-50 p-3 rounded border border-blue-200"
              style={{
                fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              }}
            >
              <div className="font-bold mb-2 text-center text-gray-800">
                ចំនួនសិស្សក្នុងមួយបន្ទប់
              </div>
              <div className="text-xs bg-white p-2 rounded border border-gray-200">
                <span className="font-bold text-purple-700">
                  បន្ទប់{" "}
                  {String(parseInt(roomNumber) + pageIndex).padStart(2, "0")}:
                </span>
                <div className="ml-2 mt-1">
                  <div className="text-blue-600">
                    • {class1.name}: {page.students1.length} នាក់
                  </div>
                  <div className="text-green-600">
                    • {class2.name}: {page.students2.length} នាក់
                  </div>
                  <div className="font-semibold text-gray-700 mt-1 border-t pt-1">
                    សរុប: {page.students1.length + page.students2.length} នាក់
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

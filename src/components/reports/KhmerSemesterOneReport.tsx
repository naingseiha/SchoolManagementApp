"use client";

interface SemesterReportRow {
  student: {
    id: string;
    lastName: string;
    firstName: string;
    gender: "male" | "female";
    className: string;
  };
  permission: number;
  absent: number;
  totalAbsent: number;
  preSemesterAverage: number;
  preSemesterRank: number;
  examTotal: number;
  examAverage: number;
  examRank: number;
  finalAverage: number;
  finalRank: number;
  finalGrade: string;
}

interface KhmerSemesterOneReportProps {
  paginatedReports: SemesterReportRow[][];
  selectedClass: any;
  province: string;
  examCenter: string;
  reportTitle: string;
  reportDate: string;
  teacherName: string;
  principalName: string;
  selectedYear: number;
  isGradeWide: boolean;
  showClassName: boolean;
  firstPageStudentCount: number;
  studentsPerPage: number;
}

export default function KhmerSemesterOneReport({
  paginatedReports,
  selectedClass,
  province,
  examCenter,
  reportTitle,
  reportDate,
  teacherName,
  principalName,
  selectedYear,
  isGradeWide,
  showClassName,
  firstPageStudentCount,
  studentsPerPage,
}: KhmerSemesterOneReportProps) {
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

        .report-page {
          page-break-inside: avoid;
          page-break-after: always;
          break-inside: avoid;
          break-after: page;
        }

        .report-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        @media print {
          .report-page {
            page-break-inside: avoid !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            break-after: page !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            min-height: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 5mm 3mm !important;
            box-shadow: none !important;
            background: white !important;
            overflow: visible !important;
          }

          .report-page:last-child {
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

      {paginatedReports.map((pageReports, pageIndex) => (
        <div
          key={pageIndex}
          className="report-page bg-white mb-8"
          style={{
            width: "210mm",
            margin: "0 auto",
            padding: "5mm 3mm",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {pageIndex === 0 && (
            <div className="mb-2">
              <div className="flex justify-between items-start mb-1">
                <div
                  className="text-left"
                  style={{
                    fontFamily: "'Khmer OS Bokor', serif",
                    paddingTop: "14px",
                  }}
                >
                  <p className="text-xs" style={{ lineHeight: "1.4" }}>
                    {province}
                  </p>
                  <p className="text-xs font-bold" style={{ lineHeight: "1.4" }}>
                    {examCenter}
                  </p>
                </div>

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
                  {isGradeWide
                    ? `កម្រិតថ្នាក់៖ ${selectedClass?.name}`
                    : `${selectedClass?.name}`}
                </p>
              </div>
            </div>
          )}

          <table
            className="w-full"
            style={{
              fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              borderCollapse: "collapse",
              fontSize: "10px",
            }}
          >
            <thead>
              <tr style={{ border: "1px solid black" }}>
                <th
                  rowSpan={2}
                  className="px-2 py-2 bg-gray-100 w-10 align-middle"
                  style={{ border: "1px solid black" }}
                >
                  ល.រ
                </th>
                <th
                  rowSpan={2}
                  className="px-2 py-2 bg-gray-100 align-middle"
                  style={{ border: "1px solid black", minWidth: "120px" }}
                >
                  គោត្តនាម និងនាម
                </th>
                {isGradeWide && showClassName && (
                  <th
                    rowSpan={2}
                    className="px-2 py-2 bg-blue-100 align-middle"
                    style={{ border: "1px solid black", minWidth: "45px" }}
                  >
                    ថ្នាក់
                  </th>
                )}
                <th
                  colSpan={3}
                  className="px-1 py-2 bg-yellow-100"
                  style={{ border: "1px solid black" }}
                >
                  អវត្តមាន
                </th>
                <th
                  colSpan={2}
                  className="px-1 py-2 bg-cyan-100"
                  style={{ border: "1px solid black" }}
                >
                  លទ្ធផលសេប្រចាំឆមាស លទ
                </th>
                <th
                  colSpan={3}
                  className="px-1 py-2 bg-green-100"
                  style={{ border: "1px solid black" }}
                >
                  លទ្ធផលប្រឡងឆមាស
                </th>
                <th
                  colSpan={3}
                  className="px-1 py-2 bg-indigo-100"
                  style={{ border: "1px solid black" }}
                >
                  លទ្ធផលប្រចាំឆមាស
                </th>
              </tr>
              <tr style={{ border: "1px solid black" }}>
                <th
                  className="px-1 py-1 bg-yellow-50 text-xs w-10"
                  style={{ border: "1px solid black" }}
                >
                  ច
                </th>
                <th
                  className="px-1 py-1 bg-yellow-50 text-xs w-10"
                  style={{ border: "1px solid black" }}
                >
                  អច្ប
                </th>
                <th
                  className="px-1 py-1 bg-yellow-50 text-xs w-10"
                  style={{ border: "1px solid black" }}
                >
                  សរុប
                </th>
                <th
                  className="px-1 py-1 bg-cyan-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ម.ភាគ
                </th>
                <th
                  className="px-1 py-1 bg-cyan-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ចំ.ថ្នាក់
                </th>
                <th
                  className="px-1 py-1 bg-green-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ពិន្ទុ
                </th>
                <th
                  className="px-1 py-1 bg-green-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ម.ភាគ
                </th>
                <th
                  className="px-1 py-1 bg-green-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ចំ.ថ្នាក់
                </th>
                <th
                  className="px-1 py-1 bg-indigo-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ម.ភាគ
                </th>
                <th
                  className="px-1 py-1 bg-indigo-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  ចំ.ថ្នាក់
                </th>
                <th
                  className="px-1 py-1 bg-indigo-50 text-xs w-14"
                  style={{ border: "1px solid black" }}
                >
                  និទ្ទេស
                </th>
              </tr>
            </thead>

            <tbody>
              {pageReports.map((report, index) => {
                const globalIndex =
                  pageIndex === 0
                    ? index + 1
                    : firstPageStudentCount +
                      (pageIndex - 1) * studentsPerPage +
                      index +
                      1;

                return (
                  <tr key={report.student.id} style={{ border: "1px solid black" }}>
                    <td
                      className="px-2 py-1.5 text-center"
                      style={{ border: "1px solid black" }}
                    >
                      {globalIndex}
                    </td>
                    <td
                      className="px-2 py-1.5"
                      style={{ border: "1px solid black" }}
                    >
                      {report.student.lastName} {report.student.firstName}
                    </td>
                    {isGradeWide && showClassName && (
                      <td
                        className="px-2 py-1.5 text-center font-semibold bg-blue-50"
                        style={{ border: "1px solid black" }}
                      >
                        {report.student.className}
                      </td>
                    )}
                    <td
                      className="px-1 py-1.5 text-center"
                      style={{ border: "1px solid black" }}
                    >
                      {report.permission}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center"
                      style={{ border: "1px solid black" }}
                    >
                      {report.absent}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold"
                      style={{ border: "1px solid black" }}
                    >
                      {report.totalAbsent}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-cyan-700"
                      style={{ border: "1px solid black" }}
                    >
                      {report.preSemesterAverage.toFixed(2)}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-red-600"
                      style={{ border: "1px solid black" }}
                    >
                      {report.preSemesterRank}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold"
                      style={{ border: "1px solid black" }}
                    >
                      {report.examTotal.toFixed(0)}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-green-700"
                      style={{ border: "1px solid black" }}
                    >
                      {report.examAverage.toFixed(2)}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-red-600"
                      style={{ border: "1px solid black" }}
                    >
                      {report.examRank}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-blue-700"
                      style={{ border: "1px solid black" }}
                    >
                      {report.finalAverage.toFixed(2)}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold text-red-600"
                      style={{ border: "1px solid black" }}
                    >
                      {report.finalRank}
                    </td>
                    <td
                      className="px-1 py-1.5 text-center font-bold"
                      style={{ border: "1px solid black" }}
                    >
                      {report.finalGrade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pageIndex === paginatedReports.length - 1 && (
            <>
              <div className="mb-2 pb-1 mt-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex-1">
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'Khmer OS Bokor', serif" }}
                    >
                      សិស្សសរុប៖{" "}
                    </span>
                    <span className="font-bold text-blue-700">
                      {paginatedReports.flat().length} នាក់
                    </span>
                    <span className="mx-1">/</span>
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'Khmer OS Bokor', serif" }}
                    >
                      ស្រី៖{" "}
                    </span>
                    <span className="font-bold text-pink-700">
                      {
                        paginatedReports
                          .flat()
                          .filter((r) => r.student.gender === "female").length
                      }{" "}
                      នាក់
                    </span>
                  </div>

                  <div className="flex-1 text-center">
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'Khmer OS Bokor', serif" }}
                    >
                      ជាប់៖{" "}
                    </span>
                    <span className="font-bold text-green-700">
                      {
                        paginatedReports
                          .flat()
                          .filter((r) => r.finalAverage >= 25).length
                      }{" "}
                      នាក់
                    </span>
                  </div>

                  <div className="flex-1 text-right">
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'Khmer OS Bokor', serif" }}
                    >
                      ធ្លាក់៖{" "}
                    </span>
                    <span className="font-bold text-orange-700">
                      {
                        paginatedReports
                          .flat()
                          .filter((r) => r.finalAverage < 25).length
                      }{" "}
                      នាក់
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mt-3">
                <div className="text-center">
                  <p
                    className="text-xs mb-0.5"
                    style={{ fontFamily: "'Khmer OS Siem Reap', serif" }}
                  >
                    {reportDate}
                  </p>
                  <p
                    className="text-xs font-bold mb-0.5"
                    style={{ fontFamily: "'Khmer OS Siem Reap', serif" }}
                  >
                    បានឃើញ និងឯកភាព
                  </p>
                  <p
                    className="text-xs font-bold text-blue-600"
                    style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                  >
                    {principalName}
                  </p>
                </div>

                <div className="text-center">
                  <p
                    className="text-xs mb-0.5"
                    style={{ fontFamily: "'Khmer OS Siem Reap', serif" }}
                  >
                    {reportDate}
                  </p>
                  <p
                    className="text-xs font-bold mb-0.5"
                    style={{ fontFamily: "'Khmer OS Siem Reap', serif" }}
                  >
                    គ្រូទទួលបន្ទុកថ្នាក់
                  </p>
                  <div className="h-10 print:h-14"></div>
                  <p
                    className="text-xs font-bold text-blue-600"
                    style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
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

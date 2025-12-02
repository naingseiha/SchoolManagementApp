"use client";

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
  getSubjectAbbr: (subjectName: string) => string;
  showSubjects?: boolean;
  showAttendance?: boolean;
  showTotal?: boolean;
  showAverage?: boolean;
  showGradeLevel?: boolean;
  showRank?: boolean;
  showRoomNumber?: boolean;
  selectedYear?: number;
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
  showSubjects = false,
  showAttendance = true,
  showTotal = true,
  showAverage = true,
  showGradeLevel = true,
  showRank = true,
  showRoomNumber = true,
  selectedYear = 2025,
}: KhmerMonthlyReportProps) {
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

        /* ✅ Prevent page break inside header + table */
        .report-page {
          page-break-inside: avoid;
          page-break-after: always;
        }

        .report-page:last-child {
          page-break-after: auto;
        }

        @media print {
          .report-page {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {paginatedReports.map((pageReports, pageIndex) => (
        <div
          key={pageIndex}
          className="report-page bg-white shadow-2xl mb-8"
          style={{
            width: "210mm",
            minHeight: "297mm",
            margin: "0 auto",
            padding: "15mm",
            boxSizing: "border-box",
          }}
        >
          {/* ✅ Header - Only on first page, but stays with table */}
          {pageIndex === 0 && (
            <div className="mb-4">
              {/* Row 1: Kingdom on right */}
              <div className="flex justify-end mb-1">
                <div className="text-center">
                  <p
                    className="font-bold text-base"
                    style={{
                      fontFamily:
                        "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                      lineHeight: "1.6",
                    }}
                  >
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </p>
                  <p
                    className="font-bold text-base"
                    style={{
                      fontFamily:
                        "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                      lineHeight: "1. 6",
                    }}
                  >
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </p>
                  <p
                    className="text-black-600 text-base mt-0.5"
                    style={{
                      fontFamily: "'Tacteing', serif",
                      letterSpacing: "0.1em",
                      fontSize: "32px",
                    }}
                  >
                    3
                  </p>
                </div>
              </div>

              {/* Row 2: School info on left */}
              <div className="flex justify-start mb-2">
                <div
                  className="text-left"
                  style={{
                    fontFamily: "'Khmer OS Bokor', serif",
                  }}
                >
                  <p className="text-sm" style={{ lineHeight: "1.8" }}>
                    {province || "មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"}
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{ lineHeight: "1.8" }}
                  >
                    {examCenter || "វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ"}
                  </p>
                </div>
              </div>

              {/* Row 3: Title in center */}
              <div className="text-center mb-3">
                <h1
                  className="text-lg font-bold mb-1"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                  }}
                >
                  {reportTitle}
                </h1>
                <p
                  className="text-sm mb-0.5"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                  }}
                >
                  ឆ្នាំសិក្សា៖ {selectedYear}-{selectedYear + 1}
                </p>

                {/* ✅ Class and Room on same line */}
                <div className="flex justify-between items-center px-4">
                  <p
                    className="text-sm font-bold"
                    style={{
                      fontFamily:
                        "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                    }}
                  >
                    ថ្នាក់ទី៖ {selectedClass?.name}
                  </p>
                  {showRoomNumber && roomNumber && (
                    <p
                      className="text-sm font-bold"
                      style={{
                        fontFamily:
                          "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
                      }}
                    >
                      បន្ទប់ប្រឡង៖ {roomNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Table - immediately after header, no break */}
          <table
            className="w-full text-xs"
            style={{
              fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              {/* Row 1: Main Headers */}
              <tr style={{ border: "1px solid black" }}>
                <th
                  rowSpan={showAttendance ? 2 : 1}
                  className="px-2 py-2 bg-gray-100 w-10 align-middle"
                  style={{ border: "1px solid black" }}
                >
                  ល.រ
                </th>

                <th
                  rowSpan={showAttendance ? 2 : 1}
                  className="px-2 py-2 bg-gray-100 align-middle"
                  style={{ border: "1px solid black", minWidth: "120px" }}
                >
                  គោត្តនាម និងនាម
                </th>

                {showAttendance && (
                  <th
                    colSpan={3}
                    className="px-1 py-2 bg-yellow-100"
                    style={{ border: "1px solid black" }}
                  >
                    អវត្តមាន
                  </th>
                )}

                {showSubjects &&
                  subjects.map((subject) => (
                    <th
                      key={subject.id}
                      rowSpan={showAttendance ? 2 : 1}
                      className="px-1 py-2 bg-blue-50 text-center align-middle"
                      style={{ border: "1px solid black", minWidth: "35px" }}
                    >
                      {getSubjectAbbr(subject.name)}
                    </th>
                  ))}

                {showTotal && (
                  <th
                    rowSpan={showAttendance ? 2 : 1}
                    className="px-2 py-2 bg-green-100 w-16 align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    ពិន្ទុសរុប
                  </th>
                )}

                {showAverage && (
                  <th
                    rowSpan={showAttendance ? 2 : 1}
                    className="px-2 py-2 bg-green-100 w-16 align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    ម.ភាគ
                  </th>
                )}

                {showRank && (
                  <th
                    rowSpan={showAttendance ? 2 : 1}
                    className="px-2 py-2 bg-indigo-100 w-16 align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    ចំ.ថ្នាក់
                  </th>
                )}

                {showGradeLevel && (
                  <th
                    rowSpan={showAttendance ? 2 : 1}
                    className="px-2 py-2 bg-yellow-100 w-16 align-middle"
                    style={{ border: "1px solid black" }}
                  >
                    និទ្ទេស
                  </th>
                )}
              </tr>

              {/* Row 2: Sub-headers */}
              {showAttendance && (
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
                    អ
                  </th>
                  <th
                    className="px-1 py-1 bg-yellow-50 text-xs w-10"
                    style={{ border: "1px solid black" }}
                  >
                    សរុប
                  </th>
                </tr>
              )}
            </thead>

            <tbody>
              {pageReports.map((report, index) => {
                const globalIndex = pageIndex * studentsPerPage + index + 1;
                const isPassed =
                  autoCircle &&
                  showCircles &&
                  ["A", "B", "C", "D", "E"].includes(report.letterGrade);

                return (
                  <tr
                    key={report.student.id}
                    style={{ border: "1px solid black" }}
                  >
                    <td
                      className="px-2 py-1. 5 text-center relative"
                      style={{ border: "1px solid black" }}
                    >
                      {isPassed ? (
                        <div className="relative inline-flex items-center justify-center">
                          <span className="absolute w-6 h-6 border-2 border-red-600 rounded-full"></span>
                          <span className="relative z-10">{globalIndex}</span>
                        </div>
                      ) : (
                        globalIndex
                      )}
                    </td>

                    <td
                      className={`px-2 py-1.5 ${
                        isPassed ? "bg-yellow-100 font-bold" : ""
                      }`}
                      style={{ border: "1px solid black" }}
                    >
                      {report.student.lastName} {report.student.firstName}
                    </td>

                    {showAttendance && (
                      <>
                        <td
                          className="px-1 py-1. 5 text-center"
                          style={{ border: "1px solid black" }}
                        >
                          {report.permission || 0}
                        </td>
                        <td
                          className="px-1 py-1.5 text-center"
                          style={{ border: "1px solid black" }}
                        >
                          {report.absent || 0}
                        </td>
                        <td
                          className="px-1 py-1.5 text-center font-bold"
                          style={{ border: "1px solid black" }}
                        >
                          {(report.permission || 0) + (report.absent || 0)}
                        </td>
                      </>
                    )}

                    {showSubjects &&
                      subjects.map((subject) => {
                        const grade = report.grades.find(
                          (g: any) => g.subjectId === subject.id
                        );
                        const score = grade?.score;
                        return (
                          <td
                            key={subject.id}
                            className="px-1 py-1. 5 text-center"
                            style={{ border: "1px solid black" }}
                          >
                            {score !== null && score !== undefined
                              ? parseFloat(score.toString()).toFixed(1)
                              : "-"}
                          </td>
                        );
                      })}

                    {showTotal && (
                      <td
                        className="px-2 py-1.5 text-center font-bold bg-green-50"
                        style={{ border: "1px solid black" }}
                      >
                        {report.total.toFixed(0)}
                      </td>
                    )}
                    {showAverage && (
                      <td
                        className="px-2 py-1.5 text-center font-bold bg-green-50"
                        style={{ border: "1px solid black" }}
                      >
                        {report.average.toFixed(2)}
                      </td>
                    )}
                    {showRank && (
                      <td
                        className="px-2 py-1.5 text-center font-bold text-red-600 bg-indigo-50"
                        style={{ border: "1px solid black" }}
                      >
                        {report.rank}
                      </td>
                    )}
                    {showGradeLevel && (
                      <td
                        className="px-2 py-1. 5 text-center font-bold bg-yellow-50"
                        style={{ border: "1px solid black" }}
                      >
                        {report.letterGrade}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ✅ Footer - Only on last page */}
          {pageIndex === paginatedReports.length - 1 && (
            <div
              className="mt-8 flex justify-between text-sm"
              style={{
                fontFamily: "'Khmer OS Siem Reap', 'Khmer OS Siemreap', serif",
              }}
            >
              <div className="text-center">
                <p className="mb-12">{reportDate}</p>
                <p className="font-bold">គ្រូបន្ទុកថ្នាក់</p>
                <p className="mt-2">{teacherName}</p>
              </div>
              <div className="text-center">
                <p className="mb-12">{reportDate}</p>
                <p className="font-bold">នាយកសាលា</p>
                <p className="mt-2">{principalName}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

"use client";

type ReportTabType = "score-bulletin" | "internship-book";

interface SubjectScoreData {
  score: number | null;
  maxScore: number;
  gradeLevel?: string;
  gradeLevelKhmer?: string;
  percentage?: number;
  semester1Score?: number | null;
  semester1Rank?: number | null;
  semester2Score?: number | null;
  semester2Rank?: number | null;
  annualScore?: number | null;
  annualRank?: number | null;
  status?: string;
  note?: string;
}

interface StudentTranscriptProps {
  studentData: {
    studentId: string;
    studentName: string;
    studentNumber: string;
    dateOfBirth: string;
    placeOfBirth: string;
    gender: string;
    fatherName: string;
    fatherOccupation?: string;
    motherName: string;
    motherOccupation?: string;
    guardianPhone?: string;
    address: string;
    className: string;
    grade: string;
  };
  subjects: Array<{
    id: string;
    nameKh: string;
    code: string;
    maxScore: number;
  }>;
  subjectScores: {
    [subjectId: string]: SubjectScoreData;
  };
  summary: {
    totalScore: number;
    averageScore: number;
    gradeLevel: string;
    gradeLevelKhmer: string;
    rank: number;
    totalRank?: number | null;
    averageRank?: number | null;
    semester1TotalRank?: number | null;
    semester2TotalRank?: number | null;
    semester1AverageRank?: number | null;
    semester2AverageRank?: number | null;
  };
  attendance?: {
    totalAbsent: number;
    permission: number;
    withoutPermission: number;
  };
  year: number;
  month: string | null;
  teacherName: string;
  principalName: string;
  schoolName: string;
  province: string;
  placeName: string;
  directorDate: string;
  teacherDate: string;
  reportTab?: ReportTabType;
}

export default function StudentTranscript({
  studentData,
  subjects,
  subjectScores,
  summary,
  attendance,
  year,
  month,
  teacherName,
  principalName,
  schoolName,
  province,
  placeName,
  directorDate,
  teacherDate,
  reportTab = "score-bulletin",
}: StudentTranscriptProps) {
  const displayValue = (
    value: string | number | null | undefined,
    suffix: string = ""
  ): string => {
    if (value === null || value === undefined || value === "" || value === 0) {
      return "N/A";
    }
    return `${value}${suffix}`;
  };

  const toNumber = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return null;
    }
    return value;
  };

  const formatMetric = (
    value: number | null | undefined,
    digits: number = 1
  ): string => {
    const numericValue = toNumber(value);
    return numericValue === null ? "-" : numericValue.toFixed(digits);
  };

  const formatRank = (value: number | null | undefined): string => {
    const numericValue = toNumber(value);
    return numericValue === null ? "-" : `${Math.round(numericValue)}`;
  };

  type GradeLetter = "A" | "B" | "C" | "D" | "E" | "F";
  const GRADE_LABELS_KH: Record<GradeLetter, string> = {
    A: "ល្អប្រសើរ",
    B: "ល្អណាស់",
    C: "ល្អ",
    D: "ល្អបង្គួរ",
    E: "មធ្យម",
    F: "ខ្សោយ",
  };

  const normalizeGradeLetter = (value: string | undefined): GradeLetter | null => {
    if (!value) return null;
    const normalized = value.trim().toUpperCase();
    if (normalized in GRADE_LABELS_KH) {
      return normalized as GradeLetter;
    }
    return null;
  };

  const getGradeLabelKhFromScore = (
    score: number | null,
    maxScore: number | null
  ): string => {
    if (score === null || maxScore === null || maxScore <= 0) {
      return "";
    }
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return GRADE_LABELS_KH.A;
    if (percentage >= 70) return GRADE_LABELS_KH.B;
    if (percentage >= 60) return GRADE_LABELS_KH.C;
    if (percentage >= 50) return GRADE_LABELS_KH.D;
    if (percentage >= 40) return GRADE_LABELS_KH.E;
    return GRADE_LABELS_KH.F;
  };

  const getSemesterMetrics = (scoreData?: SubjectScoreData) => {
    const semester1Score = toNumber(scoreData?.semester1Score ?? scoreData?.score);
    const semester1Rank = toNumber(scoreData?.semester1Rank);
    const semester2Score = toNumber(scoreData?.semester2Score);
    const semester2Rank = toNumber(scoreData?.semester2Rank);
    const calculatedAnnualScore =
      toNumber(scoreData?.annualScore) ??
      (semester1Score !== null && semester2Score !== null
        ? (semester1Score + semester2Score) / 2
        : semester1Score);
    const annualRank = toNumber(scoreData?.annualRank) ?? semester1Rank;
    const note = scoreData?.note || "";

    return {
      semester1Score,
      semester1Rank,
      semester2Score,
      semester2Rank,
      annualScore: calculatedAnnualScore,
      annualRank,
      note,
    };
  };

  const semesterRows = subjects.map((subject) => {
    const scoreData = subjectScores[subject.id];
    const metrics = getSemesterMetrics(scoreData);
    const resolvedMaxScore = toNumber(scoreData?.maxScore ?? subject.maxScore);
    const backendGradeLetter = normalizeGradeLetter(scoreData?.gradeLevel);
    const annualGradeLevelKhmer =
      getGradeLabelKhFromScore(metrics.annualScore, resolvedMaxScore) ||
      scoreData?.gradeLevelKhmer ||
      (backendGradeLetter ? GRADE_LABELS_KH[backendGradeLetter] : "");

    return {
      subject,
      annualGradeLevelKhmer,
      ...metrics,
    };
  });

  const semester1Available = semesterRows.filter(
    (row) => row.semester1Score !== null
  );
  const semester2Available = semesterRows.filter(
    (row) => row.semester2Score !== null
  );
  const annualAvailable = semesterRows.filter((row) => row.annualScore !== null);

  const semester1Total = semester1Available.reduce(
    (sum, row) => sum + (row.semester1Score ?? 0),
    0
  );
  const semester2Total = semester2Available.reduce(
    (sum, row) => sum + (row.semester2Score ?? 0),
    0
  );
  const annualTotal = annualAvailable.reduce(
    (sum, row) => sum + (row.annualScore ?? 0),
    0
  );

  const semester1Average =
    semester1Available.length > 0
      ? semester1Total / semester1Available.length
      : null;
  const semester2Average =
    semester2Available.length > 0
      ? semester2Total / semester2Available.length
      : null;
  const annualAverage =
    annualAvailable.length > 0 ? annualTotal / annualAvailable.length : null;
  const reportTitleKh =
    reportTab === "internship-book" ? "សៀវភៅសិក្ខាគារិក" : "ព្រឹត្តិបត្រពិន្ទុ";
  const normalizeRank = (value: number | null | undefined): number | null => {
    const numericValue = toNumber(value);
    if (numericValue === null || numericValue <= 0) {
      return null;
    }
    return numericValue;
  };
  const totalSummaryRank =
    normalizeRank(summary.totalRank) ?? normalizeRank(summary.rank);
  const averageSummaryRank =
    normalizeRank(summary.averageRank) ?? normalizeRank(summary.rank);
  const semester1TotalSummaryRank = normalizeRank(summary.semester1TotalRank);
  const semester2TotalSummaryRank = normalizeRank(summary.semester2TotalRank);
  const semester1AverageSummaryRank = normalizeRank(summary.semester1AverageRank);
  const semester2AverageSummaryRank = normalizeRank(summary.semester2AverageRank);

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
          font-family: "Khmer OS Battambang";
          src: local("Khmer OS Battambang"), local("KhmerOSBattambang");
        }
        @font-face {
          font-family: "Tacteing";
          src: local("Tacteing"), local("TacteingA");
        }

        .transcript-page-wrapper {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white !important;
          padding: 20mm 0;
          page-break-after: always;
          page-break-inside: avoid;
        }

        .transcript-page-wrapper:last-child {
          page-break-after: auto;
        }

        @media screen {
          .transcript-page-wrapper {
            margin-bottom: 20px;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          html {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .transcript-page-wrapper {
            width: 100%;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
            background: white !important;
            padding: 10mm 0 !important;
            margin: 0 !important;
            position: relative;
          }

          .transcript-page-wrapper:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .student-transcript-container {
            box-shadow: none !important;
            background: white !important;
            margin: 0 auto !important;
            page-break-inside: avoid;
            break-inside: avoid;
            position: relative;
            left: auto;
            transform: none;
          }

          .student-transcript-container * {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="transcript-page-wrapper">
        <div
          className="bg-white student-transcript-container"
          style={{
            width: "277mm",
            maxWidth: "277mm",
            height: "190mm",
            padding: "4mm",
            border: "2px solid black",
            boxSizing: "border-box",
            fontFamily: "'Khmer OS Battambang', serif",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            margin: "0 auto",
          }}
        >
          <div className="flex flex-1">
            {/* Left Side - Student Info (50%) */}
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                padding: "4mm",
              }}
            >
              {/* Header */}
              <div className="text-center mb-1.5">
                <div>
                  <p
                    className="font-bold text-blue-700"
                    style={{
                      fontFamily: "'Khmer OS Muol Light', serif",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </p>
                  <p
                    className="font-bold text-blue-700"
                    style={{
                      fontFamily: "'Khmer OS Muol Light', serif",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </p>
                  <p
                    className="text-red-600"
                    style={{
                      fontFamily: "'Tacteing', serif",
                      fontSize: "22px",
                      letterSpacing: "0.1em",
                      margin: "1px 0",
                    }}
                  >
                    3
                  </p>
                </div>

                <h1
                  className="font-bold text-blue-700 mt-1.5"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', serif",
                    fontSize: "13px",
                    lineHeight: "1.3",
                  }}
                >
                  {reportTitleKh}
                </h1>
                <p
                  className="mt-2.5"
                  style={{
                    fontFamily: "'Khmer OS Muol Light', serif",
                    fontSize: "10px",
                    lineHeight: "1.3",
                  }}
                >
                  {schoolName || "វិទ្យាល័យ ហ៊ុនសែន ស្វាយធំ"}
                </p>
              </div>

              {/* Student Details */}
              <div
                className="space-y-2"
                style={{
                  fontSize: "10px",
                  lineHeight: "2",
                  textAlign: "justify",
                }}
              >
                <div className="flex items-start">
                  <span
                    className="text-red-600 font-bold"
                    style={{ width: "105px" }}
                  >
                    សម្រាប់ខែ
                  </span>
                  <span className="text-red-600 font-bold">
                    ៖ {month || "ទាំងអស់"}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    អត្តលេខ
                  </span>
                  <span className="font-bold">
                    ៖ {displayValue(studentData.studentNumber)}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ឈ្មោះសិស្ស
                  </span>
                  <span className="font-bold" style={{ width: "140px" }}>
                    ៖ {displayValue(studentData.studentName)}
                  </span>
                  <span style={{ fontSize: "10px", marginLeft: "auto" }}>
                    ភេទ៖ {studentData.gender?.toUpperCase() === "MALE" || studentData.gender === "male" ? "ប្រុស" : "ស្រី"}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ថ្ងៃខែឆ្នាំកំណើត
                  </span>
                  <span>៖ {displayValue(studentData.dateOfBirth)}</span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ទីកន្លែងកំណើត
                  </span>
                  <span>៖ {displayValue(studentData.placeOfBirth)}</span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ឪពុក
                  </span>
                  <span style={{ width: "140px" }}>
                    ៖ {displayValue(studentData.fatherName)}
                  </span>
                  <span style={{ fontSize: "10px", marginLeft: "auto" }}>
                    មុខរបរ៖ {displayValue(studentData.fatherOccupation)}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ម្តាយ
                  </span>
                  <span style={{ width: "140px" }}>
                    ៖ {displayValue(studentData.motherName)}
                  </span>
                  <span style={{ fontSize: "10px", marginLeft: "auto" }}>
                    មុខរបរ៖ {displayValue(studentData.motherOccupation)}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    អាសយដ្ឋានសព្វថ្ងៃ
                  </span>
                  <span>៖ {displayValue(studentData.address)}</span>
                </div>

                <div className="flex items-start">
                  <span className="font-bold" style={{ width: "105px" }}>
                    ទូរសព្ទអាណាព្យាបាល
                  </span>
                  <span>៖ {displayValue(studentData.guardianPhone)}</span>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="mt-3 pt-1.5 border-t border-gray-300">
                <div
                  className="grid grid-cols-3 gap-1 text-center"
                  style={{ fontSize: "9px", lineHeight: "1.5" }}
                >
                  <div>
                    <p className="font-bold">
                      អវត្តមាន៖{" "}
                      {String(attendance?.totalAbsent || 0).padStart(2, "0")} ដង
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">
                      មានច្បាប់៖{" "}
                      {String(attendance?.permission || 0).padStart(2, "0")} ដង
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">
                      អត់ច្បាប់៖{" "}
                      {String(attendance?.withoutPermission || 0).padStart(
                        2,
                        "0"
                      )}{" "}
                      ដង
                    </p>
                  </div>
                </div>

                <div
                  className="mt-1.5 space-y-0"
                  style={{ fontSize: "8px", lineHeight: "1.6" }}
                >
                  <p>មតិឆ្លើយឆ្លងរបស់អាណាព្យាបាល៖</p>
                  <p
                    style={{
                      borderBottom: "1px dotted #000",
                      height: "18px",
                      margin: "2px 0",
                    }}
                  ></p>
                  <p
                    style={{
                      borderBottom: "1px dotted #000",
                      height: "18px",
                      margin: "2px 0",
                    }}
                  ></p>
                  <p
                    style={{
                      borderBottom: "1px dotted #000",
                      height: "18px",
                      margin: "2px 0",
                    }}
                  ></p>
                  <p
                    style={{
                      borderBottom: "1px dotted #000",
                      height: "18px",
                      margin: "2px 0",
                    }}
                  ></p>
                </div>

                <div
                  className="mt-1.5 text-center"
                  style={{
                    fontSize: "9px",
                    lineHeight: "2",
                    marginBottom: "8mm",
                  }}
                >
                  <p>
                    {placeName} {directorDate}
                  </p>
                  <p className="mt-1">បានឃើញ និងឯកភាព</p>
                  <p
                    className="font-bold text-blue-700"
                    style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                  >
                    {principalName || "នាយកសាលា"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Grade Table (50%) */}
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {reportTab === "score-bulletin" ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#FFF9E6" }}>
                      <th
                        rowSpan={2}
                        className="border border-black px-1.5 py-1.5"
                        style={{
                          width: "7%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ល.រ
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-black px-1.5 py-1.5"
                        style={{
                          width: "25%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        មុខវិជ្ជា
                      </th>
                      <th
                        colSpan={3}
                        className="border border-black px-1.5 py-1"
                        style={{
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ពិន្ទុ
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-black px-1.5 py-1.5"
                        style={{
                          width: "15%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ផ្សេងៗ
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#FFF9E6" }}>
                      <th
                        className="border border-black px-1.5 py-1"
                        style={{
                          width: "12%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        អតិបរមា
                      </th>
                      <th
                        className="border border-black px-1.5 py-1"
                        style={{
                          width: "15%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ពិន្ទុបាន
                      </th>
                      <th
                        className="border border-black px-1.5 py-1"
                        style={{
                          width: "12%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        និទ្ទេស
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {subjects.map((subject, index) => {
                      const scoreData = subjectScores[subject.id];
                      const score = toNumber(scoreData?.score);
                      const maxScore = toNumber(scoreData?.maxScore ?? subject.maxScore);
                      const gradeLevel =
                        scoreData?.gradeLevelKhmer ||
                        getGradeLabelKhFromScore(score, maxScore);

                      return (
                        <tr key={subject.id}>
                          <td
                            className="border border-black px-1.5 py-1 text-center"
                            style={{
                              fontFamily: "'Time New Roman'",
                              fontWeight: "bold",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td className="border border-black px-1.5 py-1">
                            {subject.nameKh}
                          </td>
                          <td
                            className="border border-black px-1.5 py-1 text-center font-bold"
                            style={{
                              fontFamily: "'Time New Roman'",
                              fontWeight: "bold",
                            }}
                          >
                            {maxScore ?? "-"}
                          </td>
                          <td
                            className="border border-black px-1.5 py-1 text-center font-bold"
                            style={{
                              color: "#2563EB",
                              fontSize: "11px",
                              fontFamily: "'Time New Roman'",
                              fontWeight: "bold",
                            }}
                          >
                            {score !== null ? Math.round(score) : "N/A"}
                          </td>
                          <td className="border border-black px-1.5 py-1 text-center">
                            {gradeLevel || "N/A"}
                          </td>
                          {/* ✅ Keep column but remove data */}
                          <td className="border border-black px-1.5 py-1 text-center"></td>
                        </tr>
                      );
                    })}

                    {/* Empty rows */}
                    {Array.from({
                      length: Math.max(0, 11 - subjects.length),
                    }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="border border-black px-1.5 py-1 text-center">
                          {subjects.length + i + 1}
                        </td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                        <td className="border border-black px-1.5 py-1"></td>
                      </tr>
                    ))}

                    {/* Summary Rows */}
                    <tr style={{ backgroundColor: "#EFF6FF" }}>
                      <td
                        colSpan={3}
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ពិន្ទុសរុប
                      </td>

                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          color: "#2563EB",
                          fontSize: "12px",
                          fontFamily: "'Time New Roman'",
                        }}
                      >
                        {summary.totalScore > 0
                          ? summary.totalScore.toFixed(0)
                          : "N/A"}
                      </td>
                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        ចំណាត់ថ្នាក់
                      </td>
                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          fontFamily: "'Time New Roman'",
                          fontWeight: "bold",
                        }}
                      >
                        {summary.rank > 0 ? summary.rank : "N/A"}
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#EFF6FF" }}>
                      <td
                        colSpan={3}
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        មធ្យមភាគ
                      </td>
                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          color: "#2563EB",
                          fontSize: "12px",
                          fontFamily: "'Time New Roman'",
                          fontWeight: "bold",
                        }}
                      >
                        {summary.averageScore > 0
                          ? summary.averageScore.toFixed(2)
                          : "N/A"}
                      </td>
                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        និទ្ទេស
                      </td>
                      <td
                        className="border border-black px-1.5 py-1.5 text-center font-bold"
                        style={{
                          color: "#2563EB",
                          fontSize: "12px",
                          fontFamily: "'Khmer OS Muol Light', serif",
                        }}
                      >
                        {summary.gradeLevelKhmer || "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "9px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#E8F0F9" }}>
                      <th
                        rowSpan={2}
                        className="border border-black px-1 py-1.5"
                        style={{ width: "6%", fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ល.រ
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-black px-1 py-1.5"
                        style={{ width: "22%", fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        មុខវិជ្ជា
                      </th>
                      <th
                        colSpan={2}
                        className="border border-black px-1 py-1"
                        style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ឆមាសទី១
                      </th>
                      <th
                        colSpan={2}
                        className="border border-black px-1 py-1"
                        style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ឆមាសទី២
                      </th>
                      <th
                        colSpan={2}
                        className="border border-black px-1 py-1"
                        style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ពិន្ទុប្រចាំឆ្នាំ
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-black px-1 py-1.5"
                        style={{
                          width: "11%",
                          fontFamily: "'Khmer OS Muol Light', serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        និទ្ទេស
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-black px-1 py-1.5"
                        style={{ width: "10%", fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ផ្សេងៗ
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#E8F0F9" }}>
                      {["ពិន្ទុ", "ចំ.ថ្នាក់", "ពិន្ទុ", "ចំ.ថ្នាក់", "ពិន្ទុ", "ចំ.ថ្នាក់"].map(
                        (label, index) => (
                          <th
                            key={`${label}-${index}`}
                            className="border border-black px-1 py-1"
                            style={{ width: "8%", fontFamily: "'Khmer OS Muol Light', serif" }}
                          >
                            {label}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {semesterRows.map((row, index) => (
                      <tr key={row.subject.id}>
                        <td
                          className="border border-black px-1 py-1 text-center"
                          style={{ fontFamily: "'Time New Roman'", fontWeight: "bold" }}
                        >
                          {index + 1}
                        </td>
                        <td className="border border-black px-1 py-1">{row.subject.nameKh}</td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                        >
                          {formatMetric(row.semester1Score)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#DC2626", fontFamily: "'Time New Roman'" }}
                        >
                          {formatRank(row.semester1Rank)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                        >
                          {formatMetric(row.semester2Score)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#DC2626", fontFamily: "'Time New Roman'" }}
                        >
                          {formatRank(row.semester2Rank)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                        >
                          {formatMetric(row.annualScore)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ color: "#DC2626", fontFamily: "'Time New Roman'" }}
                        >
                          {formatRank(row.annualRank)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center font-bold"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {row.annualGradeLevelKhmer || "-"}
                        </td>
                        <td className="border border-black px-1 py-1 text-center">
                          {row.note}
                        </td>
                      </tr>
                    ))}

                    {Array.from({
                      length: Math.max(0, 11 - semesterRows.length),
                    }).map((_, i) => (
                      <tr key={`internship-empty-${i}`}>
                        <td className="border border-black px-1 py-1 text-center">
                          {semesterRows.length + i + 1}
                        </td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                      </tr>
                    ))}

                    <tr style={{ backgroundColor: "#EFF6FF" }}>
                      <td
                        colSpan={2}
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        ពិន្ទុសរុប
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(semester1Total, 0)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center">
                        {formatRank(semester1TotalSummaryRank)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(semester2Total, 0)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center">
                        {formatRank(semester2TotalSummaryRank)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(annualTotal, 0)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#DC2626", fontFamily: "'Time New Roman'" }}
                      >
                        {formatRank(totalSummaryRank)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center font-bold">
                        -
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center"></td>
                    </tr>

                    <tr style={{ backgroundColor: "#EFF6FF" }}>
                      <td
                        colSpan={2}
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ fontFamily: "'Khmer OS Muol Light', serif" }}
                      >
                        មធ្យមភាគ
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(semester1Average, 2)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center">
                        {formatRank(semester1AverageSummaryRank)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(semester2Average, 2)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center">
                        {formatRank(semester2AverageSummaryRank)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ color: "#1D4ED8", fontFamily: "'Time New Roman'" }}
                      >
                        {formatMetric(annualAverage, 2)}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center">
                        {formatRank(averageSummaryRank)}
                      </td>
                      <td
                        className="border border-black px-1 py-1.5 text-center font-bold"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {summary.gradeLevelKhmer || "-"}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-center"></td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Footer */}
              <div className="mt-3 p-1.5" style={{ marginBottom: "8mm" }}>
                <div
                  className="text-center space-y-0"
                  style={{
                    fontSize: "9px",
                    lineHeight: "2",
                    textAlign: "center",
                  }}
                >
                  <p>
                    {placeName} {teacherDate}
                  </p>
                  <p className="mt-0.5">បានឃើញ និងឯកភាព</p>
                  <p
                    className="font-bold text-blue-700"
                    style={{
                      fontFamily: "'Khmer OS Muol Light', serif",
                    }}
                  >
                    គ្រូប្រចាំថ្នាក់
                  </p>
                </div>

                <div className="mt-16 text-center" style={{ fontSize: "9px" }}>
                  <p className="font-bold">
                    {teacherName ? `${teacherName}` : "វ៉ែន សុភា 092 25 67 87"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { Workbook, type Fill, type Borders } from "exceljs";
import {
  SCORE_INTERVALS,
  STANDARD_DISTRIBUTION_SUBJECTS,
  isExcludedSubject,
  isGrade789,
  getStandardSubjectIndex,
  getStudentScoreForStandardSlot,
  toKhmerNum,
  isFemaleStudent,
  getIntervalIndex,
  getMaxActiveIntervalIndex,
} from "@/components/reports/SubjectScoreDistributionReport";

export interface SubjectScoreDistributionExportOptions {
  students: any[];
  subjects: Array<{
    id: string;
    nameKh: string;
    nameEn?: string;
    code?: string;
    maxScore: number;
    coefficient?: number;
    track?: string | null;
  }>;
  selectedClass: any;
  selectedYear: number;
  schoolCode?: string;
  province?: string;
  district?: string;
  commune?: string;
  schoolName?: string;
  phoneNumber?: string;
  fillDate?: string;
  fillerName?: string;
  isScienceTrack?: boolean;
  isSocialTrack?: boolean;
}

export async function exportSubjectScoreDistributionToExcel({
  students = [],
  subjects = [],
  selectedClass,
  selectedYear,
  schoolCode = "01020710711",
  province = "ខេត្តសៀមរាប",
  district = "ស្រុកប្រាសាទបាគង",
  commune = "កណ្ដែក",
  schoolName = "វិទ្យាល័យ ហ៊ុនសែន ស្វាយធំ",
  phoneNumber = "069 216251",
  fillDate = "14/08/2026",
  fillerName = "ស៊ីម ប៊ុយគាន",
  isScienceTrack,
  isSocialTrack,
}: SubjectScoreDistributionExportOptions) {
  const classTrack = selectedClass?.track?.toLowerCase() || "";
  const isScience =
    isScienceTrack !== undefined
      ? isScienceTrack
      : classTrack.includes("science") || classTrack.includes("វិទ្យាសាស្ត្រ");
  const isSocial =
    isSocialTrack !== undefined
      ? isSocialTrack
      : classTrack.includes("social") || classTrack.includes("សង្គម");

  const isJunior = isGrade789(selectedClass, subjects);

  const rawClassName = selectedClass?.name || "";
  const khmerConvertedClassName = toKhmerNum(rawClassName);
  const classNameFormatted = khmerConvertedClassName.includes("ថ្នាក់ទី")
    ? khmerConvertedClassName
    : `ថ្នាក់ទី ${khmerConvertedClassName}`;

  const academicYearFormatted = `${toKhmerNum(selectedYear)}-${toKhmerNum(selectedYear + 1)}`;

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("តារាងស្រង់ពិន្ទុតាមមុខវិជ្ជា", {
    pageSetup: {
      orientation: "landscape",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.3,
        bottom: 0.3,
        header: 0.1,
        footer: 0.1,
      },
    },
  });

  // Setup Column Widths
  worksheet.columns = [
    { key: "subject", width: 13.5 }, // A: មុខវិជ្ជា / ថ្នាក់
    { key: "gender", width: 6 }, // B: ភេទ
    { key: "c0", width: 4.5 }, // C: 0
    { key: "c1", width: 6 }, // D: 1 - 10
    { key: "c2", width: 6 }, // E: 11 - 20
    { key: "c3", width: 6 }, // F: 21 - 30
    { key: "c4", width: 6 }, // G: 31 - 40
    { key: "c5", width: 6 }, // H: 41 - 50
    { key: "c6", width: 6 }, // I: 51 - 60
    { key: "c7", width: 6 }, // J: 61 - 70
    { key: "c8", width: 6 }, // K: 71 - 80
    { key: "c9", width: 6 }, // L: 81 - 90
    { key: "c10", width: 6.5 }, // M: 91 - 100
    { key: "c11", width: 7.5 }, // N: 101 - 110
    { key: "c12", width: 7.5 }, // O: 111 - 120
    { key: "c13", width: 7.5 }, // P: 121 - 130
    { key: "c14", width: 7.5 }, // Q: 131 - 140
    { key: "c15", width: 7.5 }, // R: 141 - 150
    { key: "total", width: 6.5 }, // S: សរុប
    { key: "passed", width: 8.5 }, // T: សរុប សិស្សជាប់
  ];

  const thinBorder: Partial<Borders> = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  const khmerMuolFont = "Khmer OS Muol Light";
  const khmerSiemreapFont = "Khmer OS Siemreap";

  // --- Title (Row 2) ---
  worksheet.mergeCells("A2:T2");
  const titleCell = worksheet.getCell("A2");
  titleCell.value = `តារាងស្រង់ពិន្ទុតាមមុខវិជ្ជា សម្រាប់សាលាមធ្យមសិក្សា ${academicYearFormatted}`;
  titleCell.font = { name: khmerMuolFont, size: 13, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 26;

  // --- Metadata Header (Rows 4 and 5) ---
  // Row 4
  worksheet.mergeCells("A4:D4");
  const r4Left = worksheet.getCell("A4");
  r4Left.value = {
    richText: [
      { text: "លេខកូដសាលា ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: schoolCode, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r4Left.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("E4:I4");
  const r4Mid = worksheet.getCell("E4");
  r4Mid.value = {
    richText: [
      { text: "ឈ្មោះខេត្ត ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: province, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r4Mid.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("J4:P4");
  const r4Right = worksheet.getCell("J4");
  r4Right.value = {
    richText: [
      { text: "ឈ្មោះក្រុង-ស្រុក-ខណ្ឌ ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: district, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r4Right.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("Q4:T4");
  const r4Track = worksheet.getCell("Q4");
  r4Track.value = `វិទ្យាសាស្ត្រ  [ ${isScience ? "✓" : "  "} ]`;
  r4Track.font = { name: khmerSiemreapFont, size: 10, bold: true };
  r4Track.alignment = { horizontal: "right", vertical: "middle" };

  // Row 5
  worksheet.mergeCells("A5:D5");
  const r5Left = worksheet.getCell("A5");
  r5Left.value = {
    richText: [
      { text: "ឈ្មោះឃុំ-សង្កាត់ ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: commune, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r5Left.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("E5:I5");
  const r5Mid = worksheet.getCell("E5");
  r5Mid.value = {
    richText: [
      { text: "ឈ្មោះសាលា ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: schoolName, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r5Mid.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("J5:P5");
  const r5Right = worksheet.getCell("J5");
  r5Right.value = {
    richText: [
      { text: "ទូរស័ព្ទអ្នកបំពេញ ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: phoneNumber, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  r5Right.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("Q5:T5");
  const r5Track = worksheet.getCell("Q5");
  r5Track.value = `វិទ្យា.សង្គម  [ ${isSocial ? "✓" : "  "} ]`;
  r5Track.font = { name: khmerSiemreapFont, size: 10, bold: true };
  r5Track.alignment = { horizontal: "right", vertical: "middle" };

  // --- Table Header (Rows 7 and 8) ---
  const headerFill: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFAD7B5" }, // Peach color #FAD7B5
  };

  // Row 7 (Top Header Row)
  const thClass = worksheet.getCell("A7");
  thClass.value = classNameFormatted;

  worksheet.mergeCells("B7:R7");
  const thScore = worksheet.getCell("B7");
  thScore.value = "មធ្យមភាគពិន្ទុ ( ពិន្ទុប្រឡងឆមាសទី១ + ពិន្ទុប្រឡងឆមាសទី២ ) ចែកនឹង ២";

  worksheet.mergeCells("S7:S8");
  const thTotal = worksheet.getCell("S7");
  thTotal.value = "សរុប";

  worksheet.mergeCells("T7:T8");
  const thPassed = worksheet.getCell("T7");
  thPassed.value = "សរុប\nសិស្សជាប់";

  // Row 8 (Subheader Row: មុខវិជ្ជា, ភេទ, 0, 1-10, ...)
  const thSubject = worksheet.getCell("A8");
  thSubject.value = "មុខវិជ្ជា";

  const thGender = worksheet.getCell("B8");
  thGender.value = "ភេទ";

  // Row 8 Interval Subheaders
  const colLetters = [
    "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"
  ];
  SCORE_INTERVALS.forEach((interval, idx) => {
    const col = colLetters[idx];
    worksheet.getCell(`${col}8`).value = interval.label;
  });

  worksheet.getRow(7).height = 28;
  worksheet.getRow(8).height = 26;

  // Apply header styles
  const allColLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"
  ];
  [7, 8].forEach((r) => {
    allColLetters.forEach((col) => {
      const cell = worksheet.getCell(`${col}${r}`);
      cell.fill = headerFill;
      cell.border = thinBorder;
      cell.font = {
        name: khmerSiemreapFont,
        size: r === 8 && !["A", "B", "S", "T"].includes(col) ? 8 : 9.5,
        bold: true,
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
  });

  // --- Table Body Rows ---
  let currentRow = 9;
  const totalFemaleInClass = students.filter((s) => isFemaleStudent(s.gender)).length;
  const totalMaleInClass = students.filter((s) => !isFemaleStudent(s.gender)).length;

  // Filter out excluded subjects
  const validSubjects = subjects.filter((s) => !isExcludedSubject(s));

  const distributionData = STANDARD_DISTRIBUTION_SUBJECTS.map((stdSubject, slotIdx) => {
    const matchedRawSubs = validSubjects.filter(
      (s) => getStandardSubjectIndex(s, isJunior) === slotIdx
    );

    let computedMaxScore = stdSubject.defaultMaxScore;
    if (matchedRawSubs.length > 0) {
      computedMaxScore = matchedRawSubs.reduce(
        (sum, sub) => sum + (Number(sub.maxScore) || 50),
        0
      );
    }

    if (slotIdx === 0 && isJunior) {
      computedMaxScore = 100;
    }

    const passThreshold = computedMaxScore / 2;
    const maxColIdx = getMaxActiveIntervalIndex({
      nameKh: stdSubject.standardNameKh,
      maxScore: computedMaxScore,
    });

    const femaleCounts = new Array(SCORE_INTERVALS.length).fill(0);
    const maleCounts = new Array(SCORE_INTERVALS.length).fill(0);
    let femalePassed = 0;
    let malePassed = 0;

    students.forEach((student) => {
      const isF = isFemaleStudent(student.gender);
      const { score } = getStudentScoreForStandardSlot(student, matchedRawSubs);

      if (score !== null) {
        const idx = getIntervalIndex(score);
        if (idx !== null) {
          if (isF) femaleCounts[idx]++;
          else maleCounts[idx]++;
        }
        if (score >= passThreshold) {
          if (isF) femalePassed++;
          else malePassed++;
        }
      } else {
        if (isF) femaleCounts[0]++;
        else maleCounts[0]++;
      }
    });

    return {
      standardNameKh: stdSubject.standardNameKh,
      order: stdSubject.order,
      maxColIdx,
      passThreshold,
      femaleCounts,
      maleCounts,
      femalePassed,
      malePassed,
    };
  });

  distributionData.forEach((row, subjectIdx) => {
    const row1 = worksheet.getRow(currentRow);
    const row2 = worksheet.getRow(currentRow + 1);
    row1.height = 24;
    row2.height = 24;

    const subjectFillColor = subjectIdx % 2 === 0 ? "FFFFFFFF" : "FFFFFDF0";
    const cellFill: Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: subjectFillColor },
    };

    // Merge Col A for subject name
    worksheet.mergeCells(`A${currentRow}:A${currentRow + 1}`);
    const subjectCell = worksheet.getCell(`A${currentRow}`);
    subjectCell.value = row.standardNameKh;
    subjectCell.alignment = { horizontal: "left", vertical: "middle" };

    // Female Row (Row 1)
    row1.getCell(2).value = "ស្រី";
    SCORE_INTERVALS.forEach((_, cIdx) => {
      const count = row.femaleCounts[cIdx];
      const isOutOfRange = cIdx > row.maxColIdx && count === 0;
      row1.getCell(cIdx + 3).value = isOutOfRange ? "" : count;
    });
    row1.getCell(19).value = totalFemaleInClass;
    row1.getCell(20).value = row.femalePassed;

    // Male Row (Row 2)
    row2.getCell(2).value = "ប្រុស";
    SCORE_INTERVALS.forEach((_, cIdx) => {
      const count = row.maleCounts[cIdx];
      const isOutOfRange = cIdx > row.maxColIdx && count === 0;
      row2.getCell(cIdx + 3).value = isOutOfRange ? "" : count;
    });
    row2.getCell(19).value = totalMaleInClass;
    row2.getCell(20).value = row.malePassed;

    // Apply borders and styling for both rows
    [currentRow, currentRow + 1].forEach((rNum) => {
      for (let c = 1; c <= 20; c++) {
        const cell = worksheet.getRow(rNum).getCell(c);
        cell.fill = cellFill;
        cell.border = thinBorder;
        cell.font = { name: khmerSiemreapFont, size: 9.5 };
        if (c === 1) {
          cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
        if (c === 19 || c === 20) {
          cell.font = { name: khmerSiemreapFont, size: 9.5, bold: true };
        }
      }
    });

    currentRow += 2;
  });

  // --- Footer Signature Section ---
  const sigRow = currentRow + 1;
  worksheet.mergeCells(`N${sigRow}:T${sigRow}`);
  const sDate = worksheet.getCell(`N${sigRow}`);
  sDate.value = {
    richText: [
      { text: "បំពេញនៅថ្ងៃទី ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: fillDate, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  sDate.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells(`N${sigRow + 1}:T${sigRow + 1}`);
  const sName = worksheet.getCell(`N${sigRow + 1}`);
  sName.value = {
    richText: [
      { text: "បំពេញដោយ ៖ ", font: { name: khmerSiemreapFont, size: 10 } },
      { text: fillerName, font: { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF0000CD" } } },
    ],
  };
  sName.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells(`N${sigRow + 2}:T${sigRow + 2}`);
  const sSign = worksheet.getCell(`N${sigRow + 2}`);
  sSign.value = "ហត្ថលេខា ៖ .................................";
  sSign.font = { name: khmerSiemreapFont, size: 10 };
  sSign.alignment = { horizontal: "left", vertical: "middle" };

  // Generate Excel buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `តារាងស្រង់ពិន្ទុតាមមុខវិជ្ជា_${selectedClass?.name || ""}_${selectedYear}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

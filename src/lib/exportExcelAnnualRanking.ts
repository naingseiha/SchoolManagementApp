import { Workbook, type Fill, type Borders } from "exceljs";

interface AnnualRankingExportOptions {
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

const toKhmerNum = (num: number | string) => {
  const khmerNums = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return num.toString().replace(/[0-9]/g, (m) => khmerNums[parseInt(m)]);
};

const getGradeFromAverage = (average: number | null | undefined) => {
  if (average === null || average === undefined) return "-";
  if (average >= 45) return "A";
  if (average >= 40) return "B";
  if (average >= 35) return "C";
  if (average >= 30) return "D";
  if (average >= 25) return "E";
  return "F";
};

export async function exportAnnualRankingToExcel({
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
}: AnnualRankingExportOptions) {
  // Sort data by Annual Rank (1 to N)
  const sortedData = [...transcriptData].sort((a, b) => {
    const rankA = a.summary?.annualOverallRank || 999;
    const rankB = b.summary?.annualOverallRank || 999;
    return rankA - rankB;
  });

  const className = selectedClass?.name?.includes("ថ្នាក់ទី")
    ? selectedClass.name
    : `ថ្នាក់ទី ${selectedClass?.name || ""}`;

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ", {
    pageSetup: {
      orientation: "portrait",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  // Setup Column Widths
  worksheet.columns = [
    { key: "no", width: 6 }, // A: ល.រ
    { key: "name", width: 26 }, // B: គោត្តនាម និងនាម
    { key: "abs_perm", width: 8 }, // C: ច្បាប់
    { key: "abs_no_perm", width: 8 }, // D: អ.ច្ប
    { key: "abs_total", width: 8 }, // E: សរុប
    { key: "s1_avg", width: 10 }, // F: S1 ម.ភាគ
    { key: "s1_rank", width: 10 }, // G: S1 ចំ.ថ្នាក់
    { key: "s2_avg", width: 10 }, // H: S2 ម.ភាគ
    { key: "s2_rank", width: 10 }, // I: S2 ចំ.ថ្នាក់
    { key: "annual_avg", width: 10 }, // J: Annual ម.ភាគ
    { key: "annual_rank", width: 10 }, // K: Annual ចំ.ថ្នាក់
    { key: "grade", width: 9 }, // L: និទ្ទេស
  ];

  // Helper for cell borders
  const thinBorder: Partial<Borders> = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  // Common font names
  const khmerMuolFont = "Khmer OS Muol Light";
  const khmerSiemreapFont = "Khmer OS Siemreap";

  // --- Row 1: Left header & Right Kingdom header ---
  worksheet.mergeCells("A1:D1");
  const r1Left = worksheet.getCell("A1");
  r1Left.value = province;
  r1Left.font = { name: khmerSiemreapFont, size: 10, color: { argb: "FF1D4ED8" } };
  r1Left.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("I1:L1");
  const r1Right = worksheet.getCell("I1");
  r1Right.value = "ព្រះរាជាណាចក្រកម្ពុជា";
  r1Right.font = { name: khmerMuolFont, size: 10, bold: true, color: { argb: "FF1D4ED8" } };
  r1Right.alignment = { horizontal: "center", vertical: "middle" };

  // --- Row 2 ---
  worksheet.mergeCells("A2:D2");
  const r2Left = worksheet.getCell("A2");
  r2Left.value = schoolName;
  r2Left.font = { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FF1D4ED8" } };
  r2Left.alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("I2:L2");
  const r2Right = worksheet.getCell("I2");
  r2Right.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
  r2Right.font = { name: khmerMuolFont, size: 10, bold: true, color: { argb: "FF1D4ED8" } };
  r2Right.alignment = { horizontal: "center", vertical: "middle" };

  // --- Row 4: Title ---
  worksheet.mergeCells("A4:L4");
  const titleCell = worksheet.getCell("A4");
  titleCell.value = "តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ";
  titleCell.font = { name: khmerMuolFont, size: 14, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(4).height = 24;

  // --- Row 5: Academic Year ---
  worksheet.mergeCells("A5:L5");
  const yearCell = worksheet.getCell("A5");
  yearCell.value = `ឆ្នាំសិក្សា៖ ${toKhmerNum(`${selectedYear}-${selectedYear + 1}`)}`;
  yearCell.font = { name: khmerSiemreapFont, size: 11 };
  yearCell.alignment = { horizontal: "center", vertical: "middle" };

  // --- Row 6: Class Name ---
  worksheet.mergeCells("A6:L6");
  const classCell = worksheet.getCell("A6");
  classCell.value = className;
  classCell.font = { name: khmerMuolFont, size: 11, bold: true };
  classCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(6).height = 20;

  // --- Row 8 & 9: Table Header ---
  // Row 8 merges
  worksheet.mergeCells("A8:A9");
  worksheet.getCell("A8").value = "ល.រ";

  worksheet.mergeCells("B8:B9");
  worksheet.getCell("B8").value = "គោត្តនាម និងនាម";

  worksheet.mergeCells("C8:E8");
  worksheet.getCell("C8").value = "អវត្តមាន";

  worksheet.mergeCells("F8:G8");
  worksheet.getCell("F8").value = "លទ្ធផលប្រចាំឆមាសទី១";

  worksheet.mergeCells("H8:I8");
  worksheet.getCell("H8").value = "លទ្ធផលប្រចាំឆមាសទី២";

  worksheet.mergeCells("J8:L8");
  worksheet.getCell("J8").value = "លទ្ធផលប្រចាំឆ្នាំ";

  // Row 9 Sub-headers
  worksheet.getCell("C9").value = "ច្បាប់";
  worksheet.getCell("D9").value = "អ.ច្ប";
  worksheet.getCell("E9").value = "សរុប";

  worksheet.getCell("F9").value = "ម.ភាគ";
  worksheet.getCell("G9").value = "ចំ.ថ្នាក់";

  worksheet.getCell("H9").value = "ម.ភាគ";
  worksheet.getCell("I9").value = "ចំ.ថ្នាក់";

  worksheet.getCell("J9").value = "ម.ភាគ";
  worksheet.getCell("K9").value = "ចំ.ថ្នាក់";
  worksheet.getCell("L9").value = "និទ្ទេស";

  worksheet.getRow(8).height = 22;
  worksheet.getRow(9).height = 22;

  // Apply styles to all header cells in Rows 8 and 9
  const headerFill: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" }, // Light Gray #e5e7eb
  };

  const colIndices = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  [8, 9].forEach((rowNum) => {
    colIndices.forEach((col) => {
      const cell = worksheet.getCell(`${col}${rowNum}`);
      cell.fill = headerFill;
      cell.border = thinBorder;
      cell.font = { name: khmerSiemreapFont, size: 10, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
  });

  // --- Student Data Rows (Starting at Row 10) ---
  let currentRow = 10;

  sortedData.forEach((student, index) => {
    const row = worksheet.getRow(currentRow);
    row.height = 22;

    const annualAttendance = student.attendance?.annual || {
      permission: 0,
      withoutPermission: 0,
      totalAbsent: 0,
    };
    const permission = annualAttendance.permission || 0;
    const withoutPermission = annualAttendance.withoutPermission || 0;
    const totalAbsent =
      annualAttendance.totalAbsent || permission + withoutPermission;

    const s1Avg = student.summary?.semester1OverallAverage;
    const s1Rank = student.summary?.semester1OverallRank;
    const s2Avg = student.summary?.semester2OverallAverage;
    const s2Rank = student.summary?.semester2OverallRank;
    const annualAvg = student.summary?.annualOverallAverage;
    const annualRank = student.summary?.annualOverallRank;
    const grade = getGradeFromAverage(annualAvg);

    // Set values
    row.getCell(1).value = index + 1; // Col A
    row.getCell(2).value = student.studentData?.studentName || ""; // Col B
    row.getCell(3).value = permission > 0 ? permission : 0; // Col C
    row.getCell(4).value = withoutPermission > 0 ? withoutPermission : 0; // Col D
    row.getCell(5).value = totalAbsent > 0 ? totalAbsent : 0; // Col E

    row.getCell(6).value = s1Avg !== undefined && s1Avg !== null ? Number(s1Avg.toFixed(2)) : "-"; // Col F
    row.getCell(7).value = s1Rank !== undefined && s1Rank !== null ? s1Rank : "-"; // Col G

    row.getCell(8).value = s2Avg !== undefined && s2Avg !== null ? Number(s2Avg.toFixed(2)) : "-"; // Col H
    row.getCell(9).value = s2Rank !== undefined && s2Rank !== null ? s2Rank : "-"; // Col I

    row.getCell(10).value = annualAvg !== undefined && annualAvg !== null ? Number(annualAvg.toFixed(2)) : "-"; // Col J
    row.getCell(11).value = annualRank !== undefined && annualRank !== null ? annualRank : "-"; // Col K
    row.getCell(12).value = grade; // Col L

    // Apply styling to data row cells
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: khmerSiemreapFont, size: 10 };

      if (c === 2) {
        // Name column: left align
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Red bold font for ranks (cols 7, 9, 11)
      if (c === 7 || c === 9 || c === 11) {
        cell.font = { name: khmerSiemreapFont, size: 10, bold: true, color: { argb: "FFDC2626" } };
      }

      // Bold font for Grade (col 12)
      if (c === 12) {
        cell.font = { name: khmerSiemreapFont, size: 10, bold: true };
      }

      // Number formatting for average columns
      if ((c === 6 || c === 8 || c === 10) && typeof cell.value === "number") {
        cell.numFmt = "0.00";
      }
    }

    currentRow++;
  });

  // --- Footer Signature Section ---
  const sigStartRow = currentRow + 2;

  // Left Signature: Director
  worksheet.mergeCells(`A${sigStartRow + 1}:D${sigStartRow + 1}`);
  const sLeft1 = worksheet.getCell(`A${sigStartRow + 1}`);
  sLeft1.value = "បានឃើញ និងឯកភាព";
  sLeft1.font = { name: khmerSiemreapFont, size: 10, bold: true };
  sLeft1.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells(`A${sigStartRow + 2}:D${sigStartRow + 2}`);
  const sLeft2 = worksheet.getCell(`A${sigStartRow + 2}`);
  sLeft2.value = "នាយក";
  sLeft2.font = { name: khmerSiemreapFont, size: 10, bold: true };
  sLeft2.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells(`A${sigStartRow + 6}:D${sigStartRow + 6}`);
  const sLeftName = worksheet.getCell(`A${sigStartRow + 6}`);
  sLeftName.value = principalName || "";
  sLeftName.font = { name: khmerMuolFont, size: 10, bold: true, color: { argb: "FF2563EB" } };
  sLeftName.alignment = { horizontal: "center", vertical: "middle" };

  // Right Signature: Class Teacher
  worksheet.mergeCells(`H${sigStartRow}:L${sigStartRow}`);
  const sRightDate = worksheet.getCell(`H${sigStartRow}`);
  sRightDate.value = `ធ្វើនៅ ${placeName}, ${directorDate || "ថ្ងៃទី.......ខែ.......ឆ្នាំ២០២..."}`;
  sRightDate.font = { name: khmerSiemreapFont, size: 10 };
  sRightDate.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells(`H${sigStartRow + 1}:L${sigStartRow + 1}`);
  const sRightRole = worksheet.getCell(`H${sigStartRow + 1}`);
  sRightRole.value = "គ្រូបន្ទុកថ្នាក់";
  sRightRole.font = { name: khmerSiemreapFont, size: 10, bold: true };
  sRightRole.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells(`H${sigStartRow + 6}:L${sigStartRow + 6}`);
  const sRightName = worksheet.getCell(`H${sigStartRow + 6}`);
  sRightName.value = teacherName || "";
  sRightName.font = { name: khmerMuolFont, size: 10, bold: true, color: { argb: "FF2563EB" } };
  sRightName.alignment = { horizontal: "center", vertical: "middle" };

  // Generate Excel buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ_${sortedData[0]?.studentData?.className || selectedClass?.name || ""}_${selectedYear}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

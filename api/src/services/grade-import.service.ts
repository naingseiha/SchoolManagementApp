import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GradeImportRow {
  studentId?: string;
  studentName?: string;
  [key: string]: any; // For dynamic subject columns
}

export class GradeImportService {
  /**
   * ✅ FIXED: Parse Excel buffer with proper Buffer handling
   */
  static async parseExcelBuffer(buffer: Buffer): Promise<any[]> {
    try {
      console.log("📊 Parsing Excel buffer for grades...");

      const workbook = new ExcelJS.Workbook();

      // ✅ FIXED: Use buffer directly without slice
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error("No worksheet found in Excel file");
      }

      console.log(`📄 Found worksheet:  ${worksheet.name}`);

      const data: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // First row = headers
          row.eachCell((cell) => {
            headers.push(cell.value?.toString().trim() || "");
          });
          console.log("📋 Headers:", headers);
        } else {
          // Data rows
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              // Parse cell value
              let value = cell.value;

              // Handle date values
              if (value instanceof Date) {
                value = value.toISOString();
              }

              // Handle formula results
              if (cell.type === ExcelJS.ValueType.Formula && cell.result) {
                value = cell.result;
              }

              rowData[header] = value;
            }
          });

          // Only add non-empty rows
          if (Object.keys(rowData).length > 0) {
            data.push(rowData);
          }
        }
      });

      console.log(`✅ Parsed ${data.length} rows from Excel`);
      return data;
    } catch (error: any) {
      console.error("❌ Parse Excel error:", error);
      throw new Error(`Failed to parse Excel:  ${error.message}`);
    }
  }

  /**
   * ✅ Import grades from Excel buffer
   */
  static async importGrades(
    classId: string,
    buffer: Buffer
  ): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    skipped: number;
    errors: any[];
  }> {
    try {
      console.log("\n=== EXCEL GRADE IMPORT ===");
      console.log("Class ID:", classId);

      // ✅ Verify class exists
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: true,
        },
      });

      if (!classData) {
        throw new Error("Class not found");
      }

      console.log("Class:", classData.name);
      console.log("Students in class:", classData.students.length);

      // ✅ Get subjects for this grade
      const subjects = await prisma.subject.findMany({
        where: {
          grade: classData.grade,
          isActive: true,
        },
      });

      console.log("Subjects:", subjects.length);

      // ✅ Parse Excel data
      const data = await this.parseExcelBuffer(buffer);

      if (data.length === 0) {
        throw new Error("No data found in Excel file");
      }

      const errors: any[] = [];
      let imported = 0;
      let updated = 0;
      let skipped = 0;

      // ✅ Extract month and year from first valid row or use current
      const firstRow = data[0];
      const month =
        firstRow.month || firstRow["Month"] || firstRow["ខែ"] || "មករា";
      const year = parseInt(
        firstRow.year?.toString() ||
          firstRow["Year"]?.toString() ||
          firstRow["ឆ្នាំ"]?.toString() ||
          new Date().getFullYear().toString()
      );

      console.log(`📅 Import period: ${month} ${year}`);

      // ✅ Get month number
      const monthNames = [
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];
      const monthNumber = monthNames.indexOf(month) + 1;

      if (monthNumber === 0) {
        throw new Error(`Invalid month name: ${month}`);
      }

      // ✅ Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          console.log(`\n📝 Processing row ${i + 1}: `, row);

          // ✅ Find student
          const studentId =
            row.studentId?.toString() ||
            row["Student ID"]?.toString() ||
            row["លេខសិស្ស"]?.toString();

          const studentName =
            row.studentName?.toString() ||
            row["Student Name"]?.toString() ||
            row["ឈ្មោះសិស្ស"]?.toString();

          if (!studentId && !studentName) {
            errors.push({
              row: i + 2,
              data: row,
              error: "Missing student ID or name",
            });
            skipped++;
            continue;
          }

          // ✅ Find student in class
          let student;
          if (studentId) {
            student = classData.students.find((s) => s.studentId === studentId);
          }

          if (!student && studentName) {
            student = classData.students.find(
              (s) =>
                s.khmerName === studentName ||
                `${s.lastName} ${s.firstName}` === studentName
            );
          }

          if (!student) {
            errors.push({
              row: i + 2,
              data: row,
              error: `Student not found: ${studentId || studentName}`,
            });
            skipped++;
            continue;
          }

          console.log(`👤 Found student: ${student.khmerName}`);

          // ✅ Process each subject grade
          let gradesProcessed = 0;

          for (const subject of subjects) {
            // Try multiple column name formats
            const possibleKeys = [
              subject.code,
              subject.nameKh,
              subject.nameEn,
              subject.name,
              subject.code.toLowerCase(),
            ];

            let score: number | null = null;

            for (const key of possibleKeys) {
              if (
                row[key] !== undefined &&
                row[key] !== null &&
                row[key] !== ""
              ) {
                const scoreValue = parseFloat(row[key].toString());
                if (!isNaN(scoreValue)) {
                  score = scoreValue;
                  break;
                }
              }
            }

            // Skip if no score found for this subject
            if (score === null) {
              continue;
            }

            // ✅ Validate score
            if (score < 0 || score > subject.maxScore) {
              errors.push({
                row: i + 2,
                student: student.khmerName,
                subject: subject.nameKh,
                error: `Invalid score ${score} (max: ${subject.maxScore})`,
              });
              continue;
            }

            // ✅ Calculate weighted score
            const percentage = (score / subject.maxScore) * 100;
            const weightedScore = score * subject.coefficient;

            // ✅ Check if grade exists
            const existingGrade = await prisma.grade.findFirst({
              where: {
                studentId: student.id,
                subjectId: subject.id,
                classId: classId,
                month: month,
                year: year,
              },
            });

            if (existingGrade) {
              // ✅ Update existing grade
              await prisma.grade.update({
                where: { id: existingGrade.id },
                data: {
                  score,
                  maxScore: subject.maxScore,
                  percentage,
                  weightedScore,
                  updatedAt: new Date(),
                },
              });
              updated++;
              gradesProcessed++;
            } else {
              // ✅ Create new grade
              await prisma.grade.create({
                data: {
                  studentId: student.id,
                  subjectId: subject.id,
                  classId: classId,
                  score,
                  maxScore: subject.maxScore,
                  month: month,
                  monthNumber: monthNumber,
                  year: year,
                  percentage,
                  weightedScore,
                },
              });
              imported++;
              gradesProcessed++;
            }
          }

          console.log(
            `✅ Processed ${gradesProcessed} grades for ${student.khmerName}`
          );
        } catch (error: any) {
          console.error(`❌ Error processing row ${i + 1}:`, error);
          errors.push({
            row: i + 2,
            data: row,
            error: error.message,
          });
          skipped++;
        }
      }

      console.log("\n=== GRADE IMPORT SUMMARY ===");
      console.log(`✅ Imported (new): ${imported}`);
      console.log(`🔄 Updated (existing): ${updated}`);
      console.log(`⚠️  Skipped: ${skipped}`);
      console.log(`❌ Errors: ${errors.length}`);
      console.log("============================\n");

      return {
        success: true,
        imported,
        updated,
        skipped,
        errors,
      };
    } catch (error: any) {
      console.error("❌ Import grades error:", error);
      throw new Error(`Grade import failed: ${error.message}`);
    }
  }

  /**
   * ✅ Generate Excel template for grade import
   */
  static async generateGradeTemplate(classId: string): Promise<Buffer> {
    try {
      console.log("📄 Generating grade import template for class:", classId);

      // ✅ Get class data
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
        },
      });

      if (!classData) {
        throw new Error("Class not found");
      }

      // ✅ Get subjects
      const subjects = await prisma.subject.findMany({
        where: {
          grade: classData.grade,
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      // ✅ Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Grades");

      // ✅ Define columns
      const columns: any[] = [
        { header: "studentId", key: "studentId", width: 15 },
        { header: "studentName", key: "studentName", width: 25 },
        { header: "month", key: "month", width: 12 },
        { header: "year", key: "year", width: 10 },
      ];

      // Add subject columns
      for (const subject of subjects) {
        columns.push({
          header: subject.code,
          key: subject.code,
          width: 12,
        });
      }

      worksheet.columns = columns;

      // ✅ Style header row
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      // ✅ Add student rows
      for (const student of classData.students) {
        const rowData: any = {
          studentId: student.studentId,
          studentName: student.khmerName,
          month: "មករា",
          year: new Date().getFullYear(),
        };

        // Add empty grade cells for each subject
        for (const subject of subjects) {
          rowData[subject.code] = "";
        }

        worksheet.addRow(rowData);
      }

      // ✅ Add subject info row (for reference)
      const subjectInfoRow: any = {
        studentId: "ព័ត៌មានមុខវិជ្ជា",
        studentName: "Subject Info",
        month: "",
        year: "",
      };

      for (const subject of subjects) {
        subjectInfoRow[
          subject.code
        ] = `${subject.nameKh} (Max: ${subject.maxScore})`;
      }

      worksheet.addRow(subjectInfoRow);

      // Style subject info row
      const lastRow = worksheet.lastRow;
      if (lastRow) {
        lastRow.font = { italic: true, color: { argb: "FF808080" } };
        lastRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F0F0" },
        };
      }

      // ✅ Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error: any) {
      console.error("❌ Generate grade template error:", error);
      throw new Error(`Failed to generate template: ${error.message}`);
    }
  }

  /**
   * ✅ Validate grade Excel file before import
   */
  static async validateGradeFile(
    classId: string,
    buffer: Buffer
  ): Promise<{
    valid: boolean;
    errors: string[];
    rowCount: number;
    subjectsFound: string[];
  }> {
    try {
      const data = await this.parseExcelBuffer(buffer);

      const errors: string[] = [];
      const subjectsFound: string[] = [];

      if (data.length === 0) {
        errors.push("Excel file is empty");
      }

      // ✅ Check required columns
      const requiredColumns = ["studentId", "studentName"];
      const firstRow = data[0] || {};

      for (const col of requiredColumns) {
        const hasColumn =
          firstRow.hasOwnProperty(col) ||
          firstRow.hasOwnProperty(col.toLowerCase()) ||
          Object.keys(firstRow).some((key) =>
            key.toLowerCase().includes(col.toLowerCase())
          );

        if (!hasColumn) {
          errors.push(`Missing required column: ${col}`);
        }
      }

      // ✅ Find subject columns
      const classData = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (classData) {
        const subjects = await prisma.subject.findMany({
          where: {
            grade: classData.grade,
            isActive: true,
          },
        });

        for (const subject of subjects) {
          if (
            firstRow.hasOwnProperty(subject.code) ||
            firstRow.hasOwnProperty(subject.nameKh)
          ) {
            subjectsFound.push(subject.code);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        rowCount: data.length,
        subjectsFound,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        rowCount: 0,
        subjectsFound: [],
      };
    }
  }

  /**
   * ✅ Export grades to Excel
   */
  static async exportGrades(
    classId: string,
    month: string,
    year: number
  ): Promise<Buffer> {
    try {
      console.log("📤 Exporting grades:", { classId, month, year });

      // ✅ Get class with students
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
        },
      });

      if (!classData) {
        throw new Error("Class not found");
      }

      // ✅ Get subjects
      const subjects = await prisma.subject.findMany({
        where: {
          grade: classData.grade,
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      // ✅ Get grades
      const grades = await prisma.grade.findMany({
        where: {
          classId,
          month,
          year,
        },
      });

      // ✅ Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        `${classData.name} - ${month} ${year}`
      );

      // ✅ Define columns
      const columns: any[] = [
        { header: "លេខសិស្ស", key: "studentId", width: 15 },
        { header: "ឈ្មោះសិស្ស", key: "studentName", width: 25 },
      ];

      for (const subject of subjects) {
        columns.push({
          header: `${subject.nameKh}\n(${subject.code})`,
          key: subject.code,
          width: 15,
        });
      }

      columns.push(
        { header: "សរុប", key: "total", width: 12 },
        { header: "មធ្យមភាគ", key: "average", width: 12 },
        { header: "និទ្ទេស", key: "grade", width: 10 },
        { header: "ចំណាត់ថ្នាក់", key: "rank", width: 12 }
      );

      worksheet.columns = columns;

      // ✅ Style header
      worksheet.getRow(1).font = { bold: true, size: 11 };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      worksheet.getRow(1).height = 40;
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      // ✅ Add data rows
      const totalCoefficient = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );

      const studentData = classData.students.map((student) => {
        const rowData: any = {
          studentId: student.studentId,
          studentName: student.khmerName,
        };

        let totalScore = 0;

        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );
          rowData[subject.code] = grade?.score ?? "";
          if (grade?.score) {
            totalScore += grade.score;
          }
        });

        const average =
          totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

        let gradeLevel = "F";
        if (average >= 45) gradeLevel = "A";
        else if (average >= 40) gradeLevel = "B";
        else if (average >= 35) gradeLevel = "C";
        else if (average >= 30) gradeLevel = "D";
        else if (average >= 25) gradeLevel = "E";

        rowData.total = totalScore.toFixed(2);
        rowData.average = average.toFixed(2);
        rowData.grade = gradeLevel;

        return { ...rowData, averageNum: average };
      });

      // ✅ Calculate ranks
      const sorted = studentData
        .slice()
        .sort((a, b) => b.averageNum - a.averageNum)
        .map((s, i) => ({ ...s, rank: i + 1 }));

      const finalData = studentData.map((s) => {
        const ranked = sorted.find((r) => r.studentId === s.studentId);
        return { ...s, rank: ranked?.rank || 0 };
      });

      // ✅ Add rows to worksheet
      finalData.forEach((data) => {
        worksheet.addRow(data);
      });

      // ✅ Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error: any) {
      console.error("❌ Export grades error:", error);
      throw new Error(`Failed to export grades: ${error.message}`);
    }
  }
}

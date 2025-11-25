import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import { GradeCalculationService } from "./grade-calculation.service";

const prisma = new PrismaClient();

export interface ImportedGrade {
  studentName: string;
  gender: string;
  grades: {
    [subjectCode: string]: number | null;
  };
}

export interface GradeImportResult {
  success: boolean;
  totalStudents: number;
  importedStudents: number;
  errorStudents: number;
  errors: Array<{
    row: number;
    studentName: string;
    error: string;
  }>;
  summary: {
    month: string;
    year: number;
    classId: string;
    className: string;
  };
}

export class GradeImportService {
  /**
   * Get subject mapping by grade level
   */
  private static getSubjectMapping(grade: string): { [col: string]: string } {
    // Grade 7, 8
    if (["7", "8"].includes(grade)) {
      return {
        D: "WRITING",
        E: "DICTATION",
        F: "MATH",
        G: "PHY",
        H: "CHEM",
        I: "BIO",
        J: "EARTH",
        K: "MORAL",
        L: "GEO",
        M: "HIST",
        N: "ENG",
        O: "SPORTS",
        P: "AGRI",
        Q: "ICT",
      };
    }

    // Grade 9
    if (grade === "9") {
      return {
        D: "WRITING",
        E: "DICTATION",
        F: "MATH",
        G: "PHY",
        H: "CHEM",
        I: "BIO",
        J: "EARTH",
        K: "MORAL",
        L: "GEO",
        M: "HIST",
        N: "ENG",
        O: "ECON",
        P: "SPORTS",
        Q: "AGRI",
        R: "ICT",
      };
    }

    // Grade 10
    if (grade === "10") {
      return {
        D: "KHM",
        E: "MATH",
        F: "PHY",
        G: "CHEM",
        H: "BIO",
        I: "EARTH",
        J: "MORAL",
        K: "GEO",
        L: "HIST",
        M: "ENG",
        N: "SPORTS",
        O: "AGRI",
        P: "ICT",
      };
    }

    // Grade 11
    if (grade === "11") {
      return {
        D: "KHM",
        E: "MATH",
        F: "PHY",
        G: "CHEM",
        H: "BIO",
        I: "EARTH",
        J: "MORAL",
        K: "GEO",
        L: "HIST",
        M: "ENG",
        N: "SPORTS",
        O: "AGRI",
        P: "ICT",
      };
    }

    // Grade 12 (will determine science/social from track)
    if (grade === "12") {
      return {
        D: "KHM",
        E: "MATH",
        F: "PHY",
        G: "CHEM",
        H: "BIO",
        I: "EARTH",
        J: "MORAL",
        K: "GEO",
        L: "HIST",
        M: "ENG",
        N: "ICT",
      };
    }

    return {};
  }

  /**
   * Get month number from Khmer month name
   */
  private static getMonthNumber(monthKh: string): number {
    const months: { [key: string]: number } = {
      មករា: 1,
      កុម្ភៈ: 2,
      មីនា: 3,
      មេសា: 4,
      ឧសភា: 5,
      មិថុនា: 6,
      កក្កដា: 7,
      សីហា: 8,
      កញ្ញា: 9,
      តុលា: 10,
      វិច្ឆិកា: 11,
      ធ្នូ: 12,
    };
    return months[monthKh] || 1;
  }

  /**
   * Parse grade Excel file
   */
  static async parseGradeFile(
    buffer: Buffer,
    classId: string
  ): Promise<{
    students: ImportedGrade[];
    month: string;
    year: number;
    grade: string;
  }> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📂 Parsing grade Excel file...");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    // Get class info to determine grade level
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new Error("Class not found");
    }

    const grade = classData.grade;
    const subjectMapping = this.getSubjectMapping(grade);

    // Extract month and year from Excel (assume in specific cells)
    // You may need to adjust based on your template structure
    const monthCell = worksheet.getCell("T6").value?.toString() || "មករា";
    const yearCell = worksheet.getCell("T7").value?.toString() || "2024";

    const month = monthCell.split(":")[0]?.trim() || "មករា";
    const year = parseInt(yearCell.match(/\d{4}/)?.[0] || "2024");

    console.log(`📅 Month: ${month}, Year: ${year}`);
    console.log(`🎓 Grade: ${grade}`);

    const students: ImportedGrade[] = [];

    // Find data start row (look for ល.រ header)
    let dataStartRow = 10;
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("ល.រ")) {
          dataStartRow = rowNumber + 1;
        }
      });
    });

    console.log(`📍 Data starts at row: ${dataStartRow}`);

    // Parse each student row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < dataStartRow) return;

      const studentName = row.getCell("B").value?.toString().trim();
      const gender = row.getCell("C").value?.toString().trim();

      if (!studentName || studentName === "") return;

      const grades: { [subjectCode: string]: number | null } = {};

      // Parse grades based on subject mapping
      for (const [col, subjectCode] of Object.entries(subjectMapping)) {
        const cellValue = row.getCell(col).value;
        let score: number | null = null;

        if (cellValue !== null && cellValue !== undefined && cellValue !== "") {
          const numValue =
            typeof cellValue === "number"
              ? cellValue
              : parseFloat(cellValue.toString());

          if (!isNaN(numValue)) {
            score = numValue;
          }
        }

        grades[subjectCode] = score;
      }

      students.push({
        studentName,
        gender: gender || "",
        grades,
      });

      console.log(`  ✓ Row ${rowNumber}: ${studentName}`);
    });

    console.log(`✅ Parsed ${students.length} students`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { students, month, year, grade };
  }

  /**
   * Import grades to database
   */
  static async importGrades(
    classId: string,
    buffer: Buffer
  ): Promise<GradeImportResult> {
    const result: GradeImportResult = {
      success: true,
      totalStudents: 0,
      importedStudents: 0,
      errorStudents: 0,
      errors: [],
      summary: {
        month: "",
        year: 0,
        classId: "",
        className: "",
      },
    };

    try {
      // Get class data
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: true,
        },
      });

      if (!classData) {
        throw new Error("Class not found");
      }

      // Parse Excel
      const { students, month, year, grade } = await this.parseGradeFile(
        buffer,
        classId
      );

      result.totalStudents = students.length;
      result.summary.month = month;
      result.summary.year = year;
      result.summary.classId = classId;
      result.summary.className = classData.name;

      const monthNumber = this.getMonthNumber(month);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📥 Importing grades for ${classData.name}...`);
      console.log(`📅 Month: ${month} (${monthNumber}), Year: ${year}`);

      // Get track for grade 12
      let track: string | null = null;
      if (grade === "12") {
        // You may need to determine track from class name or ask user
        // For now, assume from class name (e.g., "ថ្នាក់ទី១២ក-វិទ្យាសាស្ត្រ")
        if (
          classData.name.includes("វិទ្យាសាស្ត្រ") ||
          classData.name.includes("science")
        ) {
          track = "science";
        } else if (
          classData.name.includes("សង្គម") ||
          classData.name.includes("social")
        ) {
          track = "social";
        }
      }

      // Process each student
      for (let i = 0; i < students.length; i++) {
        const importedStudent = students[i];
        const rowNumber = i + 11;

        try {
          // Find student in database by name
          const student = classData.students.find(
            (s) =>
              s.khmerName === importedStudent.studentName ||
              `${s.lastName} ${s.firstName}` === importedStudent.studentName
          );

          if (!student) {
            result.errors.push({
              row: rowNumber,
              studentName: importedStudent.studentName,
              error: "Student not found in class",
            });
            result.errorStudents++;
            continue;
          }

          // Import grades for each subject
          for (const [subjectCode, score] of Object.entries(
            importedStudent.grades
          )) {
            if (score === null) continue;

            // Find subject
            const subjectCodeWithGrade =
              grade === "12" && track
                ? `${subjectCode}-G${grade}-${track.toUpperCase()}`
                : `${subjectCode}-G${grade}`;

            const subject = await prisma.subject.findUnique({
              where: { code: subjectCodeWithGrade },
            });

            if (!subject) {
              console.warn(
                `  ⚠️ Subject not found: ${subjectCodeWithGrade} for ${importedStudent.studentName}`
              );
              continue;
            }

            // Create or update grade
            await prisma.grade.upsert({
              where: {
                studentId_subjectId_classId_month_year: {
                  studentId: student.id,
                  subjectId: subject.id,
                  classId: classId,
                  month: month,
                  year: year,
                },
              },
              update: {
                score,
                maxScore: subject.maxScore,
                monthNumber,
              },
              create: {
                studentId: student.id,
                subjectId: subject.id,
                classId: classId,
                score,
                maxScore: subject.maxScore,
                month,
                monthNumber,
                year,
              },
            });
          }

          // Calculate monthly summary for this student
          await GradeCalculationService.calculateMonthlySummary(
            student.id,
            classId,
            month,
            monthNumber,
            year
          );

          result.importedStudents++;
          console.log(
            `  ✅ Row ${rowNumber}: ${importedStudent.studentName} - Grades imported`
          );
        } catch (error: any) {
          console.error(`  ❌ Row ${rowNumber} error:`, error.message);
          result.errors.push({
            row: rowNumber,
            studentName: importedStudent.studentName,
            error: error.message || "Unknown error",
          });
          result.errorStudents++;
        }
      }

      // Calculate class ranks
      await GradeCalculationService.calculateClassRanks(classId, month, year);

      result.success = result.errorStudents === 0;

      console.log(
        `✅ Import completed: ${result.importedStudents} success, ${result.errorStudents} errors`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error: any) {
      console.error("❌ Import failed:", error);
      result.success = false;
      result.errors.push({
        row: 0,
        studentName: "System",
        error: error.message,
      });
    }

    return result;
  }
}

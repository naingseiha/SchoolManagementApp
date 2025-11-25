import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ImportedStudent {
  fullName: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;

  // ✅ Exam-related fields
  previousGrade?: string; // ឡើងពីថ្នាក់ទី
  passedStatus?: string; // ត្រួត
  examSession?: string; // សម័យប្រឡង
  examCenter?: string; // ម.ប្រឡង
  examRoom?: string; // បន្ទប់
  examDesk?: string; // លេខតុ
  remarks?: string; // ផ្សេងៗ
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  importedStudents: any[];
}

export class ExcelImportService {
  /**
   * ✅ Parse uploaded Excel file with all fields
   */
  static async parseImportFile(buffer: Buffer): Promise<ImportedStudent[]> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📂 Parsing uploaded Excel file...");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    const students: ImportedStudent[] = [];

    // Find data start row (look for "ល.រ" header)
    let dataStartRow = 11;
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("ល.រ")) {
          dataStartRow = rowNumber + 1;
        }
      });
    });

    console.log(`📍 Data starts at row: ${dataStartRow}`);

    let rowCount = 0;

    // Parse each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < dataStartRow) return;

      const fullName = row.getCell(2).value?.toString().trim();
      const genderStr = row.getCell(3).value?.toString().trim();
      const dobValue = row.getCell(4).value; // Can be string, number, or Date

      // Skip empty rows
      if (!fullName || fullName === "") return;

      rowCount++;

      // Parse full name (គោត្តនាម.នាម)
      const nameParts = fullName.split(/\s+/);
      const lastName = nameParts[0] || "";
      const firstName = nameParts.slice(1).join(" ") || nameParts[0] || "";

      // Parse gender
      let gender: "MALE" | "FEMALE" = "MALE";
      if (genderStr) {
        const genderLower = genderStr.toLowerCase();
        if (
          genderLower === "ស្រី" ||
          genderLower === "female" ||
          genderLower === "f" ||
          genderLower.includes("ស្រី")
        ) {
          gender = "FEMALE";
        }
      }

      // Parse date of birth
      let dateOfBirth = "";
      if (dobValue) {
        dateOfBirth = this.parseDate(dobValue);
      }

      // ✅ Parse exam-related fields
      const previousGrade =
        row.getCell(5).value?.toString().trim() || undefined;
      const passedStatus = row.getCell(6).value?.toString().trim() || undefined;
      const examSession = row.getCell(7).value?.toString().trim() || undefined;
      const examCenter = row.getCell(8).value?.toString().trim() || undefined;
      const examRoom = row.getCell(9).value?.toString().trim() || undefined;
      const examDesk = row.getCell(10).value?.toString().trim() || undefined;
      const remarks = row.getCell(11).value?.toString().trim() || undefined;

      students.push({
        fullName,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        previousGrade,
        passedStatus,
        examSession,
        examCenter,
        examRoom,
        examDesk,
        remarks,
      });

      console.log(
        `  ✓ Row ${rowNumber}: ${fullName} (${gender}) - DOB: ${
          dateOfBirth.split("T")[0]
        } - Grade: ${previousGrade || "N/A"}`
      );
    });

    console.log(`✅ Parsed ${students.length} students from ${rowCount} rows`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return students;
  }

  /**
   * ✅ Enhanced date parser - supports multiple formats
   */
  private static parseDate(dateValue: string | number | Date | any): string {
    try {
      // Handle null/undefined
      if (!dateValue) {
        console.warn("⚠️ Empty date value, using today");
        return new Date().toISOString();
      }

      // Handle Date objects
      if (dateValue instanceof Date) {
        if (!isNaN(dateValue.getTime())) {
          return dateValue.toISOString();
        }
      }

      // Handle Excel serial date numbers
      if (typeof dateValue === "number") {
        const excelEpoch = new Date(1900, 0, 1);
        const days = dateValue - 2;
        const date = new Date(
          excelEpoch.getTime() + days * 24 * 60 * 60 * 1000
        );
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      const dateString = String(dateValue).trim();

      // ✅ Handle DD/MM/YY format (29/12/08)
      if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        const isoDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // ✅ Handle DD/MM/YYYY format (29/12/2008)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // ✅ Handle DD-MM-YYYY format (29-12-2008)
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // ✅ Handle DD-MM-YY format (29-12-08)
      if (/^\d{1,2}-\d{1,2}-\d{2}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        const isoDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // ✅ Handle ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // ✅ Handle Khmer numerals (២៩/១២/០៨)
      if (/[០-៩]/.test(dateString)) {
        const khmerDigits = "០១២៣៤៥៦៧៨៩";
        const arabicDate = dateString.replace(/[០-៩]/g, (match) => {
          return String(khmerDigits.indexOf(match));
        });
        return this.parseDate(arabicDate);
      }

      // Try direct Date parse as last resort
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      // ❌ If all fails, return today's date
      console.warn(`⚠️ Could not parse date: "${dateString}", using today`);
      return new Date().toISOString();
    } catch (error) {
      console.error("❌ Date parse error:", error);
      return new Date().toISOString();
    }
  }

  /**
   * ✅ Validate student data
   */
  private static validateStudent(student: ImportedStudent): string | null {
    if (!student.fullName || student.fullName.trim() === "") {
      return "គោត្តនាម.នាម ត្រូវតែមាន • Full name is required";
    }

    if (!student.firstName || student.firstName.trim() === "") {
      return "នាមត្រូវតែមាន • First name is required";
    }

    if (!student.lastName || student.lastName.trim() === "") {
      return "គោត្តនាមត្រូវតែមាន • Last name is required";
    }

    if (!["MALE", "FEMALE"].includes(student.gender)) {
      return "ភេទមិនត្រឹមត្រូវ • Gender must be ប្រុស or ស្រី";
    }

    if (!student.dateOfBirth) {
      return "ថ្ងៃខែឆ្នាំកំណើតត្រូវតែមាន • Date of birth is required";
    }

    // Validate date range (reasonable birth years)
    const birthDate = new Date(student.dateOfBirth);
    const year = birthDate.getFullYear();
    if (year < 1990 || year > 2020) {
      return `ឆ្នាំកំណើតមិនត្រឹមត្រូវ (${year}) • Birth year should be between 1990-2020`;
    }

    return null;
  }

  /**
   * ✅ Import students to database with all fields
   */
  /**
   * ✅ Import students to database with all fields - FIXED
   */
  static async importStudents(
    classId: string,
    students: ImportedStudent[]
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRows: students.length,
      validRows: 0,
      errorRows: 0,
      errors: [],
      importedStudents: [],
    };

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      `📥 Importing ${students.length} students to class ${classId}...`
    );

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNumber = i + 12;

      try {
        const validationError = this.validateStudent(student);
        if (validationError) {
          result.errors.push({
            row: rowNumber,
            data: student,
            error: validationError,
          });
          result.errorRows++;
          console.log(`  ❌ Row ${rowNumber}: ${validationError}`);
          continue;
        }

        // Generate unique email
        const timestamp = Date.now();
        const cleanFirstName = student.firstName
          .toLowerCase()
          .replace(/[^\w]/g, "");
        const cleanLastName = student.lastName
          .toLowerCase()
          .replace(/[^\w]/g, "");
        const uniqueEmail = `${cleanLastName}.${cleanFirstName}.${timestamp}@student.temp`;

        // ✅ FIX: Use nested relation for class
        const createdStudent = await prisma.student.create({
          data: {
            khmerName: student.fullName,
            firstName: student.firstName,
            lastName: student.lastName,
            email: uniqueEmail,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth,

            // ✅ FIX: Use nested connect instead of classId
            class: {
              connect: {
                id: classId,
              },
            },

            // ✅ Save exam-related fields
            previousGrade: student.previousGrade,
            passedStatus: student.passedStatus,
            examSession: student.examSession,
            examCenter: student.examCenter,
            examRoom: student.examRoom,
            examDesk: student.examDesk,
            remarks: student.remarks,
          },
        });

        result.importedStudents.push(createdStudent);
        result.validRows++;
        console.log(
          `  ✅ Row ${rowNumber}: ${student.fullName} imported (Grade: ${
            student.previousGrade || "N/A"
          }, DOB: ${new Date(student.dateOfBirth).toISOString().split("T")[0]})`
        );
      } catch (error: any) {
        console.error(`  ❌ Row ${rowNumber} error:`, error.message);
        result.errors.push({
          row: rowNumber,
          data: student,
          error: error.message || "Unknown error",
        });
        result.errorRows++;
      }
    }

    result.success = result.errorRows === 0;

    console.log(
      `✅ Import completed: ${result.validRows} success, ${result.errorRows} errors`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return result;
  }
}

import ExcelJS from "exceljs";
import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

interface StudentImportRow {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  khmerName?: string;
  englishName?: string;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  currentAddress?: string;
  phoneNumber?: string;
  email?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentOccupation?: string;
  previousSchool?: string;
  previousGrade?: string;
  remarks?: string;
}

export class ExcelImportService {
  /**
   * ✅ FIXED: Parse Excel buffer with proper Buffer handling
   */
  static async parseExcelBuffer(buffer: Buffer): Promise<any[]> {
    try {
      console.log("📊 Parsing Excel buffer...");

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
              rowData[header] = cell.value;
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
      throw new Error(`Failed to parse Excel: ${error.message}`);
    }
  }

  /**
   * ✅ Import students from Excel buffer
   */
  static async importStudents(
    classId: string,
    buffer: Buffer
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: any[];
  }> {
    try {
      console.log("\n=== EXCEL STUDENT IMPORT ===");
      console.log("Class ID:", classId);

      // Verify class exists
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        throw new Error("Class not found");
      }

      console.log("Class:", classExists.name);

      // Parse Excel data
      const data = await this.parseExcelBuffer(buffer);

      if (data.length === 0) {
        throw new Error("No data found in Excel file");
      }

      const errors: any[] = [];
      let imported = 0;
      let skipped = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          console.log(`\n📝 Processing row ${i + 1}: `, row);

          // Map Excel columns to database fields
          const firstName =
            row.firstName || row["First Name"] || row["នាមត្រកូល"];
          const lastName = row.lastName || row["Last Name"] || row["នាមខ្លួន"];
          const khmerName =
            row.khmerName || row["Khmer Name"] || row["ឈ្មោះជាភាសាខ្មែរ"];
          const genderValue = (
            row.gender ||
            row["Gender"] ||
            row["ភេទ"] ||
            "MALE"
          )
            .toString()
            .toUpperCase();

          // Validate required fields
          if (!firstName || !lastName || !khmerName) {
            errors.push({
              row: i + 2, // Excel row number (accounting for header)
              data: row,
              error:
                "Missing required fields:  firstName, lastName, or khmerName",
            });
            skipped++;
            continue;
          }

          // Parse gender
          let gender: Gender = "MALE";
          if (
            genderValue === "FEMALE" ||
            genderValue === "F" ||
            genderValue === "ស្រី"
          ) {
            gender = "FEMALE";
          } else if (
            genderValue === "MALE" ||
            genderValue === "M" ||
            genderValue === "ប្រុស"
          ) {
            gender = "MALE";
          }

          // Parse date of birth
          let dateOfBirth = "2000-01-01"; // Default
          const dobValue =
            row.dateOfBirth || row["Date of Birth"] || row["ថ្ងៃខែឆ្នាំកំណើត"];

          if (dobValue) {
            if (dobValue instanceof Date) {
              dateOfBirth = dobValue.toISOString().split("T")[0];
            } else if (typeof dobValue === "string") {
              dateOfBirth = dobValue;
            }
          }

          // Check for duplicate studentId
          const studentId =
            row.studentId || row["Student ID"] || row["លេខសិស្ស"];
          if (studentId) {
            const existing = await prisma.student.findUnique({
              where: { studentId: studentId.toString() },
            });

            if (existing) {
              errors.push({
                row: i + 2,
                data: row,
                error: `Student ID ${studentId} already exists`,
              });
              skipped++;
              continue;
            }
          }

          // Create student
          const student = await prisma.student.create({
            data: {
              studentId: studentId?.toString(),
              firstName: firstName.toString(),
              lastName: lastName.toString(),
              khmerName: khmerName.toString(),
              englishName:
                row.englishName?.toString() || row["English Name"]?.toString(),
              gender,
              dateOfBirth,
              placeOfBirth:
                row.placeOfBirth?.toString() ||
                row["Place of Birth"]?.toString() ||
                "ភ្នំពេញ",
              currentAddress:
                row.currentAddress?.toString() ||
                row["Current Address"]?.toString() ||
                "ភ្នំពេញ",
              phoneNumber:
                row.phoneNumber?.toString() || row["Phone Number"]?.toString(),
              email: row.email?.toString() || row["Email"]?.toString(),
              fatherName:
                row.fatherName?.toString() ||
                row["Father Name"]?.toString() ||
                "ឪពុក",
              motherName:
                row.motherName?.toString() ||
                row["Mother Name"]?.toString() ||
                "ម្តាយ",
              parentPhone:
                row.parentPhone?.toString() || row["Parent Phone"]?.toString(),
              parentOccupation:
                row.parentOccupation?.toString() ||
                row["Parent Occupation"]?.toString() ||
                "កសិករ",
              previousSchool:
                row.previousSchool?.toString() ||
                row["Previous School"]?.toString(),
              previousGrade:
                row.previousGrade?.toString() ||
                row["Previous Grade"]?.toString(),
              remarks: row.remarks?.toString() || row["Remarks"]?.toString(),
              classId: classId,
            },
          });

          console.log(`✅ Imported: ${student.khmerName} (${student.id})`);
          imported++;
        } catch (error: any) {
          console.error(`❌ Error importing row ${i + 1}:`, error);
          errors.push({
            row: i + 2,
            data: row,
            error: error.message,
          });
          skipped++;
        }
      }

      console.log("\n=== IMPORT SUMMARY ===");
      console.log(`✅ Imported: ${imported}`);
      console.log(`⚠️  Skipped:  ${skipped}`);
      console.log(`❌ Errors: ${errors.length}`);
      console.log("======================\n");

      return {
        success: true,
        imported,
        skipped,
        errors,
      };
    } catch (error: any) {
      console.error("❌ Import students error:", error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * ✅ Generate Excel template for student import
   */
  static async generateImportTemplate(): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Students");

      // Define columns
      worksheet.columns = [
        { header: "studentId", key: "studentId", width: 15 },
        { header: "firstName", key: "firstName", width: 20 },
        { header: "lastName", key: "lastName", width: 20 },
        { header: "khmerName", key: "khmerName", width: 25 },
        { header: "englishName", key: "englishName", width: 25 },
        { header: "gender", key: "gender", width: 10 },
        { header: "dateOfBirth", key: "dateOfBirth", width: 15 },
        { header: "placeOfBirth", key: "placeOfBirth", width: 20 },
        { header: "currentAddress", key: "currentAddress", width: 30 },
        { header: "phoneNumber", key: "phoneNumber", width: 15 },
        { header: "email", key: "email", width: 25 },
        { header: "fatherName", key: "fatherName", width: 20 },
        { header: "motherName", key: "motherName", width: 20 },
        { header: "parentPhone", key: "parentPhone", width: 15 },
        { header: "parentOccupation", key: "parentOccupation", width: 20 },
        { header: "previousSchool", key: "previousSchool", width: 30 },
        { header: "previousGrade", key: "previousGrade", width: 15 },
        { header: "remarks", key: "remarks", width: 30 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      // Add sample data
      worksheet.addRow({
        studentId: "S001",
        firstName: "Sok",
        lastName: "Dara",
        khmerName: "សុខ ដារ៉ា",
        englishName: "Dara Sok",
        gender: "MALE",
        dateOfBirth: "2010-01-15",
        placeOfBirth: "ភ្នំពេញ",
        currentAddress: "ភ្នំពេញ",
        phoneNumber: "012345678",
        email: "dara@example.com",
        fatherName: "សុខ ចន្ថា",
        motherName: "ចន្ថា សុខ",
        parentPhone: "012987654",
        parentOccupation: "អ្នកជំនួញ",
        previousSchool: "ABC School",
        previousGrade: "6",
        remarks: "Good student",
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error: any) {
      console.error("❌ Generate template error:", error);
      throw new Error(`Failed to generate template: ${error.message}`);
    }
  }

  /**
   * ✅ Validate Excel file before import
   */
  static async validateExcelFile(buffer: Buffer): Promise<{
    valid: boolean;
    errors: string[];
    rowCount: number;
  }> {
    try {
      const data = await this.parseExcelBuffer(buffer);

      const errors: string[] = [];

      if (data.length === 0) {
        errors.push("Excel file is empty");
      }

      // Check required columns
      const requiredColumns = ["firstName", "lastName", "khmerName"];
      const firstRow = data[0] || {};

      for (const col of requiredColumns) {
        if (!firstRow.hasOwnProperty(col)) {
          errors.push(`Missing required column: ${col}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        rowCount: data.length,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        rowCount: 0,
      };
    }
  }
}

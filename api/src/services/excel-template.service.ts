import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export interface ExportOptions {
  classId: string;
  schoolName?: string;
  provinceName?: string;
  academicYear?: string;
  directorDetails?: string;
  instructorDetails?: string;
  classInstructor?: string;
  examSession?: string;
  examCode?: string;
  showExamInfo?: boolean;
  showPhoneNumber?: boolean;
  showAddress?: boolean;
  showStudentId?: boolean;
}

export class ExcelTemplateService {
  private static TEMPLATE_DIR = path.join(
    process.cwd(),
    "templates",
    "exports"
  );

  /**
   * ✅ Helper: Format date to YYYY-MM-DD string
   */
  private static formatDate(date: any): string {
    if (!date) return "";

    try {
      if (date instanceof Date) {
        return date.toISOString().split("T")[0];
      }

      if (typeof date === "string") {
        return date.split("T")[0];
      }

      // Try to convert to Date
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
      }

      return "";
    } catch (error) {
      console.error("❌ Date format error:", error);
      return "";
    }
  }

  /**
   * ✅ Export students using pre-designed template
   */
  static async exportStudentsByClass(options: ExportOptions): Promise<Buffer> {
    const templatePath = path.join(
      this.TEMPLATE_DIR,
      "student-list-by-class-template.xlsx"
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📂 Loading template:", templatePath);

    // ✅ Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    // ✅ Get class data
    const classData = await prisma.class.findUnique({
      where: { id: options.classId },
      include: {
        students: {
          orderBy: [{ gender: "asc" }, { khmerName: "asc" }],
        },
        teacher: {
          select: {
            khmerName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!classData) {
      throw new Error("Class not found");
    }

    const totalStudents = classData.students.length;
    const maleStudents = classData.students.filter(
      (s) => s.gender === "MALE"
    ).length;
    const femaleStudents = classData.students.filter(
      (s) => s.gender === "FEMALE"
    ).length;

    console.log(`📚 Class: ${classData.name}`);
    console.log(
      `👥 Students: ${totalStudents} (Male: ${maleStudents}, Female: ${femaleStudents})`
    );

    // ✅ Load template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    console.log(`📄 Template loaded: ${worksheet.name}`);

    // ✅ Replace placeholders
    const instructorName =
      options.classInstructor ||
      classData.teacher?.khmerName ||
      (classData.teacher
        ? `${classData.teacher.firstName} ${classData.teacher.lastName}`
        : "មិនទាន់កំណត់");

    const replacements = {
      "{{provinceName}}": options.provinceName || "រាជធានីភ្នំពេញ",
      "{{schoolName}}": options.schoolName || "វិទ្យាល័យហ៊ុនសែន ភ្នំពេញ",
      "{{academicYear}}": options.academicYear || "2024-2025",
      "{{className}}": classData.name,
      "{{grade}}": classData.grade,
      "{{section}}": classData.section || "",
      "{{totalStudents}}": totalStudents.toString(),
      "{{maleStudents}}": maleStudents.toString(),
      "{{femaleStudents}}": femaleStudents.toString(),
      "{{classInstructor}}": instructorName,
      "{{instructorDetails}}": options.instructorDetails || instructorName,
      "{{directorDetails}}": options.directorDetails || "នាយកសាលា",
      "{{examSession}}": options.examSession || "",
      "{{examCode}}": options.examCode || "",
      "{{currentDate}}": new Date().toLocaleDateString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    console.log("🔄 Replacing placeholders...");
    this.replacePlaceholders(worksheet, replacements);

    // ✅ Find data start row
    let dataStartRow = 11;

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("ល.រ")) {
          dataStartRow = rowNumber + 1;
        }
      });
    });

    console.log(`📍 Data will start at row: ${dataStartRow}`);

    // ✅ Get template row for styling
    const templateRow = worksheet.getRow(dataStartRow);

    // ✅ Insert student data
    console.log(`📝 Inserting ${totalStudents} students...`);

    classData.students.forEach((student, index) => {
      const rowNumber = dataStartRow + index;
      const row = worksheet.getRow(rowNumber);

      row.height = templateRow.height || 22;

      let colIndex = 1;

      // ល.រ (No.)
      const cellNo = row.getCell(colIndex++);
      cellNo.value = index + 1;
      cellNo.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(1), cellNo);

      // គោត្តនាម.នាម (Full Name)
      const cellName = row.getCell(colIndex++);
      cellName.value =
        student.khmerName || `${student.lastName} ${student.firstName}`;
      cellName.alignment = { horizontal: "left", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(2), cellName);

      // ភេទ (Gender)
      const cellGender = row.getCell(colIndex++);
      cellGender.value = student.gender === "MALE" ? "ប្រុស" : "ស្រី";
      cellGender.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(3), cellGender);

      // ✅ ថ្ងៃខែឆ្នាំកំណើត (Date of Birth) - FIXED
      const cellDob = row.getCell(colIndex++);
      cellDob.value = this.formatDate(student.dateOfBirth);
      cellDob.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(4), cellDob);

      // សម័យប្រឡង (Exam Session)
      const cellExamSession = row.getCell(colIndex++);
      cellExamSession.value = options.examSession || "";
      cellExamSession.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(5), cellExamSession);

      // ម.ប្រឡង (Exam Code)
      const cellExamCode = row.getCell(colIndex++);
      cellExamCode.value = options.examCode || "";
      cellExamCode.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(6), cellExamCode);

      // បន្ទប់ (Room)
      const cellRoom = row.getCell(colIndex++);
      cellRoom.value = "";
      cellRoom.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(7), cellRoom);

      // តុ (Desk)
      const cellDesk = row.getCell(colIndex++);
      cellDesk.value = "";
      cellDesk.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(8), cellDesk);

      // ផ្សេងៗ (Notes)
      const cellNotes = row.getCell(colIndex++);
      cellNotes.value = "";
      cellNotes.alignment = { horizontal: "left", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(9), cellNotes);

      // ហត្ថលេខា (Signature)
      const cellSignature = row.getCell(colIndex++);
      cellSignature.value = "";
      cellSignature.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(10), cellSignature);

      row.commit();
    });

    console.log(`✅ ${totalStudents} students inserted successfully!`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // ✅ Convert to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * ✅ Replace all placeholders in worksheet
   */
  private static replacePlaceholders(
    worksheet: ExcelJS.Worksheet,
    replacements: Record<string, string>
  ): void {
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (cell.value && typeof cell.value === "string") {
          let newValue = cell.value;
          let replaced = false;

          Object.entries(replacements).forEach(([placeholder, value]) => {
            if (newValue.includes(placeholder)) {
              newValue = newValue.replace(new RegExp(placeholder, "g"), value);
              replaced = true;
            }
          });

          if (replaced) {
            cell.value = newValue;
            console.log(`  ✓ Row ${rowNumber}, Col ${colNumber}: ${newValue}`);
          }
        }
      });
    });
  }

  /**
   * ✅ Copy cell style from template
   */
  private static copyCellStyle(
    templateCell: ExcelJS.Cell,
    targetCell: ExcelJS.Cell
  ): void {
    if (templateCell.font) targetCell.font = { ...templateCell.font };
    if (templateCell.fill) targetCell.fill = { ...templateCell.fill };
    if (templateCell.border) targetCell.border = { ...templateCell.border };
    if (templateCell.alignment)
      targetCell.alignment = { ...templateCell.alignment };
  }

  /**
   * ✅ Get available templates
   */
  static getAvailableTemplates(): string[] {
    if (!fs.existsSync(this.TEMPLATE_DIR)) {
      fs.mkdirSync(this.TEMPLATE_DIR, { recursive: true });
      return [];
    }

    return fs
      .readdirSync(this.TEMPLATE_DIR)
      .filter((file) => file.endsWith(".xlsx"));
  }
}

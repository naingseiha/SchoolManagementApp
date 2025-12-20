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
   * ✅ Export students using pre-designed template with ALL fields
   */
  static async exportStudentsByClass(options: ExportOptions): Promise<Buffer> {
    const templatePath = path.join(
      this.TEMPLATE_DIR,
      "student-list-by-class-template.xlsx"
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📂 Loading template:", templatePath);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const classData = await prisma.class.findUnique({
      where: { id: options.classId },
      include: {
        students: {
          orderBy: [{ gender: "asc" }, { khmerName: "asc" }],
        },
        homeroomTeacher: {
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

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    console.log(`📄 Template loaded: ${worksheet.name}`);

    const instructorName =
      options.classInstructor ||
      classData.homeroomTeacher?.khmerName ||
      (classData.homeroomTeacher
        ? `${classData.homeroomTeacher.firstName} ${classData.homeroomTeacher.lastName}`
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

    let dataStartRow = 11;
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("ល.រ")) {
          dataStartRow = rowNumber + 1;
        }
      });
    });

    console.log(`📍 Data will start at row: ${dataStartRow}`);

    const templateRow = worksheet.getRow(dataStartRow);

    console.log(`📝 Inserting ${totalStudents} students with all fields...`);

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

      // ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
      const cellDob = row.getCell(colIndex++);
      cellDob.value = this.formatDate(student.dateOfBirth);
      cellDob.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(4), cellDob);

      // ✅ ឡើងពីថ្នាក់ទី (Previous Grade)
      const cellPrevGrade = row.getCell(colIndex++);
      cellPrevGrade.value = (student as any).previousGrade || "";
      cellPrevGrade.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(5), cellPrevGrade);

      // ✅ ត្រួត (Pass/Fail Status)
      const cellPassed = row.getCell(colIndex++);
      cellPassed.value = (student as any).passedStatus || "";
      cellPassed.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(6), cellPassed);

      // ✅ សម័យប្រឡង (Exam Session)
      const cellExamSession = row.getCell(colIndex++);
      cellExamSession.value =
        (student as any).examSession || options.examSession || "";
      cellExamSession.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(7), cellExamSession);

      // ✅ ម.ប្រឡង (Exam Center)
      const cellExamCenter = row.getCell(colIndex++);
      cellExamCenter.value =
        (student as any).examCenter || options.examCode || "";
      cellExamCenter.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(8), cellExamCenter);

      // ✅ បន្ទប់ (Exam Room)
      const cellRoom = row.getCell(colIndex++);
      cellRoom.value = (student as any).examRoom || "";
      cellRoom.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(9), cellRoom);

      // ✅ លេខតុ (Exam Desk)
      const cellDesk = row.getCell(colIndex++);
      cellDesk.value = (student as any).examDesk || "";
      cellDesk.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(10), cellDesk);

      // ✅ ផ្សេងៗ (Remarks)
      const cellRemarks = row.getCell(colIndex++);
      cellRemarks.value = (student as any).remarks || "";
      cellRemarks.alignment = { horizontal: "left", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(11), cellRemarks);

      // ហត្ថលេខា (Signature)
      const cellSignature = row.getCell(colIndex++);
      cellSignature.value = "";
      cellSignature.alignment = { horizontal: "center", vertical: "middle" };
      this.copyCellStyle(templateRow.getCell(12), cellSignature);

      row.commit();
    });

    console.log(`✅ ${totalStudents} students inserted with all fields!`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * ✅ Generate blank import template for manual entry
   */
  static async generateImportTemplate(
    classId: string,
    options: {
      schoolName?: string;
      provinceName?: string;
      academicYear?: string;
      className?: string;
      sampleRows?: number;
    }
  ): Promise<Buffer> {
    const templatePath = path.join(
      this.TEMPLATE_DIR,
      "student-list-by-class-template.xlsx"
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📄 Generating import template...");

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    const replacements = {
      "{{provinceName}}": options.provinceName || "[បំពេញខេត្ត/រាជធានី]",
      "{{schoolName}}": options.schoolName || "[បំពេញឈ្មោះសាលា]",
      "{{academicYear}}": options.academicYear || "[ឆ្នាំសិក្សា]",
      "{{className}}": options.className || "[ថ្នាក់]",
      "{{grade}}": "",
      "{{section}}": "",
      "{{totalStudents}}": "[ចំនួនសិស្ស]",
      "{{maleStudents}}": "",
      "{{femaleStudents}}": "",
      "{{classInstructor}}": "[គ្រូប្រចាំថ្នាក់]",
      "{{instructorDetails}}": "",
      "{{directorDetails}}": "",
      "{{examSession}}": "",
      "{{examCode}}": "",
      "{{currentDate}}": new Date().toLocaleDateString("km-KH"),
    };

    this.replacePlaceholders(worksheet, replacements);

    let dataStartRow = 11;
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("ល.រ")) {
          dataStartRow = rowNumber + 1;
        }
      });
    });

    console.log(`📍 Data entry starts at row: ${dataStartRow}`);

    // ✅ Set date column format
    worksheet.getColumn(4).numFmt = "dd/mm/yyyy";

    const sampleRows = options.sampleRows || 5;
    const templateRow = worksheet.getRow(dataStartRow);

    for (let i = 0; i < sampleRows; i++) {
      const rowNumber = dataStartRow + i;
      const row = worksheet.getRow(rowNumber);
      row.height = templateRow.height || 22;

      // Sample data
      if (i === 0) {
        row.getCell(1).value = 1;
        row.getCell(2).value = "សុខ វិរៈ";
        row.getCell(3).value = "ប្រុស";
        row.getCell(4).value = new Date(2008, 11, 29);
        row.getCell(5).value = "ថ្នាក់ទី៩";
        row.getCell(6).value = "ជាប់";
        row.getCell(7).value = "ឆមាសទី១";
        row.getCell(8).value = "HS-PP-01";
      } else if (i === 1) {
        row.getCell(1).value = 2;
        row.getCell(2).value = "ចាន់ សោភា";
        row.getCell(3).value = "ស្រី";
        row.getCell(4).value = new Date(2008, 7, 20);
        row.getCell(5).value = "ថ្នាក់ទី៩";
        row.getCell(6).value = "ជាប់";
      } else {
        row.getCell(1).value = i + 1;
        row.getCell(2).value = "";
        row.getCell(3).value = "";
        row.getCell(4).value = "";
        row.getCell(5).value = "";
        row.getCell(6).value = "";
      }

      row.getCell(7).value = "";
      row.getCell(8).value = "";
      row.getCell(9).value = "";
      row.getCell(10).value = "";
      row.getCell(11).value = "";
      row.getCell(12).value = "";

      for (let col = 1; col <= 12; col++) {
        this.copyCellStyle(templateRow.getCell(col), row.getCell(col));
      }

      row.commit();
    }

    // Add instruction note
    worksheet.getCell(`D${dataStartRow}`).note = {
      texts: [
        {
          font: { name: "Khmer OS Battambang", size: 9, bold: true },
          text: "ទម្រង់ថ្ងៃខែ • Date Format:\n\n",
        },
        {
          font: { name: "Arial", size: 8 },
          text: "✅ 29/12/2008 (DD/MM/YYYY)\n✅ 29/12/08 (DD/MM/YY)\n✅ 2008-12-29 (ISO)\n",
        },
      ],
    };

    console.log("✅ Import template generated with all fields!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

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

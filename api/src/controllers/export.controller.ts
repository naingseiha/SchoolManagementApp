import { Request, Response } from "express";
import {
  ExcelTemplateService,
  ExportOptions,
} from "../services/excel-template.service";

/**
 * ✅ Export students by class to Excel
 */
export const exportStudentsByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const options: ExportOptions = {
      classId, // ✅ Include classId
      schoolName: req.body.schoolName,
      provinceName: req.body.provinceName,
      academicYear: req.body.academicYear,
      directorDetails: req.body.directorDetails,
      instructorDetails: req.body.instructorDetails,
      classInstructor: req.body.classInstructor,
      examSession: req.body.examSession,
      examCode: req.body.examCode,
      showExamInfo: req.body.showExamInfo || false,
      showPhoneNumber: req.body.showPhoneNumber !== false,
      showAddress: req.body.showAddress !== false,
      showStudentId: req.body.showStudentId !== false,
    };

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 Export Request:", {
      classId,
      schoolName: options.schoolName,
      provinceName: options.provinceName,
      academicYear: options.academicYear,
    });

    const buffer = await ExcelTemplateService.exportStudentsByClass(options);

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Students_${classId}_${timestamp}.xlsx`;

    console.log(`📤 Sending file: ${filename} (${buffer.length} bytes)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error: any) {
    console.error("❌ Export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export students",
      error: error.message,
    });
  }
};

/**
 * ✅ Download import template
 */
export const downloadImportTemplate = async (req: Request, res: Response) => {
  try {
    console.log("📥 Import template download request");

    // You can create a simple template or use pre-designed one
    const templatePath = "templates/imports/student-import-template.xlsx";

    res.download(templatePath, "Student_Import_Template.xlsx", (err) => {
      if (err) {
        console.error("❌ Template download error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to download template",
        });
      }
    });
  } catch (error: any) {
    console.error("❌ Template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get template",
      error: error.message,
    });
  }
};

/**
 * ✅ Get available export templates
 */
export const getAvailableTemplates = async (req: Request, res: Response) => {
  try {
    const templates = ExcelTemplateService.getAvailableTemplates();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error("❌ Get templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get templates",
      error: error.message,
    });
  }
};

/**
 * ✅ Preview export settings (without generating file)
 */
/**
 * ✅ Preview export settings (without generating file)
 */
export const previewExport = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    // Get class info for preview
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          select: {
            id: true,
            gender: true,
          },
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
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const totalStudents = classData.students.length;
    const maleStudents = classData.students.filter(
      (s) => s.gender === "MALE"
    ).length;
    const femaleStudents = classData.students.filter(
      (s) => s.gender === "FEMALE"
    ).length;

    const instructorName =
      classData.teacher?.khmerName ||
      (classData.teacher
        ? `${classData.teacher.firstName} ${classData.teacher.lastName}`
        : "មិនទាន់កំណត់");

    res.json({
      success: true,
      data: {
        className: classData.name,
        grade: classData.grade,
        section: classData.section,
        academicYear: classData.academicYear || "2024-2025", // ✅ Include academicYear
        totalStudents,
        maleStudents,
        femaleStudents,
        classInstructor: instructorName,
        suggestedFilename: `Students_${classData.name}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
      },
    });

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Preview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to preview export",
      error: error.message,
    });
  }
};

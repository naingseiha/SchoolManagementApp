import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GradeImportService } from "../services/grade-import.service";
import { GradeCalculationService } from "../services/grade-calculation.service";
import multer from "multer";

const prisma = new PrismaClient();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

export class GradeController {
  // ==================== FILE UPLOAD ====================

  /**
   * Multer middleware for file upload
   */
  static uploadMiddleware = upload.single("file");

  /**
   * Upload and import grades from Excel
   */
  static async importGrades(req: Request, res: Response) {
    try {
      const { classId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log(`📤 Importing grades for class: ${classId}`);

      const result = await GradeImportService.importGrades(
        classId,
        req.file.buffer
      );

      return res.status(result.success ? 200 : 207).json(result);
    } catch (error: any) {
      console.error("❌ Grade import error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to import grades",
      });
    }
  }

  /**
   * Get grades by month
   */
  static async getGradesByMonth(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      const grades = await prisma.grade.findMany({
        where: {
          classId,
          month: month as string,
          year: parseInt(year as string),
        },
        include: {
          student: {
            select: {
              id: true,
              khmerName: true,
              firstName: true,
              lastName: true,
              gender: true,
            },
          },
          subject: {
            select: {
              id: true,
              nameKh: true,
              nameEn: true,
              code: true,
              maxScore: true,
              coefficient: true,
            },
          },
        },
        orderBy: [{ student: { khmerName: "asc" } }],
      });

      return res.json({
        success: true,
        data: grades,
      });
    } catch (error: any) {
      console.error("❌ Get grades error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get grades",
      });
    }
  }

  /**
   * Get monthly summary for a class
   */
  static async getMonthlySummary(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      const summaries = await prisma.studentMonthlySummary.findMany({
        where: {
          classId,
          month: month as string,
          year: parseInt(year as string),
        },
        include: {
          student: {
            select: {
              id: true,
              khmerName: true,
              firstName: true,
              lastName: true,
              gender: true,
            },
          },
        },
        orderBy: [{ classRank: "asc" }],
      });

      return res.json({
        success: true,
        data: summaries,
      });
    } catch (error: any) {
      console.error("❌ Get summary error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get summary",
      });
    }
  }
}

// ==================== EXISTING FUNCTIONS (Keep as is) ====================

// Get all grades
export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching grades",
      error: error.message,
    });
  }
};

// Get grade by ID
export const getGradeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            class: {
              select: {
                name: true,
                grade: true,
                section: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching grade",
      error: error.message,
    });
  }
};

// Get grades by student
export const getGradesByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const grades = await prisma.grade.findMany({
      where: { studentId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching student grades",
      error: error.message,
    });
  }
};

// Get grades by class
export const getGradesByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const grades = await prisma.grade.findMany({
      where: {
        classId, // ✅ Use direct classId instead of nested query
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            khmerName: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching class grades",
      error: error.message,
    });
  }
};

// Get grades by subject
export const getGradesBySubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const grades = await prisma.grade.findMany({
      where: { subjectId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            khmerName: true,
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching subject grades",
      error: error.message,
    });
  }
};

// Create new grade
export const createGrade = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      subjectId,
      classId,
      score,
      maxScore,
      remarks,
      month,
      year,
    } = req.body;

    if (
      !studentId ||
      !subjectId ||
      !classId ||
      score === undefined ||
      !maxScore
    ) {
      return res.status(400).json({
        success: false,
        message:
          "StudentId, subjectId, classId, score, and maxScore are required",
      });
    }

    if (score < 0 || score > maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${maxScore}`,
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        classId,
        score,
        maxScore,
        month,
        year,
        remarks,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            khmerName: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Calculate summary if month/year provided
    if (month && year) {
      const monthNumber = GradeCalculationService.getMonthNumber?.(month) || 1;
      await GradeCalculationService.calculateMonthlySummary(
        studentId,
        classId,
        month,
        monthNumber,
        year
      );
    }

    res.status(201).json({
      success: true,
      message: "Grade created successfully",
      data: newGrade,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating grade",
      error: error.message,
    });
  }
};

// Update grade
export const updateGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, maxScore, remarks } = req.body;

    const existingGrade = await prisma.grade.findUnique({
      where: { id },
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    const finalMaxScore = maxScore || existingGrade.maxScore;
    if (score !== undefined && (score < 0 || score > finalMaxScore)) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${finalMaxScore}`,
      });
    }

    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: {
        score,
        maxScore,
        remarks,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            khmerName: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Recalculate summary
    if (existingGrade.month && existingGrade.year) {
      const monthNumber = existingGrade.monthNumber || 1;
      await GradeCalculationService.calculateMonthlySummary(
        existingGrade.studentId,
        existingGrade.classId,
        existingGrade.month,
        monthNumber,
        existingGrade.year
      );
    }

    res.json({
      success: true,
      message: "Grade updated successfully",
      data: updatedGrade,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating grade",
      error: error.message,
    });
  }
};

// Delete grade
export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingGrade = await prisma.grade.findUnique({
      where: { id },
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    await prisma.grade.delete({
      where: { id },
    });

    // Recalculate summary after deletion
    if (existingGrade.month && existingGrade.year) {
      const monthNumber = existingGrade.monthNumber || 1;
      await GradeCalculationService.calculateMonthlySummary(
        existingGrade.studentId,
        existingGrade.classId,
        existingGrade.month,
        monthNumber,
        existingGrade.year
      );
    }

    res.json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting grade",
      error: error.message,
    });
  }
};

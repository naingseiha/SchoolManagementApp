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

  // ==================== NEW: GRID DATA & BULK SAVE ====================

  /**
   * Get grades in grid format for Excel-like editing
   */
  // Update the getGradesGrid method in GradeController class

  /**
   * Get grades in grid format for Excel-like editing
   */
  // Update getSubjectOrder function in getGradesGrid method

  // Update getGradesGrid method - Calculate Total Coefficients from ALL subjects

  static async getGradesGrid(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      // Get class with students
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
        },
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Define subject order and codes by grade
      const getSubjectOrder = (
        grade: string
      ): { [code: string]: { order: number; shortCode: string } } => {
        const gradeNum = parseInt(grade);

        // Grades 7, 8 - WITH He (គេហវិទ្យា)
        if (gradeNum === 7 || gradeNum === 8) {
          return {
            WRITING: { order: 1, shortCode: "W" },
            WRITER: { order: 2, shortCode: "R" },
            DICTATION: { order: 3, shortCode: "D" },
            MATH: { order: 4, shortCode: "M" },
            PHY: { order: 5, shortCode: "P" },
            CHEM: { order: 6, shortCode: "C" },
            BIO: { order: 7, shortCode: "B" },
            EARTH: { order: 8, shortCode: "Es" },
            MORAL: { order: 9, shortCode: "Mo" },
            GEO: { order: 10, shortCode: "G" },
            HIST: { order: 11, shortCode: "H" },
            ENG: { order: 12, shortCode: "E" },
            HE: { order: 13, shortCode: "He" }, // FIXED: HE not HOME
            SPORTS: { order: 14, shortCode: "S" },
            AGRI: { order: 15, shortCode: "Ag" },
            ICT: { order: 16, shortCode: "IT" },
          };
        }

        // Grade 9 - WITH He (គេហវិទ្យា)
        if (gradeNum === 9) {
          return {
            WRITING: { order: 1, shortCode: "W" },
            WRITER: { order: 2, shortCode: "R" },
            DICTATION: { order: 3, shortCode: "D" },
            MATH: { order: 4, shortCode: "M" },
            PHY: { order: 5, shortCode: "P" },
            CHEM: { order: 6, shortCode: "C" },
            BIO: { order: 7, shortCode: "B" },
            EARTH: { order: 8, shortCode: "Es" },
            MORAL: { order: 9, shortCode: "Mo" },
            GEO: { order: 10, shortCode: "G" },
            HIST: { order: 11, shortCode: "H" },
            ENG: { order: 12, shortCode: "E" },
            HE: { order: 13, shortCode: "He" }, // FIXED: HE not HOME
            SPORTS: { order: 14, shortCode: "S" },
            AGRI: { order: 15, shortCode: "Ag" },
            ICT: { order: 16, shortCode: "IT" },
          };
        }

        // Grades 10, 11, 12
        return {
          KHM: { order: 1, shortCode: "K" },
          MATH: { order: 2, shortCode: "M" },
          PHY: { order: 3, shortCode: "P" },
          CHEM: { order: 4, shortCode: "C" },
          BIO: { order: 5, shortCode: "B" },
          EARTH: { order: 6, shortCode: "Es" },
          MORAL: { order: 7, shortCode: "Mo" },
          GEO: { order: 8, shortCode: "G" },
          HIST: { order: 9, shortCode: "H" },
          ENG: { order: 10, shortCode: "E" },
          SPORTS: { order: 11, shortCode: "S" },
          AGRI: { order: 12, shortCode: "Ag" },
          ICT: { order: 13, shortCode: "IT" },
        };
      };

      const subjectOrder = getSubjectOrder(classData.grade);

      // Get subjects for this grade and sort them
      const subjects = await prisma.subject.findMany({
        where: {
          grade: classData.grade,
          isActive: true,
        },
      });

      // Sort subjects by order
      const sortedSubjects = subjects
        .map((subject) => {
          const baseCode = subject.code.split("-")[0];
          const orderInfo = subjectOrder[baseCode] || {
            order: 999,
            shortCode: subject.code,
          };
          return {
            ...subject,
            displayOrder: orderInfo.order,
            shortCode: orderInfo.shortCode,
          };
        })
        .sort((a, b) => a.displayOrder - b.displayOrder);

      // ✅ CALCULATE TOTAL COEFFICIENTS FROM ALL SUBJECTS (NOT JUST ENTERED ONES)
      const totalCoefficientForClass = sortedSubjects.reduce(
        (sum, subject) => sum + subject.coefficient,
        0
      );

      // Get existing grades
      const existingGrades = await prisma.grade.findMany({
        where: {
          classId,
          month: month as string,
          year: parseInt(year as string),
        },
      });

      // Build grid data with calculations
      const gridData = classData.students.map((student) => {
        const studentGrades: { [subjectId: string]: any } = {};
        let totalScore = 0;
        let totalMaxScore = 0;

        sortedSubjects.forEach((subject) => {
          const grade = existingGrades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          const score = grade?.score || null;

          if (score !== null) {
            totalScore += score;
            totalMaxScore += subject.maxScore;
          }

          studentGrades[subject.id] = {
            id: grade?.id || null,
            score,
            maxScore: subject.maxScore,
            coefficient: subject.coefficient,
            isSaved: !!grade,
          };
        });

        // ✅ FIXED: Average = Total Score / Total Coefficients (OF ALL SUBJECTS)
        const average =
          totalCoefficientForClass > 0
            ? totalScore / totalCoefficientForClass
            : 0;

        // Determine grade level
        let gradeLevel = "F";
        if (average >= 90) gradeLevel = "A";
        else if (average >= 80) gradeLevel = "B+";
        else if (average >= 70) gradeLevel = "B";
        else if (average >= 60) gradeLevel = "C";
        else if (average >= 50) gradeLevel = "D";
        else if (average >= 40) gradeLevel = "E";

        return {
          studentId: student.id,
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          grades: studentGrades,
          totalScore: totalScore.toFixed(2),
          totalMaxScore,
          totalCoefficient: totalCoefficientForClass.toFixed(2), // Total from ALL subjects
          average: average.toFixed(2),
          gradeLevel,
          absent: 0,
          permission: 0,
        };
      });

      // Calculate ranks
      const rankedData = gridData
        .slice()
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      // Restore original order with ranks
      const finalData = gridData.map((student) => {
        const ranked = rankedData.find(
          (r) => r.studentId === student.studentId
        );
        return { ...student, rank: ranked?.rank || 0 };
      });

      return res.json({
        success: true,
        data: {
          classId: classData.id,
          className: classData.name,
          grade: classData.grade,
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient: totalCoefficientForClass, // Send to frontend
          subjects: sortedSubjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            shortCode: s.shortCode,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
            order: s.displayOrder,
          })),
          students: finalData,
        },
      });
    } catch (error: any) {
      console.error("❌ Get grid error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get grid data",
      });
    }
  }

  /**
   * Bulk save/update grades
   */
  static async bulkSaveGrades(req: Request, res: Response) {
    try {
      const { classId, month, year, grades } = req.body;

      if (!classId || !month || !year || !grades || !Array.isArray(grades)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
        });
      }

      const monthNumber = GradeCalculationService.getMonthNumber(month) || 1;
      const savedGrades: any[] = [];
      const errors: any[] = [];

      // Process each grade
      for (const gradeData of grades) {
        const { studentId, subjectId, score } = gradeData;

        try {
          // Get subject for maxScore
          const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
          });

          if (!subject) {
            errors.push({
              studentId,
              subjectId,
              error: "Subject not found",
            });
            continue;
          }

          // Validate score
          if (score !== null && (score < 0 || score > subject.maxScore)) {
            errors.push({
              studentId,
              subjectId,
              error: `Score must be between 0 and ${subject.maxScore}`,
            });
            continue;
          }

          // Skip if score is null (no change)
          if (score === null) continue;

          // Upsert grade
          const savedGrade = await prisma.grade.upsert({
            where: {
              studentId_subjectId_classId_month_year: {
                studentId,
                subjectId,
                classId,
                month,
                year: parseInt(year),
              },
            },
            update: {
              score,
              maxScore: subject.maxScore,
              monthNumber,
              percentage: (score / subject.maxScore) * 100,
              weightedScore: score * subject.coefficient,
            },
            create: {
              studentId,
              subjectId,
              classId,
              score,
              maxScore: subject.maxScore,
              month,
              monthNumber,
              year: parseInt(year),
              percentage: (score / subject.maxScore) * 100,
              weightedScore: score * subject.coefficient,
            },
          });

          savedGrades.push(savedGrade);
        } catch (error: any) {
          errors.push({
            studentId,
            subjectId,
            error: error.message,
          });
        }
      }

      // Recalculate summaries for affected students
      const studentIds = [...new Set(grades.map((g: any) => g.studentId))];
      for (const studentId of studentIds) {
        try {
          await GradeCalculationService.calculateMonthlySummary(
            studentId,
            classId,
            month,
            monthNumber,
            parseInt(year)
          );
        } catch (error: any) {
          console.error(
            `Failed to calculate summary for student ${studentId}:`,
            error
          );
        }
      }

      // Recalculate class ranks
      await GradeCalculationService.calculateClassRanks(
        classId,
        month,
        parseInt(year)
      );

      return res.json({
        success: errors.length === 0,
        message: `Saved ${savedGrades.length} grades${
          errors.length > 0 ? `, ${errors.length} errors` : ""
        }`,
        data: {
          savedCount: savedGrades.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (error: any) {
      console.error("❌ Bulk save error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save grades",
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

    const grades = await prisma.grade.findMany({
      where: { classId },
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
        message: "Please provide all required fields",
      });
    }

    if (score < 0 || score > maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${maxScore}`,
      });
    }

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        classId,
        score,
        maxScore,
        remarks,
        month,
        year,
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
      // FIX: Remove optional chaining on static method
      const monthNumber = GradeCalculationService.getMonthNumber(month) || 1;
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

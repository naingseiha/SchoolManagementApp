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
  // Update getGradesGrid method in GradeController class
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

        // Grades 7, 8
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
            HE: { order: 13, shortCode: "He" },
            HLTH: { order: 14, shortCode: "Hl" },
            SPORTS: { order: 15, shortCode: "S" },
            AGRI: { order: 16, shortCode: "Ag" },
            ICT: { order: 17, shortCode: "IT" },
          };
        }

        // Grade 9
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
            KHM: { order: 13, shortCode: "K" },
            ECON: { order: 14, shortCode: "Ec" },
            HLTH: { order: 15, shortCode: "Hl" },
            HE: { order: 16, shortCode: "He" },
            SPORTS: { order: 17, shortCode: "S" },
            AGRI: { order: 18, shortCode: "Ag" },
            ICT: { order: 19, shortCode: "IT" },
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
          ECON: { order: 11, shortCode: "Ec" },
          HLTH: { order: 12, shortCode: "Hl" },
          SPORTS: { order: 13, shortCode: "S" },
          AGRI: { order: 14, shortCode: "Ag" },
          ICT: { order: 15, shortCode: "IT" },
        };
      };

      const subjectOrder = getSubjectOrder(classData.grade);

      // ✅ FIXED: Filter subjects by grade AND track
      const whereClause: any = {
        grade: classData.grade,
        isActive: true,
      };

      // ✅ For Grade 11 & 12, filter by track
      const gradeNum = parseInt(classData.grade);
      if ((gradeNum === 11 || gradeNum === 12) && classData.track) {
        whereClause.OR = [
          { track: classData.track }, // Subjects specific to this track
          { track: null }, // Common subjects (for both tracks)
          { track: "common" }, // Common subjects (explicit)
        ];

        console.log(
          `📚 Filtering subjects for Grade ${classData.grade} - Track: ${classData.track}`
        );
      }

      const subjects = await prisma.subject.findMany({
        where: whereClause,
      });

      console.log(
        `✅ Found ${subjects.length} subjects for grade ${classData.grade}${
          classData.track ? ` (${classData.track})` : ""
        }`
      );

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

      // ✅ CALCULATE TOTAL COEFFICIENTS FROM ALL SUBJECTS
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

        const average =
          totalCoefficientForClass > 0
            ? totalScore / totalCoefficientForClass
            : 0;

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
          totalCoefficient: totalCoefficientForClass.toFixed(2),
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
          track: classData.track || null, // ✅ Include track in response
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient: totalCoefficientForClass,
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
   * 🚀 OPTIMIZED: Bulk save/update grades
   * @description Save multiple grades efficiently with proper connection management
   */
  static async bulkSaveGrades(req: Request, res: Response) {
    try {
      const { classId, month, year, grades } = req.body;

      // ✅ Validation
      if (!classId || !month || !year || !grades || !Array.isArray(grades)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
        });
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎯 Bulk Save Grades Started");
      console.log(`📊 Class: ${classId}`);
      console.log(`📅 Period: ${month} ${year}`);
      console.log(`📝 Total items: ${grades.length}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      const monthNumber = GradeCalculationService.getMonthNumber(month) || 1;
      const errors: any[] = [];

      console.time("⏱️  Total Save Time");

      // ✅ Step 1: Fetch all subjects at once
      console.time("📚 Fetch Subjects");
      const subjectIds = [...new Set(grades.map((g: any) => g.subjectId))];
      const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, maxScore: true, coefficient: true },
      });
      const subjectMap = new Map(subjects.map((s) => [s.id, s]));
      console.timeEnd("📚 Fetch Subjects");
      console.log(`✅ Found ${subjects.length} subjects`);

      // ✅ Step 2: Validate and prepare data
      console.time("🔨 Validate Data");
      const validGrades: any[] = [];
      const uniqueKeys = new Set<string>();

      for (const gradeData of grades) {
        const { studentId, subjectId, score } = gradeData;

        // Prevent duplicates
        const uniqueKey = `${studentId}_${subjectId}_${classId}_${month}_${year}`;
        if (uniqueKeys.has(uniqueKey)) {
          console.warn(`⚠️  Duplicate entry skipped: ${uniqueKey}`);
          continue;
        }
        uniqueKeys.add(uniqueKey);

        const subject = subjectMap.get(subjectId);
        if (!subject) {
          errors.push({ studentId, subjectId, error: "Subject not found" });
          continue;
        }

        if (score !== null && (score < 0 || score > subject.maxScore)) {
          errors.push({
            studentId,
            subjectId,
            error: `Score must be between 0 and ${subject.maxScore}`,
          });
          continue;
        }

        if (score === null) continue;

        validGrades.push({
          studentId,
          subjectId,
          classId,
          month,
          year: parseInt(year),
          score,
          maxScore: subject.maxScore,
          monthNumber,
          percentage: (score / subject.maxScore) * 100,
          weightedScore: score * subject.coefficient,
        });
      }

      console.timeEnd("🔨 Validate Data");
      console.log(
        `✅ Validated: ${validGrades.length} valid, ${errors.length} errors`
      );

      let savedCount = 0;

      if (validGrades.length > 0) {
        // ✅ Step 3: Database operations
        console.time("💾 Database Save");

        try {
          // Get existing grades to determine creates vs updates
          const existingGrades = await prisma.grade.findMany({
            where: {
              classId,
              month,
              year: parseInt(year),
              OR: validGrades.map((g) => ({
                studentId: g.studentId,
                subjectId: g.subjectId,
              })),
            },
            select: {
              studentId: true,
              subjectId: true,
              id: true,
            },
          });

          const existingMap = new Map(
            existingGrades.map((g) => [`${g.studentId}_${g.subjectId}`, g.id])
          );

          // Separate creates and updates
          const toCreate: any[] = [];
          const toUpdate: any[] = [];

          validGrades.forEach((grade) => {
            const key = `${grade.studentId}_${grade.subjectId}`;
            const existingId = existingMap.get(key);

            if (existingId) {
              toUpdate.push({
                where: { id: existingId },
                data: {
                  score: grade.score,
                  maxScore: grade.maxScore,
                  monthNumber: grade.monthNumber,
                  percentage: grade.percentage,
                  weightedScore: grade.weightedScore,
                },
              });
            } else {
              toCreate.push(grade);
            }
          });

          console.log(
            `📝 Operations: ${toCreate.length} creates, ${toUpdate.length} updates`
          );

          // Execute in single transaction with optimized timeout
          await prisma.$transaction(
            async (tx) => {
              // Batch create
              if (toCreate.length > 0) {
                await tx.grade.createMany({
                  data: toCreate,
                  skipDuplicates: true,
                });
                savedCount += toCreate.length;
                console.log(`✅ Created ${toCreate.length} grades`);
              }

              // Batch update in chunks
              if (toUpdate.length > 0) {
                const CHUNK_SIZE = 50;
                for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
                  const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
                  await Promise.all(
                    chunk.map((update) => tx.grade.update(update))
                  );
                  savedCount += chunk.length;
                }
                console.log(`✅ Updated ${toUpdate.length} grades`);
              }
            },
            {
              maxWait: 10000, // 10 seconds max wait
              timeout: 15000, // 15 seconds transaction timeout
            }
          );

          console.timeEnd("💾 Database Save");
        } catch (saveError: any) {
          console.error("❌ Save error:", saveError.message);
          throw saveError;
        }
      }

      // ✅ Step 4: Calculate summaries (in parallel with controlled concurrency)
      console.time("📊 Calculate Summaries");
      const studentIds = [...new Set(grades.map((g: any) => g.studentId))];
      console.log(`🧮 Calculating summaries for ${studentIds.length} students`);

      // Process 10 students at a time to avoid overwhelming connection pool
      const PARALLEL_LIMIT = 10;
      let summaryCount = 0;

      for (let i = 0; i < studentIds.length; i += PARALLEL_LIMIT) {
        const batch = studentIds.slice(i, i + PARALLEL_LIMIT);
        const results = await Promise.allSettled(
          batch.map((studentId) =>
            GradeCalculationService.calculateMonthlySummary(
              studentId,
              classId,
              month,
              monthNumber,
              parseInt(year)
            )
          )
        );

        // Count successful calculations
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            summaryCount++;
          } else {
            console.error(
              `⚠️  Summary failed for student ${batch[index]}:`,
              result.reason?.message
            );
          }
        });
      }

      console.timeEnd("📊 Calculate Summaries");
      console.log(
        `✅ Calculated ${summaryCount}/${studentIds.length} summaries`
      );

      // ✅ Step 5: Calculate class ranks
      console.time("🏆 Calculate Ranks");
      try {
        await GradeCalculationService.calculateClassRanks(
          classId,
          month,
          parseInt(year)
        );
        console.log("✅ Class ranks calculated");
      } catch (rankError: any) {
        console.error("⚠️  Rank calculation failed:", rankError.message);
      }
      console.timeEnd("🏆 Calculate Ranks");

      console.timeEnd("⏱️  Total Save Time");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Bulk Save Completed Successfully");
      console.log(`📊 Results: ${savedCount}/${validGrades.length} saved`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return res.json({
        success: errors.length === 0,
        message: `Saved ${savedCount}/${validGrades.length} grades${
          errors.length > 0 ? `, ${errors.length} errors` : ""
        }`,
        data: {
          savedCount,
          errorCount: errors.length,
          totalProcessed: validGrades.length,
          summariesCalculated: summaryCount,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        },
      });
    } catch (error: any) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ Bulk Save Error");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save grades",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

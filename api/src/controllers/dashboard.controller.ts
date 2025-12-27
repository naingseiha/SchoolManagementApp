import { Request, Response } from "express";
import { prisma } from "../utils/db";

export class DashboardController {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const currentYear = new Date().getFullYear();

      // Get counts
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        studentsWithClass,
        teachersWithClass,
        activeSubjects,
        recentGrades,
        recentAttendance,
      ] = await Promise.all([
        // Total students
        prisma.student.count(),

        // Total teachers
        prisma.teacher.count(),

        // Total classes
        prisma.class.count(),

        // Total subjects
        prisma.subject.count(),

        // Students with class assignment
        prisma.student.count({
          where: {
            classId: { not: null },
          },
        }),

        // Teachers with class assignment
        prisma.teacher.count({
          where: {
            OR: [
              { homeroomClass: { isNot: null } },
              { teacherClasses: { some: {} } },
            ],
          },
        }),

        // Active subjects
        prisma.subject.count({
          where: { isActive: true },
        }),

        // Recent grade entries (last 7 days)
        prisma.grade.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Recent attendance records (last 7 days)
        prisma.attendance.count({
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      // Get grade distribution
      const allGrades = await prisma.grade.findMany({
        where: {
          year: currentYear,
        },
        select: {
          percentage: true,
        },
      });

      const gradeDistribution = {
        A: allGrades.filter((g) => (g.percentage || 0) >= 80).length,
        B: allGrades.filter(
          (g) => (g.percentage || 0) >= 70 && (g.percentage || 0) < 80
        ).length,
        C: allGrades.filter(
          (g) => (g.percentage || 0) >= 60 && (g.percentage || 0) < 70
        ).length,
        D: allGrades.filter(
          (g) => (g.percentage || 0) >= 50 && (g.percentage || 0) < 60
        ).length,
        E: allGrades.filter(
          (g) => (g.percentage || 0) >= 40 && (g.percentage || 0) < 50
        ).length,
        F: allGrades.filter((g) => (g.percentage || 0) < 40).length,
      };

      // Get attendance statistics
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          status: true,
        },
      });

      const attendanceStats = {
        present: attendanceRecords.filter((a) => a.status === "PRESENT").length,
        absent: attendanceRecords.filter((a) => a.status === "ABSENT").length,
        late: attendanceRecords.filter((a) => a.status === "LATE").length,
        excused: attendanceRecords.filter((a) => a.status === "EXCUSED").length,
      };

      // Get class distribution by grade
      const classByGrade = await prisma.class.groupBy({
        by: ["grade"],
        _count: {
          id: true,
        },
        orderBy: {
          grade: "asc",
        },
      });

      // Get top performing classes (by average)
      const classSummaries = await prisma.studentMonthlySummary.groupBy({
        by: ["classId"],
        _avg: {
          average: true,
        },
        _count: {
          studentId: true,
        },
        orderBy: {
          _avg: {
            average: "desc",
          },
        },
        take: 5,
      });

      const topClasses = await Promise.all(
        classSummaries.map(async (summary) => {
          const classData = await prisma.class.findUnique({
            where: { id: summary.classId },
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
            },
          });

          return {
            ...classData,
            averageScore: summary._avg.average,
            studentCount: summary._count.studentId,
          };
        })
      );

      // Calculate completion rates
      const studentEnrollmentRate =
        totalStudents > 0 ? (studentsWithClass / totalStudents) * 100 : 0;
      const teacherAssignmentRate =
        totalTeachers > 0 ? (teachersWithClass / totalTeachers) * 100 : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            studentsWithClass,
            teachersWithClass,
            activeSubjects,
            studentEnrollmentRate: parseFloat(
              studentEnrollmentRate.toFixed(1)
            ),
            teacherAssignmentRate: parseFloat(teacherAssignmentRate.toFixed(1)),
          },
          recentActivity: {
            recentGradeEntries: recentGrades,
            recentAttendanceRecords: recentAttendance,
          },
          gradeDistribution,
          attendanceStats,
          classByGrade: classByGrade.map((c) => ({
            grade: c.grade,
            count: c._count.id,
          })),
          topPerformingClasses: topClasses.filter((c) => c !== null),
        },
      });
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get teacher-specific dashboard
   */
  static async getTeacherDashboard(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;

      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          homeroomClass: {
            include: {
              students: true,
            },
          },
          teacherClasses: {
            include: {
              class: {
                include: {
                  students: true,
                },
              },
            },
          },
          subjectTeachers: {
            include: {
              subject: true,
            },
          },
        },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Get all classes taught by this teacher
      const classIds = [
        ...(teacher.homeroomClass ? [teacher.homeroomClass.id] : []),
        ...teacher.teacherClasses.map((tc) => tc.class.id),
      ];

      // Get total students
      const uniqueStudentIds = new Set<string>();
      if (teacher.homeroomClass) {
        teacher.homeroomClass.students.forEach((s) =>
          uniqueStudentIds.add(s.id)
        );
      }
      teacher.teacherClasses.forEach((tc) => {
        tc.class.students.forEach((s) => uniqueStudentIds.add(s.id));
      });

      // Recent grade entries by this teacher's classes
      const recentGrades = await prisma.grade.count({
        where: {
          classId: { in: classIds },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      res.json({
        success: true,
        data: {
          teacher: {
            id: teacher.id,
            name: teacher.khmerName || `${teacher.firstName} ${teacher.lastName}`,
            homeroomClass: teacher.homeroomClass
              ? {
                  id: teacher.homeroomClass.id,
                  name: teacher.homeroomClass.name,
                  studentCount: teacher.homeroomClass.students.length,
                }
              : null,
            totalClasses: classIds.length,
            totalStudents: uniqueStudentIds.size,
            subjects: teacher.subjectTeachers.map((st) => ({
              id: st.subject.id,
              name: st.subject.nameKh || st.subject.name,
              code: st.subject.code,
            })),
          },
          recentActivity: {
            recentGradeEntries: recentGrades,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error fetching teacher dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch teacher dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get grade-level statistics (for grades 7-12)
   */
  static async getGradeLevelStats(req: Request, res: Response) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Intl.DateTimeFormat("en-US", {
        month: "long",
      }).format(new Date());

      // Get all grades 7-12
      const grades = ["7", "8", "9", "10", "11", "12"];

      const gradeStats = await Promise.all(
        grades.map(async (grade) => {
          // Get all classes for this grade
          const classes = await prisma.class.findMany({
            where: { grade },
            include: {
              students: true,
              _count: {
                select: { students: true }
              }
            },
          });

          const classIds = classes.map(c => c.id);
          const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);

          // Get all subjects for this grade
          const subjects = await prisma.subject.findMany({
            where: {
              grade,
              isActive: true
            },
            orderBy: { code: "asc" }
          });

          const totalSubjects = subjects.length;

          // Get grades for current month and year for this grade level
          const gradesData = await prisma.grade.findMany({
            where: {
              classId: { in: classIds },
              month: currentMonth,
              year: currentYear,
            },
            select: {
              percentage: true,
              studentId: true,
              subjectId: true,
              classId: true,
            },
          });

          // Calculate statistics
          const validGrades = gradesData.filter(g => g.percentage !== null);
          const totalGrades = validGrades.length;

          // Grade distribution
          const gradeDistribution = {
            A: validGrades.filter((g) => (g.percentage || 0) >= 80).length,
            B: validGrades.filter(
              (g) => (g.percentage || 0) >= 70 && (g.percentage || 0) < 80
            ).length,
            C: validGrades.filter(
              (g) => (g.percentage || 0) >= 60 && (g.percentage || 0) < 70
            ).length,
            D: validGrades.filter(
              (g) => (g.percentage || 0) >= 50 && (g.percentage || 0) < 60
            ).length,
            E: validGrades.filter((g) => (g.percentage || 0) < 50).length,
          };

          // Calculate average across all subjects
          const averageScore = totalGrades > 0
            ? validGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / totalGrades
            : 0;

          // Pass/Fail counts
          const passCount = validGrades.filter(g => (g.percentage || 0) >= 50).length;
          const failCount = validGrades.filter(g => (g.percentage || 0) < 50).length;
          const passPercentage = totalGrades > 0 ? (passCount / totalGrades) * 100 : 0;

          // Subject completion by class
          const classDetails = await Promise.all(
            classes.map(async (cls) => {
              const classGrades = gradesData.filter(g => g.classId === cls.id);
              const uniqueSubjects = new Set(classGrades.map(g => g.subjectId));
              const completedSubjects = uniqueSubjects.size;
              const completionPercentage = totalSubjects > 0
                ? (completedSubjects / totalSubjects) * 100
                : 0;

              // Get class average
              const classValidGrades = classGrades.filter(g => g.percentage !== null);
              const classAverage = classValidGrades.length > 0
                ? classValidGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / classValidGrades.length
                : 0;

              return {
                id: cls.id,
                name: cls.name,
                section: cls.section,
                studentCount: cls.students.length,
                totalSubjects,
                completedSubjects,
                completionPercentage: Math.round(completionPercentage),
                averageScore: Math.round(classAverage * 10) / 10,
              };
            })
          );

          // Calculate overall subject completion for this grade
          const totalPossibleEntries = totalStudents * totalSubjects;
          const completedEntries = gradesData.length;
          const overallCompletion = totalPossibleEntries > 0
            ? (completedEntries / totalPossibleEntries) * 100
            : 0;

          return {
            grade,
            totalStudents,
            totalClasses: classes.length,
            totalSubjects,
            averageScore: Math.round(averageScore * 10) / 10,
            passPercentage: Math.round(passPercentage * 10) / 10,
            passCount,
            failCount,
            gradeDistribution: {
              A: totalGrades > 0 ? Math.round((gradeDistribution.A / totalGrades) * 1000) / 10 : 0,
              B: totalGrades > 0 ? Math.round((gradeDistribution.B / totalGrades) * 1000) / 10 : 0,
              C: totalGrades > 0 ? Math.round((gradeDistribution.C / totalGrades) * 1000) / 10 : 0,
              D: totalGrades > 0 ? Math.round((gradeDistribution.D / totalGrades) * 1000) / 10 : 0,
              E: totalGrades > 0 ? Math.round((gradeDistribution.E / totalGrades) * 1000) / 10 : 0,
            },
            subjectCompletionPercentage: Math.round(overallCompletion * 10) / 10,
            classes: classDetails.sort((a, b) => a.name.localeCompare(b.name)),
          };
        })
      );

      res.json({
        success: true,
        data: {
          currentMonth,
          currentYear,
          grades: gradeStats,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching grade level stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch grade level statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get student-specific dashboard
   */
  static async getStudentDashboard(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          class: true,
          grades: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
            include: {
              subject: true,
            },
          },
          attendance: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Calculate average grade
      const gradesWithScore = student.grades.filter(
        (g) => g.percentage !== null
      );
      const averageGrade =
        gradesWithScore.length > 0
          ? gradesWithScore.reduce((sum, g) => sum + (g.percentage || 0), 0) /
            gradesWithScore.length
          : 0;

      // Attendance stats
      const attendanceStats = {
        present: student.attendance.filter((a) => a.status === "PRESENT")
          .length,
        absent: student.attendance.filter((a) => a.status === "ABSENT").length,
        late: student.attendance.filter((a) => a.status === "LATE").length,
        excused: student.attendance.filter((a) => a.status === "EXCUSED")
          .length,
      };

      res.json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.khmerName || `${student.firstName} ${student.lastName}`,
            class: student.class
              ? {
                  id: student.class.id,
                  name: student.class.name,
                  grade: student.class.grade,
                }
              : null,
            averageGrade: parseFloat(averageGrade.toFixed(2)),
          },
          recentGrades: student.grades.map((g) => ({
            subject: g.subject.nameKh || g.subject.name,
            score: g.score,
            maxScore: g.maxScore,
            percentage: g.percentage,
            month: g.month,
          })),
          attendanceStats,
          totalAttendanceRecords: student.attendance.length,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching student dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch student dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

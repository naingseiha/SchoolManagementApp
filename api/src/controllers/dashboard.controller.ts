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
              name: st.subject.khmerName || st.subject.name,
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
            subject: g.subject.khmerName || g.subject.name,
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

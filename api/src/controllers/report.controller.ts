import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReportController {
  /**
   * Get monthly report for a class
   */
  static async getMonthlyReport(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      console.log(
        `📊 Report request: classId=${classId}, month=${month}, year=${year}`
      );

      // Get class with students
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
          teacher: true,
        },
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Get subjects for this grade
      const subjects = await prisma.subject.findMany({
        where: {
          grade: classData.grade,
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      console.log(
        `📚 Found ${subjects.length} subjects for grade ${classData.grade}`
      );

      // Get month number
      const monthNames = [
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];
      const monthNumber = monthNames.indexOf(month as string) + 1;

      console.log(`📅 Month: ${month} → monthNumber: ${monthNumber}`);

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      // ✅ Query grades using multiple formats
      const grades = await prisma.grade.findMany({
        where: {
          classId,
          OR: [
            { month: month as string }, // Khmer name
            { month: monthNumber.toString() }, // Number as string
            { monthNumber: monthNumber }, // monthNumber field
          ],
          year: parseInt(year as string),
        },
        include: {
          subject: true,
          student: true,
        },
      });

      console.log(`✅ Found ${grades.length} grade records`);
      if (grades.length > 0) {
        console.log(
          "Sample grades:",
          grades.slice(0, 3).map((g) => ({
            student: g.student.khmerName,
            subject: g.subject.nameKh,
            score: g.score,
            month: g.month,
            monthNumber: g.monthNumber,
          }))
        );
      } else {
        console.warn("⚠️ No grades found!  Check database:");
        console.warn(`  - classId: ${classId}`);
        console.warn(
          `  - month options: ${month}, ${monthNumber}, ${monthNumber.toString()}`
        );
        console.warn(`  - year: ${year}`);
      }

      // Get attendance summary
      const startDate = new Date(parseInt(year as string), monthNumber - 1, 1);
      const endDate = new Date(
        parseInt(year as string),
        monthNumber - 1,
        new Date(parseInt(year as string), monthNumber, 0).getDate(),
        23,
        59,
        59
      );

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          classId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      console.log(`📊 Found ${attendanceRecords.length} attendance records`);

      // Build attendance summary
      const attendanceSummary: {
        [studentId: string]: { absent: number; permission: number };
      } = {};

      attendanceRecords.forEach((record) => {
        if (!attendanceSummary[record.studentId]) {
          attendanceSummary[record.studentId] = { absent: 0, permission: 0 };
        }
        if (record.status === "ABSENT") {
          attendanceSummary[record.studentId].absent++;
        } else if (record.status === "PERMISSION") {
          attendanceSummary[record.studentId].permission++;
        }
      });

      // Calculate total coefficient
      const totalCoefficient = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );
      console.log(`📊 Total coefficient: ${totalCoefficient}`);

      // Build report data
      const studentsData = classData.students.map((student) => {
        // Get student's grades
        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let gradeCount = 0;

        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          if (grade && grade.score !== null) {
            studentGrades[subject.id] = grade.score;
            totalScore += grade.score;
            gradeCount++;
          } else {
            studentGrades[subject.id] = null;
          }
        });

        // Calculate average
        const average =
          totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

        // Determine grade level
        let gradeLevel = "F";
        if (average >= 45) gradeLevel = "A";
        else if (average >= 40) gradeLevel = "B";
        else if (average >= 35) gradeLevel = "C";
        else if (average >= 30) gradeLevel = "D";
        else if (average >= 25) gradeLevel = "E";

        return {
          studentId: student.id,
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          grades: studentGrades,
          totalScore: totalScore.toFixed(2),
          average: average.toFixed(2),
          gradeLevel,
          absent: attendanceSummary[student.id]?.absent || 0,
          permission: attendanceSummary[student.id]?.permission || 0,
        };
      });

      // Calculate ranks
      const sorted = [...studentsData]
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      const finalData = studentsData.map((student) => {
        const ranked = sorted.find((s) => s.studentId === student.studentId);
        return { ...student, rank: ranked?.rank || 0 };
      });

      console.log(`✅ Report generated for ${finalData.length} students`);

      return res.json({
        success: true,
        data: {
          classId: classData.id,
          className: classData.name,
          grade: classData.grade,
          teacherName: classData.teacher
            ? `${classData.teacher.lastName} ${classData.teacher.firstName}`
            : null,
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient,
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
          })),
          students: finalData,
        },
      });
    } catch (error: any) {
      console.error("❌ Get monthly report error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get monthly report",
      });
    }
  }

  // Add this new method to ReportController class

  /**
   * Get grade-wide report (all classes in a grade combined)
   */
  /**
   * Get grade-wide report (all classes in a grade combined)
   */
  static async getGradeWideReport(req: Request, res: Response) {
    try {
      const { grade } = req.params;
      const { month, year } = req.query;

      console.log(
        `📊 Grade-wide report: grade=${grade}, month=${month}, year=${year}`
      );

      // ✅ Get all classes for this grade (removed isActive)
      const classes = await prisma.class.findMany({
        where: {
          grade: grade,
        },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
        },
      });

      if (classes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No classes found for this grade",
        });
      }

      console.log(`📚 Found ${classes.length} classes for grade ${grade}`);

      // Get all students from all classes
      const allStudents = classes.flatMap((c) =>
        c.students.map((s) => ({
          ...s,
          className: c.name,
          classId: c.id,
        }))
      );

      console.log(`👥 Total students: ${allStudents.length}`);

      // Get subjects for this grade
      const subjects = await prisma.subject.findMany({
        where: {
          grade: grade,
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      // Get month number
      const monthNames = [
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];
      const monthNumber = monthNames.indexOf(month as string) + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      // Get grades for all students
      const grades = await prisma.grade.findMany({
        where: {
          OR: [
            { month: month as string },
            { month: monthNumber.toString() },
            { monthNumber: monthNumber },
          ],
          year: parseInt(year as string),
          studentId: {
            in: allStudents.map((s) => s.id),
          },
        },
        include: {
          subject: true,
          student: true,
        },
      });

      console.log(`✅ Found ${grades.length} grade records`);

      // Get attendance for all students
      const startDate = new Date(parseInt(year as string), monthNumber - 1, 1);
      const endDate = new Date(
        parseInt(year as string),
        monthNumber - 1,
        new Date(parseInt(year as string), monthNumber, 0).getDate(),
        23,
        59,
        59
      );

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          studentId: {
            in: allStudents.map((s) => s.id),
          },
        },
      });

      // Build attendance summary
      const attendanceSummary: {
        [studentId: string]: { absent: number; permission: number };
      } = {};

      attendanceRecords.forEach((record) => {
        if (!attendanceSummary[record.studentId]) {
          attendanceSummary[record.studentId] = { absent: 0, permission: 0 };
        }
        if (record.status === "ABSENT") {
          attendanceSummary[record.studentId].absent++;
        } else if (record.status === "PERMISSION") {
          attendanceSummary[record.studentId].permission++;
        }
      });

      // Calculate total coefficient
      const totalCoefficient = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );

      // Build student reports
      const studentsData = allStudents.map((student) => {
        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let gradeCount = 0;

        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          if (grade && grade.score !== null) {
            studentGrades[subject.id] = grade.score;
            totalScore += grade.score;
            gradeCount++;
          } else {
            studentGrades[subject.id] = null;
          }
        });

        const average =
          totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

        let gradeLevel = "F";
        if (average >= 45) gradeLevel = "A";
        else if (average >= 40) gradeLevel = "B";
        else if (average >= 35) gradeLevel = "C";
        else if (average >= 30) gradeLevel = "D";
        else if (average >= 25) gradeLevel = "E";

        return {
          studentId: student.id,
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          className: student.className,
          gender: student.gender,
          grades: studentGrades,
          totalScore: totalScore.toFixed(2),
          average: average.toFixed(2),
          gradeLevel,
          absent: attendanceSummary[student.id]?.absent || 0,
          permission: attendanceSummary[student.id]?.permission || 0,
        };
      });

      // Calculate ranks across all classes
      const sorted = [...studentsData]
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((student, index) => ({ ...student, rank: index + 1 }));

      const finalData = studentsData.map((student) => {
        const ranked = sorted.find((s) => s.studentId === student.studentId);
        return { ...student, rank: ranked?.rank || 0 };
      });

      console.log(
        `✅ Grade-wide report generated for ${finalData.length} students`
      );

      return res.json({
        success: true,
        data: {
          grade: grade,
          classNames: classes.map((c) => c.name).join(", "),
          totalClasses: classes.length,
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient,
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
          })),
          students: finalData,
        },
      });
    } catch (error: any) {
      console.error("❌ Get grade-wide report error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get grade-wide report",
      });
    }
  }
}

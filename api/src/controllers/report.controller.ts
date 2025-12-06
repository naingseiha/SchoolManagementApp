import { Request, Response } from "express";
import { prisma } from "../utils/db";

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

      // ✅ FIXED: Filter subjects by grade AND track
      const whereClause: any = {
        grade: classData.grade,
        isActive: true,
      };

      // ✅ For Grade 11 & 12, filter by track
      const gradeNum = parseInt(classData.grade);
      if ((gradeNum === 11 || gradeNum === 12) && classData.track) {
        whereClause.OR = [
          { track: classData.track }, // Track-specific subjects
          { track: null }, // Common subjects
          { track: "common" }, // Explicitly common subjects
        ];

        console.log(
          `📚 Filtering subjects for Grade ${classData.grade} - Track: ${classData.track}`
        );
      }

      const subjects = await prisma.subject.findMany({
        where: whereClause,
        orderBy: { code: "asc" },
      });

      console.log(
        `✅ Found ${subjects.length} subjects for grade ${classData.grade}${
          classData.track ? ` (${classData.track})` : ""
        }`
      );

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

      const grades = await prisma.grade.findMany({
        where: {
          classId,
          OR: [
            { month: month as string },
            { month: monthNumber.toString() },
            { monthNumber: monthNumber },
          ],
          year: parseInt(year as string),
        },
        include: {
          subject: true,
          student: true,
        },
      });

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

      // ✅ FIXED: Calculate total coefficient from filtered subjects
      const totalCoefficientForClass = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );

      console.log(
        `✅ Total coefficient for class: ${totalCoefficientForClass}`
      );

      // ✅ FIXED: Calculate using filtered subjects only
      const studentsData = classData.students.map((student) => {
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

        // ✅ Average = totalScore / totalCoefficientForClass
        const average =
          totalCoefficientForClass > 0
            ? totalScore / totalCoefficientForClass
            : 0;

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

      const sorted = [...studentsData]
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((student, index) => ({ ...student, rank: index + 1 }));

      const finalData = studentsData.map((student) => {
        const ranked = sorted.find((s) => s.studentId === student.studentId);
        return { ...student, rank: ranked?.rank || 0 };
      });

      return res.json({
        success: true,
        data: {
          classId: classData.id,
          className: classData.name,
          grade: classData.grade,
          track: classData.track || null, // ✅ Include track
          teacherName: classData.teacher
            ? `${classData.teacher.lastName} ${classData.teacher.firstName}`
            : null,
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient: totalCoefficientForClass,
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

  /**
   * ✅ FIXED: Get grade-wide report - Handle multiple tracks
   */
  static async getGradeWideReport(req: Request, res: Response) {
    try {
      const { grade } = req.params;
      const { month, year } = req.query;

      const classes = await prisma.class.findMany({
        where: { grade: grade },
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

      const allStudents = classes.flatMap((c) =>
        c.students.map((s) => ({
          ...s,
          className: c.name,
          classId: c.id,
          classTrack: c.track, // ✅ Include class track
        }))
      );

      // ✅ FIXED: Get ALL subjects for this grade (all tracks)
      const subjects = await prisma.subject.findMany({
        where: {
          grade: grade,
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      console.log(
        `✅ Found ${subjects.length} total subjects for grade ${grade}`
      );

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

      // ✅ FIXED: Calculate per-student with their class track
      const studentsData = allStudents.map((student) => {
        // ✅ Filter subjects for THIS student's class track
        const gradeNum = parseInt(grade);
        const studentSubjects =
          gradeNum === 11 || gradeNum === 12
            ? subjects.filter(
                (s) =>
                  s.track === student.classTrack ||
                  s.track === null ||
                  s.track === "common"
              )
            : subjects;

        const totalCoefficientForStudent = studentSubjects.reduce(
          (sum, s) => sum + s.coefficient,
          0
        );

        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let gradeCount = 0;

        studentSubjects.forEach((subject) => {
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
          totalCoefficientForStudent > 0
            ? totalScore / totalCoefficientForStudent
            : 0;

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

      const sorted = [...studentsData]
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((student, index) => ({ ...student, rank: index + 1 }));

      const finalData = studentsData.map((student) => {
        const ranked = sorted.find((s) => s.studentId === student.studentId);
        return { ...student, rank: ranked?.rank || 0 };
      });

      // ✅ Calculate average coefficient across all classes
      const avgCoefficient =
        subjects.reduce((sum, s) => sum + s.coefficient, 0) / classes.length;

      return res.json({
        success: true,
        data: {
          grade: grade,
          classNames: classes.map((c) => c.name).join(", "),
          totalClasses: classes.length,
          month: month as string,
          year: parseInt(year as string),
          totalCoefficient: avgCoefficient,
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
            track: s.track, // ✅ Include track info
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
  /**
   * ✅ UPDATED: Get student tracking book with attendance data
   */
  /**
   * ✅ FIXED: Get student tracking book - Filter subjects by track
   */
  static async getStudentTrackingBook(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { year, month, subjectId } = req.query;

      console.log("\n=== TRACKING BOOK REQUEST ===");
      console.log("classId:", classId);
      console.log("year:", year);
      console.log("month:", month);
      console.log("subjectId:", subjectId);

      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          students: {
            orderBy: { khmerName: "asc" },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              khmerName: true,
              gender: true,
              dateOfBirth: true,
            },
          },
        },
      });

      if (!classInfo) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      console.log(`\n📚 Class: ${classInfo.name}`);
      console.log(`👥 Students: ${classInfo.students.length}`);
      console.log(`📊 Grade: ${classInfo.grade}`);
      console.log(`🎯 Track: ${classInfo.track || "N/A"}`);

      // ✅ FIXED: Build subject filter with track support
      const subjectWhereClause: any = {
        grade: classInfo.grade,
        isActive: true,
      };

      // ✅ If specific subject requested, use it
      if (subjectId) {
        subjectWhereClause.id = subjectId as string;
      } else {
        // ✅ For Grade 11 & 12, filter by track
        const gradeNum = parseInt(classInfo.grade);
        if ((gradeNum === 11 || gradeNum === 12) && classInfo.track) {
          subjectWhereClause.OR = [
            { track: classInfo.track }, // Track-specific subjects
            { track: null }, // Common subjects
            { track: "common" }, // Explicitly common subjects
          ];

          console.log(`🔍 Filtering subjects by track: ${classInfo.track}`);
        }
      }

      const subjects = await prisma.subject.findMany({
        where: subjectWhereClause,
        orderBy: { code: "asc" },
        select: {
          id: true,
          nameKh: true,
          nameEn: true,
          code: true,
          maxScore: true,
          coefficient: true,
          track: true, // ✅ Include track
        },
      });

      console.log(`📖 Subjects: ${subjects.length}`);
      console.log(
        `📋 Subject list:`,
        subjects.map((s) => `${s.nameKh} (${s.track || "common"})`).join(", ")
      );

      const gradeWhereClause: any = {
        classId: classId,
        year: parseInt(year as string),
        studentId: {
          in: classInfo.students.map((s) => s.id),
        },
        subjectId: {
          in: subjects.map((s) => s.id), // ✅ Only filtered subjects
        },
      };

      if (month && month !== "") {
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
        const monthIndex = monthNames.indexOf(month as string);

        if (monthIndex >= 0) {
          const monthNumber = monthIndex + 1;

          gradeWhereClause.OR = [
            { month: month as string },
            { month: monthNumber.toString() },
            { monthNumber: monthNumber },
          ];

          console.log(
            `\n📅 Filtering by month: "${month}" (index: ${monthIndex}, number: ${monthNumber})`
          );
        }
      }

      console.log("\n🔍 Grade query filter:");
      console.log(JSON.stringify(gradeWhereClause, null, 2));

      const grades = await prisma.grade.findMany({
        where: gradeWhereClause,
        select: {
          id: true,
          studentId: true,
          subjectId: true,
          score: true,
          month: true,
          monthNumber: true,
        },
      });

      console.log(`\n✅ Found ${grades.length} grade records`);

      // ✅ Fetch attendance data
      const attendanceWhereClause: any = {
        classId: classId,
        studentId: {
          in: classInfo.students.map((s) => s.id),
        },
      };

      if (month && month !== "") {
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
        const monthIndex = monthNames.indexOf(month as string);

        if (monthIndex >= 0) {
          const monthNumber = monthIndex + 1;
          const startDate = new Date(
            parseInt(year as string),
            monthNumber - 1,
            1
          );
          const endDate = new Date(
            parseInt(year as string),
            monthNumber - 1,
            new Date(parseInt(year as string), monthNumber, 0).getDate(),
            23,
            59,
            59
          );

          attendanceWhereClause.date = {
            gte: startDate,
            lte: endDate,
          };

          console.log(
            `\n📅 Attendance date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          );
        }
      } else {
        const startDate = new Date(parseInt(year as string), 0, 1);
        const endDate = new Date(parseInt(year as string), 11, 31, 23, 59, 59);

        attendanceWhereClause.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where: attendanceWhereClause,
        select: {
          id: true,
          studentId: true,
          status: true,
          date: true,
        },
      });

      console.log(`\n✅ Found ${attendanceRecords.length} attendance records`);

      // Calculate attendance summary
      const attendanceSummary: {
        [studentId: string]: {
          totalAbsent: number;
          permission: number;
          withoutPermission: number;
        };
      } = {};

      classInfo.students.forEach((student) => {
        attendanceSummary[student.id] = {
          totalAbsent: 0,
          permission: 0,
          withoutPermission: 0,
        };
      });

      attendanceRecords.forEach((record) => {
        if (!attendanceSummary[record.studentId]) {
          attendanceSummary[record.studentId] = {
            totalAbsent: 0,
            permission: 0,
            withoutPermission: 0,
          };
        }

        if (record.status === "ABSENT") {
          attendanceSummary[record.studentId].withoutPermission++;
          attendanceSummary[record.studentId].totalAbsent++;
        } else if (record.status === "PERMISSION") {
          attendanceSummary[record.studentId].permission++;
          attendanceSummary[record.studentId].totalAbsent++;
        }
      });

      // ✅ FIXED: Calculate total coefficient from filtered subjects
      const totalCoefficientForClass = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );

      console.log(`\n📊 Total Coefficient: ${totalCoefficientForClass}`);

      // Build student data
      const studentsData = classInfo.students.map((student) => {
        const subjectScores: {
          [subjectId: string]: { score: number | null; maxScore: number };
        } = {};

        let totalScore = 0;
        let subjectsWithScores = 0;

        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          const score = grade?.score ?? null;

          subjectScores[subject.id] = {
            score: score,
            maxScore: subject.maxScore,
          };

          if (score !== null) {
            totalScore += score;
            subjectsWithScores++;
          }
        });

        // ✅ FIXED: Average = totalScore / totalCoefficientForClass
        const averageScore =
          totalCoefficientForClass > 0
            ? totalScore / totalCoefficientForClass
            : 0;

        // ✅ FIXED: Grade level thresholds
        let gradeLevel = "F";
        if (averageScore >= 45) gradeLevel = "A";
        else if (averageScore >= 40) gradeLevel = "B";
        else if (averageScore >= 35) gradeLevel = "C";
        else if (averageScore >= 30) gradeLevel = "D";
        else if (averageScore >= 25) gradeLevel = "E";

        const gradeLevelKhmer: { [key: string]: string } = {
          A: "ល្អបំផុត",
          B: "ល្អ",
          C: "ល្អបុរេ",
          D: "មធ្យម",
          E: "ខ្សោយ",
          F: "ខ្សោយបំផុត",
        };

        return {
          studentId: student.id,
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth
            ? new Date(student.dateOfBirth).toLocaleDateString("km-KH")
            : "",
          subjectScores,
          totalScore: totalScore.toFixed(0),
          averageScore: averageScore.toFixed(2),
          gradeLevel: gradeLevel,
          gradeLevelKhmer: gradeLevelKhmer[gradeLevel],
          subjectsRecorded: subjectsWithScores,
          attendance: attendanceSummary[student.id] || {
            totalAbsent: 0,
            permission: 0,
            withoutPermission: 0,
          },
        };
      });

      // Calculate ranks
      const sorted = [...studentsData]
        .filter((s) => s.subjectsRecorded > 0)
        .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore))
        .map((student, index) => ({ ...student, rank: index + 1 }));

      const finalData = studentsData.map((student) => {
        const ranked = sorted.find((s) => s.studentId === student.studentId);
        return { ...student, rank: ranked?.rank || 0 };
      });

      console.log(
        `\n✅ Generated tracking book for ${finalData.length} students`
      );

      if (finalData.length > 0) {
        console.log("\n📊 First student summary:");
        console.log(`  Name: ${finalData[0].studentName}`);
        console.log(`  Subjects with scores: ${finalData[0].subjectsRecorded}`);
        console.log(`  Total: ${finalData[0].totalScore}`);
        console.log(`  Average: ${finalData[0].averageScore}`);
        console.log(`  Rank: ${finalData[0].rank}`);
        console.log(`  Grade Level: ${finalData[0].gradeLevel}`);
      }

      console.log("=== END TRACKING BOOK ===\n");

      return res.json({
        success: true,
        data: {
          classId: classInfo.id,
          className: classInfo.name,
          grade: classInfo.grade,
          track: classInfo.track || null, // ✅ Include track
          year: parseInt(year as string),
          month: (month as string) || null,
          teacherName: classInfo.teacher
            ? `${classInfo.teacher.lastName} ${classInfo.teacher.firstName}`
            : "",
          totalCoefficient: totalCoefficientForClass, // ✅ Include total coefficient
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
            track: s.track, // ✅ Include track info
          })),
          students: finalData,
        },
      });
    } catch (error: any) {
      console.error("\n❌ TRACKING BOOK ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get student tracking book",
      });
    }
  }
}

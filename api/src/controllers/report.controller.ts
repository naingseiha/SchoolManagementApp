import { Request, Response } from "express";
import { prisma } from "../utils/db";

const SEMESTER_ONE_MONTH = "កុម្ភៈ";
const ENGLISH_SCORE_BASELINE = 25;

function isSemesterOneMonth(month?: string | null): boolean {
  if (!month) return false;
  const m = month.trim();
  return m === "ឆមាសទី១" || m === "កុម្ភៈ";
}

function isSemesterTwoMonth(month?: string | null): boolean {
  if (!month) return false;
  const m = month.trim();
  return m === "ឆមាសទី២" || m === "កក្កដា";
}
const KHMER_DIGIT_MAP: Record<string, string> = {
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
};

function normalizeDigits(value: string): string {
  return value.replace(/[០-៩]/g, (digit) => KHMER_DIGIT_MAP[digit] || digit);
}

function shouldApplyEnglishBonusRule(
  grade: string | number,
  month?: string
) {
  const gradeNum =
    typeof grade === "string" ? parseInt(grade.replace(/\D/g, ""), 10) : grade;

  // Rule applies only to Grade 9 and 12
  if (gradeNum !== 9 && gradeNum !== 12) return false;

  if (!month) return false;
  const normalizedMonth = month.trim();

  // Applies to both Semester 1 Exam (February) and Semester 2 Exam (June)
  return (
    normalizedMonth === "កុម្ភៈ" || 
    normalizedMonth === "ឆមាសទី១" || 
    normalizedMonth === "មិថុនា" || 
    normalizedMonth === "ឆមាសទី២"
  );
}

function isEnglishSubject(subject: {
  code?: string | null;
  name?: string | null;
  nameKh?: string | null;
  nameEn?: string | null;
}): boolean {
  const code = subject.code?.toUpperCase() || "";
  if (code.startsWith("ENG")) return true;

  const khmerName = `${subject.nameKh || ""}${subject.name || ""}`;
  if (khmerName.includes("អង់គ្លេស")) return true;

  const englishName = `${subject.nameEn || ""}${subject.name || ""}`.toLowerCase();
  return englishName.includes("english");
}

function getSubjectGradeLevel(
  score: number | null,
  maxScore: number
): {
  level: string;
  levelKhmer: string;
  percentage: number;
} {
  if (score === null || score === undefined) {
    return {
      level: "-",
      levelKhmer: "-",
      percentage: 0,
    };
  }

  const percentage = (score / maxScore) * 100;

  let level = "F";
  let levelKhmer = "ខ្សោយ";

  if (percentage >= 80) {
    level = "A";
    levelKhmer = "ល្អប្រសើរ";
  } else if (percentage >= 70) {
    level = "B";
    levelKhmer = "ល្អណាស់";
  } else if (percentage >= 60) {
    level = "C";
    levelKhmer = "ល្អ";
  } else if (percentage >= 50) {
    level = "D";
    levelKhmer = "ល្អបង្គួរ";
  } else if (percentage >= 40) {
    level = "E";
    levelKhmer = "មធ្យម";
  }

  return {
    level,
    levelKhmer,
    percentage: parseFloat(percentage.toFixed(2)),
  };
}

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
          students: true, // ✅ Remove orderBy here, sort later
          homeroomTeacher: true, // ✅ CHANGED from "teacher"
          teacherClasses: {
            // ✅ ADDED: Multiple teachers
            include: {
              teacher: true,
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

      // ✅ Sort students Excel-style
      const sortedStudents = [...classData.students].sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

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
      let searchMonth = month as string;
      if (searchMonth === "ឆមាសទី១") searchMonth = "កុម្ភៈ";
      if (searchMonth === "ឆមាសទី២") searchMonth = "កក្កដា";
      const monthNumber = monthNames.indexOf(searchMonth) + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      const applyEnglishBonusRule = shouldApplyEnglishBonusRule(
        classData.grade,
        searchMonth
      );

      const grades = await prisma.grade.findMany({
        where: {
          classId,
          OR: [
            { month: searchMonth },
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

      const inputYear = parseInt(year as string);
      const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;

      let startDate: Date;
      let endDate: Date;

      if (isSemesterOneMonth(month as string)) {
        startDate = new Date(inputYear, 10, 1);
        endDate = new Date(
          inputYear + 1,
          1,
          new Date(inputYear + 1, 2, 0).getDate(),
          23,
          59,
          59
        );
      } else if (isSemesterTwoMonth(month as string)) {
        startDate = new Date(inputYear + 1, 2, 1);
        endDate = new Date(inputYear + 1, 6, 31, 23, 59, 59);
      } else {
        startDate = new Date(calendarYear, monthNumber - 1, 1);
        endDate = new Date(
          calendarYear,
          monthNumber - 1,
          new Date(calendarYear, monthNumber, 0).getDate(),
          23,
          59,
          59
        );
      }

      const attendanceWhereOr: any[] = [{ date: { gte: startDate, lte: endDate } }];

      // The initial attendanceWhereOr with startDate and endDate perfectly covers the semester.
      // Removed redundant/incorrect pushing of previous year's dates.

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          classId,
          OR: attendanceWhereOr,
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
        (sum, s) =>
          applyEnglishBonusRule && isEnglishSubject(s)
            ? sum
            : sum + s.coefficient,
        0
      );

      console.log(
        `✅ Total coefficient for class: ${totalCoefficientForClass}`
      );

      // ✅ Use sorted students
      const studentsData = sortedStudents.map((student) => {
        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let englishBonus = 0;
        let gradeCount = 0;
        let studentCoefficient = 0; // ✅ Track coefficient per student

        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          if (grade && grade.score !== null) {
            studentGrades[subject.id] = grade.score;
            gradeCount++;

            if (applyEnglishBonusRule && isEnglishSubject(subject)) {
              englishBonus += Math.max(
                grade.score - ENGLISH_SCORE_BASELINE,
                0
              );
            } else {
              totalScore += grade.score;
              studentCoefficient += subject.coefficient; // ✅ Add coefficient only for entered subjects
            }
          } else {
            studentGrades[subject.id] = null;
          }
        });

        const adjustedTotalScore = totalScore + englishBonus;

        // ✅ Match Khmer monthly report: divide by entered non-English coefficients
        const average =
          studentCoefficient > 0
            ? adjustedTotalScore / studentCoefficient
            : 0;

        let gradeLevel = "F";
        if (average >= 45) gradeLevel = "A";
        else if (average >= 40) gradeLevel = "B";
        else if (average >= 35) gradeLevel = "C";
        else if (average >= 30) gradeLevel = "D";
        else if (average >= 25) gradeLevel = "E";

        return {
          studentId: student.studentId || student.id, // ✅ Use studentId field, fallback to id
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          grades: studentGrades,
          totalScore: adjustedTotalScore.toFixed(2),
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
          track: classData.track || null,
          teacherName: classData.homeroomTeacher
            ? `${classData.homeroomTeacher.lastName} ${classData.homeroomTeacher.firstName}`
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
          students: true, // ✅ Remove orderBy, sort later
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
          classTrack: c.track,
        }))
      );

      // ✅ Sort students Excel-style
      const sortedStudents = [...allStudents].sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

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
      let searchMonth = month as string;
      if (searchMonth === "ឆមាសទី១") searchMonth = "កុម្ភៈ";
      if (searchMonth === "ឆមាសទី២") searchMonth = "កក្កដា";
      const monthNumber = monthNames.indexOf(searchMonth) + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      const applyEnglishBonusRule = shouldApplyEnglishBonusRule(
        grade,
        searchMonth
      );

      const grades = await prisma.grade.findMany({
        where: {
          OR: [
            { month: searchMonth },
            { month: monthNumber.toString() },
            { monthNumber: monthNumber },
          ],
          year: parseInt(year as string),
          studentId: {
            in: sortedStudents.map((s) => s.id),
          },
        },
        include: {
          subject: true,
          student: true,
        },
      });

      const inputYear = parseInt(year as string);
      const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;

      let startDate: Date;
      let endDate: Date;

      if (isSemesterOneMonth(month as string)) {
        startDate = new Date(inputYear, 10, 1);
        endDate = new Date(
          inputYear + 1,
          1,
          new Date(inputYear + 1, 2, 0).getDate(),
          23,
          59,
          59
        );
      } else if (isSemesterTwoMonth(month as string)) {
        startDate = new Date(inputYear + 1, 2, 1);
        endDate = new Date(inputYear + 1, 6, 31, 23, 59, 59);
      } else {
        startDate = new Date(calendarYear, monthNumber - 1, 1);
        endDate = new Date(
          calendarYear,
          monthNumber - 1,
          new Date(calendarYear, monthNumber, 0).getDate(),
          23,
          59,
          59
        );
      }

      const attendanceWhereOr: any[] = [{ date: { gte: startDate, lte: endDate } }];

      // The initial attendanceWhereOr with startDate and endDate perfectly covers the semester.
      // Removed redundant/incorrect pushing of previous year's dates.

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          OR: attendanceWhereOr,
          studentId: {
            in: sortedStudents.map((s) => s.id),
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

      // ✅ Use sorted students
      const studentsData = sortedStudents.map((student) => {
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
          (sum, s) =>
            applyEnglishBonusRule && isEnglishSubject(s)
              ? sum
              : sum + s.coefficient,
          0
        );

        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let englishBonus = 0;
        let gradeCount = 0;
        let actualCoefficient = 0; // ✅ Track coefficient for entered subjects only

        studentSubjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          if (grade && grade.score !== null) {
            studentGrades[subject.id] = grade.score;
            gradeCount++;

            if (applyEnglishBonusRule && isEnglishSubject(subject)) {
              englishBonus += Math.max(
                grade.score - ENGLISH_SCORE_BASELINE,
                0
              );
            } else {
              totalScore += grade.score;
              actualCoefficient += subject.coefficient; // ✅ Add coefficient only for entered subjects
            }
          } else {
            studentGrades[subject.id] = null;
          }
        });

        const adjustedTotalScore = totalScore + englishBonus;

        // ✅ Match Khmer monthly report: divide by entered non-English coefficients
        const average =
          actualCoefficient > 0
            ? adjustedTotalScore / actualCoefficient
            : 0;

        let gradeLevel = "F";
        if (average >= 45) gradeLevel = "A";
        else if (average >= 40) gradeLevel = "B";
        else if (average >= 35) gradeLevel = "C";
        else if (average >= 30) gradeLevel = "D";
        else if (average >= 25) gradeLevel = "E";

        return {
          studentId: student.studentId || student.id, // ✅ Use studentId field, fallback to id
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          className: student.className,
          gender: student.gender,
          grades: studentGrades,
          totalScore: adjustedTotalScore.toFixed(2),
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
        subjects.reduce(
          (sum, s) =>
            applyEnglishBonusRule && isEnglishSubject(s)
              ? sum
              : sum + s.coefficient,
          0
        ) / classes.length;

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
            track: s.track,
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

      // ✅ FIXED: Use homeroomTeacher
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          homeroomTeacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          students: true,
        },
      });

      if (!classInfo) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // ✅ Sort students Excel-style
      const sortedStudents = [...classInfo.students].sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

      console.log(`\n📚 Class: ${classInfo.name}`);
      console.log(`👥 Students: ${sortedStudents.length}`);
      console.log(`📊 Grade: ${classInfo.grade}`);
      console.log(`🎯 Track: ${classInfo.track || "N/A"}`);

      const applyEnglishBonusRule = shouldApplyEnglishBonusRule(
        classInfo.grade,
        month as string | undefined
      );

      // ✅ Build subject filter with track support
      const subjectWhereClause: any = {
        grade: classInfo.grade,
        isActive: true,
      };

      if (subjectId) {
        subjectWhereClause.id = subjectId as string;
      } else {
        const gradeNum = parseInt(classInfo.grade);
        if ((gradeNum === 11 || gradeNum === 12) && classInfo.track) {
          subjectWhereClause.OR = [
            { track: classInfo.track },
            { track: null },
            { track: "common" },
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
          track: true,
        },
      });

      console.log(`📖 Subjects: ${subjects.length}`);
      console.log(
        `📋 Subject list: `,
        subjects.map((s) => `${s.nameKh} (${s.track || "common"})`).join(", ")
      );

      // ✅ Build grade query
      const gradeWhereClause: any = {
        classId: classId,
        year: parseInt(year as string),
        studentId: {
          in: sortedStudents.map((s) => s.id),
        },
        subjectId: {
          in: subjects.map((s) => s.id),
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
        let searchMonth = month as string;
        if (searchMonth === "ឆមាសទី១") searchMonth = "កុម្ភៈ";
        if (searchMonth === "ឆមាសទី២") searchMonth = "កក្កដា";
        const monthIndex = monthNames.indexOf(searchMonth);

        if (monthIndex >= 0) {
          const monthNumber = monthIndex + 1;
          gradeWhereClause.OR = [
            { month: searchMonth },
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

      // ✅ Fetch monthly summaries for all students in this class for the given year
      const monthlySummaries = await prisma.studentMonthlySummary.findMany({
        where: {
          classId: classId,
          year: parseInt(year as string),
          studentId: {
            in: sortedStudents.map((s) => s.id),
          },
        },
        select: {
          studentId: true,
          month: true,
          monthNumber: true,
          average: true,
        },
      });

      console.log(`\n✅ Found ${monthlySummaries.length} monthly summaries`);

      // ✅ Fetch attendance data
      const attendanceWhereClause: any = {
        classId: classId,
        studentId: {
          in: sortedStudents.map((s) => s.id),
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
        let searchMonth = month as string;
        if (searchMonth === "ឆមាសទី១") searchMonth = "កុម្ភៈ";
        if (searchMonth === "ឆមាសទី២") searchMonth = "កក្កដា";
        const monthIndex = monthNames.indexOf(searchMonth);

        if (monthIndex >= 0) {
          const monthNumber = monthIndex + 1;
          const inputYear = parseInt(year as string);
          const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;
          const startDate = new Date(
            calendarYear,
            monthNumber - 1,
            1
          );
          const endDate = new Date(
            calendarYear,
            monthNumber - 1,
            new Date(calendarYear, monthNumber, 0).getDate(),
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
        const inputYear = parseInt(year as string);
        // Academic year spans from Nov inputYear to Jul inputYear + 1.
        // Include Jan 1 inputYear to Dec 31 inputYear + 1 to capture legacy inputYear formats as well.
        const startDate = new Date(inputYear, 0, 1);
        const endDate = new Date(inputYear + 1, 11, 31, 23, 59, 59);

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

      // ✅ Calculate attendance summary for Semester 1, Semester 2, and Annual
      // Semester 1: Months 11, 12, 01, 02 (JS getMonth(): 10, 11, 0, 1)
      // Semester 2: Months 03, 04, 05, 06, 07 (JS getMonth(): 2, 3, 4, 5, 6)
      const attendanceSummary: {
        [studentId: string]: {
          semester1: { totalAbsent: number; permission: number; withoutPermission: number };
          semester2: { totalAbsent: number; permission: number; withoutPermission: number };
          annual: { totalAbsent: number; permission: number; withoutPermission: number };
        };
      } = {};

      sortedStudents.forEach((student) => {
        attendanceSummary[student.id] = {
          semester1: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
          semester2: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
          annual: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
        };
      });

      attendanceRecords.forEach((record) => {
        if (!attendanceSummary[record.studentId]) {
          attendanceSummary[record.studentId] = {
            semester1: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
            semester2: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
            annual: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
          };
        }

        const m = record.date.getMonth();
        const y = record.date.getFullYear();
        const inputYear = parseInt(year as string);

        // Semester 1: Months 11, 12, 01, 02 (JS months 10, 11, 0, 1)
        const isSem1 =
          ((m === 10 || m === 11) && (y === inputYear || y === inputYear - 1)) ||
          ((m === 0 || m === 1) && (y === inputYear + 1 || y === inputYear));

        // Semester 2: Months 03, 04, 05, 06, 07 (JS months 2, 3, 4, 5, 6)
        const gradeNum = parseInt(classInfo.grade);
        const validSem2Months = (gradeNum === 9 || gradeNum === 12) ? [2, 3, 4, 5] : [2, 3, 4, 5, 6];
        const isSem2 =
          validSem2Months.includes(m) && (y === inputYear + 1 || y === inputYear);

        const studentAtt = attendanceSummary[record.studentId];

        if (isSem1) {
          if (record.status === "ABSENT") {
            studentAtt.semester1.withoutPermission++;
            studentAtt.semester1.totalAbsent++;
            studentAtt.annual.withoutPermission++;
            studentAtt.annual.totalAbsent++;
          } else if (record.status === "PERMISSION") {
            studentAtt.semester1.permission++;
            studentAtt.semester1.totalAbsent++;
            studentAtt.annual.permission++;
            studentAtt.annual.totalAbsent++;
          }
        } else if (isSem2) {
          if (record.status === "ABSENT") {
            studentAtt.semester2.withoutPermission++;
            studentAtt.semester2.totalAbsent++;
            studentAtt.annual.withoutPermission++;
            studentAtt.annual.totalAbsent++;
          } else if (record.status === "PERMISSION") {
            studentAtt.semester2.permission++;
            studentAtt.semester2.totalAbsent++;
            studentAtt.annual.permission++;
            studentAtt.annual.totalAbsent++;
          }
        } else {
          if (y === inputYear || y === inputYear + 1) {
            if (record.status === "ABSENT") {
              studentAtt.annual.withoutPermission++;
              studentAtt.annual.totalAbsent++;
            } else if (record.status === "PERMISSION") {
              studentAtt.annual.permission++;
              studentAtt.annual.totalAbsent++;
            }
          }
        }
      });

      // ✅ Helper function for subject grade level
      const getSubjectGradeLevel = (
        score: number | null,
        maxScore: number
      ): {
        level: string;
        levelKhmer: string;
        percentage: number;
      } => {
        if (score === null || score === undefined) {
          return {
            level: "-",
            levelKhmer: "-",
            percentage: 0,
          };
        }

        const percentage = (score / maxScore) * 100;

        let level = "F";
        let levelKhmer = "ខ្សោយ";

        if (percentage >= 80) {
          level = "A";
          levelKhmer = "ល្អប្រសើរ";
        } else if (percentage >= 70) {
          level = "B";
          levelKhmer = "ល្អណាស់";
        } else if (percentage >= 60) {
          level = "C";
          levelKhmer = "ល្អ";
        } else if (percentage >= 50) {
          level = "D";
          levelKhmer = "ល្អបង្គួរ";
        } else if (percentage >= 40) {
          level = "E";
          levelKhmer = "មធ្យម";
        }

        return {
          level,
          levelKhmer,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      };

      // ✅✅✅ THIS IS THE MISSING PART - ADD IT HERE ✅✅✅
      const totalCoefficientForClass = subjects.reduce(
        (sum, s) =>
          applyEnglishBonusRule && isEnglishSubject(s)
            ? sum
            : sum + s.coefficient,
        0
      );

      console.log(`\n📊 Total Coefficient: ${totalCoefficientForClass}`);
      // ✅✅✅ END OF MISSING PART ✅✅✅

      // Build student data with subject grade levels
      const studentsData = sortedStudents.map((student) => {
        const subjectScores: {
          [subjectId: string]: {
            score: number | null;
            maxScore: number;
            gradeLevel: string;
            gradeLevelKhmer: string;
            percentage: number;
            semester1Score: number | null;
            semester2Score: number | null;
            annualScore: number | null;
          };
        } = {};

        let totalScore = 0;
        let englishBonus = 0;
        let subjectsWithScores = 0;
        let studentCoefficient = 0; // ✅ Track coefficient for entered subjects

        subjects.forEach((subject) => {
          const studentSubjectGrades = grades.filter(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          // Find Semester 1 exam grade (February / កុម្ភៈ)
          const sem1ExamGrade = studentSubjectGrades.find(
            (g) => g.month?.trim() === "កុម្ភៈ" || g.monthNumber === 2
          );

          // Find Semester 2 exam grade (June / មិថុនា for Grade 9/12, July / កក្កដា for others)
          const gradeNum = parseInt(classInfo.grade);
          const sem2ExamMonth = (gradeNum === 9 || gradeNum === 12) ? "មិថុនា" : "កក្កដា";
          const sem2ExamGrade = studentSubjectGrades.find(
            (g) => g.month?.trim() === sem2ExamMonth
          );

          const semester1Score = sem1ExamGrade ? sem1ExamGrade.score : null;
          const semester2Score = sem2ExamGrade ? sem2ExamGrade.score : null;
          const annualScore = (semester1Score !== null && semester2Score !== null)
            ? parseFloat(((semester1Score + semester2Score) / 2).toFixed(2))
            : (semester1Score !== null ? semester1Score : (semester2Score !== null ? semester2Score : null));

          // Use February score as default 'score' if month query param is not set, otherwise fallback to first record
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );
          const score = grade?.score ?? null;

          const gradeInfo = getSubjectGradeLevel(score, subject.maxScore);

          subjectScores[subject.id] = {
            score: score,
            maxScore: subject.maxScore,
            gradeLevel: gradeInfo.level,
            gradeLevelKhmer: gradeInfo.levelKhmer,
            percentage: gradeInfo.percentage,
            semester1Score,
            semester2Score,
            annualScore,
          };

          if (score !== null) {
            subjectsWithScores++;

            if (applyEnglishBonusRule && isEnglishSubject(subject)) {
              englishBonus += Math.max(score - ENGLISH_SCORE_BASELINE, 0);
            } else {
              totalScore += score;
              studentCoefficient += subject.coefficient; // ✅ Add coefficient only for entered subjects
            }
          }
        });

        const adjustedTotalScore = totalScore + englishBonus;

        // ✅ Average = totalScore / studentCoefficient (only entered subjects)
        const averageScore =
          studentCoefficient > 0
            ? adjustedTotalScore / studentCoefficient
            : 0;

        // ✅ Grade level thresholds
        let gradeLevel = "F";
        if (averageScore >= 45) gradeLevel = "A";
        else if (averageScore >= 40) gradeLevel = "B";
        else if (averageScore >= 35) gradeLevel = "C";
        else if (averageScore >= 30) gradeLevel = "D";
        else if (averageScore >= 25) gradeLevel = "E";

        const gradeLevelKhmer: { [key: string]: string } = {
          A: "ល្អប្រសើរ",
          B: "ល្អណាស់",
          C: "ល្អ",
          D: "ល្អបង្គួរ",
          E: "មធ្យម",
          F: "ខ្សោយ",
        };

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

        // Calculate monthly averages dynamically from grades
        const studentAllGrades = grades.filter((g) => g.studentId === student.id);
        const monthlyAverages = new Map<number, number>(); // monthNumber -> average

        // Group by monthNumber
        const gradesByMonth: { [month: number]: any[] } = {};
        studentAllGrades.forEach((g) => {
          let mNum = g.monthNumber;
          if (!mNum || mNum <= 0) {
            const idx = monthNames.indexOf(g.month?.trim() || "");
            if (idx >= 0) {
              mNum = idx + 1;
            }
          }
          if (mNum) {
            if (!gradesByMonth[mNum]) gradesByMonth[mNum] = [];
            gradesByMonth[mNum].push(g);
          }
        });

        // Compute average for each month
        for (const [mNumStr, mGrades] of Object.entries(gradesByMonth)) {
          const mNum = parseInt(mNumStr);
          let mTotal = 0;
          let mEngBonus = 0;
          let mCoef = 0;
          const monthName = monthNames[mNum - 1];
          const applyBonus = shouldApplyEnglishBonusRule(classInfo.grade, monthName);

          mGrades.forEach((g) => {
             const subject = subjects.find((s) => s.id === g.subjectId);
             if (subject && g.score !== null) {
                if (applyBonus && isEnglishSubject(subject)) {
                   mEngBonus += Math.max(g.score - ENGLISH_SCORE_BASELINE, 0);
                } else {
                   mTotal += g.score;
                   mCoef += subject.coefficient;
                }
             }
          });

          if (mCoef > 0) {
             monthlyAverages.set(mNum, (mTotal + mEngBonus) / mCoef);
          }
        }

        const sem1Months = [11, 12, 1];
        const gradeNum = parseInt(classInfo.grade);
        const sem2Months = (gradeNum === 9 || gradeNum === 12) ? [3, 5] : [3, 5, 6];

        const sem1ValidAverages: number[] = [];
        sem1Months.forEach((m) => {
           if (monthlyAverages.has(m) && (monthlyAverages.get(m) || 0) > 0) {
              sem1ValidAverages.push(monthlyAverages.get(m)!);
           }
        });

        const sem2ValidAverages: number[] = [];
        sem2Months.forEach((m) => {
           if (monthlyAverages.has(m) && (monthlyAverages.get(m) || 0) > 0) {
              sem2ValidAverages.push(monthlyAverages.get(m)!);
           }
        });

        let sem1MonthlyAvg: number | null = sem1ValidAverages.length > 0 
           ? parseFloat((sem1ValidAverages.reduce((a, b) => a + b, 0) / sem1ValidAverages.length).toFixed(2)) 
           : null;
        
        let sem2MonthlyAvg: number | null = sem2ValidAverages.length > 0 
           ? parseFloat((sem2ValidAverages.reduce((a, b) => a + b, 0) / sem2ValidAverages.length).toFixed(2)) 
           : null;

        return {
          studentId: student.studentId || student.id, // ✅ Use studentId field, fallback to id
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth
            ? new Date(student.dateOfBirth).toLocaleDateString("km-KH")
            : "",
          fatherName: student.fatherName || "",
          motherName: student.motherName || "",
          parentOccupation: student.parentOccupation || "",
          subjectScores,
          totalScore: adjustedTotalScore.toFixed(0),
          averageScore: averageScore.toFixed(2),
          gradeLevel: gradeLevel,
          gradeLevelKhmer: gradeLevelKhmer[gradeLevel],
          subjectsRecorded: subjectsWithScores,
          sem1MonthlyAvg,
          sem2MonthlyAvg,
          attendance: attendanceSummary[student.id] || {
            semester1: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
            semester2: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
            annual: { totalAbsent: 0, permission: 0, withoutPermission: 0 },
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
        console.log(
          `  Subjects with scores:  ${finalData[0].subjectsRecorded}`
        );
        console.log(`  Total:  ${finalData[0].totalScore}`);
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
          track: classInfo.track || null,
          year: parseInt(year as string),
          month: (month as string) || null,
          teacherName: classInfo.homeroomTeacher
            ? `${classInfo.homeroomTeacher.lastName} ${classInfo.homeroomTeacher.firstName}`
            : "",
          totalCoefficient: totalCoefficientForClass,
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
            track: s.track,
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
  /**
   * ✅ NEW: Get monthly statistics with gender breakdown
   */
  static async getMonthlyStatistics(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      console.log(
        `📊 Statistics request: classId=${classId}, month=${month}, year=${year}`
      );

      // ✅ Get class data
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: true,
          homeroomTeacher: true, // ✅ CHANGED from "teacher"
          teacherClasses: {
            // ✅ ADDED: Multiple teachers
            include: {
              teacher: true,
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

      // ✅ Sort students
      const sortedStudents = [...classData.students].sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

      // ✅ Get subjects (with track filtering)
      const whereClause: any = {
        grade: classData.grade,
        isActive: true,
      };

      const gradeNum = parseInt(classData.grade);
      if ((gradeNum === 11 || gradeNum === 12) && classData.track) {
        whereClause.OR = [
          { track: classData.track },
          { track: null },
          { track: "common" },
        ];
      }

      const subjects = await prisma.subject.findMany({
        where: whereClause,
        orderBy: { code: "asc" },
      });

      console.log(`✅ Found ${subjects.length} subjects for statistics`);

      // ✅ Get month number
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
      let searchMonth = month as string;
      if (searchMonth === "ឆមាសទី១") searchMonth = "កុម្ភៈ";
      if (searchMonth === "ឆមាសទី២") searchMonth = "កក្កដា";
      const monthNumber = monthNames.indexOf(searchMonth) + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      // ✅ Get grades
      const grades = await prisma.grade.findMany({
        where: {
          classId,
          OR: [
            { month: searchMonth },
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

      console.log(`✅ Found ${grades.length} grade records`);

      // ✅ Calculate total coefficient
      const totalCoefficient = subjects.reduce(
        (sum, s) => sum + s.coefficient,
        0
      );

      // ✅ Initialize statistics structure
      const statistics = {
        totalStudents: sortedStudents.length,
        femaleStudents: sortedStudents.filter((s) => s.gender === "FEMALE")
          .length,
        maleStudents: sortedStudents.filter((s) => s.gender === "MALE").length,

        // Overall Pass/Fail (Average >= 50 = Pass)
        totalPassed: 0,
        femalePassed: 0,
        malePassed: 0,
        totalFailed: 0,
        femaleFailed: 0,
        maleFailed: 0,

        // Overall Grade Distribution
        gradeDistribution: {
          A: { total: 0, female: 0, male: 0 },
          B: { total: 0, female: 0, male: 0 },
          C: { total: 0, female: 0, male: 0 },
          D: { total: 0, female: 0, male: 0 },
          E: { total: 0, female: 0, male: 0 },
          F: { total: 0, female: 0, male: 0 },
        },

        // Subject-wise Statistics
        subjectStatistics: {} as {
          [subjectId: string]: {
            subjectId: string;
            subjectName: string;
            subjectCode: string;
            gradeDistribution: {
              A: { total: number; female: number; male: number };
              B: { total: number; female: number; male: number };
              C: { total: number; female: number; male: number };
              D: { total: number; female: number; male: number };
              E: { total: number; female: number; male: number };
              F: { total: number; female: number; male: number };
            };
            averageScore: number;
            femaleAverageScore: number;
            maleAverageScore: number;
            totalScored: number;
            femaleScored: number;
            maleScored: number;
          };
        },
      };

      // ✅ Initialize subject statistics
      subjects.forEach((subject) => {
        statistics.subjectStatistics[subject.id] = {
          subjectId: subject.id,
          subjectName: subject.nameKh,
          subjectCode: subject.code,
          gradeDistribution: {
            A: { total: 0, female: 0, male: 0 },
            B: { total: 0, female: 0, male: 0 },
            C: { total: 0, female: 0, male: 0 },
            D: { total: 0, female: 0, male: 0 },
            E: { total: 0, female: 0, male: 0 },
            F: { total: 0, female: 0, male: 0 },
          },
          averageScore: 0,
          femaleAverageScore: 0,
          maleAverageScore: 0,
          totalScored: 0,
          femaleScored: 0,
          maleScored: 0,
        };
      });

      // ✅ Process each student
      sortedStudents.forEach((student) => {
        const studentGrades: { [subjectId: string]: number | null } = {};
        let totalScore = 0;
        let gradeCount = 0;
        let studentCoefficient = 0; // ✅ Track coefficient for entered subjects

        // Calculate student's total score and overall average
        subjects.forEach((subject) => {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.subjectId === subject.id
          );

          const score = grade?.score ?? null;
          studentGrades[subject.id] = score;

          if (score !== null) {
            totalScore += score;
            gradeCount++;
            studentCoefficient += subject.coefficient; // ✅ Add coefficient only for entered subjects

            // ✅ Calculate subject grade level
            const subjectGradeInfo = getSubjectGradeLevel(
              score,
              subject.maxScore
            );

            // ✅ Update subject statistics
            const subjectStats = statistics.subjectStatistics[subject.id];
            const gradeLevel =
              subjectGradeInfo.level as keyof typeof subjectStats.gradeDistribution;

            if (subjectStats.gradeDistribution[gradeLevel]) {
              subjectStats.gradeDistribution[gradeLevel].total++;
              if (student.gender === "FEMALE") {
                subjectStats.gradeDistribution[gradeLevel].female++;
              } else {
                subjectStats.gradeDistribution[gradeLevel].male++;
              }
            }

            // ✅ Update subject average scores
            subjectStats.totalScored++;
            subjectStats.averageScore += score;
            if (student.gender === "FEMALE") {
              subjectStats.femaleScored++;
              subjectStats.femaleAverageScore += score;
            } else {
              subjectStats.maleScored++;
              subjectStats.maleAverageScore += score;
            }
          }
        });

        // ✅ Calculate student's overall average (only entered subjects)
        const average =
          studentCoefficient > 0 ? totalScore / studentCoefficient : 0;

        // ✅ FIXED: Use correct grade level thresholds
        let overallGradeLevel = "F";
        if (average >= 80) overallGradeLevel = "A";
        else if (average >= 70) overallGradeLevel = "B";
        else if (average >= 60) overallGradeLevel = "C";
        else if (average >= 50) overallGradeLevel = "D";
        else if (average >= 40) overallGradeLevel = "E";

        // ✅ Update overall grade distribution
        const gradeLevelKey =
          overallGradeLevel as keyof typeof statistics.gradeDistribution;
        statistics.gradeDistribution[gradeLevelKey].total++;
        if (student.gender === "FEMALE") {
          statistics.gradeDistribution[gradeLevelKey].female++;
        } else {
          statistics.gradeDistribution[gradeLevelKey].male++;
        }

        // ✅ FIXED: Update pass/fail statistics (Pass = Average >= 50)
        if (average >= 50) {
          statistics.totalPassed++;
          if (student.gender === "FEMALE") {
            statistics.femalePassed++;
          } else {
            statistics.malePassed++;
          }
        } else {
          statistics.totalFailed++;
          if (student.gender === "FEMALE") {
            statistics.femaleFailed++;
          } else {
            statistics.maleFailed++;
          }
        }
      });

      // ✅ Calculate final subject averages
      Object.values(statistics.subjectStatistics).forEach((subjectStat) => {
        if (subjectStat.totalScored > 0) {
          subjectStat.averageScore = parseFloat(
            (subjectStat.averageScore / subjectStat.totalScored).toFixed(2)
          );
        }
        if (subjectStat.femaleScored > 0) {
          subjectStat.femaleAverageScore = parseFloat(
            (subjectStat.femaleAverageScore / subjectStat.femaleScored).toFixed(
              2
            )
          );
        }
        if (subjectStat.maleScored > 0) {
          subjectStat.maleAverageScore = parseFloat(
            (subjectStat.maleAverageScore / subjectStat.maleScored).toFixed(2)
          );
        }
      });

      console.log(`✅ Statistics calculated successfully`);
      console.log(`   Total Students: ${statistics.totalStudents}`);
      console.log(`   Female Students: ${statistics.femaleStudents}`);
      console.log(`   Total Passed: ${statistics.totalPassed}`);
      console.log(`   Female Passed: ${statistics.femalePassed}`);

      return res.json({
        success: true,
        data: {
          classId: classData.id,
          className: classData.name,
          grade: classData.grade,
          track: classData.track || null,
          month: month as string,
          year: parseInt(year as string),
          teacherName: classData.homeroomTeacher
            ? `${classData.homeroomTeacher.lastName} ${classData.homeroomTeacher.firstName}`
            : null,
          totalCoefficient: totalCoefficient,
          subjects: subjects.map((s) => ({
            id: s.id,
            nameKh: s.nameKh,
            nameEn: s.nameEn,
            code: s.code,
            maxScore: s.maxScore,
            coefficient: s.coefficient,
          })),
          statistics: statistics,
        },
      });
    } catch (error: any) {
      console.error("❌ Get monthly statistics error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get monthly statistics",
      });
    }
  }


  /**
   * Optimized method to fetch reports for multiple months in a single API call.
   */
  static async getMultipleMonthlyReports(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { months, year } = req.query; 

      if (!months || typeof months !== "string") {
        return res.status(400).json({ success: false, message: "months query parameter is required" });
      }

      const monthList = months.split(",").map((m) => m.trim());
      const inputYear = parseInt(year as string);

      console.log(`📊 Multiple reports request: classId=${classId}, months=${months}, year=${year}`);

      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: true,
          homeroomTeacher: true,
          teacherClasses: { include: { teacher: true } },
        },
      });

      if (!classData) return res.status(404).json({ success: false, message: "Class not found" });

      const sortedStudents = [...classData.students].sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

      const whereClause: any = { grade: classData.grade, isActive: true };
      const gradeNum = parseInt(classData.grade);
      if ((gradeNum === 11 || gradeNum === 12) && classData.track) {
        whereClause.OR = [ { track: classData.track }, { track: null }, { track: "common" } ];
      }
      const subjects = await prisma.subject.findMany({ where: whereClause, orderBy: { code: "asc" } });

      const monthNames = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

      const orConditions: any[] = [];
      let minStartDate: Date | null = null;
      let maxEndDate: Date | null = null;

      const monthDetails = monthList.map((monthStr) => {
        let searchMonth = monthStr;
        if (isSemesterOneMonth(monthStr)) searchMonth = "កុម្ភៈ";
        if (isSemesterTwoMonth(monthStr)) searchMonth = "កក្កដា";
        const monthNumber = monthNames.indexOf(searchMonth) + 1;
        
        orConditions.push({ month: searchMonth });
        orConditions.push({ month: monthNumber.toString() });
        orConditions.push({ monthNumber: monthNumber });
        if (isSemesterOneMonth(monthStr)) orConditions.push({ month: "ឆមាសទី១" });
        if (isSemesterTwoMonth(monthStr)) orConditions.push({ month: "ឆមាសទី២" });

        let startDate: Date;
        let endDate: Date;
        if (isSemesterOneMonth(monthStr)) {
          startDate = new Date(inputYear, 10, 1);
          endDate = new Date(inputYear + 1, 1, new Date(inputYear + 1, 2, 0).getDate(), 23, 59, 59);
        } else if (isSemesterTwoMonth(monthStr)) {
          startDate = new Date(inputYear + 1, 2, 1);
          endDate = new Date(inputYear + 1, 6, 31, 23, 59, 59);
        } else {
          const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;
          startDate = new Date(calendarYear, monthNumber - 1, 1);
          endDate = new Date(calendarYear, monthNumber - 1, new Date(calendarYear, monthNumber, 0).getDate(), 23, 59, 59);
        }

        if (!minStartDate || startDate < minStartDate) minStartDate = startDate;
        if (!maxEndDate || endDate > maxEndDate) maxEndDate = endDate;

        return { monthStr, searchMonth, monthNumber, startDate, endDate };
      });

      const allGrades = await prisma.grade.findMany({
        where: {
          classId,
          OR: orConditions,
          year: inputYear,
        }
      });

      const allAttendance = minStartDate && maxEndDate ? await prisma.attendance.findMany({
        where: {
          classId,
          OR: [
            { date: { gte: minStartDate, lte: maxEndDate } },
            { date: { gte: new Date(inputYear, 0, 1), lte: new Date(inputYear + 1, 11, 31, 23, 59, 59) } },
          ],
        },
      }) : [];

      const results = monthDetails.map(({ monthStr, searchMonth, monthNumber, startDate, endDate }) => {
        const applyEnglishBonusRule = shouldApplyEnglishBonusRule(classData.grade, searchMonth);
        
        // Filter grades for this month
        const grades = allGrades.filter(g => g.month === searchMonth || g.month === monthNumber.toString() || g.monthNumber === monthNumber || g.month === monthStr);
        
        const isSem1 = isSemesterOneMonth(monthStr);
        const isSem2 = isSemesterTwoMonth(monthStr);

        // Filter attendance for this month or semester
        const attendanceRecords = allAttendance.filter((a) => {
          const d = new Date(a.date);
          if (isSem1) {
            const m = d.getMonth();
            const y = d.getFullYear();
            return (
              ((m === 10 || m === 11) && (y === inputYear || y === inputYear - 1)) ||
              ((m === 0 || m === 1) && (y === inputYear + 1 || y === inputYear))
            );
          } else if (isSem2) {
            const m = d.getMonth();
            const y = d.getFullYear();
            return [2, 3, 4, 5, 6].includes(m) && (y === inputYear + 1 || y === inputYear);
          } else {
            const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            if (m !== monthNumber) return false;
            return y === calendarYear || y === inputYear;
          }
        });

        const attendanceSummary: { [studentId: string]: { absent: number; permission: number } } = {};
        attendanceRecords.forEach((record) => {
          if (!attendanceSummary[record.studentId]) {
            attendanceSummary[record.studentId] = { absent: 0, permission: 0 };
          }
          if (record.status === "ABSENT") attendanceSummary[record.studentId].absent++;
          else if (record.status === "PERMISSION") attendanceSummary[record.studentId].permission++;
        });

        const totalCoefficientForClass = subjects.reduce(
          (sum, s) => applyEnglishBonusRule && isEnglishSubject(s) ? sum : sum + s.coefficient, 0
        );

        const studentsData = sortedStudents.map((student) => {
          const studentGrades: { [subjectId: string]: number | null } = {};
          let totalScore = 0;
          let englishBonus = 0;
          let studentCoefficient = 0;

          subjects.forEach((subject) => {
            const grade = grades.find((g) => g.studentId === student.id && g.subjectId === subject.id);
            if (grade && grade.score !== null) {
              studentGrades[subject.id] = grade.score;
              if (applyEnglishBonusRule && isEnglishSubject(subject)) {
                englishBonus += Math.max(grade.score - ENGLISH_SCORE_BASELINE, 0);
              } else {
                totalScore += grade.score;
                studentCoefficient += subject.coefficient;
              }
            } else {
              studentGrades[subject.id] = null;
            }
          });

          const adjustedTotalScore = totalScore + englishBonus;
          const average = studentCoefficient > 0 ? adjustedTotalScore / studentCoefficient : 0;
          let gradeLevel = "F";
          if (average >= 45) gradeLevel = "A";
          else if (average >= 40) gradeLevel = "B";
          else if (average >= 35) gradeLevel = "C";
          else if (average >= 30) gradeLevel = "D";
          else if (average >= 25) gradeLevel = "E";

          return {
            studentId: student.studentId || student.id,
            studentName: student.khmerName || `${student.lastName} ${student.firstName}`,
            gender: student.gender,
            grades: studentGrades,
            totalScore: adjustedTotalScore.toFixed(2),
            average: average.toFixed(2),
            gradeLevel,
            absent: attendanceSummary[student.id]?.absent || 0,
            permission: attendanceSummary[student.id]?.permission || 0,
          };
        });

        const sorted = [...studentsData].sort((a, b) => parseFloat(b.average) - parseFloat(a.average)).map((student, index) => ({ ...student, rank: index + 1 }));
        const finalData = studentsData.map((student) => {
          const ranked = sorted.find((s) => s.studentId === student.studentId);
          return { ...student, rank: ranked?.rank || 0 };
        });

        return {
          classId: classData.id,
          className: classData.name,
          grade: classData.grade,
          track: classData.track || null,
          teacherName: classData.homeroomTeacher ? `${classData.homeroomTeacher.lastName} ${classData.homeroomTeacher.firstName}` : null,
          month: monthStr,
          year: inputYear,
          totalCoefficient: totalCoefficientForClass,
          subjects: subjects.map((s) => ({ id: s.id, nameKh: s.nameKh, nameEn: s.nameEn, code: s.code, maxScore: s.maxScore, coefficient: s.coefficient })),
          students: finalData,
        };
      });

      return res.json({ success: true, data: results });
    } catch (error: any) {
      console.error("❌ Get multiple monthly reports error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to get multiple reports" });
    }
  }

  /**
   * Optimized method to fetch grade-wide reports for multiple months in a single API call.
   */
  static async getMultipleGradeWideReports(req: Request, res: Response) {
    try {
      const { grade } = req.params;
      const { months, year } = req.query;

      if (!months || typeof months !== "string") {
        return res.status(400).json({ success: false, message: "months query parameter is required" });
      }

      const monthList = months.split(",").map((m) => m.trim());
      const inputYear = parseInt(year as string);

      console.log(`📊 Multiple grade-wide reports request: grade=${grade}, months=${months}, year=${year}`);

      const classes = await prisma.class.findMany({
        where: { grade: grade },
        include: { students: true },
      });

      if (classes.length === 0) {
        return res.status(404).json({ success: false, message: "No classes found for this grade" });
      }

      const allStudents = classes.flatMap((c) => 
        c.students.map(s => ({ ...s, className: c.name, track: c.track }))
      );

      const sortedStudents = allStudents.sort((a, b) => {
        const nameA = a.khmerName || `${a.lastName} ${a.firstName}`;
        const nameB = b.khmerName || `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB, "en-US");
      });

      const subjectWhereClause: any = { grade: grade, isActive: true };
      const gradeNum = parseInt(grade);
      
      const tracks = [...new Set(classes.map(c => c.track).filter(Boolean))];
      if ((gradeNum === 11 || gradeNum === 12) && tracks.length > 0) {
        subjectWhereClause.OR = [
          { track: { in: tracks } },
          { track: null },
          { track: "common" }
        ];
      }
      
      const subjects = await prisma.subject.findMany({
        where: subjectWhereClause,
        orderBy: { code: "asc" },
      });

      const monthNames = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
      const orConditions: any[] = [];
      let minStartDate: Date | null = null;
      let maxEndDate: Date | null = null;

      const monthDetails = monthList.map((monthStr) => {
        let searchMonth = monthStr;
        if (isSemesterOneMonth(monthStr)) searchMonth = "កុម្ភៈ";
        if (isSemesterTwoMonth(monthStr)) searchMonth = "កក្កដា";
        const monthNumber = monthNames.indexOf(searchMonth) + 1;
        
        orConditions.push({ month: searchMonth });
        orConditions.push({ month: monthNumber.toString() });
        orConditions.push({ monthNumber: monthNumber });
        if (isSemesterOneMonth(monthStr)) orConditions.push({ month: "ឆមាសទី១" });
        if (isSemesterTwoMonth(monthStr)) orConditions.push({ month: "ឆមាសទី២" });

        let startDate: Date;
        let endDate: Date;
        if (isSemesterOneMonth(monthStr)) {
          startDate = new Date(inputYear, 10, 1);
          endDate = new Date(inputYear + 1, 1, new Date(inputYear + 1, 2, 0).getDate(), 23, 59, 59);
        } else if (isSemesterTwoMonth(monthStr)) {
          startDate = new Date(inputYear + 1, 2, 1);
          endDate = new Date(inputYear + 1, 6, 31, 23, 59, 59);
        } else {
          const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;
          startDate = new Date(calendarYear, monthNumber - 1, 1);
          endDate = new Date(calendarYear, monthNumber - 1, new Date(calendarYear, monthNumber, 0).getDate(), 23, 59, 59);
        }

        if (!minStartDate || startDate < minStartDate) minStartDate = startDate;
        if (!maxEndDate || endDate > maxEndDate) maxEndDate = endDate;

        return { monthStr, searchMonth, monthNumber, startDate, endDate };
      });

      const allGrades = await prisma.grade.findMany({
        where: {
          classId: { in: classes.map(c => c.id) },
          OR: orConditions,
          year: inputYear,
        }
      });

      const allAttendance = minStartDate && maxEndDate ? await prisma.attendance.findMany({
        where: { 
          classId: { in: classes.map(c => c.id) }, 
          OR: [
            { date: { gte: minStartDate, lte: maxEndDate } },
            { date: { gte: new Date(inputYear, 0, 1), lte: new Date(inputYear + 1, 11, 31, 23, 59, 59) } },
          ],
        },
      }) : [];

      const results = monthDetails.map(({ monthStr, searchMonth, monthNumber, startDate, endDate }) => {
        const grades = allGrades.filter(g => g.month === searchMonth || g.month === monthNumber.toString() || g.monthNumber === monthNumber || g.month === monthStr);
        
        const isSem1 = isSemesterOneMonth(monthStr);
        const isSem2 = isSemesterTwoMonth(monthStr);

        // Filter attendance for this month or semester
        const attendanceRecords = allAttendance.filter((a) => {
          const d = new Date(a.date);
          if (isSem1) {
            const m = d.getMonth();
            const y = d.getFullYear();
            return (
              ((m === 10 || m === 11) && (y === inputYear || y === inputYear - 1)) ||
              ((m === 0 || m === 1) && (y === inputYear + 1 || y === inputYear))
            );
          } else if (isSem2) {
            const m = d.getMonth();
            const y = d.getFullYear();
            return [2, 3, 4, 5, 6].includes(m) && (y === inputYear + 1 || y === inputYear);
          } else {
            const calendarYear = monthNumber <= 9 ? inputYear + 1 : inputYear;
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            if (m !== monthNumber) return false;
            return y === calendarYear || y === inputYear;
          }
        });

        const attendanceSummary: { [studentId: string]: { absent: number; permission: number } } = {};
        attendanceRecords.forEach((record) => {
          if (!attendanceSummary[record.studentId]) {
            attendanceSummary[record.studentId] = { absent: 0, permission: 0 };
          }
          if (record.status === "ABSENT") attendanceSummary[record.studentId].absent++;
          else if (record.status === "PERMISSION") attendanceSummary[record.studentId].permission++;
        });

        const studentsData = sortedStudents.map((student) => {
          const studentGrades: { [subjectId: string]: number | null } = {};
          let totalScore = 0;
          let englishBonus = 0;
          let studentCoefficient = 0;

          const applyEnglishBonusRule = shouldApplyEnglishBonusRule(grade, searchMonth);

          const studentSubjects = subjects.filter(s => {
            if ((gradeNum === 11 || gradeNum === 12) && student.track) {
              return !s.track || s.track === "common" || s.track === student.track;
            }
            return true;
          });

          studentSubjects.forEach((subject) => {
            const gradeRecord = grades.find((g) => g.studentId === student.id && g.subjectId === subject.id);
            if (gradeRecord && gradeRecord.score !== null) {
              studentGrades[subject.id] = gradeRecord.score;
              if (applyEnglishBonusRule && isEnglishSubject(subject)) {
                englishBonus += Math.max(gradeRecord.score - ENGLISH_SCORE_BASELINE, 0);
              } else {
                totalScore += gradeRecord.score;
                studentCoefficient += subject.coefficient;
              }
            } else {
              studentGrades[subject.id] = null;
            }
          });

          const adjustedTotalScore = totalScore + englishBonus;
          const average = studentCoefficient > 0 ? adjustedTotalScore / studentCoefficient : 0;
          let gradeLevel = "F";
          if (average >= 45) gradeLevel = "A";
          else if (average >= 40) gradeLevel = "B";
          else if (average >= 35) gradeLevel = "C";
          else if (average >= 30) gradeLevel = "D";
          else if (average >= 25) gradeLevel = "E";

          return {
            studentId: student.studentId || student.id,
            studentName: student.khmerName || `${student.lastName} ${student.firstName}`,
            gender: student.gender,
            className: student.className,
            grades: studentGrades,
            totalScore: adjustedTotalScore.toFixed(2),
            average: average.toFixed(2),
            gradeLevel,
            absent: attendanceSummary[student.id]?.absent || 0,
            permission: attendanceSummary[student.id]?.permission || 0,
          };
        });

        const sorted = [...studentsData].sort((a, b) => parseFloat(b.average) - parseFloat(a.average)).map((student, index) => ({ ...student, rank: index + 1 }));
        const finalData = studentsData.map((student) => {
          const ranked = sorted.find((s) => s.studentId === student.studentId);
          return { ...student, rank: ranked?.rank || 0 };
        });

        const totalCoefficientForGrade = subjects.reduce((sum, s) => sum + s.coefficient, 0);

        return {
          grade: grade,
          month: monthStr,
          year: inputYear,
          totalCoefficient: totalCoefficientForGrade,
          subjects: subjects.map((s) => ({ id: s.id, nameKh: s.nameKh, nameEn: s.nameEn, code: s.code, maxScore: s.maxScore, coefficient: s.coefficient })),
          students: finalData,
        };
      });

      return res.json({ success: true, data: results });
    } catch (error: any) {
      console.error("❌ Get multiple grade-wide reports error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to get multiple reports" });
    }
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Service to automatically calculate monthly summaries
 * Call this after grades are saved/updated
 */
export class MonthlySummaryService {
  /**
   * Recalculate monthly summary for a specific student
   * @param studentId - Student ID
   * @param classId - Class ID
   * @param month - Month name (e.g., "មករា")
   * @param year - Year (e.g., 2025)
   */
  static async recalculateForStudent(
    studentId: string,
    classId: string,
    month: string,
    year: number
  ) {
    try {
      console.log(`📊 Recalculating summary for student ${studentId}, month ${month} ${year}`);

      // Get the class info
      const classData = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classData) {
        throw new Error(`Class ${classId} not found`);
      }

      // Get ALL subjects for this class
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

      const allSubjects = await prisma.subject.findMany({
        where: whereClause,
      });

      const totalCoefficientForClass = allSubjects.reduce(
        (sum, s) => sum + (s.coefficient || 1),
        0
      );

      // Get all grades for this student in this month
      const grades = await prisma.grade.findMany({
        where: {
          studentId,
          classId,
          month,
          year,
        },
        include: {
          subject: true,
        },
      });

      if (grades.length === 0) {
        console.log(`   ℹ️ No grades found, skipping summary`);
        return;
      }

      // Calculate statistics
      const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
      const totalMaxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
      const totalWeightedScore = grades.reduce(
        (sum, g) => sum + (g.score || 0) * (g.subject.coefficient || 1),
        0
      );

      // ✅ Calculate coefficient only for subjects with grades entered
      const studentCoefficient = grades.reduce(
        (sum, g) => sum + (g.subject.coefficient || 1),
        0
      );

      // ✅ Average = totalScore / studentCoefficient (only entered subjects)
      const average = studentCoefficient > 0
        ? totalScore / studentCoefficient
        : 0;

      // Determine grade level
      let gradeLevel = "F";
      if (average >= 45) gradeLevel = "A";
      else if (average >= 40) gradeLevel = "B";
      else if (average >= 35) gradeLevel = "C";
      else if (average >= 30) gradeLevel = "D";
      else if (average >= 25) gradeLevel = "E";

      // Get month number
      const monthNames = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ];
      const monthNumber = monthNames.indexOf(month) + 1;

      // Upsert summary
      await prisma.studentMonthlySummary.upsert({
        where: {
          studentId_classId_month_year: {
            studentId,
            classId,
            month,
            year,
          },
        },
        create: {
          studentId,
          classId,
          month,
          monthNumber,
          year,
          totalScore,
          totalMaxScore,
          totalWeightedScore,
          totalCoefficient: studentCoefficient,
          average,
          gradeLevel,
        },
        update: {
          totalScore,
          totalMaxScore,
          totalWeightedScore,
          totalCoefficient: studentCoefficient,
          average,
          gradeLevel,
        },
      });

      console.log(`   ✅ Summary updated: avg=${average.toFixed(2)}, grade=${gradeLevel}`);

      // Recalculate ranks for the entire class
      await this.recalculateClassRanks(classId, month, year);
    } catch (error) {
      console.error("❌ Error recalculating student summary:", error);
      throw error;
    }
  }

  /**
   * Recalculate class ranks for a specific month
   */
  static async recalculateClassRanks(
    classId: string,
    month: string,
    year: number
  ) {
    const summaries = await prisma.studentMonthlySummary.findMany({
      where: {
        classId,
        month,
        year,
      },
      orderBy: {
        average: "desc",
      },
    });

    for (let i = 0; i < summaries.length; i++) {
      await prisma.studentMonthlySummary.update({
        where: { id: summaries[i].id },
        data: { classRank: i + 1 },
      });
    }

    console.log(`   🏆 Updated ranks for ${summaries.length} students in class`);
  }

  /**
   * Recalculate summaries for an entire class and month
   * Use this after bulk grade import
   */
  static async recalculateForClass(
    classId: string,
    month: string,
    year: number
  ) {
    console.log(`📚 Recalculating summaries for class ${classId}, month ${month} ${year}`);

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: true,
      },
    });

    if (!classData) {
      throw new Error(`Class ${classId} not found`);
    }

    for (const student of classData.students) {
      await this.recalculateForStudent(student.id, classId, month, year);
    }

    console.log(`✅ Completed recalculation for ${classData.students.length} students`);
  }
}

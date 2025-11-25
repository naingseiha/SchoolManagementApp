import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GradeCalculationService {
  /**
   * Calculate weighted score for a grade
   */
  static calculateWeightedScore(score: number, coefficient: number): number {
    return score * coefficient;
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return (score / maxScore) * 100;
  }

  /**
   * Determine grade level (និទ្ទេស)
   */
  static determineGradeLevel(average: number): string {
    if (average >= 90) return "A";
    if (average >= 80) return "B+";
    if (average >= 70) return "B";
    if (average >= 60) return "C";
    if (average >= 50) return "D";
    if (average >= 40) return "E";
    return "F";
  }

  // Add this static method
  static getMonthNumber(monthKh: string): number {
    const months: { [key: string]: number } = {
      មករា: 1,
      កុម្ភៈ: 2,
      មីនា: 3,
      មេសា: 4,
      ឧសភា: 5,
      មិថុនា: 6,
      កក្កដា: 7,
      សីហា: 8,
      កញ្ញា: 9,
      តុលា: 10,
      វិច្ឆិកា: 11,
      ធ្នូ: 12,
    };
    return months[monthKh] || 1;
  }

  /**
   * Calculate monthly summary for a student
   */
  static async calculateMonthlySummary(
    studentId: string,
    classId: string,
    month: string,
    monthNumber: number,
    year: number
  ) {
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
      return null;
    }

    let totalScore = 0;
    let totalMaxScore = 0;
    let totalWeightedScore = 0;
    let totalCoefficient = 0;

    for (const grade of grades) {
      const coefficient = grade.subject.coefficient;
      const weightedScore = this.calculateWeightedScore(
        grade.score,
        coefficient
      );

      totalScore += grade.score;
      totalMaxScore += grade.maxScore;
      totalWeightedScore += weightedScore;
      totalCoefficient += coefficient;

      // Update grade with weighted score
      await prisma.grade.update({
        where: { id: grade.id },
        data: {
          weightedScore,
          percentage: this.calculatePercentage(grade.score, grade.maxScore),
        },
      });
    }

    // Calculate average
    const average =
      totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

    // Determine grade level
    const gradeLevel = this.determineGradeLevel(average);

    // Create or update summary
    const summary = await prisma.studentMonthlySummary.upsert({
      where: {
        studentId_classId_month_year: {
          studentId,
          classId,
          month,
          year,
        },
      },
      update: {
        totalScore,
        totalMaxScore,
        totalWeightedScore,
        totalCoefficient,
        average,
        gradeLevel,
        monthNumber,
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
        totalCoefficient,
        average,
        gradeLevel,
      },
    });

    return summary;
  }

  /**
   * Calculate class ranks for a specific month
   */
  static async calculateClassRanks(
    classId: string,
    month: string,
    year: number
  ) {
    // Get all summaries for this class/month, ordered by average DESC
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

    // Assign ranks
    for (let i = 0; i < summaries.length; i++) {
      await prisma.studentMonthlySummary.update({
        where: { id: summaries[i].id },
        data: { classRank: i + 1 },
      });
    }

    console.log(`✅ Calculated ranks for ${summaries.length} students`);
  }
}

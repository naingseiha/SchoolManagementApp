import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculate monthly summaries for a specific month and year
 * Usage: npx ts-node src/scripts/calculate-monthly-summaries-dynamic.ts <month> <year>
 * Example: npx ts-node src/scripts/calculate-monthly-summaries-dynamic.ts "មករា" 2025
 */
async function calculateMonthlySummaries() {
  try {
    // Get month and year from command line arguments
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.error("❌ Usage: npx ts-node calculate-monthly-summaries-dynamic.ts <month> <year>");
      console.error("   Example: npx ts-node calculate-monthly-summaries-dynamic.ts \"មករា\" 2025");
      process.exit(1);
    }

    const currentMonth = args[0];
    const currentYear = parseInt(args[1]);

    console.log(`🔄 Starting monthly summary calculation for ${currentMonth} ${currentYear}...`);

    // Get all classes
    const classes = await prisma.class.findMany({
      include: {
        students: true,
      },
    });

    let totalProcessed = 0;
    let totalCreated = 0;

    for (const classItem of classes) {
      console.log(`\n📚 Processing class: ${classItem.name}`);

      // Get ALL subjects for this class (same as report page)
      const whereClause: any = {
        grade: classItem.grade,
        isActive: true,
      };

      // For Grade 11 & 12, filter by track
      const gradeNum = parseInt(classItem.grade);
      if ((gradeNum === 11 || gradeNum === 12) && classItem.track) {
        whereClause.OR = [
          { track: classItem.track },
          { track: null },
          { track: "common" },
        ];
      }

      const allSubjects = await prisma.subject.findMany({
        where: whereClause,
      });

      const ENGLISH_SCORE_BASELINE = 25;
      const isEnglishSubject = (subject: any) => {
        const code = subject.code?.toUpperCase() || "";
        if (code.startsWith("ENG")) return true;
        const khmerName = `${subject.nameKh || ""}${subject.name || ""}`;
        if (khmerName.includes("អង់គ្លេស")) return true;
        const englishName = `${subject.nameEn || ""}${subject.name || ""}`.toLowerCase();
        return englishName.includes("english");
      };
      const shouldApplyEnglishBonusRule = (grade: string | number, month?: string) => {
        const gradeNum = typeof grade === "string" ? parseInt(grade.replace(/\D/g, ""), 10) : grade;
        if (gradeNum !== 9 && gradeNum !== 12) return false;
        if (!month) return false;
        const normalizedMonth = month.trim();
        return (
          normalizedMonth === "កុម្ភៈ" || 
          normalizedMonth === "ឆមាសទី១" || 
          normalizedMonth === "មិថុនា" || 
          normalizedMonth === "ឆមាសទី២"
        );
      };

      const applyEnglishBonusRule = shouldApplyEnglishBonusRule(classItem.grade, currentMonth);

      // Calculate total coefficient for this class from ALL subjects
      const totalCoefficientForClass = allSubjects.reduce(
        (sum, s) => applyEnglishBonusRule && isEnglishSubject(s) ? sum : sum + (s.coefficient || 1),
        0
      );

      console.log(`   📊 Total coefficient for class ${classItem.name}: ${totalCoefficientForClass} (${allSubjects.length} subjects)`);

      for (const student of classItem.students) {
        // Get all grades for this student in current month
        const grades = await prisma.grade.findMany({
          where: {
            studentId: student.id,
            classId: classItem.id,
            month: currentMonth,
            year: currentYear,
          },
          include: {
            subject: true,
          },
        });

        if (grades.length === 0) {
          continue;
        }

        // Calculate statistics with English rule
        let totalScore = 0;
        let totalMaxScore = 0;
        let englishBonus = 0;
        let studentCoefficient = 0;

        grades.forEach((g) => {
          const score = g.score || 0;
          totalMaxScore += g.maxScore || 0;

          if (applyEnglishBonusRule && isEnglishSubject(g.subject)) {
            englishBonus += Math.max(score - ENGLISH_SCORE_BASELINE, 0);
          } else {
            totalScore += score;
            studentCoefficient += g.subject.coefficient || 1;
          }
        });

        const adjustedTotalScore = totalScore + englishBonus;

        // ✅ Average = adjustedTotalScore / studentCoefficient (only entered subjects)
        const average = studentCoefficient > 0
          ? (adjustedTotalScore / studentCoefficient)
          : 0;

        // Keep totalWeightedScore for storage (legacy field)
        const totalWeightedScore = grades.reduce(
          (sum, g) => sum + (g.score || 0) * (g.subject.coefficient || 1),
          0
        );

        // Determine grade level (same as report page)
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
        const monthNumber = monthNames.indexOf(currentMonth) + 1;

        // Create or update summary
        await prisma.studentMonthlySummary.upsert({
          where: {
            studentId_classId_month_year: {
              studentId: student.id,
              classId: classItem.id,
              month: currentMonth,
              year: currentYear,
            },
          },
          create: {
            studentId: student.id,
            classId: classItem.id,
            month: currentMonth,
            monthNumber,
            year: currentYear,
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

        totalCreated++;
        totalProcessed++;

        if (totalProcessed % 10 === 0) {
          console.log(`   ✓ Processed ${totalProcessed} students...`);
        }
      }
    }

    // Update class ranks
    console.log("\n🏆 Calculating class ranks...");
    const allSummaries = await prisma.studentMonthlySummary.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
      },
      orderBy: {
        average: "desc",
      },
    });

    // Group by class and assign ranks
    const summariesByClass = allSummaries.reduce((acc, summary) => {
      if (!acc[summary.classId]) {
        acc[summary.classId] = [];
      }
      acc[summary.classId].push(summary);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [classId, summaries] of Object.entries(summariesByClass)) {
      // Sort by average descending
      summaries.sort((a, b) => b.average - a.average);

      // Assign ranks
      for (let i = 0; i < summaries.length; i++) {
        await prisma.studentMonthlySummary.update({
          where: { id: summaries[i].id },
          data: { classRank: i + 1 },
        });
      }

      console.log(`   ✓ Ranked ${summaries.length} students in class ${classId}`);
    }

    console.log(`\n✅ Monthly summary calculation complete!`);
    console.log(`   📊 Total students processed: ${totalProcessed}`);
    console.log(`   📝 Total summaries created/updated: ${totalCreated}`);
    console.log(`   📅 Month: ${currentMonth} ${currentYear}`);
  } catch (error) {
    console.error("❌ Error calculating monthly summaries:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the calculation
calculateMonthlySummaries()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

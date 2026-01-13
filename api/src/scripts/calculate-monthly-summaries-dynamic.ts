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

      // Calculate total coefficient for this class from ALL subjects
      const totalCoefficientForClass = allSubjects.reduce(
        (sum, s) => sum + (s.coefficient || 1),
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

        // Calculate statistics
        const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
        const totalMaxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);

        // ✅ FIXED: Use total coefficient from ALL subjects (not just graded ones)
        const totalCoefficient = totalCoefficientForClass;

        // ✅ FIXED: Average = totalScore / totalCoefficientForClass (same as report page)
        const average = totalCoefficient > 0
          ? (totalScore / totalCoefficient)
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
            totalCoefficient,
            average,
            gradeLevel,
          },
          update: {
            totalScore,
            totalMaxScore,
            totalWeightedScore,
            totalCoefficient,
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

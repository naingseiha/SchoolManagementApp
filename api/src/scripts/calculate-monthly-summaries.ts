import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function calculateMonthlySummaries() {
  try {
    console.log("🔄 Starting monthly summary calculation...");

    const currentYear = new Date().getFullYear();
    const currentMonth = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date());

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
        const totalWeightedScore = grades.reduce(
          (sum, g) => sum + (g.score || 0) * (g.subject.coefficient || 1),
          0
        );
        const totalCoefficient = grades.reduce(
          (sum, g) => sum + (g.subject.coefficient || 1),
          0
        );

        const average = totalCoefficient > 0
          ? (totalWeightedScore / totalCoefficient)
          : 0;

        // Determine grade level
        let gradeLevel = "E";
        if (average >= 80) gradeLevel = "A";
        else if (average >= 70) gradeLevel = "B";
        else if (average >= 60) gradeLevel = "C";
        else if (average >= 50) gradeLevel = "D";

        // Get month number
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
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

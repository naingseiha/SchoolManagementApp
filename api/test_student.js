const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Find a student with December grades
    const decGrade = await prisma.grade.findFirst({
      where: { month: 'ធ្នូ', year: 2025 },
      include: { student: { select: { id: true, khmerName: true } } }
    });
    
    if (!decGrade) {
      console.log('No December grades found');
      return;
    }
    
    const studentId = decGrade.student.id;
    console.log('Testing with student:', decGrade.student.khmerName, '(' + studentId + ')');
    console.log('');
    
    const grades = await prisma.grade.findMany({
      where: {
        studentId: studentId,
        OR: [
          { year: 2025, monthNumber: { gte: 10 } },
          { year: 2026, monthNumber: { lte: 9 } }
        ]
      }
    });
    
    console.log('Total grades found:', grades.length);
    
    // Group by month
    const byMonth = {};
    grades.forEach(g => {
      byMonth[g.month] = (byMonth[g.month] || 0) + 1;
    });
    
    console.log('Grades by month:');
    Object.entries(byMonth).sort().forEach(([month, count]) => {
      console.log(`  ${month}: ${count} grades`);
    });
  } finally {
    await prisma.$disconnect();
  }
})();

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zr9e0001q0ja25clx0sy'; // ថ្នាក់ទី7ក

  const targetClass = await prisma.class.findUnique({ where: { id: classId } });
  console.log('Target Class:', targetClass);

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { khmerName: 'asc' }
  });

  const grades = await prisma.grade.findMany({
    where: { classId, month: 'វិច្ឆិកា' },
    include: { subject: true }
  });

  console.log(`Found ${students.length} students in ថ្នាក់ទី7ក. Found ${grades.length} grades for វិច្ឆិកា.`);

  // Let's print the first 15 students in alphabetical order, their ID, studentId, khmerName, and scores
  for (const st of students.slice(0, 15)) {
    const stGrades = grades.filter(g => g.studentId === st.id);
    const scores: Record<string, number> = {};
    for (const g of stGrades) {
      scores[g.subject.nameKh] = g.score;
    }
    console.log(`[${st.studentId}] ${st.khmerName} (${st.lastName} ${st.firstName}) - ${stGrades.length} subjects:`, JSON.stringify(scores));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

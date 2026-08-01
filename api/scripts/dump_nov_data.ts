import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zu9d0009q0jag59r3pss'; // Class 7ក
  
  const targetClass = await prisma.class.findUnique({ where: { id: classId } });
  console.log('Class:', targetClass);

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { khmerName: 'asc' }
  });

  const subjects = await prisma.subject.findMany({
    where: {
      grades: {
        some: {
          classId,
          month: 'វិច្ឆិកា'
        }
      }
    }
  });

  console.log('\n--- Subjects present in November grades for Class 7ក ---');
  for (const s of subjects) {
    console.log(`[ID: ${s.id}] code: ${s.code}, nameKh: "${s.nameKh}", maxScore: ${s.maxScore}`);
  }

  // Also let's check ALL subjects in DB that have "G7" or grade "7" just in case some subjects have no grades yet or different names
  const allG7Sub = await prisma.subject.findMany({
    where: {
      OR: [
        { grade: '7' },
        { grade: '៧' },
        { code: { contains: 'G7' } }
      ]
    }
  });
  console.log('\n--- All G7 Subjects in DB ---');
  for (const s of allG7Sub) {
    console.log(`[ID: ${s.id}] code: ${s.code}, nameKh: "${s.nameKh}", maxScore: ${s.maxScore}`);
  }

  const grades = await prisma.grade.findMany({
    where: {
      classId,
      month: 'វិច្ឆិកា'
    },
    include: {
      subject: true
    }
  });

  console.log(`\n--- Found ${students.length} students and ${grades.length} grades in DB for Class 7ក in វិច្ឆិកា ---`);
  
  for (const st of students) {
    const stGrades = grades.filter(g => g.studentId === st.id);
    const scoresObj: Record<string, number> = {};
    for (const g of stGrades) {
      scoresObj[g.subject.nameKh] = g.score;
    }
    console.log(`[${st.studentId}] ${st.khmerName} (${st.lastName} ${st.firstName}) - ${stGrades.length} subjects:`, JSON.stringify(scoresObj));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

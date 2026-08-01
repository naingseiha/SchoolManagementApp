import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();

  const classId = 'cmiq7zwy1000jq0jalus7rknx'; // G9-ក

  const subjects = await prisma.subject.findMany({
    where: { grade: '9' }
  });

  console.log("Grade 9 Subjects:");
  subjects.forEach(s => console.log(`${s.code} -> ${s.nameKh}`));

  const student = await prisma.student.findFirst({
    where: { studentId: '25090003' } // គឹម កក្កដា
  });

  if (student) {
    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
        classId,
        month: 'វិច្ឆិកា',
        year: 2025
      },
      include: { subject: true }
    });

    console.log(`\nGrades for ${student.khmerName}:`);
    grades.forEach(g => {
      console.log(`${g.subject.code} (${g.subject.nameKh}): ${g.score}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  
  // Let's find student "ខន សុវណ្ណនីតា"
  const student = await prisma.student.findFirst({
    where: { studentId: '25090002' }
  });

  if (!student) {
    console.log('Student not found!');
    return;
  }

  const grades = await prisma.grade.findMany({
    where: { studentId: student.id, month: 'វិច្ឆិកា', year: 2025 },
    include: { subject: true }
  });

  console.log(`--- GRADES FOR [${student.studentId}] ${student.khmerName} ---`);
  grades.forEach(g => {
    console.log(`- Subject: ${g.subject.nameKh} | Code: ${g.subject.code} | Score: ${g.score}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

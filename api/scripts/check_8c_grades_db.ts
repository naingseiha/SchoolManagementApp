import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId8c = 'cmiq7zvub000fq0jaaz3hiu4e'; // ថ្នាក់ទី8គ (G8-គ)

  const student = await prisma.student.findFirst({
    where: { classId: classId8c }
  });

  if (!student) {
    console.log('No student found in 8C');
    return;
  }

  const grades = await prisma.grade.findMany({
    where: { studentId: student.id, month: 'វិច្ឆិកា', year: 2025 },
    include: { subject: true }
  });

  console.log(`--- CURRENT GRADES IN DB FOR STUDENT: ${student.khmerName} [${student.studentId}] ---`);
  grades.forEach(g => {
    console.log(`- Code: ${g.subject.code} | Name: ${g.subject.nameKh} | Score: ${g.score}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

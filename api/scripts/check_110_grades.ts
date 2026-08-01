import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const stId = 'cmiqel7x700291pack23i41es'; // 25070110 ស្វាយ កិត្យារឹទ្ធ

  const grades = await prisma.grade.findMany({
    where: { studentId: stId },
    include: { subject: true }
  });
  console.log(`Grades found for 25070110 (${grades.length}):`);
  grades.forEach(g => {
    console.log(`- Month: ${g.month} ${g.year} | ClassId: ${g.classId} | Subject: ${g.subject.nameKh} (${g.subject.code}) | Score: ${g.score}`);
  });

  const summaries = await prisma.studentMonthlySummary.findMany({
    where: { studentId: stId }
  });
  console.log('Summaries:', summaries);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

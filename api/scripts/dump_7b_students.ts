import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zs080003q0jav4gj9wat'; // ថ្នាក់ទី7ខ (G7-ខ)

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- STUDENTS IN ថ្នាក់ទី7ខ (${students.length} total) ---`);
  students.forEach((s, idx) => {
    console.log(`DB #${idx + 1}: [ID: ${s.id}, StudentID: ${s.studentId}] ${s.khmerName} (${s.fullName})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

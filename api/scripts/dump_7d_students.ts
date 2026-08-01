import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId7d = 'cmiq7zthb0007q0ja8fed8leq'; // ថ្នាក់ទី7ឃ (G7-ឃ)

  const students = await prisma.student.findMany({
    where: { classId: classId7d },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី7ឃ (G7-ឃ) IN THE DATABASE (${students.length}) ---`);
  students.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId9c = 'cmiq7zy6z000nq0jaeinbeyfd'; // ថ្នាក់ទី9គ (G9-គ)
  const classId9d = 'cmiq7zyos000pq0jawwgzbdr7'; // ថ្នាក់ទី9ឃ (G9-ឃ)

  const students9c = await prisma.student.findMany({
    where: { classId: classId9c },
    orderBy: { studentId: 'asc' }
  });

  const students9d = await prisma.student.findMany({
    where: { classId: classId9d },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី9គ (G9-គ) IN THE DATABASE (${students9c.length}) ---`);
  students9c.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });

  console.log(`\n--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី9ឃ (G9-ឃ) IN THE DATABASE (${students9d.length}) ---`);
  students9d.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId9a = 'cmiq7zwy1000jq0jalus7rknx'; // ថ្នាក់ទី9ក (G9-ក)
  const classId9b = 'cmiq7zxhq000lq0jagpi729wu'; // ថ្នាក់ទី9ខ (G9-ខ)

  const students9a = await prisma.student.findMany({
    where: { classId: classId9a },
    orderBy: { studentId: 'asc' }
  });

  const students9b = await prisma.student.findMany({
    where: { classId: classId9b },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី9ក (G9-ក) IN THE DATABASE (${students9a.length}) ---`);
  students9a.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });

  console.log(`\n--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី9ខ (G9-ខ) IN THE DATABASE (${students9b.length}) ---`);
  students9b.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

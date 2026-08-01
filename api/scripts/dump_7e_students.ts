import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId7e = 'cmiq7zu9d0009q0jag59r3pss'; // ថ្នាក់ទី7ង (G7-ង)

  const students = await prisma.student.findMany({
    where: { classId: classId7e },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី7ង (G7-ង) IN THE DATABASE (${students.length}) ---`);
  students.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId8b = 'cmiq7zvab000dq0jaz5sltz3k'; // ថ្នាក់ទី8ខ (G8-ខ)

  const students = await prisma.student.findMany({
    where: { classId: classId8b },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី8ខ (G8-ខ) IN THE DATABASE (${students.length}) ---`);
  students.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

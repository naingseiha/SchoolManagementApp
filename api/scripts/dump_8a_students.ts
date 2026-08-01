import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId8a = 'cmiq7zus8000bq0jaz191ad1z'; // ថ្នាក់ទី8ក (G8-ក)

  const students = await prisma.student.findMany({
    where: { classId: classId8a },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី8ក (G8-ក) IN THE DATABASE (${students.length}) ---`);
  students.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

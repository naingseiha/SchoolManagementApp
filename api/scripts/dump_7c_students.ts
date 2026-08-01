import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId7c = 'cmiq7zsqx0005q0jatgouva40'; // ថ្នាក់ទី7គ (G7-គ)

  const students = await prisma.student.findMany({
    where: { classId: classId7c },
    orderBy: { studentId: 'asc' }
  });

  console.log(`--- CURRENT STUDENTS ENROLLED IN ថ្នាក់ទី7គ (G7-គ) IN THE DATABASE (${students.length}) ---`);
  students.forEach((st, idx) => {
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} (Gender: ${st.gender})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const students = await prisma.student.findMany({
    where: {
      OR: [
        { khmerName: { contains: 'សុផានណា' } },
        { khmerName: { contains: 'សុផាន់ណា' } },
        { studentId: { in: ['25090115', '25090116'] } }
      ]
    }
  });

  console.log('--- FOUND STUDENTS ---');
  students.forEach(st => {
    console.log(`- ID: ${st.studentId} | Name: ${st.khmerName} | Class ID: ${st.classId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

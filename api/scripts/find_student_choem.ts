import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { khmerName: { contains: 'បញ្ញា' } },
        { khmerName: { contains: 'ឈឿម' } }
      ]
    },
    include: { class: true }
  });

  console.log('--- FOUND STUDENTS ---');
  students.forEach(s => {
    console.log(`- ${s.studentId} | ${s.khmerName} | Class: ${s.class?.name || s.classId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

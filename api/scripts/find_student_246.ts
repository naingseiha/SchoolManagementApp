import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const st246 = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: '25070246' },
        { khmerName: { contains: 'សិរី' } },
        { khmerName: { contains: 'រតនៈ' } },
        { khmerName: { contains: 'រតន' } }
      ]
    },
    include: { class: true }
  });
  console.log('Result for search:', st246 ? `${st246.studentId} - ${st246.khmerName} in class ${st246.class?.name || st246.classId}` : 'NOT FOUND');

  const allWith246 = await prisma.student.findMany({
    where: { studentId: { contains: '246' } },
    include: { class: true }
  });
  console.log('All containing 246:');
  allWith246.forEach(s => console.log(`- ${s.studentId} ${s.khmerName} in ${s.class?.name}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

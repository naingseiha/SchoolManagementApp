import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  console.log('--- Searching for student 25070110 or ស្វាយ / ភិតារិទ្ធ ---');
  const st = await prisma.student.findMany({
    where: {
      OR: [
        { studentId: { contains: '25070110' } },
        { khmerName: { contains: 'ស្វាយ' } },
        { khmerName: { contains: 'ភិតារិទ្ធ' } },
        { khmerName: { contains: 'សាយ' } },
        { firstName: { contains: 'ស្វាយ' } },
        { lastName: { contains: 'ភិតារិទ្ធ' } }
      ]
    }
  });
  console.log('Found matches:', st);

  console.log('\n--- Checking students around 25070110 ---');
  const around = await prisma.student.findMany({
    where: {
      studentId: { in: ['25070109', '25070110', '25070111', '25070112'] }
    }
  });
  around.forEach(s => console.log(s));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

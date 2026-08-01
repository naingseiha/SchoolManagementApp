import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  console.log('--- Checking all classes for Grade 7 ---');
  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { grade: '7' },
        { grade: '៧' },
        { name: { contains: '7' } },
        { classId: { contains: 'G7' } }
      ]
    }
  });
  console.log('Grade 7 classes found:');
  classes.forEach(c => console.log(c));

  console.log('\n--- Checking all classes with section B or ខ ---');
  const bClasses = await prisma.class.findMany({
    where: {
      OR: [
        { section: 'B' },
        { section: 'ខ' },
        { name: { contains: 'ខ' } },
        { name: { contains: 'B' } }
      ]
    }
  });
  bClasses.forEach(c => console.log(c));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

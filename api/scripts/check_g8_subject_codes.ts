import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();

  const subjects = await prisma.subject.findMany({
    where: {
      code: {
        endsWith: '-G8'
      }
    },
    orderBy: { code: 'asc' }
  });

  console.log('--- ALL GRADE 8 SUBJECTS ---');
  subjects.forEach(s => {
    console.log(`- Code: "${s.code}" | Name: "${s.nameKh}" | Coefficient: ${s.coefficient} | Max Score: ${s.maxScore}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

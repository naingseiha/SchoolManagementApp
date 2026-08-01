import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const subjects = await prisma.subject.findMany({
    where: { code: { contains: '-G8' } }
  });

  console.log('--- ALL GRADE 8 SUBJECTS IN DATABASE ---');
  subjects.forEach(s => {
    console.log(`- Code: ${s.code} | Name: ${s.nameKh} | Max Score: ${s.maxScore} | Coeff: ${s.coefficient}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

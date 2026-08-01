import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classes = await prisma.class.findMany({
    where: { name: { contains: '9' } }
  });

  console.log('--- ALL GRADE 9 CLASSES IN DATABASE ---');
  classes.forEach(c => {
    console.log(`- ID: ${c.id} | Name: ${c.name} | Grade: ${c.grade}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

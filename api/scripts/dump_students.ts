import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import fs from 'fs';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zu9d0009q0jag59r3pss'; // Class 7ក

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { khmerName: 'asc' }
  });

  const list = students.map(s => ({
    id: s.id,
    studentId: s.studentId,
    khmerName: s.khmerName,
    lastName: s.lastName,
    firstName: s.firstName,
    gender: s.gender
  }));

  fs.writeFileSync('scripts/students_list.json', JSON.stringify(list, null, 2), 'utf-8');
  console.log(`Saved ${list.length} students to scripts/students_list.json`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

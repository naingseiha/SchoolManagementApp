import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zu9d0009q0jag59r3pss'; // Class 7ក

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { khmerName: 'asc' }
  });

  const grades = await prisma.grade.findMany({
    where: { classId, month: 'វិច្ឆិកា' },
    include: { subject: true }
  });

  // Let's find first 5 students matching our PDF top rows:
  // 0001 កែវ ណាម៉ែន
  // 0002 គង់ ចន្ថាស៊ី
  // 0003 ចិប ដាលណង
  // 0004 ព្រឹក គីមលាំង
  // 0005 លោម អង្គិច
  
  const targetNames = ['កែវ ណាម៉ែន', 'គង់ ចន្ថាស៊ី', 'ចិប ដាលណង', 'ព្រឹក គីមលាំង', 'លោម អង្គិច'];

  for (const name of targetNames) {
    const st = students.find(s => s.khmerName.includes(name) || s.khmerName === name);
    if (!st) {
      console.log(`Student not found in DB: ${name}`);
      continue;
    }
    const stGrades = grades.filter(g => g.studentId === st.id);
    const scores: Record<string, number> = {};
    for (const g of stGrades) {
      scores[g.subject.nameKh] = g.score;
    }
    console.log(`\nDB scores for [${st.studentId}] ${st.khmerName}:`);
    console.log(JSON.stringify(scores, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

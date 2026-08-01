import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  console.log('--- Checking Classes matching Grade 7 / 7ក ---');
  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { name: { contains: '7' } },
        { grade: { contains: '7' } },
        { name: { contains: '៧' } }
      ]
    }
  });
  console.log('Classes:', classes);

  if (classes.length === 0) {
    console.log('No 7th grade classes found.');
    return;
  }

  // Let's find specifically 7ក or similar
  const targetClass = classes.find(c => c.name.includes('ក') || c.name === '7A' || c.name === '៧ក' || c.name === '7ក') || classes[0];
  console.log('Selected Target Class:', targetClass);

  const students = await prisma.student.findMany({
    where: { classId: targetClass.id },
    orderBy: { khmerName: 'asc' }
  });
  console.log(`Found ${students.length} students in class ${targetClass.name}:`);
  for (const s of students) {
    console.log(` - [ID: ${s.id}, StudentID: ${s.studentId}] ${s.khmerName} (${s.lastName} ${s.firstName}) gender: ${s.gender}`);
  }

  console.log('\n--- Checking Subjects for Grade:', targetClass.grade, '---');
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { grade: targetClass.grade },
        { grade: '7' },
        { grade: '៧' }
      ]
    }
  });
  console.log(`Found ${subjects.length} subjects:`);
  for (const sub of subjects) {
    console.log(` - [ID: ${sub.id}] code: ${sub.code}, nameKh: "${sub.nameKh}", name: "${sub.name}", maxScore: ${sub.maxScore}, coefficient: ${sub.coefficient}`);
  }

  console.log('\n--- Checking distinct month values in Grade table for this class ---');
  const grades = await prisma.grade.findMany({
    where: { classId: targetClass.id }
  });
  const months = new Set(grades.map(g => `${g.month} (monthNumber: ${g.monthNumber}, year: ${g.year})`));
  console.log('Distinct month info in grades table for class:', Array.from(months));

  // Let's sample a few grades for November or 11
  const novGrades = grades.filter(g => g.monthNumber === 11 || g.month === '11' || g.month === 'វិច្ឆិកា' || g.month === 'November');
  console.log(`Found ${novGrades.length} grades for November.`);
  if (novGrades.length > 0) {
    console.log('Sample Nov Grade:', novGrades[0]);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zy6z000nq0jaeinbeyfd'; // ថ្នាក់ទី9គ (G9-គ)

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { khmerName: 'asc' }
  });

  const subjects = await prisma.subject.findMany({
    where: { code: { contains: '-G9' } }
  });

  const grades = await prisma.grade.findMany({
    where: { studentId: { in: students.map(s => s.id) }, month: 'វិច្ឆិកា', year: 2025 }
  });

  console.log(`--- GRADE 9C STUDENTS LISTED BY KHMERNAME ASC ---`);
  students.forEach((st, idx) => {
    const sGrades = grades.filter(g => g.studentId === st.id);
    const sports = sGrades.find(g => g.subjectId === subjects.find(s => s.code === 'SPORTS-G9')?.id)?.score ?? 'MISSING';
    const agri = sGrades.find(g => g.subjectId === subjects.find(s => s.code === 'AGRI-G9')?.id)?.score ?? 'MISSING';
    const ict = sGrades.find(g => g.subjectId === subjects.find(s => s.code === 'ICT-G9')?.id)?.score ?? 'MISSING';
    const hlth = sGrades.find(g => g.subjectId === subjects.find(s => s.code === 'HLTH-G9')?.id)?.score ?? 'MISSING';
    const he = sGrades.find(g => g.subjectId === subjects.find(s => s.code === 'HE-G9')?.id)?.score ?? 'MISSING';
    console.log(`${idx + 1}. [${st.studentId}] ${st.khmerName} | Sports: ${sports} | Agri: ${agri} | ICT: ${ict} | Health: ${hlth} | HE: ${he}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

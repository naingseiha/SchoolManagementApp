import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1500): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      if (attempt === retries) throw e;
      if (e?.code === 'P1001' || e?.message?.includes('Can\'t reach database server') || e?.message?.includes('Closed connection')) {
        console.log(`⏳ DB connection lost/timeout during operation (attempt ${attempt}). Reconnecting and retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
        await connectDatabase();
      } else {
        throw e;
      }
    }
  }
  throw new Error('Retries exceeded');
}

async function main() {
  await connectDatabase();
  const classId7b = 'cmiq7zs080003q0jav4gj9wat'; // ថ្នាក់ទី7ខ (G7-ខ)
  const classId7c = 'cmiq7zsqx0005q0jatgouva40'; // ថ្នាក់ទី7គ (G7-គ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log('--- RESTORING STUDENT [25070110] ស្វាយ កិត្យារឹទ្ធ BACK TO HIS ORIGINAL CLASS (G7-គ) ---');
  const st110 = await withRetry(() => prisma.student.findUnique({ where: { studentId: '25070110' } }));
  if (st110 && st110.classId !== classId7c) {
    await withRetry(() => prisma.student.update({
      where: { id: st110.id },
      data: { classId: classId7c }
    }));
    console.log(`✅ Student [25070110] restored back to classId=${classId7c} (G7-គ)`);
  } else {
    console.log(`ℹ️ Student [25070110] is already in classId=${st110?.classId}`);
  }

  // Delete any grades or summary created under G7-ខ for 25070110 so his G7-ខ record is cleaned up
  if (st110) {
    const deletedGrades = await withRetry(() => prisma.grade.deleteMany({
      where: {
        studentId: st110.id,
        classId: classId7b,
        month,
        year
      }
    }));
    const deletedSummaries = await withRetry(() => prisma.studentMonthlySummary.deleteMany({
      where: {
        studentId: st110.id,
        classId: classId7b,
        month,
        year
      }
    }));
    if (deletedGrades.count > 0 || deletedSummaries.count > 0) {
      console.log(`✅ Cleaned up ${deletedGrades.count} grades and ${deletedSummaries.count} summaries created under G7-ខ for 25070110`);
    }
  }

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES & RANKS FOR CLASS 7ខ ---');
  const students7b = await withRetry(() => prisma.student.findMany({
    where: { classId: classId7b }
  }));
  let count7b = 0;
  for (const st of students7b) {
    const count = await withRetry(() => prisma.grade.count({
      where: { studentId: st.id, classId: classId7b, month, year }
    }));
    if (count > 0) {
      await withRetry(() => GradeCalculationService.calculateMonthlySummary(st.id, classId7b, month, 11, year));
      count7b++;
    }
  }
  await withRetry(() => GradeCalculationService.calculateClassRanks(classId7b, month, year));
  console.log(`✅ Class 7ខ summaries (${count7b} students) and ranks updated successfully!`);

  console.log('\n--- RECALCULATING RANKS FOR CLASS 7គ (to ensure 100% clean state after restoring 25070110) ---');
  if (st110) {
    const c7c = await withRetry(() => prisma.grade.count({
      where: { studentId: st110.id, classId: classId7c, month, year }
    }));
    if (c7c > 0) {
      await withRetry(() => GradeCalculationService.calculateMonthlySummary(st110.id, classId7c, month, 11, year));
    }
  }
  await withRetry(() => GradeCalculationService.calculateClassRanks(classId7c, month, year));
  console.log('✅ Class 7គ ranks verified/updated successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

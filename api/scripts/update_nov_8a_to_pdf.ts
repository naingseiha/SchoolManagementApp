import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25080001', name: 'កាន កាលីន', scores: [0, 0, 25, 35, 35, 0, 0, 0, 25, 0, 0, 45, 0, 0, 0, 20] },
  { no: '0002', studentId: '25080002', name: 'កែវ សុគុណអាលីស្សា', scores: [45, 19, 42, 40, 40, 45, 2, 7, 10, 43, 31, 45, 30, 45, 45, 40] },
  { no: '0003', studentId: '25080003', name: 'ខឿត សំណាង', scores: [5, 10, 46, 35, 35, 60, 6, 9, 30, 45, 24, 45, 12, 45, 45, 40] },
  { no: '0004', studentId: '25080004', name: 'គង់ សុជាតា', scores: [57, 20, 49, 30, 50, 75, 20, 11, 45, 48, 40, 45, 35, 45, 50, 40] },
  { no: '0005', studentId: '25080005', name: 'ឃឿន យូរី', scores: [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 50, 40] },
  { no: '0006', studentId: '25080006', name: 'ង៉ិក រាក់សា', scores: [43, 20, 42, 48, 48, 65, 30, 13, 48, 43, 43, 45, 18, 45, 25, 40] },
  { no: '0007', studentId: '25080007', name: 'ចាន់ សុណាត', scores: [57, 15, 44, 50, 50, 53, 10, 18, 25, 48, 30, 45, 30, 45, 50, 40] },
  { no: '0008', studentId: '25080008', name: 'ចាន់ សូលីកា', scores: [60, 32, 46, 49, 45, 60, 30, 23, 48, 45, 48, 45, 40, 45, 50, 40] },
  { no: '0009', studentId: '25080009', name: 'ឆៃអំុិន ជិនតាវ', scores: [59, 15, 39, 50, 50, 80, 20, 19, 48, 47, 38, 45, 28, 45, 50, 40] },
  { no: '0010', studentId: '25080010', name: 'ជា សុណា', scores: [35, 9, 44, 45, 45, 48, 30, 4, 25, 30, 34, 45, 19, 45, 50, 40] },
  { no: '0011', studentId: '25080011', name: 'ឈង់ ឆានុន', scores: [45, 12, 42, 50, 50, 79, 20, 10, 25, 45, 44, 45, 25, 45, 50, 40] },
  { no: '0012', studentId: '25080063', name: 'ឈឿម សុខបញ្ញា', scores: [60, 33, 39, 50, 50, 80, 11, 40, 30, 48, 48, 45, 28, 40, 50, 40] },
  { no: '0013', studentId: '25080012', name: 'ឌុល រ៉ាដូ', scores: [36, 18, 43, 48, 48, 70, 20, 12, 48, 30, 30, 45, 23, 45, 50, 30] },
  { no: '0014', studentId: '25080013', name: 'ណាន សារ៉ាមន', scores: [40, 19, 45, 48, 48, 40, 30, 8, 10, 45, 33, 45, 18, 45, 25, 40] },
  { no: '0015', studentId: '25080014', name: 'ណៃ វិឆៃ', scores: [16, 14, 36, 48, 48, 50, 30, 8, 25, 47, 41, 45, 0, 45, 25, 30] },
  { no: '0016', studentId: '25080015', name: 'តាន់ កុលបុត្រ', scores: [40, 17, 37, 47, 47, 40, 2, 17, 10, 47, 48, 45, 15, 45, 50, 40] },
  { no: '0017', studentId: '25080016', name: 'តុល សុលីតា', scores: [42, 15, 40, 20, 20, 55, 4, 9, 25, 47, 31, 45, 14, 45, 47, 50] },
  { no: '0018', studentId: '25080017', name: 'ថន សុវណ្ណកញ្ចនា', scores: [53, 19, 46, 50, 50, 80, 29, 12, 25, 43, 47, 45, 23, 45, 25, 40] },
  { no: '0019', studentId: '25080018', name: 'ទិព្វ វណ្ណឌី', scores: [44, 18, 41, 50, 50, 75, 18, 15, 45, 48, 39, 45, 14, 45, 50, 40] },
  { no: '0020', studentId: '25080019', name: 'ធឿន ស្រីមុំ', scores: [60, 30, 45, 49, 49, 80, 20, 26, 35, 48, 39, 45, 40, 45, 50, 40] },
  { no: '0021', studentId: '25080020', name: 'និត សុផាន់ណា', scores: [40, 19, 46, 48, 48, 40, 30, 19, 30, 47, 48, 45, 23, 40, 50, 40] },
  { no: '0022', studentId: '25080021', name: 'នី អាលីយ៉ា', scores: [46, 19, 45, 50, 50, 58, 20, 13, 45, 48, 44, 45, 38, 45, 50, 40] },
  { no: '0023', studentId: '25080022', name: 'នឹម ទិត្យថាវរី', scores: [40, 18, 40, 30, 30, 46, 6, 4, 35, 48, 30, 45, 21, 42, 50, 50] },
  { no: '0024', studentId: '25080023', name: 'នឿង សុខានិត្យ', scores: [42, 15, 44, 40, 40, 75, 20, 30, 15, 43, 33, 45, 30, 40, 47, 30] },
  { no: '0025', studentId: '25080024', name: 'ប៉ា រ៉ាឌី', scores: [0, 0, 25, 45, 45, 0, 0, 0, 0, 48, 29, 45, 0, 30, 50, 30] },
  { no: '0026', studentId: '25080025', name: 'ប៉ុន សុភា', scores: [40, 18, 46, 50, 50, 50, 11, 15, 48, 30, 35, 45, 28, 45, 50, 40] },
  { no: '0027', studentId: '25080026', name: 'ប៊ុត ចាន់ទេវី', scores: [49, 18, 45, 30, 30, 80, 4, 27, 25, 45, 32, 45, 37, 45, 50, 40] },
  { no: '0028', studentId: '25080027', name: 'ផុន សុភី', scores: [44, 19, 46, 25, 25, 80, 11, 11, 25, 45, 31, 45, 20, 45, 50, 40] },
  { no: '0029', studentId: '25080028', name: 'ព្រហ្ម សេរីវឌ្ឍនា', scores: [47, 19, 47, 50, 50, 80, 30, 11, 25, 30, 40, 45, 31, 45, 50, 40] },
  { no: '0030', studentId: '25080029', name: 'ព្រីង ប្រប', scores: [40, 11, 46, 0, 0, 60, 2, 11, 25, 48, 35, 45, 18, 45, 50, 40] },
  { no: '0031', studentId: '25080030', name: 'ភុន ស្រីណាក់', scores: [40, 16, 46, 40, 40, 85, 11, 11, 25, 45, 34, 45, 22, 45, 50, 40] },
  { no: '0032', studentId: '25080031', name: 'មេន ស្រីមុំ', scores: [60, 25, 44, 30, 30, 80, 3, 12, 48, 48, 31, 45, 20, 45, 50, 40] },
  { no: '0033', studentId: '25080032', name: 'យឿន យូរី', scores: [40, 18, 39, 50, 50, 68, 0, 16, 48, 47, 37, 45, 14, 45, 0, 40] },
  { no: '0034', studentId: '25080033', name: 'រ៉ន មីលា', scores: [46, 18, 25, 10, 10, 40, 0, 9, 25, 43, 26, 45, 31, 0, 50, 40] },
  { no: '0035', studentId: '25080034', name: 'រ៉ា ឧត្តម', scores: [30, 0, 43, 50, 50, 74, 11, 0, 25, 30, 27, 45, 0, 0, 47, 40] },
  { no: '0036', studentId: '25080035', name: 'រ៉ាន បញ្ញា', scores: [40, 16, 45, 0, 0, 70, 20, 8, 25, 30, 27, 45, 30, 45, 50, 40] },
  { no: '0037', studentId: '25080036', name: 'រ៉ាយ លីនរតនៈ', scores: [8, 18, 41, 45, 45, 70, 20, 30, 48, 48, 31, 45, 19, 45, 50, 40] },
  { no: '0038', studentId: '25080037', name: 'រ៉េត សុវណ្ណារាជ', scores: [40, 14, 40, 45, 45, 45, 20, 9, 25, 45, 38, 45, 23, 45, 50, 40] },
  { no: '0039', studentId: '25080038', name: 'រុំ ស៊ីណាត', scores: [45, 19, 44, 50, 50, 80, 11, 7, 48, 47, 46, 45, 25, 42, 50, 50] },
  { no: '0040', studentId: '25080039', name: 'រឿន ភារុណ', scores: [0, 0, 40, 45, 45, 0, 11, 0, 0, 0, 0, 45, 0, 0, 25, 30] },
  { no: '0041', studentId: '25080040', name: 'លឿន ចំរ៉ុង', scores: [35, 16, 40, 50, 50, 43, 19, 1, 25, 48, 31, 45, 19, 42, 50, 40] },
  { no: '0042', studentId: '25080041', name: 'វណ្ណ សុភារក្ស', scores: [59, 19, 44, 48, 48, 64, 30, 13, 25, 45, 37, 45, 22, 45, 50, 40] },
  { no: '0043', studentId: '25080042', name: 'វ៉ាត ចន', scores: [43, 19, 40, 50, 50, 81, 20, 26, 25, 45, 33, 45, 19, 42, 25, 40] },
  { no: '0044', studentId: '25080043', name: 'វ៉ែន ពិសិដ្ឋបញ្ញា', scores: [49, 17, 16, 30, 30, 70, 25, 11, 48, 47, 40, 45, 23, 45, 50, 40] },
  { no: '0045', studentId: '25080044', name: 'វិចិត្រ រស្មី', scores: [35, 17, 43, 50, 50, 45, 4, 27, 48, 47, 23, 45, 21, 45, 50, 40] },
  { no: '0046', studentId: '25080045', name: 'វៃ ឆវ័ន្ត', scores: [42, 20, 41, 0, 0, 75, 19, 17, 25, 48, 45, 45, 28, 45, 50, 40] },
  { no: '0047', studentId: '25080046', name: 'សល់ វាស្នា', scores: [43, 16, 45, 50, 50, 82, 20, 22, 25, 45, 27, 45, 22, 45, 50, 40] },
  { no: '0048', studentId: '25080047', name: 'ស៊ិញ វិសារ', scores: [39, 13, 36, 30, 30, 55, 4, 15, 25, 47, 26, 45, 14, 45, 25, 40] },
  { no: '0049', studentId: '25080048', name: 'ស៊ូន វ៉ាយុគ្គ', scores: [46, 10, 38, 50, 50, 48, 20, 38, 25, 48, 36, 45, 19, 45, 50, 40] },
  { no: '0050', studentId: '25080049', name: 'សាក់ លីណា', scores: [6, 19, 42, 50, 50, 35, 4, 13, 48, 47, 29, 45, 17, 45, 50, 40] },
  { no: '0051', studentId: '25080050', name: 'ហុន ហិរណ្យរតនៈ', scores: [41, 18, 44, 48, 48, 50, 3, 31, 48, 47, 47, 45, 20, 45, 50, 40] },
  { no: '0052', studentId: '25080131', name: 'យ៉ាន យ៉ាហួរ', scores: [35, 19, 34, 0, 0, 66, 0, 0, 48, 47, 0, 0, 20, 20, 50, 30] }
];

const subjectCodes = [
  'WRITER-G8', 'WRITING-G8', 'MORAL-G8', 'HIST-G8', 'GEO-G8', 'MATH-G8',
  'PHY-G8', 'CHEM-G8', 'BIO-G8', 'EARTH-G8', 'ENG-G8',
  'HE-G8', 'HLTH-G8', 'SPORTS-G8', 'AGRI-G8', 'ICT-G8'
];

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
  const classId = 'cmiq7zus8000bq0jaz191ad1z'; // ថ្នាក់ទី8ក (G8-ក)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី8ក (${month} ${year}) TO MATCH PDF (NO STUDENT MOVES) ---`);

  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { in: subjectCodes } }
  }));

  const subMap: Record<string, { id: string; nameKh: string; maxScore: number; coefficient: number }> = {};
  for (const s of subjects) {
    subMap[s.code] = {
      id: s.id,
      nameKh: s.nameKh,
      maxScore: s.maxScore,
      coefficient: s.coefficient || 1
    };
  }

  const allStudentIds = pdfData.map(p => p.studentId);
  const students = await withRetry(() => prisma.student.findMany({
    where: { studentId: { in: allStudentIds } }
  }));

  let updatedGradesCount = 0;

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st || st.classId !== classId) {
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 8ក (` + (st ? `is in classId=${st.classId}` : `not in DB`) + `). Skipping per strict instruction!`);
      continue;
    }

    for (let i = 0; i < 16; i++) {
      const code = subjectCodes[i];
      const subInfo = subMap[code];
      const pdfScore = pdfRow.scores[i];

      const existing = await withRetry(() => prisma.grade.findUnique({
        where: {
          studentId_subjectId_classId_month_year: {
            studentId: st.id,
            subjectId: subInfo.id,
            classId,
            month,
            year
          }
        }
      }));

      if (!existing || existing.score !== pdfScore) {
        const weightedScore = GradeCalculationService.calculateWeightedScore(pdfScore, subInfo.coefficient);
        const percentage = GradeCalculationService.calculatePercentage(pdfScore, subInfo.maxScore);

        await withRetry(() => prisma.grade.upsert({
          where: {
            studentId_subjectId_classId_month_year: {
              studentId: st.id,
              subjectId: subInfo.id,
              classId,
              month,
              year
            }
          },
          update: {
            score: pdfScore,
            maxScore: subInfo.maxScore,
            weightedScore,
            percentage
          },
          create: {
            studentId: st.id,
            subjectId: subInfo.id,
            classId,
            month,
            year,
            score: pdfScore,
            maxScore: subInfo.maxScore,
            weightedScore,
            percentage
          }
        }));

        console.log(`✅ Updated [${st.studentId}] ${st.khmerName} -> ${subInfo.nameKh} (${code}): old=${existing ? existing.score : 'MISSING'} -> new=${pdfScore}`);
        updatedGradesCount++;
      }
    }
  }

  console.log(`\n✅ Total individual subject grades updated/created: ${updatedGradesCount}`);

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 8A/8ក ---');
  const allClassStudents = await withRetry(() => prisma.student.findMany({
    where: { classId }
  }));

  let summariesCount = 0;
  for (const st of allClassStudents) {
    const count = await withRetry(() => prisma.grade.count({
      where: { studentId: st.id, classId, month, year }
    }));
    if (count > 0) {
      await withRetry(() => GradeCalculationService.calculateMonthlySummary(st.id, classId, month, 11, year));
      summariesCount++;
    }
  }
  console.log(`✅ Recalculated monthly summaries for ${summariesCount} students.`);

  console.log('\n--- RECALCULATING CLASS RANKS ---');
  await withRetry(() => GradeCalculationService.calculateClassRanks(classId, month, year));
  console.log('✅ Class ranks updated successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

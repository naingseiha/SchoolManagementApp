import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25070001', name: 'កែវ ណាម៉ែន', scores: [30, 20, 15, 24, 40, 31, 15, 22, 25, 35, 34, 28, 17, 45, 25, 30] },
  { no: '0002', studentId: '25070002', name: 'គង់ ចន្ថាស៊ី', scores: [32, 22, 6, 16, 25, 31, 2, 14, 20, 35, 32, 20, 7, 40, 25, 40] },
  { no: '0003', studentId: '25070003', name: 'ចិប ដាលណង', scores: [35, 20, 11, 22, 25, 31, 2, 0, 10, 42, 10, 25, 22, 0, 20, 40] },
  { no: '0004', studentId: '25070004', name: 'ប្ចឹក គីមលាំង', scores: [45, 32, 39, 43, 35, 50, 13, 24, 30, 38, 41, 50, 30, 45, 25, 40] },
  { no: '0005', studentId: '25070005', name: 'លោម អង្គិច', scores: [35, 25, 39, 45, 20, 31, 5, 28, 30, 38, 41, 50, 14, 40, 50, 40] },
  { no: '0006', studentId: '25070006', name: 'ជា ប្េីកា', scores: [47, 25, 20, 50, 25, 50, 13, 20, 30, 35, 45, 40, 29, 45, 50, 30] },
  { no: '0007', studentId: '25070007', name: 'ឈិន ពិេិត', scores: [33, 27, 21, 22, 25, 31, 25, 13, 20, 35, 42, 20, 12, 40, 25, 40] },
  { no: '0008', studentId: '25070008', name: 'លឈឿន រ៉េយ៉ុត្៉េ', scores: [41, 26, 48, 50, 25, 76, 30, 27, 48, 42, 46, 50, 29, 45, 50, 40] },
  { no: '0009', studentId: '25070009', name: 'ណារក្់ រងសី', scores: [45, 26, 46, 39, 25, 66, 28, 37, 48, 42, 46, 50, 35, 40, 25, 40] },
  { no: '0010', studentId: '25070010', name: 'ខ្ណត្ ចន័េទទិររីត្័ន', scores: [53, 34, 40, 50, 40, 50, 25, 40, 48, 38, 48, 50, 37, 45, 25, 40] },
  { no: '0011', studentId: '25070011', name: 'ត្ន់ ចរយាិ', scores: [50, 23, 13, 46, 35, 60, 15, 32, 25, 40, 48, 50, 28, 40, 50, 40] },
  { no: '0012', studentId: '25070012', name: 'ថង េ៉ុីណា', scores: [46, 16, 32, 42, 25, 40, 20, 24, 45, 38, 30, 50, 9, 45, 50, 40] },
  { no: '0013', studentId: '25070013', name: 'ថន េក្ណាខ', scores: [54, 32, 6, 48, 27, 50, 25, 30, 48, 16, 48, 50, 39, 45, 50, 40] },
  { no: '0014', studentId: '25070014', name: 'ថថ េីសា', scores: [48, 28, 5, 34, 35, 50, 25, 28, 48, 16, 38, 50, 33, 45, 50, 40] },
  { no: '0015', studentId: '25070015', name: 'លោង ប្េីភា', scores: [45, 33, 9, 35, 25, 60, 25, 28, 48, 16, 48, 43, 23, 45, 25, 40] },
  { no: '0016', studentId: '25070016', name: 'ធី េីហា', scores: [35, 28, 16, 28, 20, 50, 15, 27, 30, 40, 38, 45, 18, 45, 25, 30] },
  { no: '0017', studentId: '25070017', name: 'លធឿម ណាធីន', scores: [28, 20, 15, 34, 25, 60, 25, 26, 0, 40, 30, 45, 15, 40, 25, 30] },
  { no: '0018', studentId: '25070018', name: 'លនឿង េ៉ុខារូហ្សា', scores: [47, 30, 36, 50, 30, 100, 35, 27, 45, 35, 44, 50, 24, 45, 50, 50] },
  { no: '0019', studentId: '25070019', name: 'រ៉ុន គឹមហាង', scores: [53, 23, 33, 29, 21, 48, 10, 21, 10, 31, 28, 32, 19, 45, 50, 40] },
  { no: '0020', studentId: '25070020', name: 'បាន រ៉ុនត្៉ុង', scores: [23, 0, 0, 26, 30, 50, 12, 10, 25, 48, 10, 20, 6, 40, 25, 40] },
  { no: '0021', studentId: '25070021', name: 'ប្រន េ័កាាណា', scores: [42, 24, 39, 47, 35, 50, 30, 16, 20, 39, 43, 50, 32, 45, 25, 40] },
  { no: '0022', studentId: '25070022', name: 'ប្រុេ រក្ា', scores: [40, 0, 0, 36, 25, 50, 25, 37, 0, 40, 32, 50, 39, 45, 25, 30] },
  { no: '0023', studentId: '25070023', name: 'ផានណា់ អានីសា', scores: [47, 29, 18, 46, 25, 50, 35, 30, 40, 48, 47, 50, 10, 45, 50, 50] },
  { no: '0024', studentId: '25070024', name: 'ែ៉ុន េ៉ុវណណប្តា', scores: [45, 31, 16, 50, 30, 66, 22, 32, 48, 31, 36, 50, 30, 45, 50, 40] },
  { no: '0025', studentId: '25070025', name: 'ប្ពិច េ៉ុម៉េេីន', scores: [43, 28, 15, 46, 40, 38, 5, 30, 30, 40, 25, 50, 27, 45, 25, 40] },
  { no: '0026', studentId: '25070026', name: 'ភាព លភា', scores: [35, 21, 7, 40, 30, 40, 10, 19, 0, 16, 40, 28, 17, 0, 20, 40] },
  { no: '0027', studentId: '25070027', name: 'លឿង នរជយ', scores: [40, 23, 37, 44, 20, 50, 30, 24, 48, 42, 41, 50, 37, 45, 50, 40] },
  { no: '0028', studentId: '25070028', name: 'ម៉េរី េ៉ុខលហ្សង', scores: [48, 38, 43, 46, 30, 50, 15, 33, 48, 31, 40, 50, 42, 40, 50, 40] },
  { no: '0029', studentId: '25070029', name: 'លមៀច េ៉ុរញ្ញា', scores: [44, 32, 17, 43, 30, 31, 13, 1, 45, 16, 31, 50, 17, 45, 50, 40] },
  { no: '0030', studentId: '25070030', name: 'យ៉ុន េក្ណាិខ', scores: [52, 31, 25, 48, 30, 69, 40, 21, 40, 42, 39, 50, 22, 40, 50, 50] },
  { no: '0031', studentId: '25070031', name: 'រ៉េ េ៉ុម៉េយា៉េ', scores: [43, 25, 40, 50, 20, 50, 15, 38, 30, 38, 48, 50, 35, 0, 25, 40] },
  { no: '0032', studentId: '25070032', name: 'រ៉េន់ រត្នះឧត្មតរ', scores: [47, 29, 37, 47, 40, 31, 15, 27, 30, 48, 44, 50, 27, 45, 25, 40] },
  { no: '0033', studentId: '25070033', name: 'លរត្៉េ េ៉ុវណាណរម', scores: [40, 21, 38, 31, 25, 32, 15, 13, 45, 42, 44, 50, 21, 40, 25, 40] },
  { no: '0034', studentId: '25070034', name: 'រទិធ រញ្ញា', scores: [41, 26, 21, 39, 30, 75, 30, 27, 30, 39, 43, 50, 12, 45, 25, 40] },
  { no: '0035', studentId: '25070035', name: 'រទិធ េ៉ុរញ្ញា', scores: [45, 27, 19, 50, 40, 50, 30, 36, 48, 48, 44, 50, 25, 45, 25, 40] },
  { no: '0036', studentId: '25070036', name: 'លន លក្េរក្ូេលលៅល ៀ', scores: [58, 31, 42, 49, 20, 50, 15, 35, 35, 38, 48, 50, 38, 45, 25, 40] },
  { no: '0037', studentId: '25070037', name: 'លន អរសរក្ូេក្លៅរៀ', scores: [55, 31, 48, 50, 25, 50, 13, 28, 35, 38, 42, 50, 27, 45, 25, 40] },
  { no: '0038', studentId: '25070038', name: 'េី ជីចឹង', scores: [20, 11, 17, 18, 20, 31, 30, 16, 10, 35, 30, 20, 8, 40, 25, 40] },
  { no: '0039', studentId: '25070039', name: 'េីម េងួវសាិេ', scores: [37, 22, 23, 15, 20, 50, 30, 29, 25, 48, 43, 30, 16, 40, 25, 40] },
  { no: '0040', studentId: '25070040', name: 'េឹ ម េ៉ុវណណវមិន', scores: [49, 34, 41, 50, 45, 50, 15, 26, 48, 39, 46, 50, 33, 45, 25, 40] },
  { no: '0041', studentId: '25070041', name: 'េឹ ម េូនីកា', scores: [43, 22, 70, 48, 35, 31, 15, 18, 30, 40, 40, 50, 26, 45, 25, 40] },
  { no: '0042', studentId: '25070042', name: 'វន៉េ កាញ់ចន្ថ', scores: [50, 29, 42, 50, 35, 50, 30, 36, 48, 16, 25, 50, 50, 45, 25, 40] },
  { no: '0043', studentId: '25070043', name: 'ខ្វន៉េ េ៉ុរយាិ', scores: [54, 28, 33, 46, 40, 50, 40, 23, 45, 39, 45, 50, 34, 40, 25, 40] },
  { no: '0044', studentId: '25070044', name: 'វចិិប្ត្ រក្ា', scores: [46, 22, 29, 17, 20, 32, 15, 15, 40, 31, 27, 50, 18, 0, 25, 40] },
  { no: '0045', studentId: '25070045', name: 'វ ី ធារ៉េ', scores: [48, 28, 25, 39, 40, 50, 10, 25, 30, 31, 40, 50, 24, 45, 50, 40] },
  { no: '0046', studentId: '25070046', name: 'វ ី វ៉ុន', scores: [40, 18, 5, 26, 40, 31, 15, 3, 45, 16, 23, 33, 5, 45, 25, 40] },
  { no: '0047', studentId: '25070047', name: 'វន័ េ៉ុវណណោ', scores: [59, 36, 40, 50, 40, 95, 30, 41, 48, 31, 45, 50, 50, 45, 50, 40] },
  { no: '0048', studentId: '25070048', name: 'សា ន់ រ៉ុន ណា រ ី', scores: [49, 23, 10, 46, 35, 35, 15, 22, 45, 40, 40, 50, 26, 45, 25, 40] },
  { no: '0049', studentId: '25070049', name: 'េ៉ុក្ ដាណា', scores: [38, 21, 18, 20, 40, 50, 22, 24, 25, 40, 40, 37, 10, 0, 25, 40] },
  { no: '0050', studentId: '25070050', name: 'េ៉ុេណ័ឌ វាន្ថ', scores: [25, 8, 5, 19, 20, 35, 25, 1, 30, 48, 25, 29, 5, 45, 25, 40] },
  { no: '0051', studentId: '25070051', name: 'េួ រ រក្ា', scores: [60, 31, 20, 35, 32, 40, 25, 32, 48, 31, 40, 50, 50, 40, 25, 50] },
  { no: '0052', studentId: '25070052', name: 'លេង ហ្ស៉ុងគីម', scores: [5, 24, 48, 45, 30, 50, 15, 24, 48, 39, 25, 50, 6, 45, 25, 50] },
  { no: '0053', studentId: '25070053', name: 'ខ្េ លនសា', scores: [52, 31, 46, 46, 30, 50, 15, 24, 30, 39, 44, 50, 16, 45, 25, 40] },
  { no: '0054', studentId: '25070054', name: 'េាំណាង រេីែ', scores: [48, 16, 40, 18, 30, 48, 15, 12, 45, 39, 30, 50, 8, 45, 25, 40] },
  { no: '0055', studentId: '25070055', name: 'ហា ង េីឡា', scores: [50, 32, 25, 49, 27, 95, 15, 29, 48, 31, 45, 50, 35, 40, 50, 40] },
  { no: '0056', studentId: '25070056', name: 'ហ្ស៉ុក្ ម៉េរ៉េ ី', scores: [43, 19, 33, 46, 30, 42, 25, 20, 48, 42, 30, 44, 22, 40, 25, 40] },
  { no: '0057', studentId: '25070057', name: 'លហ្សង រក្ា', scores: [40, 22, 15, 46, 30, 48, 15, 13, 25, 35, 35, 50, 23, 40, 25, 50] },
  { no: '0058', studentId: '25070058', name: 'ថហ្សសា ងអ៉ុី', scores: [42, 31, 29, 50, 35, 100, 35, 30, 30, 35, 44, 50, 34, 45, 50, 40] },
  { no: '0059', studentId: '25070059', name: 'ឡាយ េ៉ុេីន', scores: [42, 22, 7, 35, 27, 31, 30, 21, 0, 16, 35, 28, 17, 0, 20, 50] }
];

const subjectCodes = [
  'WRITER-G7', 'WRITING-G7', 'MORAL-G7', 'HIST-G7', 'GEO-G7', 'MATH-G7',
  'PHY-G7', 'CHEM-G7', 'BIO-G7', 'EARTH-G7', 'ENG-G7',
  'HE-G7', 'HLTH-G7', 'SPORTS-G7', 'AGRI-G7', 'ICT-G7'
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
  const classId = 'cmiq7zr9e0001q0ja25clx0sy'; // ថ្នាក់ទី7ក
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី7ក (${month} ${year}) TO MATCH PDF ---`);

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

  const students = await withRetry(() => prisma.student.findMany({
    where: { classId }
  }));

  let updatedGradesCount = 0;

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) continue;

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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL STUDENTS IN CLASS ---');
  let summariesCount = 0;
  for (const st of students) {
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

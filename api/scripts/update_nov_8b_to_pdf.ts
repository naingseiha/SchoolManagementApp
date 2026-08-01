import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25080051', name: 'កេត បូរ៉ាមី', scores: [45, 20, 46, 49, 30, 80, 40, 28, 48, 45, 48, 42, 30, 45, 50, 0] },
  { no: '0002', studentId: '25080052', name: 'គាង ម៉េងហួ', scores: [55, 18, 28, 49, 25, 70, 2, 28, 48, 50, 41, 48, 42, 45, 50, 0] },
  { no: '0003', studentId: '25080053', name: 'គ្រី រចនា', scores: [43, 19, 39, 45, 30, 40, 1, 12, 35, 35, 40, 41, 44, 45, 50, 0] },
  { no: '0004', studentId: '25080054', name: 'គ្រុយ រ៉ាយុត', scores: [35, 18, 44, 36, 25, 70, 1, 3, 48, 25, 33, 50, 36, 45, 45, 0] },
  { no: '0005', studentId: '25080055', name: 'ឆយ ថាវារៈដុះដាល', scores: [60, 18, 45, 48, 50, 75, 10, 34, 48, 45, 46, 50, 29, 45, 50, 0] },
  { no: '0006', studentId: '25080056', name: 'ឆេត សុវណ្ណារ៉ា', scores: [44, 12, 28, 8, 30, 45, 1, 14, 0, 50, 27, 50, 16, 45, 50, 0] },
  { no: '0007', studentId: '25080057', name: 'ឆោមសុវណ្ណ ភូវង្ស', scores: [35, 20, 41, 35, 30, 90, 20, 17, 48, 45, 38, 50, 18, 30, 50, 0] },
  { no: '0008', studentId: '25080059', name: 'ជា មួយលី', scores: [35, 19, 28, 46, 30, 45, 1, 2, 0, 38, 35, 38, 30, 40, 50, 0] },
  { no: '0009', studentId: '25080060', name: 'ជា សុណេត', scores: [35, 3, 29, 23, 30, 55, 1, 3, 25, 25, 33, 38, 21, 45, 50, 0] },
  { no: '0010', studentId: '25080061', name: 'ជឺ ចន្ធូ', scores: [60, 27, 42, 49, 50, 40, 10, 27, 48, 45, 41, 50, 34, 45, 50, 0] },
  { no: '0011', studentId: '25080062', name: 'ជួប ករុណា', scores: [5, 16, 31, 17, 25, 50, 1, 11, 20, 50, 29, 43, 10, 30, 50, 0] },
  { no: '0012', studentId: '25080058', name: 'ជ័យ វីចិត្រ', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { no: '0013', studentId: '25080064', name: 'ឌី ឧត្តម', scores: [5, 11, 38, 23, 25, 60, 20, 1, 48, 50, 31, 0, 5, 45, 25, 0] },
  { no: '0014', studentId: '25080065', name: 'តាន់ សក្ខិណា', scores: [17, 18, 43, 37, 30, 90, 30, 19, 0, 38, 46, 40, 36, 40, 50, 0] },
  { no: '0015', studentId: '25080066', name: 'ទិន សិរីវឌ្ឍៈ', scores: [35, 16, 43, 44, 45, 30, 10, 1, 25, 45, 39, 50, 29, 30, 45, 0] },
  { no: '0016', studentId: '25080067', name: 'នី វណ្ណៈ', scores: [40, 19, 18, 29, 30, 60, 1, 20, 25, 50, 44, 0, 36, 45, 45, 0] },
  { no: '0017', studentId: '25080068', name: 'នឿន រក្សា', scores: [60, 23, 42, 48, 30, 50, 10, 21, 25, 30, 50, 50, 50, 40, 50, 0] },
  { no: '0018', studentId: '25080070', name: 'ប៉ាន វ៉ាន់ឈិក', scores: [60, 29, 41, 48, 30, 60, 10, 20, 15, 50, 50, 50, 42, 45, 50, 0] },
  { no: '0019', studentId: '25080069', name: 'បាកាន រតនៈដាវី', scores: [60, 30, 40, 49, 30, 35, 2, 19, 48, 45, 50, 43, 50, 30, 50, 0] },
  { no: '0020', studentId: '25080071', name: 'បឿន លីហុង', scores: [40, 5, 44, 16, 0, 70, 1, 0, 40, 35, 25, 50, 15, 20, 25, 0] },
  { no: '0021', studentId: '25080072', name: 'ប្រន វិជ្ជាតី', scores: [60, 40, 40, 48, 30, 95, 1, 33, 48, 45, 50, 48, 41, 45, 30, 0] },
  { no: '0022', studentId: '25080073', name: 'ប្រាជ្ញ សុចិន្តា', scores: [28, 19, 41, 49, 50, 40, 10, 17, 48, 45, 38, 0, 39, 45, 50, 0] },
  { no: '0023', studentId: '25080074', name: 'ផល ឈីនឆេងហាក់', scores: [60, 32, 45, 50, 40, 80, 30, 50, 48, 50, 50, 50, 49, 45, 50, 0] },
  { no: '0024', studentId: '25080075', name: 'ផាង សិរីសក្តា', scores: [60, 20, 46, 49, 25, 40, 10, 33, 40, 45, 46, 50, 32, 40, 50, 0] },
  { no: '0025', studentId: '25080076', name: 'ពេជ្រ សុវណ្ណា', scores: [48, 16, 29, 46, 0, 40, 1, 11, 40, 35, 14, 50, 25, 0, 50, 0] },
  { no: '0026', studentId: '25080077', name: 'មន មករា', scores: [35, 17, 41, 15, 30, 60, 10, 6, 25, 25, 27, 47, 17, 30, 40, 0] },
  { no: '0027', studentId: '25080078', name: 'យ៉ាន់ ចន្ថា', scores: [47, 18, 42, 39, 40, 55, 1, 18, 48, 50, 31, 50, 26, 45, 50, 0] },
  { no: '0028', studentId: '25080079', name: 'រ៉ុម ដេវីត', scores: [35, 15, 36, 32, 30, 40, 1, 1, 48, 25, 26, 45, 15, 30, 25, 0] },
  { no: '0029', studentId: '25080080', name: 'រ៉េត វិច្ឆ័យ', scores: [5, 19, 45, 38, 30, 70, 3, 0, 0, 30, 22, 0, 30, 20, 25, 0] },
  { no: '0030', studentId: '25080082', name: 'វណ្ណូ នរទេពី', scores: [35, 17, 38, 42, 30, 85, 1, 17, 48, 35, 45, 38, 32, 25, 50, 0] },
  { no: '0031', studentId: '25080081', name: 'វណ្ណៈ សិរីភិមាន', scores: [60, 37, 45, 50, 30, 95, 29, 40, 48, 45, 50, 50, 45, 45, 50, 0] },
  { no: '0032', studentId: '25080083', name: 'វ៉ា ផាវិន', scores: [40, 18, 40, 34, 30, 85, 10, 6, 40, 35, 42, 45, 17, 45, 25, 0] },
  { no: '0033', studentId: '25080084', name: 'វ៉ាត សុវណ្ណ', scores: [5, 9, 39, 20, 30, 35, 1, 4, 0, 30, 23, 0, 5, 25, 45, 0] },
  { no: '0034', studentId: '25080087', name: 'សម្បតិ រ៉ានុត', scores: [5, 12, 40, 27, 50, 45, 10, 2, 0, 45, 41, 0, 14, 45, 45, 0] },
  { no: '0035', studentId: '25080086', name: 'ស៊ន់ ចាន់រស្មី', scores: [53, 18, 32, 48, 30, 60, 10, 17, 0, 30, 34, 0, 49, 40, 45, 0] },
  { no: '0036', studentId: '25080088', name: 'ស៊ា សុដាវិន', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0] },
  { no: '0037', studentId: '25080089', name: 'សាន ពិសី', scores: [58, 18, 45, 48, 25, 89, 2, 21, 45, 45, 45, 50, 50, 45, 45, 0] },
  { no: '0038', studentId: '25080090', name: 'សាម៉ុន លឹមហោ', scores: [37, 18, 44, 25, 30, 65, 1, 6, 0, 25, 35, 40, 33, 45, 25, 0] },
  { no: '0039', studentId: '25080091', name: 'សុមី ប៊ុនណារិទ្ធ', scores: [40, 18, 44, 47, 50, 50, 10, 19, 48, 45, 48, 50, 20, 45, 50, 0] },
  { no: '0040', studentId: '25080092', name: 'សួន គឹមសាន', scores: [12, 12, 21, 32, 35, 55, 20, 14, 48, 38, 36, 38, 0, 45, 50, 0] },
  { no: '0041', studentId: '25080093', name: 'សួន ពិសិដ្ឋ', scores: [35, 17, 41, 41, 30, 87, 11, 14, 40, 35, 44, 43, 12, 45, 50, 0] },
  { no: '0042', studentId: '25080094', name: 'សេក ស្រីពៅ', scores: [50, 19, 38, 49, 30, 90, 10, 20, 45, 35, 35, 50, 48, 45, 50, 0] },
  { no: '0043', studentId: '25080095', name: 'សេង លិងលិង', scores: [56, 19, 43, 47, 45, 70, 10, 19, 45, 38, 47, 50, 45, 45, 50, 0] },
  { no: '0044', studentId: '25080096', name: 'សែត ច័ន្ទរឹទ្ធី', scores: [5, 15, 38, 28, 40, 40, 1, 2, 10, 38, 36, 38, 28, 40, 25, 0] },
  { no: '0045', studentId: '25080097', name: 'ស្រ៊ិន ឈុនលាង', scores: [54, 18, 44, 47, 40, 70, 10, 10, 48, 50, 33, 50, 34, 45, 50, 0] },
  { no: '0046', studentId: '25080098', name: 'ស្រឺន សុវណ្ណ', scores: [40, 14, 45, 22, 30, 65, 10, 16, 25, 30, 38, 50, 18, 45, 50, 0] },
  { no: '0047', studentId: '25080099', name: 'ស្រៀង តុងហ៊ាង', scores: [10, 17, 43, 29, 40, 55, 1, 5, 35, 38, 40, 50, 28, 30, 40, 0] },
  { no: '0048', studentId: '25080085', name: 'សំ សក្ខណា', scores: [40, 16, 39, 26, 30, 70, 1, 14, 25, 50, 38, 48, 27, 40, 50, 0] },
  { no: '0049', studentId: '25080100', name: 'ហន មានហ័រ', scores: [60, 34, 42, 49, 35, 75, 12, 29, 48, 50, 37, 45, 47, 45, 50, 0] },
  { no: '0050', studentId: '25080103', name: 'ហ៊ុន ប៊ុនលាភ', scores: [40, 19, 41, 45, 25, 60, 1, 27, 48, 25, 44, 50, 32, 45, 50, 0] },
  { no: '0051', studentId: '25080104', name: 'ហ៊ុន សុធារី', scores: [57, 19, 47, 31, 40, 73, 10, 42, 48, 45, 48, 50, 38, 45, 50, 0] },
  { no: '0052', studentId: '25080101', name: 'ហាន ហាក់រតនៈភូមី', scores: [60, 39, 39, 49, 50, 70, 10, 38, 48, 45, 47, 50, 46, 45, 50, 0] },
  { no: '0053', studentId: '25080102', name: 'ហុង ម៉េងទូ', scores: [35, 13, 43, 34, 25, 60, 3, 0, 20, 30, 38, 50, 0, 45, 25, 0] },
  { no: '0054', studentId: '25080105', name: 'ហែប ចិន្តា', scores: [52, 18, 42, 40, 30, 55, 1, 34, 48, 50, 45, 40, 32, 45, 50, 0] },
  { no: '0055', studentId: '25080106', name: 'អាន និមល', scores: [60, 40, 46, 50, 50, 95, 30, 43, 48, 45, 49, 50, 50, 45, 50, 0] }
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
  const classId = 'cmiq7zvab000dq0jaz5sltz3k'; // ថ្នាក់ទី8ខ (G8-ខ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី8ខ (${month} ${year}) TO MATCH PDF (NO STUDENT MOVES) ---`);

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
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 8ខ (` + (st ? `is in classId=${st.classId}` : `not in DB`) + `). Skipping per strict instruction!`);
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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 8B/8ខ ---');
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

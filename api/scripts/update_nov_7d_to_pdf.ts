import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25070164', name: 'កឹង នីសា', scores: [33, 35, 10, 18, 25, 43, 1, 35, 35, 40, 15, 50, 6, 45, 35, 0] },
  { no: '0002', studentId: '25070165', name: 'កែវ រស្មី', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { no: '0003', studentId: '25070166', name: 'គុណ សុកញ្ចៈនាថ', scores: [30, 35, 17, 12, 27, 45, 1, 31, 48, 25, 34, 50, 8, 45, 35, 0] },
  { no: '0004', studentId: '25070167', name: 'គ្រួច សកុលកណ្ណិកា', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { no: '0005', studentId: '25070168', name: 'ឃីម បញ្ញារិទ្ធិ', scores: [38, 25, 15, 36, 30, 28, 1, 22, 48, 40, 32, 32, 2, 15, 20, 0] },
  { no: '0006', studentId: '25070169', name: 'ង៉ិក ចំរើន', scores: [32, 0, 5, 39, 30, 29, 1, 27, 10, 35, 15, 0, 4, 45, 50, 0] },
  { no: '0007', studentId: '25070170', name: 'ចោម លីហួ', scores: [22, 35, 6, 30, 0, 45, 1, 25, 0, 40, 15, 0, 4, 15, 0, 0] },
  { no: '0008', studentId: '25070171', name: 'ចំរ៉ុង បូរី', scores: [30, 25, 25, 20, 40, 44, 1, 32, 10, 40, 20, 25, 5, 35, 50, 0] },
  { no: '0009', studentId: '25070172', name: 'ចំរ៉ុង សោភារ', scores: [15, 25, 14, 19, 30, 29, 1, 19, 25, 25, 36, 25, 5, 35, 20, 0] },
  { no: '0010', studentId: '25070173', name: 'ចំរើន ដាវីន', scores: [37, 35, 50, 34, 35, 63, 12, 40, 45, 40, 15, 50, 10, 45, 35, 0] },
  { no: '0011', studentId: '25070174', name: 'ចំរើន ស៊ុនណារ៉ុង', scores: [30, 25, 12, 28, 30, 31, 1, 29, 25, 40, 15, 0, 2, 30, 20, 0] },
  { no: '0012', studentId: '25070175', name: 'ជា ចិន្តា', scores: [35, 35, 48, 18, 30, 55, 1, 30, 35, 40, 49, 50, 18, 45, 50, 0] },
  { no: '0013', studentId: '25070176', name: 'ជាតិ ម៉ាគីណា', scores: [40, 35, 17, 40, 30, 32, 1, 36, 48, 23, 18, 44, 25, 40, 35, 0] },
  { no: '0014', studentId: '25070177', name: 'ជាតិ ឡាយហ្វុង', scores: [30, 35, 9, 6, 40, 10, 1, 26, 48, 35, 15, 0, 18, 45, 50, 0] },
  { no: '0015', studentId: '25070178', name: 'ឈាត មករា', scores: [10, 0, 6, 0, 0, 10, 1, 0, 0, 23, 0, 0, 2, 0, 0, 0] },
  { no: '0016', studentId: '25070179', name: 'ឈុន ម៉ាន់ទី', scores: [0, 0, 0, 0, 0, 0, 1, 0, 0, 23, 0, 0, 2, 0, 20, 0] },
  { no: '0017', studentId: '25070180', name: 'ញ៉ាញ់ វិញាណ', scores: [22, 25, 11, 8, 30, 29, 1, 30, 25, 35, 15, 28, 3, 45, 50, 0] },
  { no: '0018', studentId: '25070181', name: 'ដួងច័ន្ទ រតនៈឆ័យ', scores: [18, 35, 6, 11, 10, 35, 1, 32, 10, 25, 18, 23, 10, 45, 50, 0] },
  { no: '0019', studentId: '25070182', name: 'ថា ចាន់ឌី', scores: [38, 35, 41, 27, 50, 55, 1, 32, 48, 28, 44, 50, 20, 45, 50, 0] },
  { no: '0020', studentId: '25070183', name: 'ថេង ប៊ុនឃ្លាំង', scores: [20, 25, 10, 7, 40, 28, 1, 23, 45, 40, 46, 49, 7, 40, 50, 0] },
  { no: '0021', studentId: '25070184', name: 'ថៃ ស៊ីណា', scores: [25, 0, 31, 0, 0, 30, 1, 0, 0, 40, 0, 0, 10, 0, 0, 0] },
  { no: '0022', studentId: '25070185', name: 'ទុំ រក្សា', scores: [33, 0, 11, 15, 35, 23, 1, 25, 30, 23, 15, 0, 0, 0, 0, 0] },
  { no: '0023', studentId: '25070186', name: 'ប៉ា មេសា', scores: [18, 25, 5, 27, 15, 39, 1, 23, 30, 23, 45, 25, 6, 0, 35, 0] },
  { no: '0024', studentId: '25070187', name: 'ប៊ុត ជុងលិ', scores: [20, 0, 20, 11, 30, 27, 0, 7, 10, 33, 15, 0, 0, 35, 35, 0] },
  { no: '0025', studentId: '25070188', name: 'បូរ តារា', scores: [22, 25, 13, 7, 40, 64, 1, 22, 48, 40, 45, 0, 5, 45, 50, 0] },
  { no: '0026', studentId: '25070189', name: 'ផ សុភ័ណ្ឌ', scores: [30, 0, 11, 7, 25, 20, 1, 0, 10, 35, 0, 50, 20, 45, 50, 0] },
  { no: '0027', studentId: '25070190', name: 'ផៃ ផាន់ណាត់', scores: [33, 0, 5, 32, 40, 56, 1, 24, 35, 35, 30, 0, 3, 45, 50, 0] },
  { no: '0028', studentId: '25070191', name: 'ពា ចាប', scores: [15, 25, 7, 10, 30, 57, 1, 13, 48, 35, 45, 0, 3, 35, 35, 0] },
  { no: '0029', studentId: '25070192', name: 'ពិសិដ្ឋ ឫទ្ធីសែន', scores: [17, 35, 16, 43, 30, 33, 1, 24, 45, 40, 16, 50, 2, 45, 50, 0] },
  { no: '0030', studentId: '25070193', name: 'ភី សុផាន់ណា', scores: [15, 0, 35, 16, 30, 22, 0, 15, 48, 40, 19, 0, 3, 15, 50, 0] },
  { no: '0031', studentId: '25070194', name: 'ភឿន សារ៉ែម', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0] },
  { no: '0032', studentId: '25070195', name: 'ម៉ាន់ ចាន់គ្រឹះហ្វា', scores: [40, 35, 42, 27, 27, 15, 1, 24, 48, 33, 45, 30, 2, 45, 35, 0] },
  { no: '0033', studentId: '25070196', name: 'មី សារិន', scores: [40, 35, 50, 39, 50, 48, 1, 34, 48, 35, 15, 50, 5, 45, 35, 0] },
  { no: '0034', studentId: '25070197', name: 'រស់ រស្មី', scores: [38, 35, 22, 18, 27, 35, 10, 24, 48, 25, 45, 0, 11, 45, 50, 0] },
  { no: '0035', studentId: '25070198', name: 'លី ម៉េងហ័ង', scores: [30, 35, 20, 7, 30, 55, 2, 0, 48, 25, 29, 42, 6, 45, 50, 0] },
  { no: '0036', studentId: '25070199', name: 'លី សុផាន់ណា', scores: [28, 25, 15, 14, 27, 35, 1, 12, 10, 25, 37, 20, 2, 40, 50, 0] },
  { no: '0037', studentId: '25070200', name: 'លឹម សុខហេង', scores: [15, 25, 10, 10, 15, 0, 1, 0, 10, 0, 37, 25, 0, 15, 35, 0] },
  { no: '0038', studentId: '25070201', name: 'លឹម សៀងហៃ', scores: [32, 28, 44, 6, 40, 48, 1, 19, 10, 40, 36, 50, 8, 45, 50, 0] },
  { no: '0039', studentId: '25070202', name: 'វ៉ាត សុវណ្ណគង្គា', scores: [33, 35, 45, 44, 40, 30, 1, 37, 45, 28, 49, 50, 10, 35, 20, 0] },
  { no: '0040', studentId: '25070203', name: 'វារៈ ពិសី', scores: [22, 35, 10, 5, 0, 15, 1, 20, 0, 28, 15, 0, 5, 0, 20, 0] },
  { no: '0041', studentId: '25070204', name: 'វុធ ឆវ័ន្ត', scores: [38, 29, 21, 15, 27, 50, 1, 14, 15, 33, 15, 50, 2, 45, 50, 0] },
  { no: '0042', studentId: '25070205', name: 'ស៊ង់ សម្បត្តិ', scores: [33, 25, 48, 32, 25, 43, 1, 9, 15, 33, 40, 50, 3, 45, 50, 0] },
  { no: '0043', studentId: '25070206', name: 'ស៊ាន សុភី', scores: [15, 35, 5, 0, 40, 20, 1, 20, 48, 28, 0, 50, 3, 45, 50, 0] },
  { no: '0044', studentId: '25070207', name: 'សាន់ រីណា', scores: [25, 35, 10, 6, 30, 25, 1, 0, 30, 28, 25, 50, 1, 40, 50, 0] },
  { no: '0045', studentId: '25070208', name: 'សិទ្ធ យិង', scores: [20, 25, 15, 15, 30, 35, 1, 0, 10, 28, 15, 0, 0, 30, 50, 0] },
  { no: '0046', studentId: '25070209', name: 'សិម នីសា', scores: [30, 35, 39, 16, 25, 66, 1, 28, 35, 40, 47, 50, 5, 45, 50, 0] },
  { no: '0047', studentId: '25070210', name: 'សី វិសាល', scores: [33, 35, 6, 37, 10, 33, 1, 36, 48, 23, 43, 50, 13, 15, 50, 0] },
  { no: '0048', studentId: '25070211', name: 'សុខ ភីលីប', scores: [30, 0, 23, 8, 25, 23, 1, 25, 25, 33, 15, 25, 5, 30, 50, 0] },
  { no: '0049', studentId: '25070212', name: 'សុខ លីន', scores: [25, 25, 7, 7, 10, 33, 0, 0, 15, 0, 15, 0, 3, 0, 0, 0] },
  { no: '0050', studentId: '25070213', name: 'សុធន វឌ្ឍនា', scores: [38, 33, 5, 28, 25, 28, 1, 19, 48, 40, 46, 50, 6, 35, 35, 0] },
  { no: '0051', studentId: '25070214', name: 'សូល វិមហារាជសី', scores: [25, 35, 7, 10, 15, 36, 1, 20, 15, 40, 36, 50, 2, 45, 35, 0] },
  { no: '0052', studentId: '25070215', name: 'សេត ស្រីណេ', scores: [37, 35, 5, 13, 27, 36, 1, 42, 48, 28, 27, 30, 10, 45, 50, 0] },
  { no: '0053', studentId: '25070216', name: 'សោម ចាន់ណា', scores: [18, 35, 15, 30, 27, 20, 1, 27, 45, 0, 15, 38, 2, 45, 50, 0] },
  { no: '0054', studentId: '25070217', name: 'ហាវ នីតា', scores: [35, 35, 50, 28, 40, 67, 37, 45, 30, 28, 49, 50, 15, 45, 50, 0] },
  { no: '0055', studentId: '25070218', name: 'ហេង ឡៃហៀង', scores: [40, 35, 41, 20, 30, 52, 38, 28, 48, 25, 27, 50, 8, 45, 50, 0] },
  { no: '0056', studentId: '25070219', name: 'ឡា សុចាន់តុលា', scores: [0, 0, 0, 8, 0, 0, 1, 0, 0, 0, 15, 0, 0, 0, 20, 0] }
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
  const classId = 'cmiq7zthb0007q0ja8fed8leq'; // ថ្នាក់ទី7ឃ (G7-ឃ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី7ឃ (${month} ${year}) TO MATCH PDF (NO STUDENT MOVES) ---`);

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
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 7ឃ (` + (st ? `is in classId=${st.classId}` : `not in DB`) + `). Skipping per strict instruction!`);
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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 7D/7ឃ ---');
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

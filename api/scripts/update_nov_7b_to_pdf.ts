import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25070060', name: 'កាត់ កឿន', scores: [45, 25, 23, 38, 35, 31, 13, 44, 25, 45, 38, 30, 8, 40, 50, 0] },
  { no: '0002', studentId: '25070061', name: 'ខុន អារ៉ាខា', scores: [20, 16, 11, 44, 20, 38, 20, 27, 45, 45, 45, 26, 6, 45, 25, 0] },
  { no: '0003', studentId: '25070062', name: 'គៀត លីហៃ', scores: [20, 17, 10, 30, 25, 50, 3, 32, 45, 35, 33, 38, 2, 45, 25, 0] },
  { no: '0004', studentId: '25070063', name: 'ឃាន ចន្តា', scores: [50, 25, 20, 37, 25, 31, 2, 19, 25, 38, 5, 23, 11, 40, 25, 0] },
  { no: '0005', studentId: '25070064', name: 'ចម ស៊ាវម៉ី', scores: [50, 31, 48, 50, 30, 50, 5, 34, 48, 45, 47, 40, 5, 45, 25, 0] },
  { no: '0006', studentId: '25070065', name: 'ឆៀប វ៉ាន់ឆៃ', scores: [30, 0, 25, 43, 35, 50, 10, 24, 0, 45, 32, 15, 8, 40, 25, 0] },
  { no: '0007', studentId: '25070066', name: 'ជ វត្តី', scores: [20, 23, 50, 40, 30, 38, 3, 35, 25, 35, 20, 42, 17, 40, 50, 0] },
  { no: '0008', studentId: '25070067', name: 'ជា សុវណ្ណរាជ្យ', scores: [30, 24, 5, 27, 20, 31, 5, 8, 0, 35, 36, 40, 15, 40, 25, 0] },
  { no: '0009', studentId: '25070068', name: 'ជួន បញ្ញា', scores: [48, 25, 0, 14, 10, 31, 10, 25, 25, 0, 28, 22, 6, 45, 25, 0] },
  { no: '0010', studentId: '25070069', name: 'ឈួង ហ៊ុយស៊ីង', scores: [30, 23, 0, 37, 10, 1, 3, 21, 25, 38, 30, 22, 10, 40, 25, 0] },
  { no: '0011', studentId: '25070070', name: 'ណា លីយ៉ា', scores: [20, 10, 0, 40, 28, 38, 2, 25, 25, 35, 33, 35, 13, 40, 25, 0] },
  { no: '0012', studentId: '25070071', name: 'ណាត រចនា', scores: [50, 32, 48, 48, 38, 78, 15, 43, 45, 35, 47, 40, 20, 45, 25, 0] },
  { no: '0013', studentId: '25070072', name: 'ណេន សិរីភិមាន', scores: [50, 26, 29, 41, 25, 95, 2, 39, 25, 35, 45, 40, 15, 45, 25, 0] },
  { no: '0014', studentId: '25070073', name: 'ថៃ រដ្ឋា', scores: [20, 12, 23, 29, 20, 31, 5, 10, 10, 30, 25, 22, 3, 40, 50, 0] },
  { no: '0015', studentId: '25070074', name: 'ធា ស៊ូពេជ្រ', scores: [20, 20, 32, 30, 30, 70, 10, 10, 45, 45, 30, 25, 5, 40, 50, 0] },
  { no: '0016', studentId: '25070075', name: 'ធីម បញ្ញាវន្ត', scores: [20, 22, 14, 31, 20, 31, 5, 28, 25, 45, 32, 22, 5, 40, 50, 0] },
  { no: '0017', studentId: '25070076', name: 'ប៉ាក់ និស័យ', scores: [20, 21, 15, 17, 20, 50, 5, 18, 10, 30, 30, 30, 3, 40, 25, 0] },
  { no: '0018', studentId: '25070077', name: 'ប៊ុត ម៉ាលី', scores: [30, 10, 7, 36, 25, 40, 5, 20, 0, 38, 36, 27, 7, 40, 25, 0] },
  { no: '0019', studentId: '25070078', name: 'ប្រស្នា ប៊ុនហាក់', scores: [40, 30, 0, 38, 50, 60, 15, 34, 45, 0, 35, 22, 8, 45, 50, 0] },
  { no: '0020', studentId: '25070079', name: 'ផល់ សុភ័ណ្ឌ', scores: [20, 22, 13, 44, 35, 31, 10, 18, 25, 0, 30, 42, 7, 45, 50, 0] },
  { no: '0021', studentId: '25070080', name: 'ផាន សុខឧត្តម', scores: [20, 8, 9, 15, 10, 38, 5, 13, 10, 35, 37, 22, 5, 0, 50, 0] },
  { no: '0022', studentId: '25070081', name: 'ផៃ ចាន់ឌី', scores: [50, 26, 33, 46, 20, 88, 10, 36, 25, 35, 40, 40, 9, 45, 50, 0] },
  { no: '0023', studentId: '25070082', name: 'ពិន ណាក់រ៉ាសេដ្ឋបុត្រ', scores: [40, 8, 5, 38, 25, 55, 10, 28, 45, 30, 30, 40, 5, 45, 25, 0] },
  { no: '0024', studentId: '25070083', name: 'ភាព ភីម៉ី', scores: [50, 32, 12, 44, 10, 31, 2, 12, 10, 35, 28, 22, 25, 40, 50, 0] },
  { no: '0025', studentId: '25070084', name: 'ភ័ក្រ្ត សំនៀង', scores: [50, 17, 15, 21, 15, 31, 5, 12, 10, 30, 30, 30, 22, 40, 25, 0] },
  { no: '0026', studentId: '25070085', name: 'ម៉ន សុម៉ាឡែន', scores: [20, 31, 50, 50, 49, 50, 10, 35, 48, 46, 47, 22, 10, 40, 50, 0] },
  { no: '0027', studentId: '25070086', name: 'ម៉ម រិទ្ធសភា', scores: [40, 0, 0, 9, 0, 38, 0, 1, 10, 0, 5, 0, 5, 40, 25, 0] },
  { no: '0028', studentId: '25070087', name: 'ម៉ែន ស៊ីតា', scores: [40, 12, 30, 40, 30, 48, 10, 28, 25, 38, 27, 28, 8, 45, 25, 0] },
  { no: '0029', studentId: '25070088', name: 'មឿន ពិសី', scores: [20, 8, 0, 25, 28, 31, 2, 1, 0, 40, 15, 0, 5, 40, 50, 0] },
  { no: '0030', studentId: '25070089', name: 'មឿនពិសាល', scores: [20, 0, 10, 12, 20, 31, 2, 1, 0, 40, 5, 0, 2, 40, 50, 0] },
  { no: '0031', studentId: '25070090', name: 'យូ សុផាដានីត', scores: [20, 29, 38, 44, 50, 31, 4, 33, 30, 40, 43, 29, 10, 40, 50, 0] },
  { no: '0032', studentId: '25070091', name: 'យឿន សុជីជី', scores: [50, 29, 0, 50, 30, 95, 10, 37, 48, 35, 47, 40, 12, 40, 50, 0] },
  { no: '0033', studentId: '25070092', name: 'រ៉ា វិមាន', scores: [45, 31, 25, 49, 25, 38, 15, 34, 48, 35, 48, 45, 7, 40, 25, 0] },
  { no: '0034', studentId: '25070093', name: 'រាក់ បញ្ញា', scores: [30, 24, 10, 17, 30, 31, 2, 20, 48, 35, 41, 22, 5, 40, 50, 0] },
  { no: '0035', studentId: '25070094', name: 'រុន ភារៈ', scores: [20, 15, 15, 11, 10, 40, 5, 6, 10, 45, 5, 22, 10, 40, 25, 0] },
  { no: '0036', studentId: '25070095', name: 'លយ ជីតា', scores: [20, 20, 0, 17, 30, 31, 3, 18, 0, 35, 38, 23, 8, 40, 50, 0] },
  { no: '0037', studentId: '25070096', name: 'លាប រ៉ូហ្ស៊ី', scores: [20, 24, 10, 36, 35, 38, 5, 0, 5, 40, 25, 25, 3, 40, 25, 0] },
  { no: '0038', studentId: '25070097', name: 'លី សៀវឡុង', scores: [20, 25, 10, 36, 40, 78, 3, 30, 5, 40, 15, 22, 10, 40, 25, 0] },
  { no: '0039', studentId: '25070098', name: 'វ៉ា ពុតធីតា', scores: [20, 27, 28, 32, 27, 55, 3, 24, 25, 45, 35, 30, 6, 40, 50, 0] },
  { no: '0040', studentId: '25070099', name: 'វី ធារឹទ្ធ', scores: [25, 22, 11, 36, 30, 31, 5, 7, 25, 40, 25, 22, 6, 40, 25, 0] },
  { no: '0041', studentId: '25070100', name: 'សាក់ ពិសិដ្ឋ', scores: [20, 27, 15, 23, 25, 31, 10, 30, 5, 0, 35, 39, 5, 40, 25, 0] },
  { no: '0042', studentId: '25070101', name: 'សាង អ៊ីរ៉ា', scores: [50, 25, 38, 50, 29, 38, 0, 21, 6, 45, 5, 38, 12, 45, 50, 0] },
  { no: '0043', studentId: '25070102', name: 'សុភី ណារី', scores: [20, 12, 25, 38, 25, 31, 2, 18, 35, 35, 5, 30, 10, 40, 25, 0] },
  { no: '0044', studentId: '25070103', name: 'សូរ រក្សា', scores: [30, 20, 27, 50, 20, 31, 5, 19, 10, 45, 34, 20, 25, 40, 50, 0] },
  { no: '0045', studentId: '25070104', name: 'សឿង ពិសិដ្ឋ', scores: [40, 20, 18, 46, 20, 70, 15, 25, 10, 30, 37, 40, 5, 0, 50, 0] },
  { no: '0046', studentId: '25070105', name: 'សែន កុសល', scores: [25, 8, 11, 37, 20, 0, 5, 0, 10, 30, 34, 30, 3, 40, 50, 0] },
  { no: '0047', studentId: '25070106', name: 'សោម វាសនា', scores: [20, 13, 10, 21, 10, 38, 2, 9, 5, 45, 5, 22, 5, 40, 25, 0] },
  { no: '0048', studentId: '25070107', name: 'សោម ស៊ាងឡី', scores: [30, 23, 25, 42, 50, 70, 10, 41, 48, 0, 40, 0, 3, 40, 25, 0] },
  { no: '0049', studentId: '25070108', name: 'ស្រាង មិនជូ', scores: [20, 20, 5, 40, 20, 38, 10, 11, 10, 38, 28, 27, 8, 45, 25, 0] },
  { no: '0050', studentId: '25070109', name: 'ស្រេង ស៊ាវលីញ', scores: [55, 30, 50, 50, 40, 95, 10, 36, 10, 35, 48, 40, 16, 40, 50, 0] },
  { no: '0051', studentId: '25070110', name: 'ស្វាយ កិត្យារឹទ្ធ', scores: [25, 24, 15, 29, 20, 38, 10, 33, 15, 45, 10, 30, 12, 0, 25, 0] },
  { no: '0052', studentId: '25070111', name: 'សំអូន ធីតុលា', scores: [30, 20, 23, 34, 20, 38, 5, 13, 20, 35, 34, 30, 6, 40, 50, 0] },
  { no: '0053', studentId: '25070112', name: 'ហ៊ន់ ឆេងលី', scores: [35, 12, 15, 32, 25, 38, 10, 1, 15, 35, 34, 23, 5, 0, 50, 0] },
  { no: '0054', studentId: '25070113', name: 'ហាប់ ហុងឡាយ', scores: [20, 14, 5, 9, 10, 38, 10, 7, 25, 38, 20, 22, 10, 45, 50, 0] },
  { no: '0055', studentId: '25070114', name: 'ឡា ស៊ិញឡុង', scores: [50, 25, 14, 41, 15, 75, 20, 27, 30, 30, 48, 38, 5, 40, 25, 0] },
  { no: '0056', studentId: '25070115', name: 'ឡាំ រ័តនាសារីម៉ា', scores: [20, 23, 13, 39, 0, 38, 0, 20, 15, 40, 5, 30, 20, 40, 50, 0] },
  { no: '0057', studentId: '25070116', name: 'ឡូ ពិសី', scores: [20, 28, 19, 35, 25, 31, 5, 23, 10, 35, 43, 45, 8, 40, 50, 0] },
  { no: '0058', studentId: '25070117', name: 'អ៊ាង គន្ធា', scores: [40, 30, 40, 44, 20, 31, 20, 42, 40, 45, 45, 42, 7, 45, 25, 0] },
  { no: '0059', studentId: '25070118', name: 'អុល ផាន់និត', scores: [35, 21, 46, 48, 20, 38, 10, 17, 40, 45, 28, 22, 5, 40, 25, 0] }
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
  const classId = 'cmiq7zs080003q0jav4gj9wat'; // ថ្នាក់ទី7ខ (G7-ខ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី7ខ (${month} ${year}) TO MATCH PDF ---`);

  // Ensure student 25070110 is in G7-ខ
  const st110 = await withRetry(() => prisma.student.findUnique({ where: { studentId: '25070110' } }));
  if (st110 && st110.classId !== classId) {
    console.log(`--- Moving student [25070110] ${st110.khmerName} from classId=${st110.classId} to G7-ខ (${classId}) ---`);
    await withRetry(() => prisma.student.update({
      where: { id: st110.id },
      data: { classId }
    }));
  }

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
    if (!st) {
      console.log(`❌ Student ID ${pdfRow.studentId} not found!`);
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

      // Also check if grade exists under another classId (like old G7-គ for 25070110)
      if (!existing && st.studentId === '25070110') {
        const oldGrade = await withRetry(() => prisma.grade.findFirst({
          where: {
            studentId: st.id,
            subjectId: subInfo.id,
            month,
            year
          }
        }));
        if (oldGrade) {
          await withRetry(() => prisma.grade.delete({ where: { id: oldGrade.id } }));
        }
      }

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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL STUDENTS IN CLASS 7B/7ខ ---');
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

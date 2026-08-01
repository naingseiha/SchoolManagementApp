import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfData = [
  { no: '0001', studentId: '25070220', name: 'គង់ សុធារ៉ា', scores: [35, 43, 13, 7, 20, 30, 15, 35, 30, 40, 50, 30, 45, 45, 35, 40] },
  { no: '0002', studentId: '25070221', name: 'គឿន លីការ', scores: [35, 31, 41, 25, 40, 78, 22, 17, 30, 45, 50, 50, 45, 45, 50, 40] },
  { no: '0003', studentId: '25070222', name: 'ឃន ទីពោធិ៍', scores: [35, 42, 41, 21, 30, 33, 12, 16, 48, 35, 50, 50, 35, 30, 20, 40] },
  { no: '0004', studentId: '25070223', name: 'ឃាត់ កណ្ណិកា', scores: [35, 31, 30, 26, 10, 56, 8, 15, 48, 45, 40, 50, 40, 45, 50, 40] },
  { no: '0005', studentId: '25070224', name: 'ឃួន សាវឿន', scores: [35, 38, 38, 17, 20, 68, 16, 15, 48, 45, 50, 50, 45, 45, 50, 40] },
  { no: '0006', studentId: '25070225', name: 'ចន្ថា អាន់យ៉ា', scores: [35, 44, 50, 37, 30, 71, 29, 27, 48, 40, 50, 50, 40, 45, 50, 40] },
  { no: '0007', studentId: '25070226', name: 'ចិន នីត្តា', scores: [35, 30, 33, 33, 50, 61, 17, 35, 48, 35, 50, 50, 35, 45, 50, 40] },
  { no: '0008', studentId: '25070227', name: 'ចិន ម៉ីម៉ី', scores: [35, 40, 39, 35, 25, 38, 7, 22, 48, 45, 50, 50, 40, 45, 50, 40] },
  { no: '0009', studentId: '25070228', name: 'ចំរើន ម៉ារីណា', scores: [35, 30, 14, 30, 10, 29, 2, 16, 48, 40, 50, 35, 45, 45, 50, 40] },
  { no: '0010', studentId: '25070229', name: 'ជា ចន្ទ័វត្តី', scores: [35, 45, 43, 35, 50, 74, 25, 18, 48, 45, 50, 50, 50, 25, 20, 40] },
  { no: '0011', studentId: '25070230', name: 'ជិន សុធាស៊ីស៊ីលាង', scores: [35, 31, 25, 27, 35, 70, 10, 13, 30, 40, 25, 50, 45, 45, 50, 30] },
  { no: '0012', studentId: '25070231', name: 'ឈៀង ចរិយា', scores: [35, 38, 30, 35, 40, 60, 5, 18, 48, 45, 50, 50, 50, 45, 50, 40] },
  { no: '0013', studentId: '25070232', name: 'ណាក់ សៀវអ៊ី', scores: [35, 20, 10, 17, 10, 47, 5, 7, 25, 45, 40, 50, 40, 45, 50, 40] },
  { no: '0014', studentId: '25070233', name: 'ណាត ស្រីណេ', scores: [35, 45, 24, 35, 50, 75, 15, 0, 48, 45, 50, 50, 50, 45, 50, 40] },
  { no: '0015', studentId: '25070234', name: 'ណុប សាលីណា', scores: [35, 35, 47, 33, 40, 85, 38, 50, 48, 35, 50, 50, 35, 45, 50, 50] },
  { no: '0016', studentId: '25070235', name: 'ថា ណារីន', scores: [35, 34, 38, 35, 45, 66, 22, 10, 48, 40, 50, 50, 40, 25, 35, 40] },
  { no: '0017', studentId: '25070236', name: 'ធួន សុរ៉ាមី', scores: [35, 30, 0, 31, 50, 45, 32, 18, 48, 40, 50, 50, 40, 50, 50, 40] },
  { no: '0018', studentId: '25070237', name: 'នី សារ៉ា', scores: [35, 38, 28, 27, 40, 81, 12, 25, 48, 45, 40, 50, 40, 45, 50, 40] },
  { no: '0019', studentId: '25070238', name: 'ប៉ៃ វិច្ឆិកា', scores: [35, 38, 15, 35, 35, 80, 34, 11, 48, 40, 50, 50, 40, 50, 50, 40] },
  { no: '0020', studentId: '25070239', name: 'ផល ផាន់នី', scores: [35, 34, 29, 23, 38, 28, 5, 5, 48, 45, 50, 48, 50, 45, 50, 30] },
  { no: '0021', studentId: '25070240', name: 'ពឿន ពិសី', scores: [35, 36, 31, 27, 10, 65, 10, 10, 0, 35, 50, 50, 35, 45, 50, 40] },
  { no: '0022', studentId: '25070241', name: 'ពេញ ពេជ្រនីតា', scores: [35, 37, 32, 10, 40, 78, 15, 11, 35, 35, 50, 50, 35, 25, 50, 40] },
  { no: '0023', studentId: '25070242', name: 'ភក្តី សាន់ឌី', scores: [35, 37, 44, 35, 40, 70, 10, 5, 30, 45, 50, 50, 50, 25, 50, 40] },
  { no: '0024', studentId: '25070243', name: 'មន សុមាន', scores: [35, 55, 45, 40, 50, 70, 42, 14, 48, 45, 50, 50, 50, 25, 50, 40] },
  { no: '0025', studentId: '25070244', name: 'មីន ស៊ីណាត', scores: [35, 40, 28, 27, 10, 60, 31, 21, 48, 45, 50, 50, 40, 45, 50, 40] },
  { no: '0026', studentId: '25070245', name: 'យ៉ាត់ ស្រីដឿន', scores: [40, 32, 18, 30, 25, 78, 25, 25, 30, 40, 40, 50, 45, 45, 20, 40] },
  { no: '0027', studentId: '25070246', name: 'យ៉េង សិរីរតនា', scores: [35, 37, 20, 13, 40, 55, 15, 27, 30, 35, 50, 50, 35, 45, 50, 40] },
  { no: '0028', studentId: '25070247', name: 'រស់ ស្រីរតន៍', scores: [37, 23, 48, 40, 50, 74, 29, 31, 48, 40, 50, 50, 40, 45, 50, 40] },
  { no: '0029', studentId: '25070248', name: 'រ៉ា សុម៉ា', scores: [30, 22, 42, 44, 35, 12, 5, 12, 0, 40, 40, 50, 40, 0, 0, 40] },
  { no: '0030', studentId: '25070249', name: 'រ៉េន ខឺលី', scores: [30, 18, 22, 27, 40, 24, 12, 1, 0, 40, 30, 50, 40, 35, 50, 40] },
  { no: '0031', studentId: '25070250', name: 'រ៉េន ដារីណា', scores: [35, 49, 21, 24, 40, 23, 12, 4, 0, 40, 30, 50, 40, 35, 20, 40] },
  { no: '0032', studentId: '25070251', name: 'រួន លក្ខិណា', scores: [49, 32, 48, 22, 10, 52, 19, 16, 48, 35, 50, 50, 35, 45, 50, 50] },
  { no: '0033', studentId: '25070252', name: 'លាង ឆៃណា', scores: [32, 35, 16, 30, 35, 79, 15, 31, 48, 40, 50, 50, 40, 45, 50, 40] },
  { no: '0034', studentId: '25070253', name: 'លី គីមហួរ', scores: [35, 15, 27, 34, 50, 72, 32, 26, 48, 40, 50, 50, 40, 45, 50, 40] },
  { no: '0035', studentId: '25070254', name: 'វុន ធីតា', scores: [35, 33, 43, 29, 25, 45, 5, 19, 48, 40, 40, 50, 40, 0, 0, 40] },
  { no: '0036', studentId: '25070255', name: 'ស៊ិន សក្តិសត្យា', scores: [35, 23, 27, 35, 50, 84, 22, 43, 48, 40, 30, 50, 40, 45, 50, 40] },
  { no: '0037', studentId: '25070256', name: 'ស៊ិន ស័ក្កមល្លិកា', scores: [35, 22, 12, 26, 20, 40, 17, 36, 30, 40, 50, 50, 45, 45, 50, 40] },
  { no: '0038', studentId: '25070257', name: 'សាន លីណា', scores: [35, 32, 38, 20, 40, 80, 22, 29, 30, 40, 50, 50, 45, 45, 35, 40] },
  { no: '0039', studentId: '25070258', name: 'សាវ៉ុន គន្ធធិតា', scores: [35, 43, 38, 30, 20, 67, 15, 38, 48, 45, 50, 50, 45, 45, 35, 40] },
  { no: '0040', studentId: '25070259', name: 'សិដ្ឋ ផាវត្តិ', scores: [35, 30, 21, 19, 10, 17, 5, 6, 48, 27, 50, 33, 25, 45, 50, 40] },
  { no: '0041', studentId: '25070260', name: 'សុន វីលៀម', scores: [35, 38, 18, 35, 50, 76, 34, 16, 48, 40, 50, 50, 40, 45, 50, 50] },
  { no: '0042', studentId: '25070261', name: 'សុរ៉ូ សូម៉ា', scores: [35, 35, 22, 30, 50, 61, 12, 15, 48, 45, 50, 50, 45, 25, 35, 40] },
  { no: '0043', studentId: '25070262', name: 'សូ សុនីតា', scores: [35, 34, 15, 20, 10, 55, 7, 18, 48, 45, 30, 50, 40, 45, 50, 40] },
  { no: '0044', studentId: '25070263', name: 'សូត្រ សាយ៉ាណា', scores: [35, 33, 44, 35, 50, 65, 29, 17, 48, 40, 50, 50, 40, 45, 35, 40] },
  { no: '0045', studentId: '25070264', name: 'សួរ វិសាល', scores: [35, 20, 28, 17, 20, 52, 5, 1, 48, 27, 0, 25, 25, 35, 20, 40] },
  { no: '0046', studentId: '25070265', name: 'សំណាង អាលីហ្សា', scores: [35, 30, 0, 12, 10, 40, 6, 2, 30, 35, 50, 30, 35, 45, 50, 40] },
  { no: '0047', studentId: '25070266', name: 'ហ៊ីង នារីចំណាន', scores: [35, 38, 33, 22, 25, 71, 22, 16, 48, 45, 50, 50, 45, 45, 50, 40] },
  { no: '0048', studentId: '25070267', name: 'ហ៊ីម លីហ្វុង', scores: [35, 30, 5, 20, 10, 31, 8, 5, 48, 27, 50, 28, 25, 45, 50, 40] },
  { no: '0049', studentId: '25070268', name: 'ហុង គិមជូ', scores: [35, 30, 8, 22, 20, 43, 10, 4, 30, 45, 40, 50, 45, 35, 20, 40] },
  { no: '0050', studentId: '25070269', name: 'ហេង ហាវរ៉ាន់', scores: [28, 0, 0, 7, 10, 37, 0, 1, 0, 27, 50, 35, 25, 45, 50, 40] },
  { no: '0051', studentId: '25070270', name: 'ហ្វ័ង កាំភីង', scores: [35, 32, 16, 17, 20, 29, 5, 6, 48, 27, 50, 15, 25, 45, 50, 40] },
  { no: '0052', studentId: '25070271', name: 'ឡន សុលាប', scores: [35, 32, 25, 0, 10, 35, 5, 7, 40, 27, 50, 50, 25, 30, 40, 40] },
  { no: '0053', studentId: '25070272', name: 'ឡី ស្រីយ៉ា', scores: [35, 45, 38, 33, 50, 52, 17, 24, 48, 45, 50, 50, 45, 45, 50, 40] },
  { no: '0054', studentId: '25070273', name: 'អិន វណ្ណឆៃ', scores: [35, 30, 15, 27, 20, 44, 5, 8, 48, 45, 40, 50, 40, 45, 50, 40] }
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
  const classId = 'cmiq7zu9d0009q0jag59r3pss'; // ថ្នាក់ទី7ង (G7-ង)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES WITH ROBUST RETRY FOR ថ្នាក់ទី7ង (${month} ${year}) TO MATCH PDF (NO STUDENT MOVES) ---`);

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
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 7ង (` + (st ? `is in classId=${st.classId}` : `not in DB`) + `). Skipping per strict instruction!`);
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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 7E/7ង ---');
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

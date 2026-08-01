import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

interface RowData {
  no: string;
  studentId: string;
  name: string;
  khmer: number;
  moral: number;
  hist: number;
  geo: number;
  math: number;
  phy: number;
  chem: number;
  bio: number;
  earth: number;
  eng: number;
  he: number;
  ict: number;
  agri: number;
  sports: number;
  skip?: boolean;
}

const pdfData: RowData[] = [
  { no: '0001', studentId: '25090088', name: 'កឹក សំណាង', khmer: 23, moral: 18, hist: 18, geo: 25, math: 55, phy: 10, chem: 1, bio: 0, earth: 23, eng: 19, he: 24, ict: 10, agri: 0, sports: 0 },
  { no: '0002', studentId: '25090089', name: 'គា រក្សា', khmer: 78, moral: 34, hist: 20, geo: 26, math: 75, phy: 35, chem: 7, bio: 18, earth: 23, eng: 28, he: 40, ict: 48, agri: 45, sports: 35 },
  { no: '0003', studentId: '25090090', name: 'គា សុជា', khmer: 38, moral: 15, hist: 16, geo: 18, math: 55, phy: 35, chem: 2, bio: 18, earth: 15, eng: 40, he: 27, ict: 25, agri: 0, sports: 0 },
  { no: '0004', studentId: '25090134', name: 'គឿន រាត្រី', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0, skip: true }, // in 9D in database
  { no: '0005', studentId: '25090092', name: 'ឆេង សីហា', khmer: 53, moral: 30, hist: 21, geo: 14, math: 55, phy: 35, chem: 2, bio: 0, earth: 20, eng: 21, he: 30, ict: 48, agri: 45, sports: 20 },
  { no: '0006', studentId: '25090093', name: 'ជា សំណាង', khmer: 60, moral: 23, hist: 26, geo: 11, math: 50, phy: 10, chem: 0, bio: 10, earth: 0, eng: 28, he: 35, ict: 20, agri: 0, sports: 0 },
  { no: '0007', studentId: '25090094', name: 'ជុំ ថាននរៈ', khmer: 26, moral: 13, hist: 7, geo: 8, math: 50, phy: 10, chem: 2, bio: 15, earth: 23, eng: 20, he: 10, ict: 48, agri: 40, sports: 35 },
  { no: '0008', studentId: '25090095', name: 'ឈុន ណានឈៀវ', khmer: 19, moral: 10, hist: 4, geo: 12, math: 55, phy: 10, chem: 1, bio: 0, earth: 20, eng: 21, he: 17, ict: 0, agri: 35, sports: 0 },
  { no: '0009', studentId: '25090096', name: 'ណន រ័ត្ននះ', khmer: 72, moral: 19, hist: 24, geo: 23, math: 50, phy: 10, chem: 0, bio: 10, earth: 18, eng: 17, he: 25, ict: 0, agri: 0, sports: 0 },
  { no: '0010', studentId: '25090097', name: 'ណាង វណ្ណណេ', khmer: 55, moral: 16, hist: 23, geo: 31, math: 55, phy: 23, chem: 5, bio: 10, earth: 18, eng: 29, he: 37, ict: 48, agri: 45, sports: 35 },
  { no: '0011', studentId: '25090098', name: 'ណុប ផាន់ណា', khmer: 37, moral: 20, hist: 12, geo: 16, math: 60, phy: 30, chem: 2, bio: 32, earth: 15, eng: 33, he: 30, ict: 48, agri: 45, sports: 35 },
  { no: '0012', studentId: '25090099', name: 'ថា រ៉ូហ្សា', khmer: 50, moral: 35, hist: 16, geo: 27, math: 50, phy: 25, chem: 5, bio: 32, earth: 29, eng: 20, he: 38, ict: 25, agri: 40, sports: 20 },
  { no: '0013', studentId: '25090100', name: 'ទីវ ដាវិន', khmer: 54, moral: 28, hist: 18, geo: 26, math: 75, phy: 35, chem: 9, bio: 10, earth: 23, eng: 43, he: 40, ict: 48, agri: 40, sports: 35 },
  { no: '0014', studentId: '25090101', name: 'ទឹម សុប៊ុនលី', khmer: 10, moral: 13, hist: 14, geo: 0, math: 55, phy: 10, chem: 1, bio: 0, earth: 20, eng: 0, he: 29, ict: 10, agri: 40, sports: 20 },
  { no: '0015', studentId: '25090102', name: 'ទូច តុង', khmer: 50, moral: 23, hist: 19, geo: 25, math: 50, phy: 10, chem: 0, bio: 0, earth: 0, eng: 23, he: 37, ict: 20, agri: 0, sports: 30 },
  { no: '0016', studentId: '25090103', name: 'ទូច សីហា', khmer: 63, moral: 30, hist: 27, geo: 28, math: 50, phy: 10, chem: 0, bio: 10, earth: 18, eng: 25, he: 42, ict: 20, agri: 0, sports: 30 },
  { no: '0017', studentId: '25090104', name: 'ធី ពេជ្រកម្មនថាត់', khmer: 29, moral: 25, hist: 21, geo: 0, math: 55, phy: 10, chem: 1, bio: 30, earth: 0, eng: 27, he: 0, ict: 10, agri: 40, sports: 0 },
  { no: '0018', studentId: '25090105', name: 'ប៉ុន កុលលិនី', khmer: 89, moral: 28, hist: 33, geo: 31, math: 80, phy: 35, chem: 21, bio: 0, earth: 23, eng: 49, he: 43, ict: 48, agri: 45, sports: 35 },
  { no: '0019', studentId: '25090106', name: 'ប៉ូ សុភី', khmer: 0, moral: 18, hist: 0, geo: 0, math: 25, phy: 0, chem: 0, bio: 32, earth: 15, eng: 18, he: 0, ict: 0, agri: 0, sports: 0 },
  { no: '0020', studentId: '25090107', name: 'ប៉ែន ឆៃរ៉ានុត', khmer: 79, moral: 35, hist: 15, geo: 28, math: 50, phy: 35, chem: 7, bio: 10, earth: 29, eng: 50, he: 38, ict: 48, agri: 45, sports: 35 },
  { no: '0021', studentId: '25090108', name: 'ប៊ុន វណ្ណៈ', khmer: 51, moral: 28, hist: 7, geo: 9, math: 50, phy: 25, chem: 0, bio: 32, earth: 23, eng: 19, he: 33, ict: 20, agri: 0, sports: 35 },
  { no: '0022', studentId: '25090109', name: 'បូ សុភី', khmer: 31, moral: 18, hist: 0, geo: 17, math: 30, phy: 20, chem: 3, bio: 18, earth: 0, eng: 18, he: 0, ict: 25, agri: 45, sports: 50 },
  { no: '0023', studentId: '25090110', name: 'បូរ វណ្ណៈ', khmer: 68, moral: 18, hist: 24, geo: 31, math: 50, phy: 35, chem: 5, bio: 15, earth: 18, eng: 21, he: 26, ict: 25, agri: 45, sports: 35 },
  { no: '0024', studentId: '25090111', name: 'ផាន់ សូហ្វីលីយ៉ា', khmer: 63, moral: 28, hist: 15, geo: 27, math: 50, phy: 30, chem: 9, bio: 10, earth: 25, eng: 42, he: 48, ict: 48, agri: 40, sports: 20 },
  { no: '0025', studentId: '25090112', name: 'ពុំ ប៉', khmer: 54, moral: 22, hist: 26, geo: 11, math: 50, phy: 25, chem: 5, bio: 30, earth: 18, eng: 20, he: 34, ict: 25, agri: 45, sports: 20 },
  { no: '0026', studentId: '25090113', name: 'ព្រេង វិច្ឆិកា', khmer: 53, moral: 25, hist: 14, geo: 24, math: 55, phy: 30, chem: 4, bio: 18, earth: 29, eng: 27, he: 43, ict: 48, agri: 45, sports: 35 },
  { no: '0027', studentId: '25090114', name: 'ម៉ន សុម៉ុន', khmer: 10, moral: 12, hist: 21, geo: 0, math: 50, phy: 15, chem: 5, bio: 30, earth: 23, eng: 0, he: 22, ict: 48, agri: 0, sports: 0 },
  { no: '0028', studentId: 'គ_សុផានណា', name: 'គ សុផានណា', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0, skip: true }, // not in DB
  { no: '0029', studentId: '25090116', name: 'រស្មី ច័ន្ទកនិកា', khmer: 60, moral: 31, hist: 17, geo: 28, math: 60, phy: 35, chem: 7, bio: 32, earth: 15, eng: 36, he: 33, ict: 48, agri: 45, sports: 35 },
  { no: '0030', studentId: '25090117', name: 'លយ សៀងហៃ', khmer: 37, moral: 21, hist: 18, geo: 26, math: 55, phy: 10, chem: 1, bio: 32, earth: 23, eng: 30, he: 15, ict: 48, agri: 0, sports: 0 },
  { no: '0031', studentId: '25090118', name: 'វឿង វណ្ណារី', khmer: 67, moral: 25, hist: 16, geo: 27, math: 75, phy: 25, chem: 9, bio: 20, earth: 15, eng: 24, he: 30, ict: 48, agri: 40, sports: 20 },
  { no: '0032', studentId: '25090119', name: 'សន វាសនា', khmer: 60, moral: 23, hist: 18, geo: 14, math: 70, phy: 30, chem: 2, bio: 10, earth: 23, eng: 20, he: 36, ict: 48, agri: 45, sports: 50 },
  { no: '0033', studentId: '25090120', name: 'សាន សុដាវណ្ណ', khmer: 45, moral: 27, hist: 15, geo: 7, math: 70, phy: 30, chem: 8, bio: 10, earth: 15, eng: 24, he: 25, ict: 25, agri: 45, sports: 50 },
  { no: '0034', studentId: '25090121', name: 'សិញ ពិសិដ្ឋ', khmer: 51, moral: 11, hist: 17, geo: 26, math: 55, phy: 30, chem: 1, bio: 18, earth: 15, eng: 28, he: 38, ict: 48, agri: 45, sports: 50 },
  { no: '0035', studentId: '25090122', name: 'សុន សុមុនី', khmer: 51, moral: 24, hist: 22, geo: 26, math: 50, phy: 10, chem: 11, bio: 18, earth: 15, eng: 31, he: 38, ict: 25, agri: 45, sports: 35 },
  { no: '0036', studentId: '25090123', name: 'សឿន សុខសំណាង', khmer: 37, moral: 26, hist: 22, geo: 22, math: 55, phy: 30, chem: 9, bio: 32, earth: 29, eng: 28, he: 45, ict: 48, agri: 40, sports: 35 },
  { no: '0037', studentId: '25090124', name: 'សេក សុនីសា', khmer: 58, moral: 25, hist: 22, geo: 29, math: 55, phy: 30, chem: 7, bio: 10, earth: 29, eng: 19, he: 48, ict: 48, agri: 45, sports: 20 },
  { no: '0038', studentId: '25090125', name: 'សោម ដេវីត', khmer: 25, moral: 17, hist: 27, geo: 23, math: 55, phy: 30, chem: 3, bio: 15, earth: 15, eng: 18, he: 38, ict: 25, agri: 45, sports: 50 },
  { no: '0039', studentId: '25090126', name: 'ស្រេង ហេងរិទ្ធីរាជ', khmer: 50, moral: 21, hist: 15, geo: 19, math: 70, phy: 10, chem: 1, bio: 33, earth: 15, eng: 39, he: 25, ict: 48, agri: 40, sports: 35 },
  { no: '0040', studentId: '25090127', name: 'ហាប វិបុល', khmer: 62, moral: 19, hist: 25, geo: 21, math: 55, phy: 20, chem: 1, bio: 25, earth: 20, eng: 28, he: 28, ict: 25, agri: 35, sports: 20 },
  { no: '0041', studentId: '25090128', name: 'ហៀង សីហា', khmer: 64, moral: 24, hist: 33, geo: 24, math: 55, phy: 35, chem: 3, bio: 10, earth: 0, eng: 19, he: 50, ict: 25, agri: 45, sports: 50 },
  { no: '0042', studentId: '25090129', name: 'ហៃ ហ៊ានឌី', khmer: 60, moral: 24, hist: 25, geo: 25, math: 55, phy: 25, chem: 5, bio: 25, earth: 15, eng: 33, he: 27, ict: 48, agri: 40, sports: 50 },
  { no: '0043', studentId: '25090130', name: 'អែល រ័ត្ន', khmer: 56, moral: 14, hist: 20, geo: 16, math: 65, phy: 15, chem: 3, bio: 10, earth: 15, eng: 31, he: 35, ict: 20, agri: 40, sports: 50 }
];

const subjectCodesMap = {
  moral: 'MORAL-G9',
  hist: 'HIST-G9',
  geo: 'GEO-G9',
  math: 'MATH-G9',
  phy: 'PHY-G9',
  chem: 'CHEM-G9',
  bio: 'BIO-G9',
  earth: 'EARTH-G9',
  eng: 'ENG-G9',
  he: 'HE-G9',
  ict: 'ICT-G9',
  agri: 'AGRI-G9',
  sports: 'SPORTS-G9',
  hlth: 'HLTH-G9'
};

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
  const classId = 'cmiq7zy6z000nq0jaeinbeyfd'; // ថ្នាក់ទី9គ (G9-គ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- UPDATING GRADES FOR ថ្នាក់ទី9គ (${month} ${year}) (NO STUDENT MOVES) ---`);

  // Fetch all subject records for Grade 9
  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { contains: '-G9' } }
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

  const allStudentIds = pdfData.filter(p => !p.skip).map(p => p.studentId);
  const students = await withRetry(() => prisma.student.findMany({
    where: { studentId: { in: allStudentIds } }
  }));

  let updatedGradesCount = 0;

  for (const pdfRow of pdfData) {
    if (pdfRow.skip) {
      console.log(`ℹ️ PDF row [${pdfRow.no}] ${pdfRow.name} is marked to skip. Skipping!`);
      continue;
    }

    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st || st.classId !== classId) {
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 9គ in the System. Skipping!`);
      continue;
    }

    // Determine subject values to update
    const subjectUpdates: { code: string; score: number }[] = [];

    // Khmer language splits into two: WRITER and WRITING
    const writerScore = Math.floor(pdfRow.khmer / 2);
    const writingScore = Math.ceil(pdfRow.khmer / 2);
    subjectUpdates.push({ code: 'WRITER-G9', score: writerScore });
    subjectUpdates.push({ code: 'WRITING-G9', score: writingScore });

    // Other subjects
    subjectUpdates.push({ code: subjectCodesMap.moral, score: pdfRow.moral });
    subjectUpdates.push({ code: subjectCodesMap.hist, score: pdfRow.hist });
    subjectUpdates.push({ code: subjectCodesMap.geo, score: pdfRow.geo });
    subjectUpdates.push({ code: subjectCodesMap.math, score: pdfRow.math });
    subjectUpdates.push({ code: subjectCodesMap.phy, score: pdfRow.phy });
    subjectUpdates.push({ code: subjectCodesMap.chem, score: pdfRow.chem });
    subjectUpdates.push({ code: subjectCodesMap.bio, score: pdfRow.bio });
    subjectUpdates.push({ code: subjectCodesMap.earth, score: pdfRow.earth });
    subjectUpdates.push({ code: subjectCodesMap.eng, score: pdfRow.eng });
    subjectUpdates.push({ code: subjectCodesMap.he, score: pdfRow.he });
    subjectUpdates.push({ code: subjectCodesMap.ict, score: pdfRow.ict });
    subjectUpdates.push({ code: subjectCodesMap.agri, score: pdfRow.agri });
    subjectUpdates.push({ code: subjectCodesMap.sports, score: pdfRow.sports });
    
    // Health is always 0 because it's not present on PDF
    subjectUpdates.push({ code: subjectCodesMap.hlth, score: 0 });

    for (const update of subjectUpdates) {
      const subInfo = subMap[update.code];
      const targetScore = update.score;

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

      if (!existing || existing.score !== targetScore) {
        const weightedScore = GradeCalculationService.calculateWeightedScore(targetScore, subInfo.coefficient);
        const percentage = GradeCalculationService.calculatePercentage(targetScore, subInfo.maxScore);

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
            score: targetScore,
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
            score: targetScore,
            maxScore: subInfo.maxScore,
            weightedScore,
            percentage
          }
        }));

        console.log(`✅ Updated [${st.studentId}] ${st.khmerName} -> ${subInfo.nameKh} (${update.code}): old=${existing ? existing.score : 'MISSING'} -> new=${targetScore}`);
        updatedGradesCount++;
      }
    }
  }

  console.log(`\n✅ Total individual subject grades updated/created: ${updatedGradesCount}`);

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 9C/9គ ---');
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

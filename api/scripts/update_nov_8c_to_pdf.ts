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
}

const pdfData: RowData[] = [
  { no: '0001', studentId: '25080107', name: 'កែវ ចែម', khmer: 40, moral: 25, hist: 35, geo: 29, math: 45, phy: 10, chem: 19, bio: 5, earth: 45, eng: 50, he: 43, ict: 49, agri: 40, sports: 40 },
  { no: '0002', studentId: '25080108', name: 'ក្រូច សុម៉ាវត្តី', khmer: 35, moral: 44, hist: 32, geo: 10, math: 50, phy: 15, chem: 13, bio: 5, earth: 42, eng: 30, he: 42, ict: 40, agri: 45, sports: 50 },
  { no: '0003', studentId: '25080109', name: 'ខៀវ សុម៉ា', khmer: 0, moral: 48, hist: 35, geo: 0, math: 0, phy: 7, chem: 0, bio: 5, earth: 0, eng: 25, he: 48, ict: 35, agri: 0, sports: 40 },
  { no: '0004', studentId: '25080110', name: 'គុជ ដេវីត', khmer: 35, moral: 35, hist: 34, geo: 20, math: 50, phy: 28, chem: 14, bio: 5, earth: 4, eng: 50, he: 49, ict: 49, agri: 45, sports: 50 },
  { no: '0005', studentId: '25080111', name: 'គូ រក្សា', khmer: 50, moral: 47, hist: 39, geo: 45, math: 50, phy: 5, chem: 3, bio: 35, earth: 48, eng: 50, he: 38, ict: 49, agri: 45, sports: 40 },
  { no: '0006', studentId: '25080112', name: 'គឿន សុគ្រី', khmer: 25, moral: 46, hist: 9, geo: 20, math: 50, phy: 2, chem: 1, bio: 15, earth: 45, eng: 45, he: 22, ict: 49, agri: 40, sports: 50 },
  { no: '0007', studentId: '25080113', name: 'ចន ចរិយា', khmer: 52, moral: 46, hist: 26, geo: 45, math: 57, phy: 25, chem: 9, bio: 25, earth: 45, eng: 15, he: 34, ict: 30, agri: 45, sports: 50 },
  { no: '0008', studentId: '25080114', name: 'ចឹម លីសា', khmer: 86, moral: 47, hist: 35, geo: 49, math: 80, phy: 15, chem: 18, bio: 20, earth: 48, eng: 50, he: 34, ict: 49, agri: 45, sports: 50 },
  { no: '0009', studentId: '25080115', name: 'ញ៉ោម រាក់', khmer: 81, moral: 45, hist: 33, geo: 49, math: 50, phy: 10, chem: 35, bio: 25, earth: 45, eng: 25, he: 39, ict: 40, agri: 35, sports: 20 },
  { no: '0010', studentId: '25080116', name: 'ដន រិទ្ធិដែន', khmer: 40, moral: 25, hist: 35, geo: 43, math: 75, phy: 10, chem: 19, bio: 25, earth: 45, eng: 0, he: 0, ict: 0, agri: 40, sports: 50 },
  { no: '0011', studentId: '25080117', name: 'ដន វិឆាយ', khmer: 76, moral: 45, hist: 35, geo: 45, math: 80, phy: 5, chem: 7, bio: 20, earth: 45, eng: 30, he: 39, ict: 40, agri: 0, sports: 30 },
  { no: '0012', studentId: '25080118', name: 'ដាញ់ ចាន់សុនី', khmer: 53, moral: 41, hist: 34, geo: 44, math: 70, phy: 5, chem: 7, bio: 45, earth: 45, eng: 0, he: 40, ict: 0, agri: 45, sports: 50 },
  { no: '0013', studentId: '25080119', name: 'ណាត វុទ្ធី', khmer: 45, moral: 38, hist: 35, geo: 43, math: 35, phy: 7, chem: 12, bio: 25, earth: 45, eng: 20, he: 46, ict: 40, agri: 45, sports: 40 },
  { no: '0014', studentId: '25080120', name: 'តង ម៉ាឌីណា', khmer: 45, moral: 37, hist: 33, geo: 46, math: 50, phy: 15, chem: 11, bio: 48, earth: 42, eng: 35, he: 39, ict: 45, agri: 45, sports: 50 },
  { no: '0015', studentId: '25080121', name: 'ថាន ប៊ុនហូវ', khmer: 70, moral: 44, hist: 0, geo: 42, math: 20, phy: 0, chem: 18, bio: 30, earth: 45, eng: 25, he: 49, ict: 45, agri: 45, sports: 50 },
  { no: '0016', studentId: '25080122', name: 'ធី លីវន់', khmer: 55, moral: 37, hist: 35, geo: 47, math: 25, phy: 12, chem: 8, bio: 35, earth: 45, eng: 15, he: 44, ict: 35, agri: 45, sports: 40 },
  { no: '0017', studentId: '25080123', name: 'បូរិទ្ធ ធារ៉ា', khmer: 65, moral: 25, hist: 31, geo: 40, math: 0, phy: 5, chem: 0, bio: 25, earth: 20, eng: 15, he: 41, ict: 35, agri: 0, sports: 30 },
  { no: '0018', studentId: '25080124', name: 'ប្រាក់ ស្រីនាង', khmer: 45, moral: 37, hist: 31, geo: 40, math: 0, phy: 5, chem: 8, bio: 0, earth: 48, eng: 15, he: 36, ict: 35, agri: 45, sports: 40 },
  { no: '0019', studentId: '25080125', name: 'ប្រុញ រស្មី', khmer: 85, moral: 25, hist: 35, geo: 46, math: 80, phy: 10, chem: 4, bio: 5, earth: 45, eng: 35, he: 39, ict: 45, agri: 45, sports: 50 },
  { no: '0020', studentId: '25080126', name: 'ពង រ៉ាត់', khmer: 50, moral: 33, hist: 32, geo: 39, math: 50, phy: 4, chem: 8, bio: 25, earth: 45, eng: 30, he: 9, ict: 40, agri: 40, sports: 50 },
  { no: '0021', studentId: '25080127', name: 'ម៉ាន់ ចាន់រក្សា', khmer: 70, moral: 50, hist: 35, geo: 49, math: 80, phy: 27, chem: 8, bio: 25, earth: 45, eng: 15, he: 47, ict: 35, agri: 45, sports: 50 },
  { no: '0022', studentId: '25080128', name: 'ម៉ែន ចិត្រា', khmer: 77, moral: 25, hist: 35, geo: 44, math: 50, phy: 15, chem: 13, bio: 20, earth: 45, eng: 50, he: 44, ict: 49, agri: 0, sports: 20 },
  { no: '0023', studentId: '25080129', name: 'យន្ត ចាន់ណា', khmer: 85, moral: 25, hist: 35, geo: 47, math: 80, phy: 15, chem: 9, bio: 45, earth: 45, eng: 50, he: 48, ict: 49, agri: 45, sports: 40 },
  { no: '0024', studentId: '25080130', name: 'យ៉ាត ផានុត', khmer: 50, moral: 39, hist: 34, geo: 30, math: 50, phy: 14, chem: 0, bio: 25, earth: 45, eng: 25, he: 39, ict: 40, agri: 40, sports: 40 },
  { no: '0025', studentId: '25080131', name: 'យ៉ាន យ៉ាហួរ', khmer: 0, moral: 35, hist: 0, geo: 0, math: 0, phy: 10, chem: 13, bio: 0, earth: 0, eng: 50, he: 48, ict: 49, agri: 45, sports: 40 },
  { no: '0026', studentId: '25080132', name: 'យ៉ូត ខេមម៉ាវត្តី', khmer: 58, moral: 44, hist: 35, geo: 39, math: 60, phy: 10, chem: 16, bio: 20, earth: 45, eng: 15, he: 44, ict: 35, agri: 0, sports: 20 },
  { no: '0027', studentId: '25080133', name: 'យូរ សុម៉ារាជ្យ', khmer: 60, moral: 44, hist: 27, geo: 29, math: 50, phy: 5, chem: 16, bio: 35, earth: 45, eng: 15, he: 39, ict: 35, agri: 45, sports: 50 },
  { no: '0028', studentId: '25080134', name: 'រ៉ាន់ ធារិទ្ធ', khmer: 55, moral: 48, hist: 32, geo: 33, math: 75, phy: 15, chem: 12, bio: 40, earth: 48, eng: 50, he: 48, ict: 49, agri: 45, sports: 50 },
  { no: '0029', studentId: '25080135', name: 'រ៉ាម៉ន វីរៈយុទ្ធ', khmer: 10, moral: 25, hist: 24, geo: 20, math: 20, phy: 2, chem: 1, bio: 30, earth: 45, eng: 20, he: 43, ict: 40, agri: 0, sports: 30 },
  { no: '0030', studentId: '25080136', name: 'រាន់ រស្មី', khmer: 47, moral: 47, hist: 19, geo: 47, math: 75, phy: 5, chem: 15, bio: 25, earth: 45, eng: 50, he: 43, ict: 49, agri: 40, sports: 50 },
  { no: '0031', studentId: '25080137', name: 'រើន សុខពិសិទ្ធ', khmer: 75, moral: 45, hist: 33, geo: 39, math: 50, phy: 15, chem: 7, bio: 10, earth: 45, eng: 25, he: 46, ict: 35, agri: 45, sports: 50 },
  { no: '0032', studentId: '25080138', name: 'រឿន គឹមហុង', khmer: 45, moral: 25, hist: 0, geo: 0, math: 75, phy: 0, chem: 0, bio: 0, earth: 0, eng: 40, he: 26, ict: 45, agri: 0, sports: 20 },
  { no: '0033', studentId: '25080139', name: 'វន ពិសិដ្ឋ', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 20 },
  { no: '0034', studentId: '25080140', name: 'វ៉ាន់ ធារី', khmer: 45, moral: 44, hist: 35, geo: 33, math: 50, phy: 5, chem: 0, bio: 25, earth: 40, eng: 25, he: 49, ict: 35, agri: 45, sports: 45 },
  { no: '0035', studentId: '25080141', name: 'វ៉ាន់ វីរាក់', khmer: 42, moral: 32, hist: 33, geo: 33, math: 45, phy: 10, chem: 20, bio: 25, earth: 45, eng: 0, he: 31, ict: 0, agri: 40, sports: 50 },
  { no: '0036', studentId: '25080142', name: 'វិចិត្រ រស្មី', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 30 },
  { no: '0037', studentId: '25080143', name: 'វី ដាវីត', khmer: 45, moral: 25, hist: 30, geo: 20, math: 45, phy: 12, chem: 7, bio: 15, earth: 45, eng: 0, he: 0, ict: 0, agri: 0, sports: 20 },
  { no: '0038', studentId: '25080144', name: 'វី លីហួរ', khmer: 50, moral: 30, hist: 35, geo: 29, math: 50, phy: 10, chem: 6, bio: 20, earth: 45, eng: 50, he: 46, ict: 49, agri: 40, sports: 50 },
  { no: '0039', studentId: '25080145', name: 'សន សុខពិដោ', khmer: 25, moral: 44, hist: 24, geo: 0, math: 45, phy: 15, chem: 12, bio: 0, earth: 45, eng: 30, he: 35, ict: 40, agri: 0, sports: 0 },
  { no: '0040', studentId: '25080146', name: 'ស៊ាត សាង', khmer: 25, moral: 25, hist: 35, geo: 45, math: 0, phy: 27, chem: 14, bio: 25, earth: 45, eng: 30, he: 41, ict: 40, agri: 45, sports: 40 },
  { no: '0041', studentId: '25080147', name: 'ស៊ាប ច័ន្ទសុខា', khmer: 88, moral: 25, hist: 35, geo: 49, math: 68, phy: 15, chem: 9, bio: 0, earth: 40, eng: 20, he: 46, ict: 35, agri: 0, sports: 0 },
  { no: '0042', studentId: '25080148', name: 'សិទ្ធ សុម៉ា', khmer: 45, moral: 46, hist: 34, geo: 46, math: 50, phy: 15, chem: 5, bio: 30, earth: 42, eng: 25, he: 29, ict: 35, agri: 45, sports: 50 },
  { no: '0043', studentId: '25080149', name: 'សុទ្ធកា សិរីយុទ្ធ', khmer: 60, moral: 25, hist: 0, geo: 20, math: 55, phy: 14, chem: 16, bio: 10, earth: 48, eng: 35, he: 48, ict: 45, agri: 40, sports: 40 },
  { no: '0044', studentId: '25080150', name: 'សុខា ស្រីលី', khmer: 67, moral: 49, hist: 35, geo: 44, math: 78, phy: 22, chem: 25, bio: 48, earth: 45, eng: 25, he: 46, ict: 35, agri: 45, sports: 40 },
  { no: '0045', studentId: '25080151', name: 'សុភ័ន្ត ស្រីធុច', khmer: 66, moral: 25, hist: 35, geo: 30, math: 65, phy: 2, chem: 18, bio: 45, earth: 42, eng: 20, he: 44, ict: 30, agri: 0, sports: 0 },
  { no: '0046', studentId: '25080152', name: 'សេង ប៉ោហេង', khmer: 70, moral: 45, hist: 35, geo: 47, math: 50, phy: 20, chem: 12, bio: 30, earth: 45, eng: 45, he: 34, ict: 47, agri: 45, sports: 50 },
  { no: '0047', studentId: '25080153', name: 'សំណាង លីហ្សា', khmer: 35, moral: 38, hist: 33, geo: 40, math: 50, phy: 2, chem: 3, bio: 20, earth: 48, eng: 0, he: 21, ict: 0, agri: 45, sports: 40 },
  { no: '0048', studentId: '25080154', name: 'ហម អាលីសា', khmer: 67, moral: 46, hist: 35, geo: 48, math: 50, phy: 27, chem: 15, bio: 45, earth: 45, eng: 5, he: 48, ict: 35, agri: 45, sports: 50 },
  { no: '0049', studentId: '25080155', name: 'ហ៊ាង រតនា', khmer: 80, moral: 46, hist: 39, geo: 49, math: 80, phy: 27, chem: 27, bio: 45, earth: 45, eng: 25, he: 46, ict: 35, agri: 45, sports: 50 },
  { no: '0050', studentId: '25080156', name: 'ហ៊ី អីុឈាង', khmer: 55, moral: 32, hist: 33, geo: 40, math: 40, phy: 20, chem: 7, bio: 20, earth: 40, eng: 30, he: 34, ict: 40, agri: 45, sports: 25 },
  { no: '0051', studentId: '25080157', name: 'ហឿន ចរិយា', khmer: 51, moral: 38, hist: 35, geo: 45, math: 50, phy: 5, chem: 19, bio: 30, earth: 40, eng: 25, he: 48, ict: 35, agri: 40, sports: 50 },
  { no: '0052', studentId: '25080158', name: 'ហេង ប៊ុនហាក់', khmer: 62, moral: 43, hist: 32, geo: 40, math: 40, phy: 15, chem: 4, bio: 20, earth: 42, eng: 35, he: 30, ict: 45, agri: 45, sports: 50 },
  { no: '0053', studentId: '25080159', name: 'ហេង វីរៈ', khmer: 55, moral: 36, hist: 35, geo: 20, math: 40, phy: 15, chem: 11, bio: 25, earth: 40, eng: 35, he: 32, ict: 45, agri: 40, sports: 40 },
  { no: '0054', studentId: '25080160', name: 'ឡែន សុឡៃ', khmer: 65, moral: 42, hist: 7, geo: 46, math: 80, phy: 10, chem: 9, bio: 25, earth: 45, eng: 40, he: 22, ict: 47, agri: 45, sports: 50 },
  { no: '0055', studentId: '25080161', name: 'អាត លិនណា', khmer: 45, moral: 32, hist: 35, geo: 46, math: 70, phy: 10, chem: 12, bio: 25, earth: 40, eng: 25, he: 45, ict: 35, agri: 0, sports: 0 },
  { no: '0056', studentId: '25080162', name: 'អ៉ិត សំអឿន', khmer: 33, moral: 40, hist: 33, geo: 38, math: 40, phy: 10, chem: 6, bio: 40, earth: 42, eng: 0, he: 38, ict: 0, agri: 40, sports: 50 },
  { no: '0057', studentId: '25080163', name: 'អុល ចាន់ដុល្លា', khmer: 68, moral: 25, hist: 27, geo: 39, math: 30, phy: 20, chem: 27, bio: 35, earth: 45, eng: 30, he: 44, ict: 40, agri: 0, sports: 30 },
  { no: '0058', studentId: '25080164', name: 'អើន ពន្លឺ', khmer: 48, moral: 35, hist: 32, geo: 46, math: 50, phy: 8, chem: 12, bio: 25, earth: 42, eng: 30, he: 25, ict: 40, agri: 45, sports: 50 },
  { no: '0059', studentId: '25080165', name: 'អឿន វីរៈ', khmer: 76, moral: 44, hist: 33, geo: 48, math: 53, phy: 30, chem: 26, bio: 25, earth: 48, eng: 40, he: 46, ict: 47, agri: 45, sports: 50 }
];

const subjectCodesMap = {
  moral: 'MORAL-G8',
  hist: 'HIST-G8',
  geo: 'GEO-G8',
  math: 'MATH-G8',
  phy: 'PHY-G8',
  chem: 'CHEM-G8',
  bio: 'BIO-G8',
  earth: 'EARTH-G8',
  eng: 'ENG-G8',
  he: 'HE-G8',
  ict: 'ICT-G8',
  agri: 'AGRI-G8',
  sports: 'SPORTS-G8',
  hlth: 'HLTH-G8'
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
  const classId = 'cmiq7zvub000fq0jaaz3hiu4e'; // ថ្នាក់ទី8គ (G8-គ)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`--- CORRECTLY UPDATING GRADES FOR ថ្នាក់ទី8គ (${month} ${year}) (NO STUDENT MOVES) ---`);

  // Fetch all subject records for Grade 8
  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { contains: '-G8' } }
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
      console.log(`ℹ️ Student ID ${pdfRow.studentId} (${pdfRow.name}) not found inside 8គ. Skipping!`);
      continue;
    }

    // Determine subject values to update
    const subjectUpdates: { code: string; score: number }[] = [];

    // Khmer language splits into two: WRITER and WRITING
    const writerScore = pdfRow.khmer / 2;
    const writingScore = pdfRow.khmer / 2;
    subjectUpdates.push({ code: 'WRITER-G8', score: writerScore });
    subjectUpdates.push({ code: 'WRITING-G8', score: writingScore });

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

  console.log('\n--- RECALCULATING MONTHLY SUMMARIES FOR ALL CURRENT STUDENTS IN CLASS 8C/8គ ---');
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

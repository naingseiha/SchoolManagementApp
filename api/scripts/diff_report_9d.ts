import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

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
  { no: '0001', studentId: '25090131', name: 'ក្រីយ៉ា សាគី', khmer: 51, moral: 30, hist: 32, geo: 31, math: 30, phy: 17, chem: 5, bio: 32, earth: 26, eng: 8, he: 42, ict: 10, agri: 45, sports: 50 },
  { no: '0002', studentId: '25090132', name: 'ខន សុខុនកញ្ញា', khmer: 72, moral: 33, hist: 33, geo: 30, math: 58, phy: 11, chem: 14, bio: 0, earth: 24, eng: 27, he: 48, ict: 45, agri: 45, sports: 50 },
  { no: '0003', studentId: '25090133', name: 'គុណ រិទ្ធី', khmer: 50, moral: 29, hist: 25, geo: 19, math: 60, phy: 22, chem: 11, bio: 0, earth: 22, eng: 32, he: 33, ict: 36, agri: 45, sports: 50 },
  { no: '0004', studentId: '25090134', name: 'គឿន រាត្រី', khmer: 84, moral: 34, hist: 29, geo: 28, math: 65, phy: 28, chem: 11, bio: 0, earth: 29, eng: 37, he: 46, ict: 45, agri: 45, sports: 50 },
  { no: '0005', studentId: '25090135', name: 'គ្រីសំណាង កាណាន់', khmer: 31, moral: 28, hist: 14, geo: 29, math: 62, phy: 18, chem: 5, bio: 32, earth: 26, eng: 26, he: 42, ict: 43, agri: 45, sports: 50 },
  { no: '0006', studentId: '25090136', name: 'ឃីម សុខរម្យនា', khmer: 51, moral: 32, hist: 32, geo: 25, math: 90, phy: 20, chem: 8, bio: 32, earth: 28, eng: 36, he: 50, ict: 48, agri: 0, sports: 0 },
  { no: '0007', studentId: '25090137', name: 'ងីន ឌីណា', khmer: 50, moral: 29, hist: 16, geo: 30, math: 93, phy: 26, chem: 3, bio: 18, earth: 26, eng: 34, he: 44, ict: 40, agri: 45, sports: 50 },
  { no: '0008', studentId: '25090138', name: 'ចាប អ៊ីហ្វុង', khmer: 22, moral: 15, hist: 32, geo: 31, math: 25, phy: 12, chem: 9, bio: 32, earth: 29, eng: 32, he: 50, ict: 31, agri: 45, sports: 50 },
  { no: '0009', studentId: '25090139', name: 'ឆោម អេនជី', khmer: 50, moral: 33, hist: 30, geo: 31, math: 45, phy: 11, chem: 9, bio: 0, earth: 29, eng: 22, he: 49, ict: 48, agri: 0, sports: 20 },
  { no: '0010', studentId: '25090140', name: 'ជា សុខា', khmer: 31, moral: 33, hist: 33, geo: 31, math: 35, phy: 25, chem: 6, bio: 32, earth: 24, eng: 48, he: 42, ict: 50, agri: 40, sports: 50 },
  { no: '0011', studentId: '25090141', name: 'ជុក ចាន់យ៉ាផារិន', khmer: 32, moral: 28, hist: 25, geo: 20, math: 25, phy: 0, chem: 7, bio: 0, earth: 22, eng: 29, he: 39, ict: 0, agri: 40, sports: 50 },
  { no: '0012', studentId: '25090142', name: 'ឌឿន លក្ខណា', khmer: 50, moral: 32, hist: 33, geo: 31, math: 100, phy: 23, chem: 17, bio: 0, earth: 28, eng: 29, he: 50, ict: 48, agri: 35, sports: 35 },
  { no: '0013', studentId: '25090143', name: 'តាំង តុងឈី', khmer: 62, moral: 0, hist: 33, geo: 30, math: 95, phy: 32, chem: 10, bio: 32, earth: 28, eng: 31, he: 50, ict: 48, agri: 45, sports: 35 },
  { no: '0014', studentId: '25090144', name: 'តែម សុជាតិ', khmer: 46, moral: 28, hist: 16, geo: 22, math: 25, phy: 23, chem: 11, bio: 32, earth: 26, eng: 36, he: 39, ict: 35, agri: 40, sports: 50 },
  { no: '0015', studentId: '25090145', name: 'ធូ សុខឡៃហេង', khmer: 81, moral: 30, hist: 31, geo: 31, math: 32, phy: 32, chem: 19, bio: 32, earth: 28, eng: 19, he: 50, ict: 43, agri: 45, sports: 35 },
  { no: '0016', studentId: '25090146', name: 'នី កន្និកា', khmer: 46, moral: 0, hist: 33, geo: 29, math: 28, phy: 27, chem: 9, bio: 0, earth: 24, eng: 18, he: 47, ict: 40, agri: 0, sports: 0 },
  { no: '0017', studentId: '25090147', name: 'បាន សុមៀន', khmer: 10, moral: 30, hist: 29, geo: 19, math: 32, phy: 13, chem: 10, bio: 32, earth: 24, eng: 33, he: 47, ict: 40, agri: 40, sports: 50 },
  { no: '0018', studentId: '25090148', name: 'បួន រ៉ាយុទ្ធ', khmer: 30, moral: 27, hist: 26, geo: 29, math: 100, phy: 30, chem: 5, bio: 32, earth: 29, eng: 17, he: 31, ict: 15, agri: 40, sports: 50 },
  { no: '0019', studentId: '25090149', name: 'ផាន ធារី', khmer: 69, moral: 30, hist: 25, geo: 30, math: 57, phy: 32, chem: 9, bio: 32, earth: 29, eng: 21, he: 48, ict: 44, agri: 45, sports: 50 },
  { no: '0020', studentId: '25090150', name: 'ផាន់ ហេងលាភ', khmer: 43, moral: 30, hist: 30, geo: 31, math: 85, phy: 23, chem: 8, bio: 0, earth: 22, eng: 42, he: 48, ict: 45, agri: 40, sports: 50 },
  { no: '0021', studentId: '25090151', name: 'ព្រំ ពន្លឺ', khmer: 53, moral: 29, hist: 14, geo: 30, math: 97, phy: 32, chem: 15, bio: 32, earth: 26, eng: 47, he: 47, ict: 40, agri: 45, sports: 50 },
  { no: '0022', studentId: '25090152', name: 'ភី រក្សា', khmer: 51, moral: 33, hist: 26, geo: 28, math: 25, phy: 11, chem: 5, bio: 0, earth: 23, eng: 10, he: 46, ict: 45, agri: 35, sports: 45 },
  { no: '0023', studentId: '25090153', name: 'មឿន ស្រីល័ក្ខ', khmer: 38, moral: 29, hist: 25, geo: 30, math: 30, phy: 21, chem: 7, bio: 0, earth: 23, eng: 10, he: 16, ict: 0, agri: 45, sports: 35 },
  { no: '0024', studentId: '25090154', name: 'យ៉ាន ចាន់ណេ', khmer: 54, moral: 33, hist: 29, geo: 30, math: 50, phy: 23, chem: 11, bio: 32, earth: 28, eng: 22, he: 49, ict: 40, agri: 40, sports: 35 },
  { no: '0025', studentId: '25090155', name: 'យាន គីមហួង', khmer: 38, moral: 29, hist: 31, geo: 29, math: 64, phy: 32, chem: 17, bio: 32, earth: 28, eng: 28, he: 44, ict: 40, agri: 40, sports: 50 },
  { no: '0026', studentId: '25090156', name: 'រឹម ស្រីល័ក្ខ', khmer: 68, moral: 32, hist: 31, geo: 28, math: 35, phy: 25, chem: 6, bio: 0, earth: 23, eng: 30, he: 50, ict: 37, agri: 45, sports: 50 },
  { no: '0027', studentId: '25090157', name: 'រឿន សោពណ៌', khmer: 61, moral: 32, hist: 33, geo: 31, math: 80, phy: 23, chem: 9, bio: 0, earth: 28, eng: 49, he: 45, ict: 50, agri: 45, sports: 20 },
  { no: '0028', studentId: '25090158', name: 'ស៊ន់ ស្រីពេជ្រ', khmer: 32, moral: 32, hist: 31, geo: 31, math: 25, phy: 30, chem: 15, bio: 32, earth: 24, eng: 40, he: 30, ict: 48, agri: 40, sports: 50 },
  { no: '0029', studentId: '25090159', name: 'សាង លីណា', khmer: 48, moral: 32, hist: 33, geo: 29, math: 85, phy: 32, chem: 17, bio: 32, earth: 28, eng: 29, he: 50, ict: 50, agri: 45, sports: 50 },
  { no: '0030', studentId: '25090160', name: 'សាន សុម៉ារី', khmer: 50, moral: 32, hist: 24, geo: 31, math: 35, phy: 16, chem: 3, bio: 32, earth: 24, eng: 9, he: 29, ict: 45, agri: 40, sports: 35 },
  { no: '0031', studentId: '25090161', name: 'សារ៉ូន សុម៉ាវត្តី', khmer: 87, moral: 32, hist: 33, geo: 31, math: 85, phy: 28, chem: 18, bio: 32, earth: 24, eng: 44, he: 50, ict: 50, agri: 45, sports: 50 },
  { no: '0032', studentId: '25090162', name: 'សារ៉េត វីរៈ', khmer: 16, moral: 28, hist: 26, geo: 27, math: 25, phy: 8, chem: 5, bio: 32, earth: 22, eng: 35, he: 5, ict: 41, agri: 0, sports: 20 },
  { no: '0033', studentId: '25090163', name: 'សឿម ស្រីណុច', khmer: 34, moral: 29, hist: 32, geo: 29, math: 25, phy: 21, chem: 11, bio: 32, earth: 29, eng: 25, he: 31, ict: 48, agri: 40, sports: 50 },
  { no: '0034', studentId: '25090164', name: 'ហល់ លីហ៊ាង', khmer: 87, moral: 33, hist: 33, geo: 31, math: 73, phy: 26, chem: 17, bio: 32, earth: 24, eng: 36, he: 50, ict: 50, agri: 45, sports: 50 },
  { no: '0035', studentId: '25090165', name: 'ហ៊ីម លីហួរ', khmer: 53, moral: 28, hist: 26, geo: 30, math: 100, phy: 32, chem: 15, bio: 32, earth: 24, eng: 48, he: 48, ict: 50, agri: 40, sports: 50 },
  { no: '0036', studentId: '25090166', name: 'ហាន់ សារ៉ាវុឌ្ឍនា', khmer: 85, moral: 30, hist: 33, geo: 31, math: 80, phy: 35, chem: 17, bio: 32, earth: 26, eng: 43, he: 50, ict: 50, agri: 45, sports: 50 },
  { no: '0037', studentId: '25090167', name: 'ហេង សុគង់', khmer: 52, moral: 29, hist: 27, geo: 25, math: 25, phy: 29, chem: 2, bio: 32, earth: 22, eng: 20, he: 42, ict: 45, agri: 40, sports: 50 },
  { no: '0038', studentId: '25090168', name: 'ឡាន សេងលី', khmer: 81, moral: 18, hist: 33, geo: 31, math: 80, phy: 25, chem: 17, bio: 32, earth: 28, eng: 30, he: 50, ict: 50, agri: 40, sports: 50 },
  { no: '0039', studentId: '25090169', name: 'ឡុង ប៉ស៊ំាង', khmer: 84, moral: 32, hist: 31, geo: 31, math: 60, phy: 27, chem: 11, bio: 32, earth: 28, eng: 31, he: 50, ict: 30, agri: 40, sports: 35 },
  { no: '0040', studentId: '25090170', name: 'អន សុផាន', khmer: 28, moral: 30, hist: 33, geo: 30, math: 32, phy: 18, chem: 6, bio: 0, earth: 24, eng: 16, he: 31, ict: 45, agri: 40, sports: 50 },
  { no: '0041', studentId: '25090171', name: 'អ៊ុក ចន្ថា', khmer: 42, moral: 29, hist: 30, geo: 31, math: 30, phy: 23, chem: 6, bio: 32, earth: 23, eng: 19, he: 48, ict: 35, agri: 40, sports: 50 },
  { no: '0042', studentId: '25090172', name: 'អេង សុខា', khmer: 64, moral: 30, hist: 33, geo: 31, math: 30, phy: 23, chem: 3, bio: 0, earth: 24, eng: 16, he: 31, ict: 45, agri: 45, sports: 50 },
  { no: '0043', studentId: '25090127', name: 'ហាប វិបុល', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0, skip: true }, // in 9C in database
  { no: '0044', studentId: '25120229', name: 'យូ គង្គារ', khmer: 0, moral: 0, hist: 33, geo: 30, math: 98, phy: 45, chem: 8, bio: 32, earth: 28, eng: 20, he: 25, ict: 25, agri: 40, sports: 25 }
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

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zyos000pq0jawwgzbdr7'; // ថ្នាក់ទី9ឃ (G9-ឃ)

  // Fetch all subject records for Grade 9
  const subjects = await prisma.subject.findMany({
    where: { code: { contains: '-G9' } }
  });

  const subMap: Record<string, { id: string; nameKh: string; maxScore: number }> = {};
  for (const s of subjects) {
    subMap[s.code] = { id: s.id, nameKh: s.nameKh, maxScore: s.maxScore };
  }

  const students = await prisma.student.findMany({
    where: { classId }
  });

  const grades = await prisma.grade.findMany({
    where: { studentId: { in: students.map(s => s.id) }, month: 'វិច្ឆិកា', year: 2025 }
  });

  let totalDiscrepancies = 0;
  let totalMatches = 0;
  let studentsWithDiscrepancies = 0;
  let activeStudentsChecked = 0;

  console.log('--- CORRECTED SCORE DIFFERENCES REPORT FOR ថ្នាក់ទី9ឃ (វិច្ឆិកា) ---');

  for (const pdfRow of pdfData) {
    if (pdfRow.skip) {
      console.log(`ℹ️ PDF row [${pdfRow.no}] ${pdfRow.name} (${pdfRow.studentId}) is marked to skip. Skipping!`);
      continue;
    }

    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) {
      console.log(`ℹ️ PDF row [${pdfRow.no}] ${pdfRow.name} (${pdfRow.studentId}) is NOT inside 9ឃ in the System. Skipping!`);
      continue;
    }

    activeStudentsChecked++;
    let studentHasDiff = false;
    const diffs: string[] = [];

    // Map targets to check
    const targets = [
      { code: 'WRITER-G9', score: Math.floor(pdfRow.khmer / 2) },
      { code: 'WRITING-G9', score: Math.ceil(pdfRow.khmer / 2) },
      { code: subjectCodesMap.moral, score: pdfRow.moral },
      { code: subjectCodesMap.hist, score: pdfRow.hist },
      { code: subjectCodesMap.geo, score: pdfRow.geo },
      { code: subjectCodesMap.math, score: pdfRow.math },
      { code: subjectCodesMap.phy, score: pdfRow.phy },
      { code: subjectCodesMap.chem, score: pdfRow.chem },
      { code: subjectCodesMap.bio, score: pdfRow.bio },
      { code: subjectCodesMap.earth, score: pdfRow.earth },
      { code: subjectCodesMap.eng, score: pdfRow.eng },
      { code: subjectCodesMap.he, score: pdfRow.he },
      { code: subjectCodesMap.ict, score: pdfRow.ict },
      { code: subjectCodesMap.agri, score: pdfRow.agri },
      { code: subjectCodesMap.sports, score: pdfRow.sports },
      { code: subjectCodesMap.hlth, score: 0 }
    ];

    for (const target of targets) {
      const subInfo = subMap[target.code];
      const g = grades.find(x => x.studentId === st.id && x.subjectId === subInfo.id);
      const dbScore = g ? g.score : null;

      if (dbScore !== target.score) {
        studentHasDiff = true;
        totalDiscrepancies++;
        diffs.push(`   - ${subInfo.nameKh} (${target.code}): DB score = ${dbScore === null ? 'MISSING' : dbScore} | PDF score = ${target.score}`);
      } else {
        totalMatches++;
      }
    }

    if (studentHasDiff) {
      studentsWithDiscrepancies++;
      console.log(`\nDiscrepancies for [${st.studentId}] ${st.khmerName} (No. ${pdfRow.no}):`);
      diffs.forEach(d => console.log(d));
    }
  }

  console.log(`\n========================================`);
  console.log(`Total active G9-ឃ students checked against PDF: ${activeStudentsChecked}`);
  console.log(`Students with score differences: ${studentsWithDiscrepancies}`);
  console.log(`Total exact score matches: ${totalMatches}`);
  console.log(`Total score discrepancies to update: ${totalDiscrepancies}`);
  console.log(`========================================`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

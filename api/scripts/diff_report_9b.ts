import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

interface RowData {
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
  { studentId: '25090047', name: 'គ្រុំ រុំមិនា', khmer: 30, moral: 27, hist: 14, geo: 23, math: 30, phy: 15, chem: 4, bio: 30, earth: 24, eng: 35, he: 0, ict: 45, agri: 40, sports: 50 },
  { studentId: '25090048', name: 'ឆន សូលីតា', khmer: 48, moral: 24, hist: 17, geo: 22, math: 32, phy: 10, chem: 2, bio: 15, earth: 29, eng: 26, he: 40, ict: 45, agri: 45, sports: 50 },
  { studentId: '25090049', name: 'ឆោម សុភា', khmer: 53, moral: 17, hist: 22, geo: 31, math: 98, phy: 35, chem: 7, bio: 33, earth: 32, eng: 30, he: 41, ict: 45, agri: 45, sports: 50 },
  { studentId: '25090050', name: 'ជា ស្រីនិច', khmer: 31, moral: 24, hist: 18, geo: 23, math: 53, phy: 18, chem: 3, bio: 18, earth: 29, eng: 26, he: 38, ict: 48, agri: 30, sports: 45 },
  { studentId: '25090051', name: 'ឈឹម សុធាវី', khmer: 62, moral: 21, hist: 26, geo: 29, math: 84, phy: 35, chem: 5, bio: 33, earth: 24, eng: 42, he: 40, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090052', name: 'ណាក់ កូណា', khmer: 37, moral: 19, hist: 23, geo: 28, math: 25, phy: 30, chem: 11, bio: 10, earth: 24, eng: 50, he: 43, ict: 35, agri: 45, sports: 50 },
  { studentId: '25090053', name: 'តាំង លាងហុង', khmer: 58, moral: 18, hist: 23, geo: 31, math: 25, phy: 35, chem: 11, bio: 18, earth: 29, eng: 30, he: 38, ict: 45, agri: 45, sports: 50 },
  { studentId: '25090054', name: 'ថា ផារី', khmer: 70, moral: 33, hist: 33, geo: 27, math: 58, phy: 35, chem: 11, bio: 33, earth: 27, eng: 39, he: 43, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090055', name: 'ផាន់ ប៊ុនឡេង', khmer: 30, moral: 18, hist: 14, geo: 23, math: 25, phy: 25, chem: 2, bio: 18, earth: 27, eng: 38, he: 32, ict: 40, agri: 45, sports: 50 },
  { studentId: '25090056', name: 'ភាន់ រ៉ាវី', khmer: 29, moral: 0, hist: 18, geo: 27, math: 30, phy: 0, chem: 2, bio: 0, earth: 29, eng: 34, he: 10, ict: 0, agri: 0, sports: 0 },
  { studentId: '25090057', name: 'ភាព ស្រីល័ក្ខណ៍', khmer: 69, moral: 28, hist: 31, geo: 29, math: 100, phy: 35, chem: 15, bio: 33, earth: 29, eng: 43, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090058', name: 'ភារម្យ មករា', khmer: 47, moral: 13, hist: 12, geo: 29, math: 50, phy: 10, chem: 11, bio: 33, earth: 24, eng: 38, he: 15, ict: 0, agri: 0, sports: 50 },
  { studentId: '25090059', name: 'ភឿន ច័ន្ទនីរ័ត្ន', khmer: 55, moral: 25, hist: 20, geo: 29, math: 75, phy: 35, chem: 5, bio: 18, earth: 29, eng: 28, he: 44, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090060', name: 'ម៉យ សុហួ', khmer: 63, moral: 19, hist: 31, geo: 31, math: 80, phy: 30, chem: 11, bio: 18, earth: 29, eng: 39, he: 42, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090061', name: 'ម៉ាន សុមាន', khmer: 69, moral: 30, hist: 33, geo: 26, math: 85, phy: 25, chem: 11, bio: 18, earth: 24, eng: 28, he: 17, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090062', name: 'ម៉ៅ សុផាន់ណា', khmer: 30, moral: 18, hist: 26, geo: 25, math: 58, phy: 30, chem: 11, bio: 18, earth: 29, eng: 32, he: 38, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090063', name: 'មួន សូលីកា', khmer: 63, moral: 31, hist: 31, geo: 26, math: 67, phy: 35, chem: 9, bio: 33, earth: 27, eng: 39, he: 47, ict: 45, agri: 45, sports: 50 },
  { studentId: '25090064', name: 'រួន ណារ៉ា', khmer: 40, moral: 31, hist: 21, geo: 31, math: 25, phy: 35, chem: 3, bio: 10, earth: 29, eng: 42, he: 49, ict: 20, agri: 45, sports: 50 },
  { studentId: '25090065', name: 'អាង ធារ៉ា', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0 },
  { studentId: '25090066', name: 'លាង លីហួរ', khmer: 54, moral: 19, hist: 22, geo: 31, math: 32, phy: 25, chem: 4, bio: 18, earth: 29, eng: 33, he: 15, ict: 40, agri: 45, sports: 50 },
  { studentId: '25090067', name: 'លឹម ភួងរក្សា', khmer: 25, moral: 18, hist: 7, geo: 26, math: 21, phy: 10, chem: 4, bio: 18, earth: 24, eng: 35, he: 29, ict: 40, agri: 45, sports: 50 },
  { studentId: '25090068', name: 'វណ្ណរ៉ូ សៀវម៉ី', khmer: 32, moral: 19, hist: 22, geo: 24, math: 25, phy: 15, chem: 4, bio: 33, earth: 27, eng: 33, he: 43, ict: 0, agri: 45, sports: 47 },
  { studentId: '25090069', name: 'វណ្ណរ៉ូ សៀវម៉ីញ', khmer: 31, moral: 18, hist: 15, geo: 22, math: 25, phy: 20, chem: 2, bio: 18, earth: 29, eng: 35, he: 39, ict: 0, agri: 45, sports: 50 },
  { studentId: '25090070', name: 'វេញ វិស្នារ៉ាវី', khmer: 83, moral: 18, hist: 32, geo: 28, math: 79, phy: 35, chem: 9, bio: 18, earth: 29, eng: 45, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090071', name: 'ស៊ន ​នីសា', khmer: 55, moral: 18, hist: 23, geo: 31, math: 54, phy: 20, chem: 9, bio: 18, earth: 29, eng: 31, he: 48, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090072', name: 'ស៊ុន អានីសា', khmer: 24, moral: 5, hist: 17, geo: 17, math: 36, phy: 35, chem: 2, bio: 0, earth: 29, eng: 39, he: 12, ict: 20, agri: 45, sports: 50 },
  { studentId: '25090073', name: 'សាវឿត សួស្តី', khmer: 53, moral: 15, hist: 32, geo: 14, math: 25, phy: 10, chem: 9, bio: 33, earth: 29, eng: 33, he: 33, ict: 40, agri: 45, sports: 25 },
  { studentId: '25090074', name: 'សាំ រក្សា', khmer: 34, moral: 18, hist: 18, geo: 24, math: 72, phy: 35, chem: 15, bio: 18, earth: 29, eng: 30, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090075', name: 'សិទ្ធ សីហា', khmer: 60, moral: 25, hist: 26, geo: 23, math: 25, phy: 10, chem: 4, bio: 18, earth: 32, eng: 31, he: 23, ict: 0, agri: 45, sports: 50 },
  { studentId: '25090076', name: 'សីហា មន្នី', khmer: 66, moral: 16, hist: 31, geo: 32, math: 100, phy: 10, chem: 13, bio: 10, earth: 32, eng: 42, he: 48, ict: 30, agri: 30, sports: 48 },
  { studentId: '25090077', name: 'សៀង វាសនា', khmer: 65, moral: 31, hist: 19, geo: 26, math: 70, phy: 35, chem: 11, bio: 18, earth: 29, eng: 37, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090078', name: 'ស្រស់ ច័ន្ទឌី', khmer: 48, moral: 23, hist: 21, geo: 28, math: 75, phy: 30, chem: 8, bio: 33, earth: 24, eng: 28, he: 43, ict: 48, agri: 35, sports: 45 },
  { studentId: '25090079', name: 'ស្រី សាវរីន', khmer: 63, moral: 18, hist: 21, geo: 29, math: 65, phy: 25, chem: 8, bio: 10, earth: 29, eng: 46, he: 26, ict: 40, agri: 45, sports: 25 },
  { studentId: '25090080', name: 'សំ  សុជាតិ', khmer: 76, moral: 20, hist: 29, geo: 31, math: 32, phy: 35, chem: 17, bio: 33, earth: 32, eng: 33, he: 40, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090081', name: 'សំ សុរីយ៉ា', khmer: 32, moral: 15, hist: 22, geo: 31, math: 73, phy: 35, chem: 6, bio: 18, earth: 32, eng: 40, he: 33, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090082', name: 'ហាង សុខហេង', khmer: 58, moral: 23, hist: 32, geo: 28, math: 80, phy: 35, chem: 17, bio: 33, earth: 29, eng: 32, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090083', name: 'ហេង លីដា', khmer: 78, moral: 25, hist: 32, geo: 26, math: 93, phy: 35, chem: 16, bio: 20, earth: 29, eng: 48, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090084', name: 'ឡង គឹមឡាយ', khmer: 62, moral: 30, hist: 26, geo: 27, math: 100, phy: 15, chem: 15, bio: 20, earth: 32, eng: 50, he: 40, ict: 40, agri: 45, sports: 50 },
  { studentId: '25090085', name: 'ឡាយ គឹមលាន', khmer: 71, moral: 28, hist: 26, geo: 31, math: 81, phy: 35, chem: 13, bio: 33, earth: 29, eng: 35, he: 50, ict: 48, agri: 45, sports: 50 },
  { studentId: '25090086', name: 'ឧត្តម ដាវី', khmer: 26, moral: 18, hist: 19, geo: 0, math: 25, phy: 15, chem: 3, bio: 15, earth: 24, eng: 37, he: 20, ict: 30, agri: 30, sports: 45 },
  { studentId: '25090087', name: 'អូន សេងហាក់', khmer: 35, moral: 18, hist: 20, geo: 26, math: 25, phy: 35, chem: 3, bio: 18, earth: 24, eng: 36, he: 31, ict: 40, agri: 45, sports: 50 }
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
  const classId = 'cmiq7zxhq000lq0jagpi729wu'; // ថ្នាក់ទី9ខ (G9-ខ)

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

  console.log('--- CORRECTED SCORE DIFFERENCES REPORT FOR ថ្នាក់ទី9ខ (វិច្ឆិកា) ---');

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) {
      console.log(`ℹ️ PDF row ${pdfRow.studentId} (${pdfRow.name}) is NOT inside 9ខ in the System. Skipping!`);
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
      console.log(`\nDiscrepancies for [${st.studentId}] ${st.khmerName}:`);
      diffs.forEach(d => console.log(d));
    }
  }

  console.log(`\n========================================`);
  console.log(`Total active G9-ខ students checked against PDF: ${activeStudentsChecked}`);
  console.log(`Students with score differences: ${studentsWithDiscrepancies}`);
  console.log(`Total exact score matches: ${totalMatches}`);
  console.log(`Total score discrepancies to update: ${totalDiscrepancies}`);
  console.log(`========================================`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

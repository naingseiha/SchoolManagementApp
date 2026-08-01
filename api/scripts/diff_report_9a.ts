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
  { studentId: '25090001', name: 'កៅ  គុន', khmer: 40, moral: 34, hist: 25, geo: 31, math: 32, phy: 11, chem: 7, bio: 20, earth: 29, eng: 34, he: 45, ict: 41, agri: 35, sports: 25 },
  { studentId: '25090002', name: 'ខន សុវណ្ណនីតា', khmer: 19, moral: 33, hist: 0, geo: 29, math: 35, phy: 3, chem: 5, bio: 33, earth: 24, eng: 0, he: 45, ict: 50, agri: 35, sports: 25 },
  { studentId: '25090003', name: 'គឹម កក្កដា', khmer: 69, moral: 35, hist: 32, geo: 31, math: 100, phy: 11, chem: 13, bio: 33, earth: 32, eng: 44, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090004', name: 'គឹម មេងស៊ាង', khmer: 60, moral: 30, hist: 32, geo: 32, math: 41, phy: 6, chem: 11, bio: 15, earth: 19, eng: 27, he: 45, ict: 25, agri: 35, sports: 50 },
  { studentId: '25090005', name: 'គឿន ចាន់ថន', khmer: 58, moral: 31, hist: 33, geo: 32, math: 44, phy: 3, chem: 11, bio: 25, earth: 26, eng: 31, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090006', name: 'ចាន់ មនីកា', khmer: 98, moral: 35, hist: 33, geo: 32, math: 100, phy: 25, chem: 14, bio: 33, earth: 26, eng: 44, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090007', name: 'ជា  សុម៉ាណា', khmer: 67, moral: 34, hist: 33, geo: 32, math: 95, phy: 4, chem: 12, bio: 33, earth: 19, eng: 28, he: 45, ict: 25, agri: 35, sports: 25 },
  { studentId: '25090008', name: 'ជា សុខរីណា', khmer: 43, moral: 22, hist: 15, geo: 32, math: 35, phy: 6, chem: 5, bio: 18, earth: 24, eng: 17, he: 45, ict: 30, agri: 35, sports: 25 },
  { studentId: '25090009', name: 'ជាតិ ចាន់វាសនា', khmer: 56, moral: 26, hist: 17, geo: 27, math: 75, phy: 5, chem: 5, bio: 20, earth: 26, eng: 7, he: 25, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090010', name: 'ជួប  ស្រីរត្ន', khmer: 45, moral: 30, hist: 25, geo: 26, math: 30, phy: 4, chem: 5, bio: 33, earth: 23, eng: 30, he: 25, ict: 42, agri: 35, sports: 25 },
  { studentId: '25090011', name: 'ជឿន នីតា', khmer: 42, moral: 29, hist: 31, geo: 31, math: 52, phy: 2, chem: 9, bio: 18, earth: 26, eng: 28, he: 45, ict: 45, agri: 35, sports: 25 },
  { studentId: '25090012', name: 'ណាង  លីដា', khmer: 85, moral: 32, hist: 8, geo: 26, math: 35, phy: 4, chem: 7, bio: 18, earth: 23, eng: 26, he: 45, ict: 48, agri: 35, sports: 50 },
  { studentId: '25090013', name: 'ណាត ស្រីនាថ', khmer: 80, moral: 31, hist: 30, geo: 31, math: 68, phy: 0, chem: 15, bio: 33, earth: 24, eng: 26, he: 45, ict: 32, agri: 35, sports: 25 },
  { studentId: '25090014', name: 'តាន់ កន្និកាពេជ្រ', khmer: 49, moral: 21, hist: 17, geo: 19, math: 32, phy: 11, chem: 6, bio: 18, earth: 23, eng: 29, he: 45, ict: 48, agri: 35, sports: 25 },
  { studentId: '25090015', name: 'ថន សុនីតា', khmer: 85, moral: 35, hist: 33, geo: 32, math: 100, phy: 19, chem: 14, bio: 33, earth: 32, eng: 41, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090016', name: 'ថេន រតនា', khmer: 60, moral: 33, hist: 33, geo: 31, math: 40, phy: 7, chem: 3, bio: 20, earth: 19, eng: 38, he: 45, ict: 43, agri: 35, sports: 50 },
  { studentId: '25090017', name: 'ទីន ច័ន្ទរីយ៉ា', khmer: 79, moral: 32, hist: 33, geo: 32, math: 100, phy: 22, chem: 15, bio: 33, earth: 26, eng: 41, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090018', name: 'ទៀង ច័ន្ទរីយ៉ា', khmer: 81, moral: 25, hist: 33, geo: 32, math: 98, phy: 16, chem: 10, bio: 33, earth: 26, eng: 43, he: 45, ict: 25, agri: 35, sports: 50 },
  { studentId: '25090019', name: 'ប្រុស  វ៉ាន់ណារ៉ា', khmer: 72, moral: 35, hist: 33, geo: 32, math: 100, phy: 21, chem: 13, bio: 33, earth: 29, eng: 36, he: 45, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090020', name: 'ផន សុធារី', khmer: 55, moral: 28, hist: 21, geo: 21, math: 45, phy: 4, chem: 9, bio: 33, earth: 23, eng: 25, he: 45, ict: 50, agri: 35, sports: 25 },
  { studentId: '25090021', name: 'ផាង សេរីឧត្តម', khmer: 65, moral: 35, hist: 33, geo: 32, math: 94, phy: 3, chem: 10, bio: 25, earth: 29, eng: 42, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090022', name: 'ផុន  ច័ន្ទរតនា', khmer: 91, moral: 35, hist: 33, geo: 31, math: 100, phy: 16, chem: 15, bio: 33, earth: 32, eng: 46, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090023', name: 'ផៃ ឧត្តម', khmer: 37, moral: 27, hist: 22, geo: 30, math: 35, phy: 5, chem: 7, bio: 18, earth: 26, eng: 23, he: 45, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090024', name: 'ព្រំ  លីណា', khmer: 75, moral: 29, hist: 33, geo: 28, math: 95, phy: 14, chem: 11, bio: 33, earth: 32, eng: 34, he: 45, ict: 35, agri: 35, sports: 50 },
  { studentId: '25090025', name: 'ភាជ ស៊ីផៃ', khmer: 41, moral: 28, hist: 24, geo: 26, math: 37, phy: 5, chem: 2, bio: 18, earth: 26, eng: 27, he: 45, ict: 43, agri: 35, sports: 50 },
  { studentId: '25090026', name: 'ម៉ាប់ ស្រីឡែន', khmer: 79, moral: 30, hist: 33, geo: 32, math: 95, phy: 13, chem: 13, bio: 33, earth: 26, eng: 33, he: 45, ict: 23, agri: 35, sports: 50 },
  { studentId: '25090027', name: 'ម៉េង  ស្រីណាត', khmer: 40, moral: 28, hist: 24, geo: 28, math: 41, phy: 6, chem: 3, bio: 0, earth: 24, eng: 32, he: 45, ict: 25, agri: 35, sports: 25 },
  { studentId: '25090028', name: 'មាន  រតនា', khmer: 49, moral: 31, hist: 25, geo: 32, math: 76, phy: 2, chem: 5, bio: 25, earth: 26, eng: 33, he: 45, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090029', name: 'យ៉េត រតនៈ', khmer: 70, moral: 15, hist: 26, geo: 32, math: 40, phy: 4, chem: 5, bio: 18, earth: 29, eng: 25, he: 45, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090030', name: 'យិនអ៉ឹម ពេជ្រសោម៉ាវត្តី', khmer: 67, moral: 34, hist: 33, geo: 29, math: 69, phy: 9, chem: 11, bio: 33, earth: 19, eng: 37, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090031', name: 'យឿង គឹមហេង', khmer: 36, moral: 25, hist: 32, geo: 28, math: 30, phy: 3, chem: 8, bio: 18, earth: 29, eng: 33, he: 45, ict: 15, agri: 35, sports: 25 },
  { studentId: '25090032', name: 'រ៉ាំ រតនា', khmer: 71, moral: 29, hist: 31, geo: 32, math: 100, phy: 15, chem: 15, bio: 33, earth: 19, eng: 47, he: 45, ict: 41, agri: 35, sports: 50 },
  { studentId: '25090033', name: 'រ៉ី  ស៊ីថា', khmer: 63, moral: 30, hist: 25, geo: 31, math: 40, phy: 6, chem: 3, bio: 18, earth: 26, eng: 23, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090034', name: 'រិន សារីន', khmer: 55, moral: 30, hist: 32, geo: 32, math: 53, phy: 6, chem: 5, bio: 18, earth: 29, eng: 35, he: 45, ict: 35, agri: 35, sports: 25 },
  { studentId: '25090035', name: 'រូ  ម៉ីជឺ', khmer: 91, moral: 29, hist: 28, geo: 31, math: 60, phy: 5, chem: 13, bio: 33, earth: 32, eng: 40, he: 45, ict: 48, agri: 35, sports: 50 },
  { studentId: '25090036', name: 'រើន  សុវណ្ណរាជ', khmer: 33, moral: 15, hist: 20, geo: 23, math: 25, phy: 4, chem: 6, bio: 18, earth: 19, eng: 24, he: 45, ict: 20, agri: 35, sports: 50 },
  { studentId: '25090037', name: 'រើន វាសនា', khmer: 74, moral: 24, hist: 31, geo: 31, math: 41, phy: 6, chem: 7, bio: 33, earth: 29, eng: 22, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090038', name: 'រឿន រតនៈសៀវអ៊ី', khmer: 70, moral: 34, hist: 33, geo: 19, math: 72, phy: 7, chem: 0, bio: 33, earth: 0, eng: 37, he: 45, ict: 45, agri: 35, sports: 50 },
  { studentId: '25090039', name: 'រ័ត្ន លីតា', khmer: 86, moral: 35, hist: 26, geo: 21, math: 41, phy: 8, chem: 6, bio: 33, earth: 23, eng: 34, he: 45, ict: 42, agri: 35, sports: 25 },
  { studentId: '25090040', name: 'លន់ ឡៃ', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 45, ict: 0, agri: 35, sports: 0 },
  { studentId: '25090041', name: 'វាសនា ចន្ធី', khmer: 19, moral: 30, hist: 30, geo: 32, math: 66, phy: 0, chem: 8, bio: 18, earth: 26, eng: 13, he: 25, ict: 45, agri: 35, sports: 25 },
  { studentId: '25090042', name: 'សុភារិទ្ធិ  សុផលមុន្នី', khmer: 46, moral: 26, hist: 20, geo: 29, math: 30, phy: 4, chem: 5, bio: 33, earth: 19, eng: 22, he: 45, ict: 40, agri: 35, sports: 50 },
  { studentId: '25090043', name: 'សុវណ្ណារី នីតា', khmer: 75, moral: 33, hist: 33, geo: 32, math: 95, phy: 10, chem: 9, bio: 33, earth: 32, eng: 30, he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090044', name: 'សេង បញ្ញាវុទ្ធ', khmer: 55, moral: 30, hist: 22, geo: 32, math: 100, phy: 8, chem: 13, bio: 18, earth: 26, eng: 43, he: 45, ict: 42, agri: 35, sports: 50 },
  { studentId: '25090045', name: 'សោម  សុវណ្ណវិជ្ជរា', khmer: 88, moral: 35, hist: 33, geo: 32, math: 87, phy: 9, chem: 7, bio: 33, earth: 19, eng: 47, he: 45, ict: 43, agri: 35, sports: 25 },
  { studentId: '25090046', name: 'ហាក់ ប៊ុនលាភ', khmer: 38, moral: 29, hist: 22, geo: 30, math: 50, phy: 0, chem: 7, bio: 33, earth: 19, eng: 33, he: 45, ict: 25, agri: 35, sports: 50 }
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
  const classId = 'cmiq7zwy1000jq0jalus7rknx'; // ថ្នាក់ទី9ក (G9-ក)

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

  console.log('--- CORRECTED SCORE DIFFERENCES REPORT FOR ថ្នាក់ទី9ក (វិច្ឆិកា) ---');

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) {
      console.log(`ℹ️ PDF row ${pdfRow.studentId} (${pdfRow.name}) is NOT inside 9ក in the System. Skipping!`);
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
  console.log(`Total active G9-ក students checked against PDF: ${activeStudentsChecked}`);
  console.log(`Students with score differences: ${studentsWithDiscrepancies}`);
  console.log(`Total exact score matches: ${totalMatches}`);
  console.log(`Total score discrepancies to update: ${totalDiscrepancies}`);
  console.log(`========================================`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

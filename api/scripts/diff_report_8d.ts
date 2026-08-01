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
}

const pdfData: RowData[] = [
  { no: '0001', studentId: '25080166', name: 'កូវ ស្ទីវិន', khmer: 51, moral: 39, hist: 44, geo: 49, math: 63, phy: 2, chem: 15, bio: 48, earth: 48, eng: 15, he: 44, ict: 48, agri: 45, sports: 50 },
  { no: '0002', studentId: '25080167', name: 'កែវ ផាន់សុភក្រ្តា', khmer: 76, moral: 45, hist: 36, geo: 50, math: 94, phy: 50, chem: 50, bio: 48, earth: 50, eng: 25, he: 50, ict: 49, agri: 45, sports: 50 },
  { no: '0003', studentId: '25080168', name: 'ខាន់ សុកប្រេម', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0 },
  { no: '0004', studentId: '25080169', name: 'គា សុវណ្ណា', khmer: 56, moral: 48, hist: 48, geo: 40, math: 85, phy: 5, chem: 16, bio: 40, earth: 50, eng: 30, he: 49, ict: 49, agri: 45, sports: 50 },
  { no: '0005', studentId: '25080170', name: 'គីន ចរិយា', khmer: 68, moral: 47, hist: 35, geo: 50, math: 70, phy: 18, chem: 38, bio: 30, earth: 48, eng: 25, he: 44, ict: 47, agri: 45, sports: 50 },
  { no: '0006', studentId: '25080171', name: 'គឹម ស្រីនីម', khmer: 63, moral: 46, hist: 11, geo: 45, math: 62, phy: 1, chem: 3, bio: 30, earth: 48, eng: 40, he: 45, ict: 49, agri: 20, sports: 30 },
  { no: '0007', studentId: '25080172', name: 'គឿង សុបញ្ញា', khmer: 61, moral: 40, hist: 28, geo: 50, math: 70, phy: 20, chem: 34, bio: 48, earth: 50, eng: 20, he: 48, ict: 49, agri: 0, sports: 0 },
  { no: '0008', studentId: '25080173', name: 'ឃន់ សៀវឡុង', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0 },
  { no: '0009', studentId: '25080174', name: 'ចាន់ រតនា', khmer: 48, moral: 44, hist: 48, geo: 50, math: 74, phy: 7, chem: 30, bio: 48, earth: 50, eng: 30, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0010', studentId: '25080175', name: 'ចំរើន រដ្ឋាណា', khmer: 53, moral: 48, hist: 36, geo: 50, math: 80, phy: 5, chem: 18, bio: 48, earth: 48, eng: 20, he: 46, ict: 49, agri: 45, sports: 50 },
  { no: '0011', studentId: '25080176', name: 'ឆាយ ឈន់មន្នីនាថ', khmer: 57, moral: 41, hist: 35, geo: 48, math: 49, phy: 5, chem: 20, bio: 40, earth: 46, eng: 15, he: 41, ict: 49, agri: 0, sports: 40 },
  { no: '0012', studentId: '25080177', name: 'ឈន វិច្ឆិកា', khmer: 21, moral: 26, hist: 30, geo: 25, math: 60, phy: 0, chem: 12, bio: 10, earth: 0, eng: 0, he: 8, ict: 0, agri: 0, sports: 0 },
  { no: '0013', studentId: '25080178', name: 'ឌី ដារីកា', khmer: 56, moral: 48, hist: 36, geo: 50, math: 65, phy: 23, chem: 22, bio: 48, earth: 48, eng: 35, he: 50, ict: 49, agri: 45, sports: 30 },
  { no: '0014', studentId: '25080179', name: 'ឌីម៉ង់ ស្រីកាវត្តី', khmer: 42, moral: 42, hist: 42, geo: 50, math: 35, phy: 2, chem: 18, bio: 30, earth: 50, eng: 0, he: 30, ict: 45, agri: 45, sports: 30 },
  { no: '0015', studentId: '25080180', name: 'ណាក់ ដាលីន', khmer: 58, moral: 42, hist: 25, geo: 50, math: 50, phy: 2, chem: 9, bio: 40, earth: 50, eng: 0, he: 22, ict: 25, agri: 45, sports: 50 },
  { no: '0016', studentId: '25080181', name: 'ណាំ ដានីន', khmer: 69, moral: 40, hist: 34, geo: 40, math: 40, phy: 5, chem: 9, bio: 40, earth: 48, eng: 10, he: 45, ict: 40, agri: 45, sports: 40 },
  { no: '0017', studentId: '25080182', name: 'ថង មុន្នីរ័ត្ន', khmer: 57, moral: 48, hist: 41, geo: 50, math: 90, phy: 2, chem: 10, bio: 40, earth: 48, eng: 40, he: 43, ict: 49, agri: 45, sports: 50 },
  { no: '0018', studentId: '25080183', name: 'ថន ស៊ីមថៃ', khmer: 36, moral: 41, hist: 36, geo: 50, math: 40, phy: 10, chem: 30, bio: 30, earth: 50, eng: 25, he: 46, ict: 49, agri: 45, sports: 30 },
  { no: '0019', studentId: '25080184', name: 'ទ្រី សុខហេង', khmer: 52, moral: 24, hist: 48, geo: 50, math: 45, phy: 7, chem: 10, bio: 30, earth: 48, eng: 20, he: 36, ict: 49, agri: 45, sports: 30 },
  { no: '0020', studentId: '25080185', name: 'នាត ហ្វីយ៉ា', khmer: 55, moral: 45, hist: 43, geo: 50, math: 50, phy: 9, chem: 22, bio: 30, earth: 50, eng: 15, he: 42, ict: 49, agri: 45, sports: 40 },
  { no: '0021', studentId: '25080186', name: 'នី លីតា', khmer: 79, moral: 48, hist: 46, geo: 50, math: 80, phy: 48, chem: 41, bio: 48, earth: 48, eng: 20, he: 50, ict: 50, agri: 45, sports: 40 },
  { no: '0022', studentId: '25080187', name: 'នៅ ស៊ីណា', khmer: 0, moral: 43, hist: 0, geo: 0, math: 30, phy: 5, chem: 19, bio: 10, earth: 50, eng: 10, he: 0, ict: 49, agri: 0, sports: 0 },
  { no: '0023', studentId: '25080188', name: 'ប៊ុនហួរ សាន់ណា', khmer: 21, moral: 44, hist: 4, geo: 10, math: 64, phy: 2, chem: 27, bio: 0, earth: 50, eng: 5, he: 0, ict: 49, agri: 0, sports: 0 },
  { no: '0024', studentId: '25080189', name: 'បារាំង សុបារី', khmer: 80, moral: 46, hist: 43, geo: 50, math: 67, phy: 2, chem: 34, bio: 48, earth: 48, eng: 45, he: 24, ict: 49, agri: 45, sports: 50 },
  { no: '0025', studentId: '25080190', name: 'ប្រន ចាន់រ៉ា', khmer: 63, moral: 45, hist: 35, geo: 50, math: 80, phy: 3, chem: 33, bio: 48, earth: 48, eng: 25, he: 43, ict: 49, agri: 45, sports: 40 },
  { no: '0026', studentId: '25080191', name: 'ផល ស្រីរឿន', khmer: 43, moral: 41, hist: 40, geo: 50, math: 60, phy: 7, chem: 20, bio: 48, earth: 48, eng: 25, he: 43, ict: 37, agri: 45, sports: 40 },
  { no: '0027', studentId: '25080192', name: 'ផាន់ សិរីមង្គល', khmer: 52, moral: 41, hist: 45, geo: 49, math: 48, phy: 2, chem: 9, bio: 40, earth: 48, eng: 45, he: 27, ict: 28, agri: 30, sports: 30 },
  { no: '0028', studentId: '25080193', name: 'ផុន នីសា', khmer: 80, moral: 45, hist: 43, geo: 50, math: 96, phy: 2, chem: 31, bio: 30, earth: 48, eng: 20, he: 48, ict: 50, agri: 40, sports: 30 },
  { no: '0029', studentId: '25080194', name: 'ពៅ រិទ្ធី', khmer: 54, moral: 48, hist: 45, geo: 50, math: 49, phy: 3, chem: 33, bio: 48, earth: 50, eng: 45, he: 46, ict: 46, agri: 45, sports: 40 },
  { no: '0030', studentId: '25080195', name: 'មល ដាលីន', khmer: 79, moral: 45, hist: 43, geo: 50, math: 70, phy: 6, chem: 23, bio: 48, earth: 48, eng: 10, he: 49, ict: 49, agri: 45, sports: 40 },
  { no: '0031', studentId: '25080196', name: 'ម៉ុយ ធារី', khmer: 75, moral: 48, hist: 42, geo: 50, math: 70, phy: 7, chem: 48, bio: 48, earth: 48, eng: 25, he: 47, ict: 49, agri: 45, sports: 30 },
  { no: '0032', studentId: '25080197', name: 'ម៉ៅ សុច័ន្ទសីហា', khmer: 46, moral: 38, hist: 37, geo: 49, math: 50, phy: 6, chem: 11, bio: 48, earth: 48, eng: 20, he: 32, ict: 49, agri: 45, sports: 40 },
  { no: '0033', studentId: '25080198', name: 'មិ ម៉ារ៉ា', khmer: 85, moral: 49, hist: 48, geo: 50, math: 96, phy: 49, chem: 44, bio: 48, earth: 50, eng: 40, he: 48, ict: 50, agri: 45, sports: 40 },
  { no: '0034', studentId: '25080199', name: 'យ៉ា បញ្ញា', khmer: 32, moral: 41, hist: 27, geo: 49, math: 30, phy: 1, chem: 22, bio: 48, earth: 50, eng: 20, he: 46, ict: 50, agri: 0, sports: 0 },
  { no: '0035', studentId: '25080200', name: 'យឹម រដ្ឋា', khmer: 26, moral: 27, hist: 5, geo: 20, math: 50, phy: 1, chem: 9, bio: 15, earth: 0, eng: 20, he: 23, ict: 11, agri: 0, sports: 0 },
  { no: '0036', studentId: '25080201', name: 'រ៉ើន សុមាន', khmer: 79, moral: 47, hist: 40, geo: 50, math: 80, phy: 6, chem: 30, bio: 48, earth: 46, eng: 35, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0037', studentId: '25080202', name: 'រិន គន្ធា', khmer: 79, moral: 40, hist: 42, geo: 50, math: 83, phy: 23, chem: 14, bio: 45, earth: 46, eng: 40, he: 48, ict: 49, agri: 45, sports: 40 },
  { no: '0038', studentId: '25080203', name: 'រី ដារ៉ុង', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0 },
  { no: '0039', studentId: '25080204', name: 'រើន ធារិទ្ធ', khmer: 59, moral: 41, hist: 43, geo: 49, math: 69, phy: 24, chem: 16, bio: 48, earth: 48, eng: 10, he: 44, ict: 49, agri: 0, sports: 0 },
  { no: '0040', studentId: '25080205', name: 'រឿន រិទ្ធី', khmer: 52, moral: 38, hist: 36, geo: 49, math: 60, phy: 4, chem: 41, bio: 48, earth: 48, eng: 25, he: 48, ict: 42, agri: 40, sports: 40 },
  { no: '0041', studentId: '25080206', name: 'រ័ត្ន ចរិយា', khmer: 79, moral: 47, hist: 42, geo: 50, math: 68, phy: 32, chem: 46, bio: 48, earth: 50, eng: 35, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0042', studentId: '25080207', name: 'លី សុខាវត្តី', khmer: 83, moral: 46, hist: 48, geo: 50, math: 97, phy: 26, chem: 49, bio: 48, earth: 48, eng: 50, he: 49, ict: 49, agri: 45, sports: 40 },
  { no: '0043', studentId: '25080208', name: 'លី សុឡាំ', khmer: 70, moral: 50, hist: 48, geo: 50, math: 82, phy: 20, chem: 20, bio: 30, earth: 48, eng: 15, he: 41, ict: 46, agri: 45, sports: 40 },
  { no: '0044', studentId: '25080209', name: 'លឿន សុមាលី', khmer: 58, moral: 47, hist: 24, geo: 50, math: 67, phy: 1, chem: 30, bio: 48, earth: 48, eng: 30, he: 48, ict: 49, agri: 40, sports: 40 },
  { no: '0045', studentId: '25080210', name: 'វង ច័ន្ទណា', khmer: 32, moral: 48, hist: 30, geo: 49, math: 75, phy: 1, chem: 11, bio: 35, earth: 50, eng: 0, he: 44, ict: 47, agri: 0, sports: 0 },
  { no: '0046', studentId: '25080211', name: 'វណ្ឌី លីនដា', khmer: 77, moral: 47, hist: 47, geo: 50, math: 56, phy: 3, chem: 39, bio: 48, earth: 48, eng: 50, he: 45, ict: 49, agri: 40, sports: 40 },
  { no: '0047', studentId: '25080212', name: 'វ៉ាត់ អេណា', khmer: 71, moral: 44, hist: 47, geo: 50, math: 90, phy: 21, chem: 37, bio: 45, earth: 48, eng: 50, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0048', studentId: '25080213', name: 'វីន ប៊ូណាន់ធីតាលយាន', khmer: 61, moral: 45, hist: 36, geo: 50, math: 90, phy: 26, chem: 42, bio: 48, earth: 48, eng: 35, he: 49, ict: 49, agri: 0, sports: 0 },
  { no: '0049', studentId: '25080214', name: 'វុទ្ធី វណ្ណកាណាន់', khmer: 59, moral: 46, hist: 47, geo: 50, math: 95, phy: 50, chem: 47, bio: 48, earth: 50, eng: 50, he: 50, ict: 49, agri: 45, sports: 40 },
  { no: '0050', studentId: '25080215', name: 'ស៊ីខា វ៉ាន់នី', khmer: 23, moral: 41, hist: 40, geo: 45, math: 37, phy: 2, chem: 3, bio: 30, earth: 48, eng: 15, he: 19, ict: 28, agri: 38, sports: 40 },
  { no: '0051', studentId: '25080216', name: 'សាត ដាវណ្ណមុនីនាថ', khmer: 85, moral: 47, hist: 49, geo: 50, math: 98, phy: 50, chem: 48, bio: 48, earth: 48, eng: 50, he: 48, ict: 49, agri: 45, sports: 40 },
  { no: '0052', studentId: '25080217', name: 'សាន គឹមសៀង', khmer: 58, moral: 46, hist: 22, geo: 48, math: 50, phy: 13, chem: 22, bio: 48, earth: 50, eng: 45, he: 50, ict: 49, agri: 45, sports: 40 },
  { no: '0053', studentId: '25080218', name: 'សាម៉ុន អមរា', khmer: 76, moral: 46, hist: 35, geo: 50, math: 98, phy: 16, chem: 40, bio: 45, earth: 48, eng: 50, he: 48, ict: 49, agri: 45, sports: 40 },
  { no: '0054', studentId: '25080219', name: 'សាយ សុភ័ក្ត', khmer: 93, moral: 44, hist: 48, geo: 50, math: 75, phy: 2, chem: 23, bio: 48, earth: 50, eng: 15, he: 49, ict: 41, agri: 45, sports: 30 },
  { no: '0055', studentId: '25080220', name: 'សុក សុវណ្ណស័ក', khmer: 50, moral: 43, hist: 26, geo: 50, math: 45, phy: 2, chem: 25, bio: 30, earth: 50, eng: 25, he: 43, ict: 49, agri: 45, sports: 40 },
  { no: '0056', studentId: '25080221', name: 'សុធា សុខាបញ្ញា', khmer: 0, moral: 0, hist: 0, geo: 0, math: 0, phy: 0, chem: 0, bio: 0, earth: 0, eng: 0, he: 0, ict: 0, agri: 0, sports: 0 },
  { no: '0057', studentId: '25080222', name: 'សុវណ្ណ អនុស្សា', khmer: 77, moral: 48, hist: 48, geo: 49, math: 98, phy: 32, chem: 46, bio: 35, earth: 50, eng: 40, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0058', studentId: '25080223', name: 'សុវណ្ណទីន សុជាតា', khmer: 82, moral: 46, hist: 49, geo: 50, math: 70, phy: 31, chem: 23, bio: 48, earth: 50, eng: 25, he: 48, ict: 49, agri: 45, sports: 50 },
  { no: '0059', studentId: '25080224', name: 'សូរ លីតា', khmer: 92, moral: 50, hist: 48, geo: 50, math: 98, phy: 50, chem: 47, bio: 48, earth: 48, eng: 50, he: 47, ict: 50, agri: 45, sports: 40 },
  { no: '0060', studentId: '25080225', name: 'ហ៊ុន រីណា', khmer: 64, moral: 39, hist: 4, geo: 28, math: 50, phy: 5, chem: 12, bio: 25, earth: 46, eng: 10, he: 23, ict: 44, agri: 35, sports: 20 },
  { no: '0061', studentId: '25080226', name: 'ហុច រ៉ាឌី', khmer: 63, moral: 44, hist: 46, geo: 50, math: 74, phy: 12, chem: 32, bio: 40, earth: 50, eng: 25, he: 47, ict: 49, agri: 45, sports: 40 },
  { no: '0062', studentId: '25080227', name: 'អ៊ន់ សុមន្ថា', khmer: 19, moral: 20, hist: 25, geo: 20, math: 55, phy: 2, chem: 6, bio: 30, earth: 46, eng: 0, he: 14, ict: 28, agri: 0, sports: 30 }
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

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zwfy000hq0jaf7ml4u89'; // ថ្នាក់ទី8ឃ (G8-ឃ)

  // Fetch all subject records for Grade 8
  const subjects = await prisma.subject.findMany({
    where: { code: { contains: '-G8' } }
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

  console.log('--- CORRECTED SCORE DIFFERENCES REPORT FOR ថ្នាក់ទី8ឃ (វិច្ឆិកា) ---');

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) {
      console.log(`ℹ️ PDF row [${pdfRow.no}] ${pdfRow.name} (${pdfRow.studentId}) is NOT inside 8ឃ in the System (transferred out). Skipping!`);
      continue;
    }

    activeStudentsChecked++;
    let studentHasDiff = false;
    const diffs: string[] = [];

    // Map targets to check
    const targets = [
      { code: 'WRITER-G8', score: pdfRow.khmer / 2 },
      { code: 'WRITING-G8', score: pdfRow.khmer / 2 },
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
  console.log(`Total active G8-ឃ students checked against PDF: ${activeStudentsChecked}`);
  console.log(`Students with score differences: ${studentsWithDiscrepancies}`);
  console.log(`Total exact score matches: ${totalMatches}`);
  console.log(`Total score discrepancies to update: ${totalDiscrepancies}`);
  console.log(`========================================`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

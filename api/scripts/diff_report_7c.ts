import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

const pdfData = [
  { no: '0001', studentId: '25070119', name: 'គា សុកឡាយ', scores: [52, 0, 19, 10, 25, 20, 2, 16, 0, 40, 5, 38, 10, 35, 0, 0] },
  { no: '0002', studentId: '25070120', name: 'គឿន សុក្រា', scores: [40, 20, 5, 10, 27, 38, 5, 31, 25, 40, 30, 25, 6, 15, 0, 0] },
  { no: '0003', studentId: '25070121', name: 'គឿន ពិសិទ្ធ', scores: [0, 10, 0, 10, 0, 5, 7, 39, 45, 40, 5, 0, 0, 15, 0, 0] },
  { no: '0004', studentId: '25070122', name: 'ចក់ សុជាតា', scores: [0, 0, 6, 46, 0, 28, 5, 0, 25, 40, 27, 0, 13, 35, 35, 0] },
  { no: '0005', studentId: '25070123', name: 'ចំរើន សុម៉ាវតី', scores: [38, 12, 14, 40, 25, 48, 2, 33, 0, 35, 34, 37, 1, 45, 50, 0] },
  { no: '0006', studentId: '25070124', name: 'ឌឿន រុស្សា', scores: [0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 5, 0, 0, 15, 0, 0] },
  { no: '0007', studentId: '25070125', name: 'ថា វិច្ឆិកា', scores: [50, 10, 9, 46, 25, 15, 2, 30, 10, 40, 19, 25, 10, 45, 50, 0] },
  { no: '0008', studentId: '25070126', name: 'ថុល ចន្ទថៃ', scores: [0, 7, 9, 18, 0, 39, 6, 20, 25, 40, 29, 0, 2, 15, 0, 0] },
  { no: '0009', studentId: '25070127', name: 'ធា ប៊ុនថង', scores: [18, 2, 5, 0, 0, 0, 2, 15, 0, 0, 15, 0, 8, 45, 35, 0] },
  { no: '0010', studentId: '25070128', name: 'នាង សានិត', scores: [50, 7, 6, 24, 50, 10, 4, 19, 45, 40, 5, 35, 7, 45, 50, 0] },
  { no: '0011', studentId: '25070129', name: 'ប៉ក់ បញ្ញាវ័ន', scores: [45, 19, 24, 10, 30, 16, 2, 29, 0, 40, 32, 25, 10, 45, 50, 0] },
  { no: '0012', studentId: '25070130', name: 'ប៉ិច លីណា', scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 5, 0, 0, 15, 0, 0] },
  { no: '0013', studentId: '25070131', name: 'បូរ សុសារ', scores: [25, 12, 30, 25, 27, 5, 5, 17, 0, 40, 5, 50, 13, 45, 35, 0] },
  { no: '0014', studentId: '25070132', name: 'ផាន់ គឹមលន់', scores: [25, 20, 27, 10, 15, 32, 3, 45, 10, 35, 38, 37, 3, 15, 0, 0] },
  { no: '0015', studentId: '25070133', name: 'ពិន សុខា', scores: [50, 16, 19, 10, 27, 20, 15, 25, 25, 40, 12, 22, 3, 15, 0, 0] },
  { no: '0016', studentId: '25070134', name: 'ពុំ ពូក', scores: [28, 7, 16, 46, 50, 43, 6, 26, 25, 40, 20, 35, 21, 45, 50, 0] },
  { no: '0017', studentId: '25070135', name: 'ពៅ មករា', scores: [35, 8, 12, 12, 27, 15, 2, 20, 20, 40, 25, 38, 7, 45, 50, 0] },
  { no: '0018', studentId: '25070136', name: 'ព្រឿន ចាន់ណារ័ត្ន', scores: [0, 23, 12, 46, 40, 10, 5, 0, 0, 35, 25, 38, 10, 45, 50, 0] },
  { no: '0019', studentId: '25070137', name: 'ព្រំ ចាន់វាសនា', scores: [22, 17, 12, 15, 45, 58, 5, 47, 45, 40, 30, 38, 4, 45, 35, 0] },
  { no: '0020', studentId: '25070138', name: 'ភី សុវឌ្ឍនា', scores: [35, 29, 16, 25, 50, 10, 8, 48, 25, 20, 27, 35, 2, 45, 50, 0] },
  { no: '0021', studentId: '25070139', name: 'ម៉ាប់ សុវិន', scores: [44, 17, 24, 46, 45, 28, 2, 32, 25, 20, 34, 38, 16, 45, 50, 0] },
  { no: '0022', studentId: '25070140', name: 'ម៉ូវ រតនៈឧត្តម', scores: [32, 20, 6, 16, 5, 8, 3, 11, 25, 40, 22, 38, 3, 45, 50, 0] },
  { no: '0023', studentId: '25070141', name: 'យ៉ន ស្រីនី', scores: [50, 21, 5, 44, 25, 28, 2, 42, 25, 35, 35, 37, 15, 45, 35, 0] },
  { no: '0024', studentId: '25070142', name: 'យោ លឹមសេង', scores: [27, 20, 20, 10, 27, 53, 3, 28, 10, 40, 32, 22, 3, 15, 35, 0] },
  { no: '0025', studentId: '25070143', name: 'រន សុភា', scores: [50, 16, 14, 25, 30, 21, 10, 29, 25, 40, 7, 25, 3, 45, 50, 0] },
  { no: '0026', studentId: '25070144', name: 'រ៉ា ឧត្តម', scores: [23, 3, 11, 0, 0, 15, 2, 8, 25, 0, 25, 0, 3, 15, 35, 0] },
  { no: '0027', studentId: '25070145', name: 'រ៉ូ សារាជ', scores: [35, 5, 8, 46, 10, 30, 2, 6, 45, 40, 28, 22, 3, 45, 50, 0] },
  { no: '0028', studentId: '25070146', name: 'រ៉ូន វុទ្ធា', scores: [54, 26, 14, 16, 50, 84, 9, 46, 25, 20, 40, 35, 40, 45, 30, 0] },
  { no: '0029', studentId: '25070147', name: 'រួន សុណេត', scores: [23, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 15, 0, 0, 0] },
  { no: '0030', studentId: '25070148', name: 'លី បញ្ញាស្រីនុច', scores: [55, 30, 23, 46, 30, 60, 15, 40, 20, 40, 37, 50, 28, 45, 48, 0] },
  { no: '0031', studentId: '25070149', name: 'លីន ស្រីឡាត់', scores: [29, 21, 45, 40, 47, 2, 0, 0, 35, 25, 38, 10, 45, 50, 0, 0] },
  { no: '0032', studentId: '25070150', name: 'វិបុល ច័ន្ទសុធារី', scores: [27, 0, 13, 35, 20, 15, 3, 33, 40, 40, 10, 22, 0, 15, 0, 0] },
  { no: '0033', studentId: '25070151', name: 'វី សុជាវិរៈ', scores: [22, 0, 5, 16, 20, 18, 2, 33, 48, 35, 23, 33, 14, 45, 35, 0] },
  { no: '0034', studentId: '25070152', name: 'ស៊ាត សយ', scores: [35, 40, 40, 46, 27, 65, 5, 46, 0, 20, 40, 38, 45, 45, 50, 0] },
  { no: '0035', studentId: '25070153', name: 'ស៊ុប ម៉ាណា', scores: [30, 32, 47, 46, 50, 64, 18, 46, 0, 40, 37, 50, 48, 45, 35, 0] },
  { no: '0036', studentId: '25070154', name: 'សី សុម៉ាល័យ', scores: [23, 19, 17, 46, 30, 51, 5, 49, 0, 40, 40, 33, 5, 45, 50, 0] },
  { no: '0037', studentId: '25070155', name: 'សុខ ពៀវ', scores: [20, 9, 16, 12, 10, 28, 2, 16, 25, 0, 20, 33, 2, 45, 35, 0] },
  { no: '0038', studentId: '25070156', name: 'សេង មន្នីរចនា', scores: [40, 21, 6, 46, 40, 50, 4, 23, 48, 20, 43, 38, 6, 45, 50, 0] },
  { no: '0039', studentId: '25070157', name: 'សៅ ពិសី', scores: [58, 27, 42, 46, 30, 68, 10, 48, 0, 40, 34, 50, 40, 45, 50, 0] },
  { no: '0040', studentId: '25070158', name: 'ហាត់ វណ្ណៈ', scores: [5, 25, 6, 10, 0, 10, 6, 21, 0, 40, 5, 0, 28, 15, 0, 0] },
  { no: '0041', studentId: '25070159', name: 'ហៀង ឈុនហុង', scores: [45, 15, 35, 0, 15, 0, 2, 11, 0, 20, 5, 38, 10, 35, 20, 0] },
  { no: '0042', studentId: '25070160', name: 'ឡុត បូរិន', scores: [27, 7, 0, 0, 50, 0, 0, 28, 25, 0, 5, 38, 0, 15, 0, 0] },
  { no: '0043', studentId: '25070161', name: 'ឡេន ស្រីភ័ស', scores: [45, 22, 28, 46, 10, 20, 10, 46, 25, 35, 40, 37, 14, 45, 50, 0] },
  { no: '0044', studentId: '25070162', name: 'អ៊ិន ផាន់ណ្ណា', scores: [55, 21, 5, 25, 30, 40, 5, 32, 25, 40, 47, 25, 7, 45, 35, 0] },
  { no: '0045', studentId: '25070163', name: 'អឿន ភារម្យ', scores: [30, 5, 5, 46, 27, 53, 2, 21, 0, 40, 37, 25, 3, 45, 20, 0] },
  { no: '0046', studentId: '25090091', name: 'យ៉ុង វិស៊ូ', scores: [45, 10, 12, 12, 30, 32, 0, 0, 12, 40, 0, 25, 0, 45, 0, 0] },
  { no: '0047', studentId: '25070274', name: 'តាប់ ចំរើន', scores: [0, 0, 12, 10, 10, 0, 0, 0, 0, 0, 0, 33, 0, 45, 35, 0] }
];

const subjectCodes = [
  'WRITER-G7', 'WRITING-G7', 'MORAL-G7', 'HIST-G7', 'GEO-G7', 'MATH-G7',
  'PHY-G7', 'CHEM-G7', 'BIO-G7', 'EARTH-G7', 'ENG-G7',
  'HE-G7', 'HLTH-G7', 'SPORTS-G7', 'AGRI-G7', 'ICT-G7'
];

async function main() {
  await connectDatabase();
  const classId = 'cmiq7zsqx0005q0jatgouva40'; // ថ្នាក់ទី7គ (G7-គ)

  const subjects = await prisma.subject.findMany({
    where: { code: { in: subjectCodes } }
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

  console.log('--- SCORE DIFFERENCES REPORT FOR ថ្នាក់ទី7គ (វិច្ឆិកា) ---');

  for (const pdfRow of pdfData) {
    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st) {
      console.log(`ℹ️ PDF row [${pdfRow.no}] ${pdfRow.name} (${pdfRow.studentId}) is NOT inside 7គ in the System (transferred out). Skipping!`);
      continue;
    }

    activeStudentsChecked++;
    let studentHasDiff = false;
    const diffs: string[] = [];

    for (let i = 0; i < 16; i++) {
      const code = subjectCodes[i];
      const subInfo = subMap[code];
      const pdfScore = pdfRow.scores[i];

      const g = grades.find(x => x.studentId === st.id && x.subjectId === subInfo.id);
      const dbScore = g ? g.score : null;

      if (dbScore !== pdfScore) {
        studentHasDiff = true;
        totalDiscrepancies++;
        diffs.push(`   - ${subInfo.nameKh} (${code}): DB score = ${dbScore === null ? 'MISSING' : dbScore} | PDF score = ${pdfScore}`);
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
  console.log(`Total active G7-គ students checked against PDF: ${activeStudentsChecked}`);
  console.log(`Students with score differences: ${studentsWithDiscrepancies}`);
  console.log(`Total exact score matches: ${totalMatches}`);
  console.log(`Total score discrepancies to update: ${totalDiscrepancies}`);
  console.log(`========================================`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

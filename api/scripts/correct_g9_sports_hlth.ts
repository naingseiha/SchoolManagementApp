import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const classIds = {
  g9a: 'cmiq7zwy1000jq0jalus7rknx', // G9-ក
  g9b: 'cmiq7zxhq000lq0jagpi729wu', // G9-ខ
  g9c: 'cmiq7zy6z000nq0jaeinbeyfd', // G9-គ
  g9d: 'cmiq7zyos000pq0jawwgzbdr7'  // G9-ឃ
};

interface RowData {
  studentId: string;
  name: string;
  sports: number;
  skip?: boolean;
}

const pdfData9a: RowData[] = [
  { studentId: '25090001', name: 'កៅ  គុន', sports: 25 },
  { studentId: '25090002', name: 'ខន សុវណ្ណនីតា', sports: 25 },
  { studentId: '25090003', name: 'គឹម កក្កដា', sports: 50 },
  { studentId: '25090004', name: 'គឹម មេងស៊ាង', sports: 50 },
  { studentId: '25090005', name: 'គឿន ចាន់ថន', sports: 50 },
  { studentId: '25090006', name: 'ចាន់ មនីកា', sports: 50 },
  { studentId: '25090007', name: 'ជា  សុម៉ាណា', sports: 25 },
  { studentId: '25090008', name: 'ជា សុខរីណា', sports: 25 },
  { studentId: '25090009', name: 'ជាតិ ចាន់វាសនា', sports: 50 },
  { studentId: '25090010', name: 'ជួប  ស្រីរត្ន', sports: 25 },
  { studentId: '25090011', name: 'ជឿន នីតា', sports: 25 },
  { studentId: '25090012', name: 'ណាង  លីដា', sports: 50 },
  { studentId: '25090013', name: 'ណាត ស្រីនាថ', sports: 25 },
  { studentId: '25090014', name: 'តាន់ កន្និកាពេជ្រ', sports: 25 },
  { studentId: '25090015', name: 'ថន សុនីតា', sports: 50 },
  { studentId: '25090016', name: 'ថេន រតនា', sports: 50 },
  { studentId: '25090017', name: 'ទីន ច័ន្ទរីយ៉ា', sports: 50 },
  { studentId: '25090018', name: 'ទៀង ច័ន្ទរីយ៉ា', sports: 50 },
  { studentId: '25090019', name: 'ប្រុស  វ៉ាន់ណារ៉ា', sports: 50 },
  { studentId: '25090020', name: 'ផន សុធារី', sports: 25 },
  { studentId: '25090021', name: 'ផាង សេរីឧត្តម', sports: 50 },
  { studentId: '25090022', name: 'ផុន  ច័ន្ទរតនា', sports: 50 },
  { studentId: '25090023', name: 'ផៃ ឧត្តម', sports: 50 },
  { studentId: '25090024', name: 'ព្រំ  លីណា', sports: 50 },
  { studentId: '25090025', name: 'ភាជ ស៊ីផៃ', sports: 50 },
  { studentId: '25090026', name: 'ម៉ាប់ ស្រីឡែន', sports: 50 },
  { studentId: '25090027', name: 'ម៉េង  ស្រីណាត', sports: 25 },
  { studentId: '25090028', name: 'មាន  រតនា', sports: 50 },
  { studentId: '25090029', name: 'យ៉េត រតនៈ', sports: 50 },
  { studentId: '25090030', name: 'យិនអ៉ឹម ពេជ្រសោម៉ាវត្តី', sports: 50 },
  { studentId: '25090031', name: 'យឿង គឹមហេង', sports: 25 },
  { studentId: '25090032', name: 'រ៉ាំ រតនា', sports: 50 },
  { studentId: '25090033', name: 'រ៉ី  ស៊ីថា', sports: 50 },
  { studentId: '25090034', name: 'រិន សារីន', sports: 25 },
  { studentId: '25090035', name: 'រូ  ម៉ីជឺ', sports: 50 },
  { studentId: '25090036', name: 'រើន  សុវណ្ណរាជ', sports: 50 },
  { studentId: '25090037', name: 'រើន វាសនា', sports: 50 },
  { studentId: '25090038', name: 'រឿន រតនៈសៀវអ៊ី', sports: 50 },
  { studentId: '25090039', name: 'រ័ត្ន លីតា', sports: 25 },
  { studentId: '25090040', name: 'លន់ ឡៃ', sports: 0 },
  { studentId: '25090041', name: 'វាសនា ចន្ធី', sports: 25 },
  { studentId: '25090042', name: 'សុភារិទ្ធិ  សុផលមុន្នី', sports: 50 },
  { studentId: '25090043', name: 'សុវណ្ណារី នីតា', sports: 50 },
  { studentId: '25090044', name: 'សេង បញ្ញាវុទ្ធ', sports: 50 },
  { studentId: '25090045', name: 'សោម  សុវណ្ណវិជ្ជរា', sports: 25 },
  { studentId: '25090046', name: 'ហាក់ ប៊ុនលាភ', sports: 50 }
];

const pdfData9b: RowData[] = [
  { studentId: '25090047', name: 'គ្រុំ រុំមិនា', sports: 50 },
  { studentId: '25090048', name: 'ឆន សូលីតា', sports: 50 },
  { studentId: '25090049', name: 'ឆោម សុភា', sports: 50 },
  { studentId: '25090050', name: 'ជា ស្រីនិច', sports: 45 },
  { studentId: '25090051', name: 'ឈឹម សុធាវី', sports: 50 },
  { studentId: '25090052', name: 'ណាក់ កូណា', sports: 50 },
  { studentId: '25090053', name: 'តាំង លាងហុង', sports: 50 },
  { studentId: '25090054', name: 'ថា ផារី', sports: 50 },
  { studentId: '25090055', name: 'ផាន់ ប៊ុនឡេង', sports: 50 },
  { studentId: '25090056', name: 'ភាន់ រ៉ាវី', sports: 0 },
  { studentId: '25090057', name: 'ភាព ស្រីល័ក្ខណ៍', sports: 50 },
  { studentId: '25090058', name: 'ភារម្យ មករា', sports: 50 },
  { studentId: '25090059', name: 'ភឿន ច័ន្ទនីរ័ត្ន', sports: 50 },
  { studentId: '25090060', name: 'ម៉យ សុហួ', sports: 50 },
  { studentId: '25090061', name: 'ម៉ាន សុមាន', sports: 50 },
  { studentId: '25090062', name: 'ម៉ៅ សុផាន់ណា', sports: 50 },
  { studentId: '25090063', name: 'មួន សូលីកា', sports: 50 },
  { studentId: '25090064', name: 'រួន ណារ៉ា', sports: 50 },
  { studentId: '25090065', name: 'អាង ធារ៉ា', sports: 0 },
  { studentId: '25090066', name: 'លាង លីហួរ', sports: 50 },
  { studentId: '25090067', name: 'លឹម ភួងរក្សា', sports: 50 },
  { studentId: '25090068', name: 'វណ្ណរ៉ូ សៀវម៉ី', sports: 47 },
  { studentId: '25090069', name: 'វណ្ណរ៉ូ សៀវម៉ីញ', sports: 50 },
  { studentId: '25090070', name: 'វេញ វិស្នារ៉ាវី', sports: 50 },
  { studentId: '25090071', name: 'ស៊ន ​នីសា', sports: 50 },
  { studentId: '25090072', name: 'ស៊ុន អានីសា', sports: 50 },
  { studentId: '25090073', name: 'សាវឿត សួស្តី', sports: 25 },
  { studentId: '25090074', name: 'សាំ រក្សា', sports: 50 },
  { studentId: '25090075', name: 'សិទ្ធ សីហា', sports: 50 },
  { studentId: '25090076', name: 'សីហា មន្នី', sports: 48 },
  { studentId: '25090077', name: 'សៀង វាសនា', sports: 50 },
  { studentId: '25090078', name: 'ស្រស់ ច័ន្ទឌី', sports: 45 },
  { studentId: '25090079', name: 'ស្រី សាវរីន', sports: 25 },
  { studentId: '25090080', name: 'សំ  សុជាតិ', sports: 50 },
  { studentId: '25090081', name: 'សំ សុរីយ៉ា', sports: 50 },
  { studentId: '25090082', name: 'ហាង សុខហេង', sports: 50 },
  { studentId: '25090083', name: 'ហេង លីដា', sports: 50 },
  { studentId: '25090084', name: 'ឡង គឹមឡាយ', sports: 50 },
  { studentId: '25090085', name: 'ឡាយ គឹមលាន', sports: 50 },
  { studentId: '25090086', name: 'ឧត្តម ដាវី', sports: 45 },
  { studentId: '25090087', name: 'អូន សេងហាក់', sports: 50 }
];

const pdfData9c: RowData[] = [
  { studentId: '25090088', name: 'កឹក សំណាង', sports: 0 },
  { studentId: '25090089', name: 'គា រក្សា', sports: 35 },
  { studentId: '25090090', name: 'គា សុជា', sports: 0 },
  { studentId: '25090134', name: 'គឿន រាត្រី', sports: 0, skip: true },
  { studentId: '25090092', name: 'ឆេង សីហា', sports: 20 },
  { studentId: '25090093', name: 'ជា សំណាង', sports: 0 },
  { studentId: '25090094', name: 'ជុំ ថាននរៈ', sports: 35 },
  { studentId: '25090095', name: 'ឈុន ណានឈៀវ', sports: 0 },
  { studentId: '25090096', name: 'ណន រ័ត្ននះ', sports: 0 },
  { studentId: '25090097', name: 'ណាង វណ្ណណេ', sports: 35 },
  { studentId: '25090098', name: 'ណុប ផាន់ណា', sports: 35 },
  { studentId: '25090099', name: 'ថា រ៉ូហ្សា', sports: 20 },
  { studentId: '25090100', name: 'ទីវ ដាវិន', sports: 35 },
  { studentId: '25090101', name: 'ទឹម សុប៊ុនលី', sports: 20 },
  { studentId: '25090102', name: 'ទូច តុង', sports: 30 },
  { studentId: '25090103', name: 'ទូច សីហា', sports: 30 },
  { studentId: '25090104', name: 'ធី ពេជ្រកម្មនថាត់', sports: 0 },
  { studentId: '25090105', name: 'ប៉ុន កុលលិនី', sports: 35 },
  { studentId: '25090106', name: 'ប៉ូ សុភី', sports: 0 },
  { studentId: '25090107', name: 'ប៉ែន ឆៃរ៉ានុត', sports: 35 },
  { studentId: '25090108', name: 'ប៊ុន វណ្ណៈ', sports: 35 },
  { studentId: '25090109', name: 'បូ សុភី', sports: 50 },
  { studentId: '25090110', name: 'បូរ វណ្ណៈ', sports: 35 },
  { studentId: '25090111', name: 'ផាន់ សូហ្វីលីយ៉ា', sports: 20 },
  { studentId: '25090112', name: 'ពុំ ប៉', sports: 20 },
  { studentId: '25090113', name: 'ព្រេង វិច្ឆិកា', sports: 35 },
  { studentId: '25090114', name: 'ម៉ន សុម៉ុន', sports: 0 },
  { studentId: 'គ_សុផានណា', name: 'គ សុផានណា', sports: 0, skip: true },
  { studentId: '25090116', name: 'រស្មី ច័ន្ទកនិកា', sports: 35 },
  { studentId: '25090117', name: 'លយ សៀងហៃ', sports: 0 },
  { studentId: '25090118', name: 'វឿង វណ្ណារី', sports: 20 },
  { studentId: '25090119', name: 'សន វាសនា', sports: 50 },
  { studentId: '25090120', name: 'សាន សុដាវណ្ណ', sports: 50 },
  { studentId: '25090121', name: 'សិញ ពិសិដ្ឋ', sports: 50 },
  { studentId: '25090122', name: 'សុន សុមុនី', sports: 35 },
  { studentId: '25090123', name: 'សឿន សុខសំណាង', sports: 35 },
  { studentId: '25090124', name: 'សេក សុនីសា', sports: 20 },
  { studentId: '25090125', name: 'សោម ដេវីត', sports: 50 },
  { studentId: '25090126', name: 'ស្រេង ហេងរិទ្ធីរាជ', sports: 35 },
  { studentId: '25090127', name: 'ហាប វិបុល', sports: 20 },
  { studentId: '25090128', name: 'ហៀង សីហា', sports: 50 },
  { studentId: '25090129', name: 'ហៃ ហ៊ានឌី', sports: 50 },
  { studentId: '25090130', name: 'អែល រ័ត្ន', sports: 50 }
];

const pdfData9d: RowData[] = [
  { studentId: '25090131', name: 'ក្រីយ៉ា សាគី', sports: 50 },
  { studentId: '25090132', name: 'ខន សុខុនកញ្ញា', sports: 50 },
  { studentId: '25090133', name: 'គុណ រិទ្ធី', sports: 50 },
  { studentId: '25090134', name: 'គឿន រាត្រី', sports: 50 },
  { studentId: '25090135', name: 'គ្រីសំណាង កាណាន់', sports: 50 },
  { studentId: '25090136', name: 'ឃីម សុខរម្យនា', sports: 0 },
  { studentId: '25090137', name: 'ងីន ឌីណា', sports: 50 },
  { studentId: '25090138', name: 'ចាប អ៊ីហ្វុង', sports: 50 },
  { studentId: '25090139', name: 'ឆោម អេនជី', sports: 20 },
  { studentId: '25090140', name: 'ជា សុខា', sports: 50 },
  { studentId: '25090141', name: 'ជុក ចាន់យ៉ាផារិន', sports: 50 },
  { studentId: '25090142', name: 'ឌឿន លក្ខណា', sports: 35 },
  { studentId: '25090143', name: 'តាំង តុងឈី', sports: 35 },
  { studentId: '25090144', name: 'តែម សុជាតិ', sports: 50 },
  { studentId: '25090145', name: 'ធូ សុខឡៃហេង', sports: 35 },
  { studentId: '25090146', name: 'នី កន្និកា', sports: 0 },
  { studentId: '25090147', name: 'បាន សុមៀន', sports: 50 },
  { studentId: '25090148', name: 'បួន រ៉ាយុទ្ធ', sports: 50 },
  { studentId: '25090149', name: 'ផាន ធារី', sports: 50 },
  { studentId: '25090150', name: 'ផាន់ ហេងលាភ', sports: 50 },
  { studentId: '25090151', name: 'ព្រំ ពន្លឺ', sports: 50 },
  { studentId: '25090152', name: 'ភី រក្សា', sports: 45 },
  { studentId: '25090153', name: 'មឿន ស្រីល័ក្ខ', sports: 35 },
  { studentId: '25090154', name: 'យ៉ាន ចាន់ណេ', sports: 35 },
  { studentId: '25090155', name: 'យាន គីមហួង', sports: 50 },
  { studentId: '25090156', name: 'រឹម ស្រីល័ក្ខ', sports: 50 },
  { studentId: '25090157', name: 'រឿន សោពណ៌', sports: 20 },
  { studentId: '25090158', name: 'ស៊ន់ ស្រីពេជ្រ', sports: 50 },
  { studentId: '25090159', name: 'សាង លីណា', sports: 50 },
  { studentId: '25090160', name: 'សាន សុម៉ារី', sports: 35 },
  { studentId: '25090161', name: 'សារ៉ូន សុម៉ាវត្តី', sports: 50 },
  { studentId: '25090162', name: 'សារ៉េត វីរៈ', sports: 20 },
  { studentId: '25090163', name: 'សឿម ស្រីណុច', sports: 50 },
  { studentId: '25090164', name: 'ហល់ លីហ៊ាង', sports: 50 },
  { studentId: '25090165', name: 'ហ៊ីម លីហួរ', sports: 50 },
  { studentId: '25090166', name: 'ហាន់ សារ៉ាវុឌ្ឍនា', sports: 50 },
  { studentId: '25090167', name: 'ហេង សុគង់', sports: 50 },
  { studentId: '25090168', name: 'ឡាន សេងលី', sports: 50 },
  { studentId: '25090169', name: 'ឡុង ប៉ស៊ំាង', sports: 35 },
  { studentId: '25090170', name: 'អន សុផាន', sports: 50 },
  { studentId: '25090171', name: 'អ៊ុក ចន្ថា', sports: 50 },
  { studentId: '25090172', name: 'អេង សុខា', sports: 50 },
  { studentId: '25090127', name: 'ហាប វិបុល', sports: 0, skip: true },
  { studentId: '25120229', name: 'យូ គង្គារ', sports: 25 }
];

const g9aSports = [41, 15, 35, 15, 29, 21, 32, 36, 15, 35, 32, 23, 21, 15, 24, 35, 21, 23, 27, 24, 42, 30, 35, 21, 27, 28, 15, 15, 15, 29, 18, 21, 20, 40, 26, 20, 31, 42, 27, 20, 18, 33, 20, 35, 35, 27];
const g9bSports = [10, 26, 27, 23, 33, 44, 24, 26, 27, 10, 26, 27, 21, 24, 36, 21, 10, 21, 0, 26, 19, 20, 26, 22, 29, 18, 25, 15, 29, 37, 24, 15, 24, 34, 29, 30, 20, 28, 19, 26, 28];
const g9dSports = [45, 45, 45, 45, 25, 25, 45, 50, 25, 25, 45, 45, 45, 45, 45, 25, 45, 45, 45, 45, 45, 45, 35, 45, 45, 35, 45, 45, 50, 45, 50, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 0, 25];

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1500): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      if (attempt === retries) throw e;
      if (e?.code === 'P1001' || e?.message?.includes('Can\'t reach database server') || e?.message?.includes('Closed connection')) {
        console.log(`⏳ DB connection lost/timeout (attempt ${attempt}). Retrying...`);
        await new Promise(r => setTimeout(r, delayMs));
        await connectDatabase();
      } else {
        throw e;
      }
    }
  }
  throw new Error('Retries exceeded');
}

async function updateClassGrades(classId: string, className: string, pdfData: RowData[], sportsArray: number[] | null) {
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`\n==================================================`);
  console.log(`⚙️ Correcting Health & Sports for ${className}`);
  console.log(`==================================================`);

  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { in: ['HLTH-G9', 'SPORTS-G9'] } }
  }));

  const hlthSubject = subjects.find(s => s.code === 'HLTH-G9')!;
  const sportsSubject = subjects.find(s => s.code === 'SPORTS-G9')!;

  const studentIds = pdfData.filter(p => !p.skip).map(p => p.studentId);
  const students = await withRetry(() => prisma.student.findMany({
    where: { studentId: { in: studentIds } }
  }));

  let updatedCount = 0;

  for (let idx = 0; idx < pdfData.length; idx++) {
    const pdfRow = pdfData[idx];
    if (pdfRow.skip) continue;

    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st || st.classId !== classId) continue;

    // Correct Health score: value currently stored in sports property of pdfRow
    const targetHlthScore = pdfRow.sports; 

    // Correct Sports score: value from the sportsArray, or 0 for G9-C
    const targetSportsScore = sportsArray ? sportsArray[idx] : 0;

    const targets = [
      { subject: hlthSubject, score: targetHlthScore },
      { subject: sportsSubject, score: targetSportsScore }
    ];

    for (const target of targets) {
      const existing = await withRetry(() => prisma.grade.findUnique({
        where: {
          studentId_subjectId_classId_month_year: {
            studentId: st.id,
            subjectId: target.subject.id,
            classId,
            month,
            year
          }
        }
      }));

      if (!existing || existing.score !== target.score) {
        const weightedScore = GradeCalculationService.calculateWeightedScore(target.score, target.subject.coefficient || 1);
        const percentage = GradeCalculationService.calculatePercentage(target.score, target.subject.maxScore);

        await withRetry(() => prisma.grade.upsert({
          where: {
            studentId_subjectId_classId_month_year: {
              studentId: st.id,
              subjectId: target.subject.id,
              classId,
              month,
              year
            }
          },
          update: {
            score: target.score,
            maxScore: target.subject.maxScore,
            weightedScore,
            percentage
          },
          create: {
            studentId: st.id,
            subjectId: target.subject.id,
            classId,
            month,
            year,
            score: target.score,
            maxScore: target.subject.maxScore,
            weightedScore,
            percentage
          }
        }));

        console.log(`   ✅ [${st.studentId}] ${st.khmerName} -> ${target.subject.nameKh}: old=${existing ? existing.score : 'MISSING'} -> new=${target.score}`);
        updatedCount++;
      }
    }
  }

  console.log(`✨ Updated/corrected ${updatedCount} grade records for ${className}`);

  console.log(`🔄 Recalculating summaries for ${className}...`);
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
  console.log(`✅ Recalculated summaries for ${summariesCount} students.`);

  console.log(`🔄 Recalculating ranks for ${className}...`);
  await withRetry(() => GradeCalculationService.calculateClassRanks(classId, month, year));
  console.log(`✅ Class ranks updated successfully!`);
}

async function main() {
  await connectDatabase();

  // Correct 9A
  await updateClassGrades(classIds.g9a, 'ថ្នាក់ទី9ក (G9-A)', pdfData9a, g9aSports);

  // Correct 9B
  await updateClassGrades(classIds.g9b, 'ថ្នាក់ទី9ខ (G9-B)', pdfData9b, g9bSports);

  // Correct 9C
  await updateClassGrades(classIds.g9c, 'ថ្នាក់ទី9គ (G9-C)', pdfData9c, null); // 9C Sports is always 0

  // Correct 9D
  await updateClassGrades(classIds.g9d, 'ថ្នាក់ទី9ឃ (G9-D)', pdfData9d, g9dSports);

  console.log('\n🎉 ALL GRADE 9 SPORTS & HEALTH GRADES CORRECTED SUCCESSFULLY!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

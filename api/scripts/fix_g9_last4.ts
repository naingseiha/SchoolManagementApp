import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import fs from 'fs';
import path from 'path';

interface RowData {
  studentId: string;
  name: string;
  he: number;
  ict: number;
  agri: number;
  sports: number;
  skip?: boolean;
}

function extractPdfData(filePath: string): RowData[] {
  const content = fs.readFileSync(filePath, 'utf8');
  // Find the array definition
  const match = content.match(/const pdfData[^=]*=\s*(\[[\s\S]*?\]);/);
  if (match) {
    // Evaluate the array safely
    // Since it's TS code but mostly just object literals, we can eval it
    const code = match[1].replace(/skip:\s*true/g, '"skip": true').replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"').replace(/\/\/.*$/gm, '');
    try {
      return JSON.parse(code);
    } catch (e) {
      console.log(`Failed to parse array in ${filePath} via JSON.parse, using eval...`);
      return eval(`(${match[1]})`);
    }
  }
  return [];
}

const classIds = {
  g9a: 'cmiq7zwy1000jq0jalus7rknx', // G9-ក
  g9b: 'cmiq7zxhq000lq0jagpi729wu', // G9-ខ
  g9c: 'cmiq7zy6z000nq0jaeinbeyfd', // G9-គ
  g9d: 'cmiq7zyos000pq0jawwgzbdr7'  // G9-ឃ
};

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

import { GradeCalculationService } from '../src/services/grade-calculation.service';

async function updateClassGrades(classId: string, className: string, pdfData: RowData[]) {
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`\n==================================================`);
  console.log(`⚙️ Correcting 4 subjects for ${className}`);
  console.log(`==================================================`);

  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { in: ['HLTH-G9', 'SPORTS-G9', 'AGRI-G9', 'ICT-G9', 'HE-G9'] } }
  }));

  const hlthSubject = subjects.find(s => s.code === 'HLTH-G9')!;
  const sportsSubject = subjects.find(s => s.code === 'SPORTS-G9')!;
  const agriSubject = subjects.find(s => s.code === 'AGRI-G9')!;
  const ictSubject = subjects.find(s => s.code === 'ICT-G9')!;
  const heSubject = subjects.find(s => s.code === 'HE-G9')!;

  const studentIds = pdfData.filter(p => !p.skip).map(p => p.studentId);
  const students = await withRetry(() => prisma.student.findMany({
    where: { studentId: { in: studentIds } }
  }));

  let updatedCount = 0;
  let deletedCount = 0;

  for (let idx = 0; idx < pdfData.length; idx++) {
    const pdfRow = pdfData[idx];
    if (pdfRow.skip) continue;

    const st = students.find(s => s.studentId === pdfRow.studentId);
    if (!st || st.classId !== classId) continue;

    // Based on user mapping:
    // he (Col 11) -> AGRI
    // ict (Col 12) -> HLTH
    // agri (Col 13) -> SPORTS
    // sports (Col 14) -> ICT
    const targets = [
      { subject: agriSubject, score: pdfRow.he },
      { subject: hlthSubject, score: pdfRow.ict },
      { subject: sportsSubject, score: pdfRow.agri },
      { subject: ictSubject, score: pdfRow.sports }
    ];

    for (const target of targets) {
      if (target.score === undefined || target.score === null) continue;
      
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
        updatedCount++;
      }
    }

    // Delete HE-G9 grade if it exists
    if (heSubject) {
      try {
        await withRetry(() => prisma.grade.delete({
          where: {
            studentId_subjectId_classId_month_year: {
              studentId: st.id,
              subjectId: heSubject.id,
              classId,
              month,
              year
            }
          }
        }));
        deletedCount++;
      } catch (e: any) {
        // Record to delete does not exist, ignore
      }
    }
  }

  console.log(`✨ Updated/corrected ${updatedCount} grade records, Deleted ${deletedCount} HE records for ${className}`);

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
  
  console.log(`🔄 Recalculating ranks for ${className}...`);
  await withRetry(() => GradeCalculationService.calculateClassRanks(classId, month, year));
  console.log(`✅ ${className} complete!`);
}

async function main() {
  await connectDatabase();

  const scriptDir = __dirname;
  
  const data9a = extractPdfData(path.join(scriptDir, 'update_nov_9a_to_pdf.ts'));
  const data9b = extractPdfData(path.join(scriptDir, 'update_nov_9b_to_pdf.ts'));
  const data9c = extractPdfData(path.join(scriptDir, 'update_nov_9c_to_pdf.ts'));
  const data9d = extractPdfData(path.join(scriptDir, 'update_nov_9d_to_pdf.ts'));

  await updateClassGrades(classIds.g9a, 'ថ្នាក់ទី9ក (G9-A)', data9a);
  await updateClassGrades(classIds.g9b, 'ថ្នាក់ទី9ខ (G9-B)', data9b);
  await updateClassGrades(classIds.g9c, 'ថ្នាក់ទី9គ (G9-C)', data9c);
  await updateClassGrades(classIds.g9d, 'ថ្នាក់ទី9ឃ (G9-D)', data9d);

  console.log('\n🎉 ALL GRADE 9 SUBJECT MAPPINGS FIXED SUCCESSFULLY!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

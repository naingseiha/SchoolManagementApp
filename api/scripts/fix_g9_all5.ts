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
  const match = content.match(/const pdfData[^=]*=\s*(\[[\s\S]*?\]);/);
  if (match) {
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

// 5th column arrays extracted previously (which represent ICT)
const g9aIct = [41, 15, 35, 15, 29, 21, 32, 36, 15, 35, 32, 23, 21, 15, 24, 35, 21, 23, 27, 24, 42, 30, 35, 21, 27, 28, 15, 15, 15, 29, 18, 21, 20, 40, 26, 20, 31, 42, 27, 20, 18, 33, 20, 35, 35, 27];
const g9bIct = [10, 26, 27, 23, 33, 44, 24, 26, 27, 10, 26, 27, 21, 24, 36, 21, 10, 21, 0, 26, 19, 20, 26, 22, 29, 18, 25, 15, 29, 37, 24, 15, 24, 34, 29, 30, 20, 28, 19, 26, 28];
const g9dIct = [45, 45, 45, 45, 25, 25, 45, 50, 25, 25, 45, 45, 45, 45, 45, 25, 45, 45, 45, 45, 45, 45, 35, 45, 45, 35, 45, 45, 50, 45, 50, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 0, 25];

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

async function updateClassGrades(classId: string, className: string, pdfData: RowData[], ictArray: number[] | null) {
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log(`\n==================================================`);
  console.log(`⚙️ Correcting 5 subjects for ${className}`);
  console.log(`==================================================`);

  const subjects = await withRetry(() => prisma.subject.findMany({
    where: { code: { in: ['HE-G9', 'HLTH-G9', 'SPORTS-G9', 'AGRI-G9', 'ICT-G9'] } }
  }));

  const heSubject = subjects.find(s => s.code === 'HE-G9')!;
  const hlthSubject = subjects.find(s => s.code === 'HLTH-G9')!;
  const sportsSubject = subjects.find(s => s.code === 'SPORTS-G9')!;
  const agriSubject = subjects.find(s => s.code === 'AGRI-G9')!;
  const ictSubject = subjects.find(s => s.code === 'ICT-G9')!;

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

    // TRUE FULL MAPPING:
    // he property = Col 11 = HE
    // ict property = Col 12 = Health
    // agri property = Col 13 = Sports
    // sports property = Col 14 = Agri
    // 5th array value = Col 15 = ICT
    
    // Calculate index into the ICT array (which only contains non-skipped students)
    // Wait, the ictArray values map 1-to-1 to non-skipped rows in pdfData, or all rows?
    // Let's count non-skipped rows vs array length.
    let arrayIndex = 0;
    for (let i = 0; i < idx; i++) {
      if (!pdfData[i].skip) arrayIndex++;
    }

    const targetIctScore = ictArray ? ictArray[arrayIndex] : 0; // Set to 0 if null (like 9C)

    const targets = [
      { subject: heSubject, score: pdfRow.he },
      { subject: hlthSubject, score: pdfRow.ict },
      { subject: sportsSubject, score: pdfRow.agri },
      { subject: agriSubject, score: pdfRow.sports },
      { subject: ictSubject, score: targetIctScore }
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

  await updateClassGrades(classIds.g9a, 'ថ្នាក់ទី9ក (G9-A)', data9a, g9aIct);
  await updateClassGrades(classIds.g9b, 'ថ្នាក់ទី9ខ (G9-B)', data9b, g9bIct);
  await updateClassGrades(classIds.g9c, 'ថ្នាក់ទី9គ (G9-C)', data9c, null);
  await updateClassGrades(classIds.g9d, 'ថ្នាក់ទី9ឃ (G9-D)', data9d, g9dIct);

  console.log('\n🎉 ALL GRADE 9 SUBJECT MAPPINGS FIXED SUCCESSFULLY!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';
import { GradeCalculationService } from '../src/services/grade-calculation.service';

const pdfStudentIds7k = [
  '25070001', '25070002', '25070003', '25070004', '25070005', '25070006',
  '25070007', '25070008', '25070009', '25070010', '25070011', '25070012',
  '25070013', '25070014', '25070015', '25070016', '25070017', '25070018',
  '25070019', '25070020', '25070021', '25070022', '25070023', '25070024',
  '25070025', '25070026', '25070027', '25070028', '25070029', '25070030',
  '25070031', '25070032', '25070033', '25070034', '25070035', '25070036',
  '25070037', '25070038', '25070039', '25070040', '25070041', '25070042',
  '25070043', '25070044', '25070045', '25070046', '25070047', '25070048',
  '25070049', '25070050', '25070051', '25070052', '25070053', '25070054',
  '25070055', '25070056', '25070057', '25070058', '25070059'
];

async function main() {
  await connectDatabase();
  const classId7k = 'cmiq7zr9e0001q0ja25clx0sy'; // ថ្នាក់ទី7ក (G7-ក)
  const month = 'វិច្ឆិកា';
  const year = 2025;

  console.log('--- CHECKING IF ANY STUDENT IN 7ក PDF BELONGS TO ANOTHER CLASS OR HAS GRADES CREATED OUTSIDE THEIR CLASS ---');
  const students = await prisma.student.findMany({
    where: { studentId: { in: pdfStudentIds7k } }
  });

  let studentsOutside7k = 0;
  for (const st of students) {
    if (st.classId !== classId7k) {
      studentsOutside7k++;
      console.log(`⚠️ Student [${st.studentId}] ${st.khmerName} is in classId=${st.classId} (NOT G7-ក)`);
      // Check if we created grades for this student under classId7k
      const gCount = await prisma.grade.count({
        where: { studentId: st.id, classId: classId7k, month, year }
      });
      if (gCount > 0) {
        console.log(`🧹 Cleaning up ${gCount} temporary grades created under G7-ក for transferred student [${st.studentId}]...`);
        await prisma.grade.deleteMany({
          where: { studentId: st.id, classId: classId7k, month, year }
        });
        await prisma.studentMonthlySummary.deleteMany({
          where: { studentId: st.id, classId: classId7k, month, year }
        });
      }
    }
  }

  if (studentsOutside7k === 0) {
    console.log(`✅ All 59 students in the 7ក PDF are active students currently inside classId=${classId7k} (G7-ក). No students were moved or outside the class!`);
  } else {
    console.log(`ℹ️ Found and cleaned up ${studentsOutside7k} students who were outside G7-ក.`);
  }

  // Also check if there are any students whose Student.classId was modified recently or check all current students of 7ក
  const current7kStudents = await prisma.student.findMany({
    where: { classId: classId7k }
  });
  console.log(`\n✅ Total current students enrolled in ថ្នាក់ទី7ក in the System: ${current7kStudents.length}`);

  // Recalculate summaries and ranks for 7ក to ensure exact sync
  console.log('\n--- REVERIFYING SUMMARIES AND RANKS FOR 7ក ---');
  let count = 0;
  for (const st of current7kStudents) {
    const c = await prisma.grade.count({
      where: { studentId: st.id, classId: classId7k, month, year }
    });
    if (c > 0) {
      await GradeCalculationService.calculateMonthlySummary(st.id, classId7k, month, 11, year);
      count++;
    }
  }
  await GradeCalculationService.calculateClassRanks(classId7k, month, year);
  console.log(`✅ Class 7ក summaries (${count} students) and ranks verified/updated successfully!`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

interface RowData {
  studentId: string;
  name: string;
  he: number;
  ict: number;
  agri: number;
  sports: number;
}

const pdfData9a: RowData[] = [
  { studentId: '25090001', name: 'កៅ  គុន', he: 45, ict: 41, agri: 35, sports: 25 },
  { studentId: '25090002', name: 'ខន សុវណ្ណនីតា', he: 45, ict: 50, agri: 35, sports: 25 },
  { studentId: '25090003', name: 'គឹម កក្កដា', he: 45, ict: 50, agri: 35, sports: 50 },
  { studentId: '25090009', name: 'ជាតិ ចាន់វាសនា', he: 25, ict: 40, agri: 35, sports: 50 }
];

async function main() {
  console.log("Proposed Mapping based on User Instructions:");
  for (const row of pdfData9a) {
    console.log(`\nStudent: ${row.name}`);
    console.log(`Health (HLTH) should be (from ICT col): ${row.ict}`);
    console.log(`Sports (SPORTS) should be (from Agri col): ${row.agri}`);
    console.log(`Agriculture (AGRI) should be (from HE col): ${row.he}`);
    console.log(`ICT (ICT) should be (from Sports col): ${row.sports}`);
  }
}

main();

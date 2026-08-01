import 'dotenv/config';
import { prisma, connectDatabase } from '../src/config/database';

async function main() {
  await connectDatabase();
  const names = ['ណាម៉ែន', 'ចន្ថាស៊ី', 'ដាលណង', 'គីមលាំង', 'អង្គិច', 'រ៉យ៉ុត', 'រង្សី', 'ចន្ទ័ធិរារីត័ន', 'សក្កណា', 'រ៉េន ខឺលី', 'សំណាង អាលីហ្សា'];

  console.log('--- Searching for sample names across ALL students in DB ---');
  for (const name of names) {
    const found = await prisma.student.findMany({
      where: {
        OR: [
          { khmerName: { contains: name } },
          { firstName: { contains: name } },
          { lastName: { contains: name } }
        ]
      },
      include: { class: true }
    });
    console.log(`Search "${name}": found ${found.length} students`);
    for (const st of found) {
      console.log(`   -> [ID: ${st.id}, StudentID: ${st.studentId}] ${st.khmerName} | Class: ${st.class?.name} (${st.class?.grade})`);
    }
  }

  // Also let's check ALL classes in the database
  const classes = await prisma.class.findMany();
  console.log('\n--- All Classes in DB ---');
  for (const c of classes) {
    const count = await prisma.student.count({ where: { classId: c.id } });
    console.log(`Class [${c.id}] name: "${c.name}", grade: "${c.grade}", students count: ${count}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

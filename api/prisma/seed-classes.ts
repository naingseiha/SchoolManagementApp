import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ClassTemplate {
  grade: string;
  sections: string[];
  academicYear: string;
  capacity: number;
}

const defaultClasses: ClassTemplate[] = [
  {
    grade: "7",
    sections: ["ក", "ខ", "គ", "ឃ", "ង"],
    academicYear: "2024-2025",
    capacity: 45,
  },
  {
    grade: "8",
    sections: ["ក", "ខ", "គ", "ឃ"],
    academicYear: "2024-2025",
    capacity: 45,
  },
  {
    grade: "9",
    sections: ["ក", "ខ", "គ", "ឃ"],
    academicYear: "2024-2025",
    capacity: 45,
  },
  {
    grade: "10",
    sections: ["ក", "ខ", "គ", "ឃ", "ង", "ច", "ឆ"],
    academicYear: "2024-2025",
    capacity: 45,
  },
  {
    grade: "11",
    sections: ["ក", "ខ", "គ", "ឃ", "ង", "ច", "ឆ"],
    academicYear: "2024-2025",
    capacity: 40,
  },
  {
    grade: "12",
    sections: ["ក", "ខ", "គ", "ឃ", "ង", "ច"],
    academicYear: "2024-2025",
    capacity: 40,
  },
];

async function seedClasses() {
  console.log("🌱 Starting class seeding...");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const template of defaultClasses) {
    console.log(`\n📚 Processing Grade ${template.grade}...`);

    for (const section of template.sections) {
      const classId = `G${template.grade}-${section}`;
      const name = `ថ្នាក់ទី${template.grade}${section}`;

      try {
        const existing = await prisma.class.findUnique({
          where: { classId },
        });

        if (existing) {
          await prisma.class.update({
            where: { classId },
            data: {
              name,
              grade: template.grade,
              section,
              academicYear: template.academicYear,
              capacity: template.capacity,
            },
          });
          console.log(`  🔄 Updated: ${name} (${classId})`);
          updated++;
        } else {
          await prisma.class.create({
            data: {
              classId,
              name,
              grade: template.grade,
              section,
              academicYear: template.academicYear,
              capacity: template.capacity,
            },
          });
          console.log(`  ✅ Created: ${name} (${classId})`);
          created++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error: ${name} (${classId}) - ${error.message}`);
        skipped++;
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ Class seeding completed!`);
  console.log(`   ✅ Created: ${created} classes`);
  console.log(`   🔄 Updated: ${updated} classes`);
  console.log(`   ⏭️  Skipped: ${skipped} classes`);
  console.log(`   📊 Total: ${created + updated + skipped} classes`);
  console.log("=".repeat(70));
}

seedClasses()
  .catch((e) => {
    console.error("❌ Error seeding classes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

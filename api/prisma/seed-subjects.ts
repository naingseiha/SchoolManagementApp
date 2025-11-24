import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SubjectTemplate {
  nameKh: string;
  nameEn: string;
  code: string;
  category: "social" | "science";
  maxScores: {
    [grade: string]: {
      science?: number;
      social?: number;
      default?: number;
    };
  };
}

const defaultSubjects: SubjectTemplate[] = [
  // ថ្នាក់ទី 7 និង 8 - មុខវិជ្ជាសរសេរ
  {
    nameKh: "តែងសេចក្តី",
    nameEn: "Writer",
    code: "WRITER",
    category: "social",
    maxScores: {
      "7": { default: 60 },
      "8": { default: 60 },
    },
  },
  {
    nameKh: "សរសេរតាមអាន",
    nameEn: "Writing",
    code: "WRITING",
    category: "social",
    maxScores: {
      "7": { default: 40 },
      "8": { default: 40 },
    },
  },

  // អក្សរសាស្ត្រខ្មែរ
  {
    nameKh: "អក្សរសាស្ត្រខ្មែរ",
    nameEn: "Khmer Literature",
    code: "KHM",
    category: "social",
    maxScores: {
      "9": { default: 100 },
      "10": { default: 150 },
      "11": { default: 75 },
      "12": { science: 75, social: 125 },
    },
  },

  // គណិតវិទ្យា
  {
    nameKh: "គណិតវិទ្យា",
    nameEn: "Mathematics",
    code: "MATH",
    category: "science",
    maxScores: {
      "7": { default: 100 },
      "8": { default: 100 },
      "9": { default: 100 },
      "10": { default: 150 },
      "11": { default: 125 },
      "12": { science: 125, social: 75 },
    },
  },

  // រូបវិទ្យា
  {
    nameKh: "រូបវិទ្យា",
    nameEn: "Physics",
    code: "PHY",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 75 },
      "12": { science: 75, social: 50 },
    },
  },

  // គីមីវិទ្យា
  {
    nameKh: "គីមីវិទ្យា",
    nameEn: "Chemistry",
    code: "CHEM",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 37 },
      "11": { default: 75 },
      "12": { science: 75, social: 50 },
    },
  },

  // ជីវវិទ្យា
  {
    nameKh: "ជីវវិទ្យា",
    nameEn: "Biology",
    code: "BIO",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 75 },
      "12": { default: 75 },
    },
  },

  // ផែនដីវិទ្យា
  {
    nameKh: "ផែនដីវិទ្យា",
    nameEn: "Earth Science",
    code: "EARTH",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 25 },
      "11": { default: 50 },
      "12": { science: 50, social: 50 },
    },
  },

  // សីលធម៌-ពលរដ្ឋវិជ្ជា
  {
    nameKh: "សីលធម៌-ពលរដ្ឋវិជ្ជា",
    nameEn: "Moral Education - Civics",
    code: "MORAL",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 38 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },

  // ភូមិវិទ្យា
  {
    nameKh: "ភូមិវិទ្យា",
    nameEn: "Geography",
    code: "GEO",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 38 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },

  // ប្រវត្តិវិទ្យា
  {
    nameKh: "ប្រវត្តិវិទ្យា",
    nameEn: "History",
    code: "HIST",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 37 },
      "11": { default: 50 },
      "12": { science: 50, social: 75 },
    },
  },

  // ភាសាអង់គ្លេស
  {
    nameKh: "ភាសាអង់គ្លេស",
    nameEn: "English",
    code: "ENG",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 100 },
      "11": { default: 100 },
      "12": { science: 50, social: 50 },
    },
  },

  // គេហវិទ្យា
  {
    nameKh: "គេហវិទ្យា",
    nameEn: "Home Economics",
    code: "HE",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
    },
  },

  // កីឡា
  {
    nameKh: "កីឡា",
    nameEn: "Sports",
    code: "SPORTS",
    category: "social",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
    },
  },

  // កសិកម្ម
  {
    nameKh: "កសិកម្ម",
    nameEn: "Agriculture",
    code: "AGRI",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
    },
  },

  // ព័ត៌មានវិទ្យា
  {
    nameKh: "ព័ត៌មានវិទ្យា",
    nameEn: "Information & Communication Technology",
    code: "ICT",
    category: "science",
    maxScores: {
      "7": { default: 50 },
      "8": { default: 50 },
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 50 },
      "12": { science: 50, social: 50 },
    },
  },

  // សេដ្ឋកិច្ច
  {
    nameKh: "សេដ្ឋកិច្ច",
    nameEn: "Economics",
    code: "ECON",
    category: "social",
    maxScores: {
      "9": { default: 50 },
      "10": { default: 50 },
      "11": { default: 55 },
      "12": { default: 50 },
    },
  },
];

async function seedSubjects() {
  console.log("🌱 Starting subject seeding...");
  console.log("📌 Only 2 categories: social (សង្គម) & science (វិទ្យាសាស្ត្រ)");

  let created = 0;
  let skipped = 0;
  let updated = 0;

  // Grades 7-10: No track distinction
  for (let gradeNum = 7; gradeNum <= 10; gradeNum++) {
    const grade = String(gradeNum);
    console.log(`\n📚 Processing Grade ${grade}...`);

    const subjectsForGrade = defaultSubjects.filter((s) => s.maxScores[grade]);

    for (const template of subjectsForGrade) {
      const maxScoreConfig = template.maxScores[grade];
      const maxScore = maxScoreConfig.default || 50;
      const code = `${template.code}-G${grade}`;

      try {
        const existing = await prisma.subject.findUnique({
          where: { code },
        });

        if (existing) {
          // Update existing subject with new category
          await prisma.subject.update({
            where: { code },
            data: {
              category: template.category,
              maxScore: maxScore,
              nameKh: template.nameKh,
              nameEn: template.nameEn,
            },
          });
          console.log(
            `  🔄 Updated: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
          );
          updated++;
          continue;
        }

        await prisma.subject.create({
          data: {
            name: template.nameKh,
            nameKh: template.nameKh,
            nameEn: template.nameEn,
            code: code,
            category: template.category,
            grade: grade,
            track: null,
            weeklyHours: 0,
            annualHours: 0,
            maxScore: maxScore,
            isActive: true,
          },
        });

        console.log(
          `  ✅ Created: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
        );
        created++;
      } catch (error: any) {
        console.error(
          `  ❌ Error: ${template.nameKh} (${code}) - ${error.message}`
        );
      }
    }
  }

  // Grades 11-12: With track distinction (science/social)
  for (let gradeNum = 11; gradeNum <= 12; gradeNum++) {
    const grade = String(gradeNum);

    // Science track
    console.log(`\n🔬 Processing Grade ${grade} (Science Track)...`);
    const scienceSubjects = defaultSubjects.filter((s) => s.maxScores[grade]);

    for (const template of scienceSubjects) {
      const maxScoreConfig = template.maxScores[grade];
      const maxScore = maxScoreConfig.science || maxScoreConfig.default || 50;
      const code = `${template.code}-G${grade}-SCIENCE`;

      try {
        const existing = await prisma.subject.findUnique({
          where: { code },
        });

        if (existing) {
          await prisma.subject.update({
            where: { code },
            data: {
              category: template.category,
              maxScore: maxScore,
              nameKh: template.nameKh,
              nameEn: template.nameEn,
            },
          });
          console.log(
            `  🔄 Updated: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
          );
          updated++;
          continue;
        }

        await prisma.subject.create({
          data: {
            name: template.nameKh,
            nameKh: template.nameKh,
            nameEn: template.nameEn,
            code: code,
            category: template.category,
            grade: grade,
            track: "science",
            weeklyHours: 0,
            annualHours: 0,
            maxScore: maxScore,
            isActive: true,
          },
        });

        console.log(
          `  ✅ Created: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
        );
        created++;
      } catch (error: any) {
        console.error(
          `  ❌ Error: ${template.nameKh} (${code}) - ${error.message}`
        );
      }
    }

    // Social track
    console.log(`\n🌍 Processing Grade ${grade} (Social Track)...`);
    const socialSubjects = defaultSubjects.filter((s) => s.maxScores[grade]);

    for (const template of socialSubjects) {
      const maxScoreConfig = template.maxScores[grade];
      const maxScore = maxScoreConfig.social || maxScoreConfig.default || 50;
      const code = `${template.code}-G${grade}-SOCIAL`;

      try {
        const existing = await prisma.subject.findUnique({
          where: { code },
        });

        if (existing) {
          await prisma.subject.update({
            where: { code },
            data: {
              category: template.category,
              maxScore: maxScore,
              nameKh: template.nameKh,
              nameEn: template.nameEn,
            },
          });
          console.log(
            `  🔄 Updated: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
          );
          updated++;
          continue;
        }

        await prisma.subject.create({
          data: {
            name: template.nameKh,
            nameKh: template.nameKh,
            nameEn: template.nameEn,
            code: code,
            category: template.category,
            grade: grade,
            track: "social",
            weeklyHours: 0,
            annualHours: 0,
            maxScore: maxScore,
            isActive: true,
          },
        });

        console.log(
          `  ✅ Created: ${template.nameKh} (${code}) - Category: ${template.category}, Max: ${maxScore}`
        );
        created++;
      } catch (error: any) {
        console.error(
          `  ❌ Error: ${template.nameKh} (${code}) - ${error.message}`
        );
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ Seeding completed!`);
  console.log(`   ✅ Created: ${created} subjects`);
  console.log(`   🔄 Updated: ${updated} subjects`);
  console.log(`   ⏭️  Skipped: ${skipped} subjects`);
  console.log(`   📊 Total: ${created + updated + skipped} subjects`);
  console.log(`   📌 Categories: social (សង្គម) & science (វិទ្យាសាស្ត្រ)`);
  console.log("=".repeat(70));
}

seedSubjects()
  .catch((e) => {
    console.error("❌ Error seeding subjects:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

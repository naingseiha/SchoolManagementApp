import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SubjectCoefficient {
  code: string;
  nameKh: string;
  nameEn: string;
  maxScore: number;
  coefficients: {
    [grade: string]: number;
  };
}

const subjectCoefficients: SubjectCoefficient[] = [
  // Grade 7, 8, 9 subjects
  {
    code: "WRITING",
    nameKh: "តែងសេចក្តី",
    nameEn: "Writing",
    maxScore: 60,
    coefficients: {
      "7": 1.2,
      "8": 1.2,
      "9": 1.2,
    },
  },
  {
    code: "DICTATION",
    nameKh: "សរសេរតាមអាន",
    nameEn: "Dictation",
    maxScore: 40,
    coefficients: {
      "7": 0.8,
      "8": 0.8,
      "9": 0.8,
    },
  },
  {
    code: "MATH",
    nameKh: "គណិតវិទ្យា",
    nameEn: "Mathematics",
    maxScore: 100,
    coefficients: {
      "7": 2,
      "8": 2,
      "9": 2,
      "10": 3,
      "11": 2.5,
      "12-science": 2.5,
      "12-social": 1.5,
    },
  },
  {
    code: "PHY",
    nameKh: "រូបវិទ្យា",
    nameEn: "Physics",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.7,
      "10": 1,
      "11": 1.5,
      "12-science": 1.5,
      "12-social": 1,
    },
  },
  {
    code: "CHEM",
    nameKh: "គីមីវិទ្យា",
    nameEn: "Chemistry",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.5,
      "10": 0.74,
      "11": 1.5,
      "12-science": 1.5,
      "12-social": 1,
    },
  },
  {
    code: "BIO",
    nameKh: "ជីវវិទ្យា",
    nameEn: "Biology",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.7,
      "10": 0.76,
      "11": 1.5,
      "12-science": 1.5,
      "12-social": 1,
    },
  },
  {
    code: "EARTH",
    nameKh: "ផែនដីវិទ្យា",
    nameEn: "Earth Science",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.5,
      "10": 0.5,
      "11": 1,
      "12-science": 1,
      "12-social": 1,
    },
  },
  {
    code: "MORAL",
    nameKh: "សីលធម៌-ពលរដ្ឋវិជ្ជា",
    nameEn: "Moral Education",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.7,
      "10": 0.76,
      "11": 1,
      "12-science": 1,
      "12-social": 1.5,
    },
  },
  {
    code: "GEO",
    nameKh: "ភូមិវិទ្យា",
    nameEn: "Geography",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.64,
      "10": 0.76,
      "11": 1,
      "12-science": 1,
      "12-social": 1.5,
    },
  },
  {
    code: "HIST",
    nameKh: "ប្រវត្តិវិទ្យា",
    nameEn: "History",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 0.66,
      "10": 0.74,
      "11": 1,
      "12-science": 1,
      "12-social": 1.5,
    },
  },
  {
    code: "KHM",
    nameKh: "អក្សរសាស្ត្រខ្មែរ",
    nameEn: "Khmer Literature",
    maxScore: 100,
    coefficients: {
      "10": 3,
      "11": 1.5,
      "12-science": 1.5,
      "12-social": 2.5,
    },
  },
  {
    code: "ENG",
    nameKh: "ភាសាអង់គ្លេស",
    nameEn: "English",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 2,
      "11": 1,
      "12-science": 1,
      "12-social": 1,
    },
  },
  {
    code: "SPORTS",
    nameKh: "កីឡា",
    nameEn: "Physical Education",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 1,
      "11": 1,
    },
  },
  {
    code: "AGRI",
    nameKh: "កសិកម្ម",
    nameEn: "Agriculture",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 1,
      "11": 1,
    },
  },
  {
    code: "ICT",
    nameKh: "ព័ត៌មានវិទ្យា",
    nameEn: "ICT",
    maxScore: 50,
    coefficients: {
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 1,
      "11": 1,
      "12-science": 1,
      "12-social": 1,
    },
  },
];

async function seedCoefficients() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Seeding Subject Coefficients...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let created = 0;
  let updated = 0;

  for (const subj of subjectCoefficients) {
    // For each grade level
    for (const [gradeKey, coefficient] of Object.entries(subj.coefficients)) {
      let grade = gradeKey;
      let track = null;

      // Handle grade 12 tracks
      if (gradeKey.includes("-")) {
        const parts = gradeKey.split("-");
        grade = parts[0];
        track = parts[1];
      }

      const code = track
        ? `${subj.code}-G${grade}-${track.toUpperCase()}`
        : `${subj.code}-G${grade}`;

      try {
        const existing = await prisma.subject.findUnique({
          where: { code },
        });

        if (existing) {
          await prisma.subject.update({
            where: { code },
            data: {
              coefficient,
              maxScore: subj.maxScore,
            },
          });
          console.log(
            `  🔄 Updated: ${subj.nameKh} (${code}) - Coefficient: ${coefficient}`
          );
          updated++;
        } else {
          await prisma.subject.create({
            data: {
              name: subj.nameKh,
              nameKh: subj.nameKh,
              nameEn: subj.nameEn,
              code,
              grade,
              track,
              category: ["MATH", "PHY", "CHEM", "BIO", "EARTH", "ICT"].includes(
                subj.code
              )
                ? "science"
                : "social",
              coefficient,
              maxScore: subj.maxScore,
              isActive: true,
            },
          });
          console.log(
            `  ✅ Created: ${subj.nameKh} (${code}) - Coefficient: ${coefficient}`
          );
          created++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error: ${code} - ${error.message}`);
      }
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Coefficient seeding completed!`);
  console.log(`   ✅ Created: ${created} subjects`);
  console.log(`   🔄 Updated: ${updated} subjects`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

seedCoefficients()
  .catch((e) => {
    console.error("❌ Error seeding coefficients:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 STARTING COMPLETE DATABASE SEEDING");
  console.log("=".repeat(70) + "\n");

  try {
    // Step 1: Seed Users
    console.log("📍 Step 1/3: Seeding users...\n");
    execSync("tsx prisma/seed.ts", { stdio: "inherit" });

    // Step 2: Seed Classes
    console.log("\n📍 Step 2/3: Seeding classes...\n");
    execSync("tsx prisma/seed-classes.ts", { stdio: "inherit" });

    // Step 3: Seed Subjects
    console.log("\n📍 Step 3/3: Seeding subjects...\n");
    execSync("tsx prisma/seed-subjects.ts", { stdio: "inherit" });

    console.log("\n" + "=".repeat(70));
    console.log("✅ COMPLETE DATABASE SEEDING FINISHED!");
    console.log("=".repeat(70));
    console.log("\n📊 Final Summary:");

    const userCount = await prisma.user.count();
    const teacherCount = await prisma.teacher.count();
    const classCount = await prisma.class.count();
    const subjectCount = await prisma.subject.count();

    console.log(`  👤 Users: ${userCount}`);
    console.log(`  👨‍🏫 Teachers: ${teacherCount}`);
    console.log(`  🏫 Classes: ${classCount}`);
    console.log(`  📚 Subjects: ${subjectCount}`);
    console.log("\n🎉 System ready for use!");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

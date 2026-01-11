import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createStudentAccounts() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 Creating accounts for all students without accounts...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const studentsWithoutAccounts = await prisma.student.findMany({
      where: { user: null },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        khmerName: true,
        email: true,
        phoneNumber: true,
        class: { select: { name: true, grade: true } },
      },
    });

    console.log(`📊 Found ${studentsWithoutAccounts.length} students without accounts\n`);

    if (studentsWithoutAccounts.length === 0) {
      console.log("✅ All students already have accounts!");
      return;
    }

    let created = 0;
    let failed = 0;

    for (const student of studentsWithoutAccounts) {
      try {
        const defaultPassword = student.studentId || "123456";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await prisma.user.create({
          data: {
            email: student.email || undefined,
            phone: student.phoneNumber || undefined,
            password: hashedPassword,
            firstName: student.firstName,
            lastName: student.lastName,
            role: "STUDENT",
            studentId: student.id,
            isActive: true,
          },
        });

        created++;
        console.log(`✅ [${created}] Created: ${student.studentId} - ${student.khmerName}`);
      } catch (error: any) {
        failed++;
        console.error(`❌ Failed: ${student.studentId} - ${error.message}`);
      }
    }

    console.log(`\n✅ Created: ${created} | ❌ Failed: ${failed}`);
  } catch (error: any) {
    console.error("❌ Fatal error:", error);
    throw error;
  }
}

async function main() {
  console.log("\n🎓 STUDENT ACCOUNT BULK CREATION SCRIPT\n");
  await createStudentAccounts();
  console.log("\n🎉 SCRIPT COMPLETED!\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

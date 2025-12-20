import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Seeding default users...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ==================== ADMIN USER ====================
  console.log("\n👤 Creating admin user...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.edu.kh" },
    update: {},
    create: {
      email: "admin@school.edu.kh",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "System",
      role: UserRole.ADMIN,
    },
  });

  console.log(`  ✅ Admin: ${admin.email}`);
  console.log(`     Password: admin123`);

  // ==================== SAMPLE TEACHERS ====================
  console.log("\n👨‍🏫 Creating sample teachers...");

  const teacherPassword = await bcrypt.hash("teacher123", 10);

  const teacher1 = await prisma.teacher.upsert({
    where: { email: "sokha.teacher@school.edu.kh" },
    update: {},
    create: {
      firstName: "Sokha",
      lastName: "Chan",
      khmerName: "ចាន់ សុខា",
      email: "sokha.teacher@school.edu.kh",
      phone: "012 345 678",
      employeeId: "TCH-001",
      gender: "MALE",
      dateOfBirth: "1985-05-15",
      position: "Senior Teacher",
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { email: "sreymom.teacher@school.edu.kh" },
    update: {},
    create: {
      firstName: "Sreymom",
      lastName: "Pich",
      khmerName: "ពេជ្រ ស្រីមម",
      email: "sreymom.teacher@school.edu.kh",
      phone: "012 345 679",
      employeeId: "TCH-002",
      gender: "FEMALE",
      dateOfBirth: "1988-08-20",
      position: "Teacher",
    },
  });

  console.log(`  ✅ Teacher 1: ${teacher1.email} (Password: teacher123)`);
  console.log(`  ✅ Teacher 2: ${teacher2.email} (Password: teacher123)`);

  // ==================== CLASS TEACHER USER ====================
  console.log("\n👨‍🏫 Creating class teacher users...");

  const classTeacher = await prisma.user.upsert({
    where: { email: "classteacher@school.edu.kh" },
    update: {},
    create: {
      email: "classteacher@school.edu.kh",
      password: teacherPassword,
      firstName: "Class",
      lastName: "Teacher",
      role: UserRole.TEACHER,
    },
  });

  console.log(
    `  ✅ Class Teacher: ${classTeacher.email} (Password: teacher123)`
  );

  // ==================== SUBJECT TEACHER USER ====================
  const subjectTeacher = await prisma.user.upsert({
    where: { email: "subjectteacher@school.edu.kh" },
    update: {},
    create: {
      email: "subjectteacher@school.edu.kh",
      password: teacherPassword,
      firstName: "Subject",
      lastName: "Teacher",
      role: UserRole.TEACHER,
    },
  });

  console.log(
    `  ✅ Subject Teacher: ${subjectTeacher.email} (Password: teacher123)`
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ User seeding completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Summary:");
  console.log("  - 1 Admin user");
  console.log("  - 1 Class Teacher user");
  console.log("  - 1 Subject Teacher user");
  console.log("  - 2 Sample Teachers (database records)");
  console.log("\n🔐 Login Credentials:");
  console.log("  Admin: admin@school.edu.kh / admin123");
  console.log("  Class Teacher: classteacher@school.edu.kh / teacher123");
  console.log("  Subject Teacher: subjectteacher@school.edu.kh / teacher123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

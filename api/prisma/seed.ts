import { PrismaClient, Role, Gender, AttendanceStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const teacherPassword = await bcrypt.hash("Teacher123!", 10);
  const studentPassword = await bcrypt.hash("Student123!", 10);

  // ==================== CREATE USERS ====================

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user created");

  // Create Teacher User (not needed in this schema, just for auth)
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      email: "teacher@school.com",
      password: teacherPassword,
      firstName: "Sokha",
      lastName: "Chan",
      role: Role.CLASS_TEACHER,
    },
  });
  console.log("✅ Teacher user created");

  // Create Student User (not needed in this schema, just for auth)
  const studentUser = await prisma.user.upsert({
    where: { email: "student@school.com" },
    update: {},
    create: {
      email: "student@school.com",
      password: studentPassword,
      firstName: "Sreymom",
      lastName: "Heng",
      role: Role.SUBJECT_TEACHER, // Using available role
    },
  });
  console.log("✅ Student user created");

  // ==================== CREATE TEACHERS ====================

  const teacher1 = await prisma.teacher.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      firstName: "Sokha",
      lastName: "Chan",
      email: "teacher@school.com",
      phone: "012345678",
      subject: "Mathematics",
      employeeId: "T001",
    },
  });
  console.log("✅ Teacher 1 created");

  const teacher2 = await prisma.teacher.upsert({
    where: { email: "teacher2@school.com" },
    update: {},
    create: {
      firstName: "Sreymom",
      lastName: "Heng",
      email: "teacher2@school.com",
      phone: "012345679",
      subject: "Physics",
      employeeId: "T002",
    },
  });
  console.log("✅ Teacher 2 created");

  // ==================== CREATE CLASSES ====================

  const class7A = await prisma.class.create({
    data: {
      name: "Grade 7A",
      grade: "7",
      section: "A",
      teacherId: teacher1.id,
    },
  });
  console.log("✅ Class 7A created");

  const class8B = await prisma.class.create({
    data: {
      name: "Grade 8B",
      grade: "8",
      section: "B",
      teacherId: teacher2.id,
    },
  });
  console.log("✅ Class 8B created");

  // ==================== CREATE SUBJECTS ====================

  const mathSubject = await prisma.subject.upsert({
    where: { code: "MATH101" },
    update: {},
    create: {
      name: "Mathematics",
      code: "MATH101",
      description: "Basic Mathematics for Grade 7",
      classId: class7A.id,
    },
  });
  console.log("✅ Math subject created");

  const physicsSubject = await prisma.subject.upsert({
    where: { code: "PHY101" },
    update: {},
    create: {
      name: "Physics",
      code: "PHY101",
      description: "Introduction to Physics",
      classId: class7A.id,
    },
  });
  console.log("✅ Physics subject created");

  // ==================== CREATE STUDENTS ====================

  const student1 = await prisma.student.upsert({
    where: { email: "student@school.com" },
    update: {},
    create: {
      firstName: "Sokha",
      lastName: "Lim",
      email: "student@school.com",
      dateOfBirth: new Date("2010-03-10"),
      gender: Gender.MALE,
      address: "Phnom Penh, Cambodia",
      phone: "012111111",
      classId: class7A.id,
    },
  });
  console.log("✅ Student 1 created");

  const student2 = await prisma.student.upsert({
    where: { email: "student2@school.com" },
    update: {},
    create: {
      firstName: "Sreymom",
      lastName: "Heng",
      email: "student2@school.com",
      dateOfBirth: new Date("2009-07-22"),
      gender: Gender.FEMALE,
      address: "Phnom Penh, Cambodia",
      phone: "012222222",
      classId: class7A.id,
    },
  });
  console.log("✅ Student 2 created");

  const student3 = await prisma.student.upsert({
    where: { email: "student3@school.com" },
    update: {},
    create: {
      firstName: "Dara",
      lastName: "Kim",
      email: "student3@school.com",
      dateOfBirth: new Date("2010-05-15"),
      gender: Gender.MALE,
      address: "Siem Reap, Cambodia",
      phone: "012333333",
      classId: class8B.id,
    },
  });
  console.log("✅ Student 3 created");

  // ==================== CREATE GRADES ====================

  // Delete existing grades to avoid duplicates
  await prisma.grade.deleteMany({
    where: {
      studentId: { in: [student1.id, student2.id] },
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: mathSubject.id,
      score: 85,
      maxScore: 100,
      remarks: "Excellent performance",
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: physicsSubject.id,
      score: 78,
      maxScore: 100,
      remarks: "Good work",
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student2.id,
      subjectId: mathSubject.id,
      score: 92,
      maxScore: 100,
      remarks: "Outstanding",
    },
  });
  console.log("✅ Grades created");

  // ==================== CREATE ATTENDANCE ====================

  // Delete existing attendance to avoid duplicates
  await prisma.attendance.deleteMany({
    where: {
      date: new Date("2024-10-01"),
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      date: new Date("2024-10-01"),
      status: AttendanceStatus.PRESENT,
      remarks: "On time",
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      date: new Date("2024-10-01"),
      status: AttendanceStatus.PRESENT,
      remarks: "On time",
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student3.id,
      date: new Date("2024-10-01"),
      status: AttendanceStatus.LATE,
      remarks: "Arrived 10 minutes late",
    },
  });
  console.log("✅ Attendance records created");

  console.log("\n🎉 Database seeding completed!");
  console.log("\n📝 Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Admin:");
  console.log("   Email: admin@school.com");
  console.log("   Password: Admin123!");
  console.log("\n👨‍🏫 Teacher:");
  console.log("   Email: teacher@school.com");
  console.log("   Password: Teacher123!");
  console.log("\n🎓 Student:");
  console.log("   Email: student@school.com");
  console.log("   Password: Student123!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 Seeded Data:");
  console.log("   - 3 Users (Admin, Teacher, Student)");
  console.log("   - 2 Teachers");
  console.log("   - 2 Classes (Grade 7A, Grade 8B)");
  console.log("   - 2 Subjects (Math, Physics)");
  console.log("   - 3 Students");
  console.log("   - 3 Grades");
  console.log("   - 3 Attendance records");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

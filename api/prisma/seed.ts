import { PrismaClient, Role, Gender, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // 2. Create Teachers
  console.log("👨‍🏫 Creating teachers...");

  const teacher1 = await prisma.teacher.upsert({
    where: { email: "sokha.chan@school.com" },
    update: {},
    create: {
      firstName: "Sokha",
      lastName: "Chan",
      email: "sokha.chan@school.com",
      phone: "012 345 678",
      subject: "Mathematics",
      employeeId: "T-001",
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { email: "dara.kim@school.com" },
    update: {},
    create: {
      firstName: "Dara",
      lastName: "Kim",
      email: "dara.kim@school.com",
      phone: "012 345 679",
      subject: "Physics",
      employeeId: "T-002",
    },
  });

  const teacher3 = await prisma.teacher.upsert({
    where: { email: "sophea.lim@school.com" },
    update: {},
    create: {
      firstName: "Sophea",
      lastName: "Lim",
      email: "sophea.lim@school.com",
      phone: "012 345 680",
      subject: "Khmer Literature",
      employeeId: "T-003",
    },
  });

  console.log("✅ Teachers created");

  // 3. Create Classes
  console.log("🏫 Creating classes...");

  const class7A = await prisma.class.upsert({
    where: { id: "class-7a-001" },
    update: {},
    create: {
      id: "class-7a-001",
      name: "Grade 7A",
      grade: "7",
      section: "A",
      teacherId: teacher1.id,
    },
  });

  const class8A = await prisma.class.upsert({
    where: { id: "class-8a-001" },
    update: {},
    create: {
      id: "class-8a-001",
      name: "Grade 8A",
      grade: "8",
      section: "A",
      teacherId: teacher2.id,
    },
  });

  console.log("✅ Classes created");

  // 4. Create Subjects (✅ FIXED: Removed classId)
  console.log("📚 Creating subjects...");

  const mathSubject = await prisma.subject.upsert({
    where: { code: "G7-MATH-001" },
    update: {},
    create: {
      name: "គណិតវិទ្យា • Mathematics",
      nameKh: "គណិតវិទ្យា",
      nameEn: "Mathematics",
      code: "G7-MATH-001",
      description: "Grade 7 Mathematics",
      grade: "7",
      category: "core",
      weeklyHours: 6,
      annualHours: 192,
      isActive: true,
      // ✅ REMOVED: classId: class7A.id,
    },
  });

  const physicsSubject = await prisma.subject.upsert({
    where: { code: "G7-PHYS-001" },
    update: {},
    create: {
      name: "រូបវិទ្យា • Physics",
      nameKh: "រូបវិទ្យា",
      nameEn: "Physics",
      code: "G7-PHYS-001",
      description: "Grade 7 Physics",
      grade: "7",
      category: "science",
      weeklyHours: 2.5,
      annualHours: 80,
      isActive: true,
      // ✅ REMOVED: classId: class7A.id,
    },
  });

  const khmerSubject = await prisma.subject.upsert({
    where: { code: "G7-KHMER-001" },
    update: {},
    create: {
      name: "អក្សរសាស្ត្រខ្មែរ • Khmer Literature",
      nameKh: "អក្សរសាស្ត្រខ្មែរ",
      nameEn: "Khmer Literature",
      code: "G7-KHMER-001",
      description: "Grade 7 Khmer Literature",
      grade: "7",
      category: "core",
      weeklyHours: 5,
      annualHours: 160,
      isActive: true,
    },
  });

  const ictSubject = await prisma.subject.upsert({
    where: { code: "G7-ICT-001" },
    update: {},
    create: {
      name: "បច្ចេកវិទ្យាព័ត៌មានវិទ្យា • ICT",
      nameKh: "បច្ចេកវិទ្យាព័ត៌មានវិទ្យា",
      nameEn: "Information & Communication Technology",
      code: "G7-ICT-001",
      description: "Grade 7 ICT",
      grade: "7",
      category: "technology",
      weeklyHours: 1.5,
      annualHours: 50,
      isActive: true,
    },
  });

  console.log("✅ Subjects created");

  // 5. ✅ NEW: Assign Teachers to Subjects (Many-to-Many)
  console.log("🔗 Assigning teachers to subjects...");

  // Teacher1 (Sokha) teaches Math
  await prisma.subjectTeacher.upsert({
    where: {
      subjectId_teacherId: {
        subjectId: mathSubject.id,
        teacherId: teacher1.id,
      },
    },
    update: {},
    create: {
      subjectId: mathSubject.id,
      teacherId: teacher1.id,
    },
  });

  // Teacher2 (Dara) teaches Physics
  await prisma.subjectTeacher.upsert({
    where: {
      subjectId_teacherId: {
        subjectId: physicsSubject.id,
        teacherId: teacher2.id,
      },
    },
    update: {},
    create: {
      subjectId: physicsSubject.id,
      teacherId: teacher2.id,
    },
  });

  // Teacher3 (Sophea) teaches Khmer
  await prisma.subjectTeacher.upsert({
    where: {
      subjectId_teacherId: {
        subjectId: khmerSubject.id,
        teacherId: teacher3.id,
      },
    },
    update: {},
    create: {
      subjectId: khmerSubject.id,
      teacherId: teacher3.id,
    },
  });

  // Teacher1 can also teach ICT (one teacher, multiple subjects)
  await prisma.subjectTeacher.upsert({
    where: {
      subjectId_teacherId: {
        subjectId: ictSubject.id,
        teacherId: teacher1.id,
      },
    },
    update: {},
    create: {
      subjectId: ictSubject.id,
      teacherId: teacher1.id,
    },
  });

  console.log("✅ Teacher-Subject assignments created");

  // 6. Create Students
  console.log("👨‍🎓 Creating students...");

  const student1 = await prisma.student.upsert({
    where: { email: "student1@school.com" },
    update: {},
    create: {
      firstName: "Pisey",
      lastName: "Sok",
      email: "student1@school.com",
      dateOfBirth: new Date("2010-05-15"),
      gender: Gender.MALE,
      address: "Phnom Penh",
      phone: "012 111 111",
      classId: class7A.id,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { email: "student2@school.com" },
    update: {},
    create: {
      firstName: "Sreymom",
      lastName: "Touch",
      email: "student2@school.com",
      dateOfBirth: new Date("2010-08-22"),
      gender: Gender.FEMALE,
      address: "Phnom Penh",
      phone: "012 222 222",
      classId: class7A.id,
    },
  });

  const student3 = await prisma.student.upsert({
    where: { email: "student3@school.com" },
    update: {},
    create: {
      firstName: "Virak",
      lastName: "Chea",
      email: "student3@school.com",
      dateOfBirth: new Date("2009-03-10"),
      gender: Gender.MALE,
      address: "Phnom Penh",
      phone: "012 333 333",
      classId: class8A.id,
    },
  });

  console.log("✅ Students created");

  // 7. Create Grades
  console.log("📊 Creating grades...");

  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: mathSubject.id,
      score: 85,
      maxScore: 100,
      remarks: "Good performance",
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: physicsSubject.id,
      score: 78,
      maxScore: 100,
      remarks: "Needs improvement",
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student2.id,
      subjectId: mathSubject.id,
      score: 92,
      maxScore: 100,
      remarks: "Excellent work",
    },
  });

  console.log("✅ Grades created");

  // 8. Create Attendance
  console.log("📅 Creating attendance records...");

  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      date: new Date(),
      status: AttendanceStatus.PRESENT,
      remarks: "On time",
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      date: new Date(),
      status: AttendanceStatus.PRESENT,
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student3.id,
      date: new Date(),
      status: AttendanceStatus.LATE,
      remarks: "Arrived 15 minutes late",
    },
  });

  console.log("✅ Attendance records created");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Database seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Summary:");
  console.log("  - 1 Admin user");
  console.log("  - 3 Teachers");
  console.log("  - 2 Classes");
  console.log("  - 4 Subjects");
  console.log("  - 4 Teacher-Subject assignments");
  console.log("  - 3 Students");
  console.log("  - 3 Grades");
  console.log("  - 3 Attendance records");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

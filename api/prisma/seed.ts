import { PrismaClient, Role, Gender, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created');

  // Create Teachers
  const teacher1User = await prisma.user.create({
    data: {
      username: 'teacher1',
      email: 'teacher1@school.com',
      password: hashedPassword,
      role: Role.CLASS_TEACHER,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      teacherId: 'T001',
      khmerName: 'លោក សុខា',
      englishName: 'Mr. Sokha',
      gender: Gender.MALE,
      dateOfBirth: new Date('1985-05-15'),
      phoneNumber: '012345678',
      email: 'teacher1@school.com',
      position: 'Class Teacher',
      userId: teacher1User.id,
    },
  });
  console.log('✅ Teacher 1 created');

  const teacher2User = await prisma.user.create({
    data: {
      username: 'teacher2',
      email: 'teacher2@school.com',
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      teacherId: 'T002',
      khmerName: 'លោកស្រី ស្រីមុំ',
      englishName: 'Ms. Sreymom',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1990-08-20'),
      phoneNumber: '012345679',
      email: 'teacher2@school.com',
      position: 'Teacher',
      userId: teacher2User.id,
    },
  });
  console.log('✅ Teacher 2 created');

  // Create Classes
  const class7A = await prisma.class.create({
    data: {
      classId: 'C001',
      name: 'Grade 7A',
      grade: '7',
      academicYear: '2024-2025',
      classTeacherId: teacher1.id,
      capacity: 40,
    },
  });
  console.log('✅ Class 7A created');

  const class8B = await prisma.class.create({
    data: {
      classId: 'C002',
      name: 'Grade 8B',
      grade: '8',
      academicYear: '2024-2025',
      classTeacherId: teacher2.id,
      capacity: 35,
    },
  });
  console.log('✅ Class 8B created');

  // Create Students
  const student1User = await prisma.user.create({
    data: {
      username: 'student1',
      email: 'student1@school.com',
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      studentId: 'S001',
      khmerName: 'សុខា ចាន់',
      englishName: 'Sokha Chan',
      gender: Gender.MALE,
      dateOfBirth: new Date('2010-03-10'),
      placeOfBirth: 'Phnom Penh',
      currentAddress: 'Phnom Penh, Cambodia',
      phoneNumber: '012111111',
      classId: class7A.id,
      userId: student1User.id,
    },
  });
  console.log('✅ Student 1 created');

  const student2User = await prisma.user.create({
    data: {
      username: 'student2',
      email: 'student2@school.com',
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'S002',
      khmerName: 'ស្រីមុំ ហេង',
      englishName: 'Sreymom Heng',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('2009-07-22'),
      placeOfBirth: 'Siem Reap',
      currentAddress: 'Phnom Penh, Cambodia',
      phoneNumber: '012222222',
      classId: class7A.id,
      userId: student2User.id,
    },
  });
  console.log('✅ Student 2 created');

  // Create Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      subjectId: 'SUB001',
      name: 'គណិតវិទ្យា',
      code: 'MATH',
      credits: 4,
      classId: class7A.id,
      teacherId: teacher1.id,
    },
  });
  console.log('✅ Math subject created');

  const physicsSubject = await prisma.subject.create({
    data: {
      subjectId: 'SUB002',
      name: 'រូបវិទ្យា',
      code: 'PHY',
      credits: 3,
      classId: class7A.id,
      teacherId: teacher2.id,
    },
  });
  console.log('✅ Physics subject created');

  // Create Grades
  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: mathSubject.id,
      classId: class7A.id,
      semester: 1,
      month1Score: 85,
      month2Score: 90,
      month3Score: 88,
      semesterScore: 87,
      finalScore: 87.5,
      grade: 'A',
      teacherId: teacher1.id,
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: physicsSubject.id,
      classId: class7A.id,
      semester: 1,
      month1Score: 78,
      month2Score: 82,
      month3Score: 80,
      semesterScore: 79,
      finalScore: 79.75,
      grade: 'B',
      teacherId: teacher2.id,
    },
  });
  console.log('✅ Grades created');

  // Create Attendance
  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      classId: class7A.id,
      date: new Date('2024-10-01'),
      status: AttendanceStatus.PRESENT,
      note: 'On time',
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      classId: class7A.id,
      date: new Date('2024-10-01'),
      status: AttendanceStatus.PRESENT,
      note: 'On time',
    },
  });
  console.log('✅ Attendance records created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log("Connecting to DB:", dbUrl ? dbUrl.split("@")[1] : "undefined");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log("🔍 Searching for Class 7C / ៧គ...");
  
  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { name: { contains: "7C", mode: "insensitive" } },
        { name: { contains: "7 C", mode: "insensitive" } },
        { name: { contains: "៧គ", mode: "insensitive" } },
        { name: { contains: "៧ គ", mode: "insensitive" } },
        { name: { contains: "7គ", mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { students: true, attendance: true } }
    }
  });

  console.log("Found classes:", classes.map(c => ({ id: c.id, name: c.name, grade: c.grade, year: c.academicYear, students: c._count.students, attendance: c._count.attendance })));

  if (classes.length === 0) {
    const all7th = await prisma.class.findMany({
      where: { grade: "7" }
    });
    console.log("All Grade 7 classes:", all7th.map(c => ({ id: c.id, name: c.name, grade: c.grade })));
    return;
  }

  for (const c of classes) {
    console.log(`\n========================================`);
    console.log(`Class: ${c.name} (ID: ${c.id}, Grade: ${c.grade}, Year: ${c.academicYear})`);

    const attendanceRecords = await prisma.attendance.findMany({
      where: { classId: c.id },
      select: { id: true, date: true, status: true, session: true, studentId: true }
    });

    console.log(`Total Attendance Records for ${c.name}: ${attendanceRecords.length}`);

    const monthCounts: Record<string, number> = {};
    const monthStatusCounts: Record<string, { ABSENT: number; PERMISSION: number; PRESENT: number }> = {};

    attendanceRecords.forEach(r => {
      const yearMonth = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[yearMonth] = (monthCounts[yearMonth] || 0) + 1;

      if (!monthStatusCounts[yearMonth]) {
        monthStatusCounts[yearMonth] = { ABSENT: 0, PERMISSION: 0, PRESENT: 0 };
      }
      if (r.status === "ABSENT") monthStatusCounts[yearMonth].ABSENT++;
      else if (r.status === "PERMISSION") monthStatusCounts[yearMonth].PERMISSION++;
      else if (r.status === "PRESENT") monthStatusCounts[yearMonth].PRESENT++;
    });

    console.log("Attendance breakdown by Month (YYYY-MM):", monthCounts);
    console.log("Attendance breakdown by Status:", monthStatusCounts);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

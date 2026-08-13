import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function main() {
  const classId = "cmiq7zsqx0005q0jatgouva40"; // ថ្នាក់ទី7គ
  const c = await prisma.class.findUnique({ where: { id: classId } });

  console.log(`Class: ${c?.name} (${c?.id}), AcademicYear: ${c?.academicYear}`);

  const sampleRecords = await prisma.attendance.findMany({
    where: { classId: classId },
    take: 20,
    orderBy: { date: "desc" },
    select: { id: true, date: true, status: true, session: true, studentId: true }
  });

  console.log("\nSample 20 attendance records for 7C:");
  sampleRecords.forEach(r => {
    console.log(`ID: ${r.id} | Date ISO: ${r.date.toISOString()} | Date UTC String: ${r.date.toUTCString()} | Status: ${r.status}`);
  });

  // Also query count of records by full year-month date range
  const recordsJul2026 = await prisma.attendance.count({
    where: {
      classId,
      date: {
        gte: new Date(2026, 6, 1),
        lte: new Date(2026, 6, 31, 23, 59, 59)
      }
    }
  });

  const recordsJul2025 = await prisma.attendance.count({
    where: {
      classId,
      date: {
        gte: new Date(2025, 6, 1),
        lte: new Date(2025, 6, 31, 23, 59, 59)
      }
    }
  });

  console.log(`\nJuly 2026 count: ${recordsJul2026}`);
  console.log(`July 2025 count: ${recordsJul2025}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

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

  console.log(`Fixing UTC dates for Class: ${c?.name} (${classId})`);

  const records = await prisma.attendance.findMany({
    where: { classId: classId }
  });

  console.log(`Found ${records.length} records for 7C. Updating all dates to July 2026 (UTC)...`);

  let updatedCount = 0;
  for (const r of records) {
    // Extract UTC day from existing date (or local day if UTC day is off)
    const existingDate = new Date(r.date);
    // Use UTC date or local date to get day number (1-31)
    let day = existingDate.getUTCDate();
    if (day > 31 || day < 1) day = 1;

    // Create explicit UTC date for July 2026 (Month 6 in 0-indexed JS UTC)
    const targetUtcDate = new Date(Date.UTC(2026, 6, day, 12, 0, 0));

    await prisma.attendance.update({
      where: { id: r.id },
      data: { date: targetUtcDate }
    });
    updatedCount++;
  }

  console.log(`\n✅ Updated ${updatedCount} records to July 2026 (Date.UTC).`);

  // Verification 1: Count with gte: 2026-07-01T00:00:00Z and lte: 2026-07-31T23:59:59Z
  const july2026Count = await prisma.attendance.count({
    where: {
      classId,
      date: {
        gte: new Date("2026-07-01T00:00:00.000Z"),
        lte: new Date("2026-07-31T23:59:59.999Z"),
      }
    }
  });

  console.log(`\n📊 Verified July 2026 attendance count (UTC range 2026-07-01 to 2026-07-31): ${july2026Count}`);

  // Verification 2: Breakdown by status
  const JulyRecords = await prisma.attendance.findMany({
    where: {
      classId,
      date: {
        gte: new Date("2026-07-01T00:00:00.000Z"),
        lte: new Date("2026-07-31T23:59:59.999Z"),
      }
    },
    select: { status: true }
  });

  const statusCounts = { ABSENT: 0, PERMISSION: 0, PRESENT: 0 };
  JulyRecords.forEach(r => {
    if (r.status === "ABSENT") statusCounts.ABSENT++;
    else if (r.status === "PERMISSION") statusCounts.PERMISSION++;
    else if (r.status === "PRESENT") statusCounts.PRESENT++;
  });

  console.log("Status Breakdown for July 2026:", statusCounts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

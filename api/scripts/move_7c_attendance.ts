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
  const classId = "cmiq7zsqx0005q0jatgouva40"; // ថ្នាក់ទី7គ
  const targetClass = await prisma.class.findUnique({ where: { id: classId } });

  if (!targetClass) {
    console.error("❌ Class not found:", classId);
    return;
  }

  console.log(`\n🚀 Starting Attendance Shift & Cleanup for Class: ${targetClass.name} (${classId})`);

  // Step 1: Delete August 2026 attendance records
  const augustStart = new Date(2026, 7, 1, 0, 0, 0); // Month 7 = August (0-indexed)
  const augustEnd = new Date(2026, 7, 31, 23, 59, 59);

  const deleteAugustResult = await prisma.attendance.deleteMany({
    where: {
      classId: classId,
      date: {
        gte: augustStart,
        lte: augustEnd,
      },
    },
  });

  console.log(`\n🗑️ Deleted ${deleteAugustResult.count} attendance records from August 2026.`);

  // Step 2: Fetch September 2026 attendance records
  const septemberStart = new Date(2026, 8, 1, 0, 0, 0); // Month 8 = September (0-indexed)
  const septemberEnd = new Date(2026, 8, 30, 23, 59, 59);

  const septemberRecords = await prisma.attendance.findMany({
    where: {
      classId: classId,
      date: {
        gte: septemberStart,
        lte: septemberEnd,
      },
    },
  });

  console.log(`\n📦 Found ${septemberRecords.length} records in September 2026 to move to July 2026...`);

  let movedCount = 0;
  for (const record of septemberRecords) {
    const oldDate = new Date(record.date);
    const day = oldDate.getDate();
    const hours = oldDate.getHours();
    const minutes = oldDate.getMinutes();
    const seconds = oldDate.getSeconds();

    // Target date: July 2026 (Month 6 in 0-index)
    const newDate = new Date(2026, 6, day, hours, minutes, seconds);

    await prisma.attendance.update({
      where: { id: record.id },
      data: { date: newDate },
    });
    movedCount++;
  }

  console.log(`\n✅ Successfully moved ${movedCount} attendance records from September 2026 to July 2026.`);

  // Step 3: Verification
  const allRecords = await prisma.attendance.findMany({
    where: { classId: classId },
    select: { id: true, date: true, status: true, session: true },
  });

  const monthCounts: Record<string, number> = {};
  const monthStatusCounts: Record<string, { ABSENT: number; PERMISSION: number; PRESENT: number }> = {};

  allRecords.forEach((r) => {
    const yearMonth = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
    monthCounts[yearMonth] = (monthCounts[yearMonth] || 0) + 1;

    if (!monthStatusCounts[yearMonth]) {
      monthStatusCounts[yearMonth] = { ABSENT: 0, PERMISSION: 0, PRESENT: 0 };
    }
    if (r.status === "ABSENT") monthStatusCounts[yearMonth].ABSENT++;
    else if (r.status === "PERMISSION") monthStatusCounts[yearMonth].PERMISSION++;
    else if (r.status === "PRESENT") monthStatusCounts[yearMonth].PRESENT++;
  });

  console.log("\n📊 VERIFICATION RESULT FOR ថ្នាក់ទី7គ:");
  console.log("Total attendance records:", allRecords.length);
  console.log("Attendance breakdown by Month (YYYY-MM):", monthCounts);
  console.log("Attendance breakdown by Status:", monthStatusCounts);
}

main()
  .catch((err) => {
    console.error("❌ Error during script execution:", err);
  })
  .finally(() => prisma.$disconnect());

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
  console.log("🔍 Checking all classes in DB...");
  const allClasses = await prisma.class.findMany({
    include: {
      _count: { select: { students: true, attendance: true } }
    }
  });

  console.log("All classes count:", allClasses.length);
  allClasses.forEach(c => {
    console.log(`Class: "${c.name}" | Grade: "${c.grade}" | Section: "${c.section}" | Year: "${c.academicYear}" | Students: ${c._count.students} | Attendance: ${c._count.attendance} | ID: ${c.id}`);
  });

  // Also check if there are attendance records with null classId or assigned to specific dates in 2026
  const attendanceMonths = await prisma.$queryRaw`
    SELECT 
      c.name as class_name,
      c.grade as grade,
      EXTRACT(YEAR FROM a.date) as yr,
      EXTRACT(MONTH FROM a.date) as mo,
      COUNT(*)::int as count,
      SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END)::int as absent_count,
      SUM(CASE WHEN a.status = 'PERMISSION' THEN 1 ELSE 0 END)::int as permission_count
    FROM attendance a
    JOIN classes c ON a."classId" = c.id
    GROUP BY c.name, c.grade, yr, mo
    ORDER BY yr DESC, mo DESC, c.name ASC
  `;

  console.log("\n📊 Attendance summary across all classes by Year-Month:", JSON.stringify(attendanceMonths, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

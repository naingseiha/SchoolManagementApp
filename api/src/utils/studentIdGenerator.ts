import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🎯 Generate Unique Student ID
 * Format: YYCCNNNN (8 digits)
 *
 * - YY: Year enrolled (2 digits) - Ex: 25 for 2025
 * - CC: Grade/Class code (2 digits) - Ex: 07, 08, 09, 10, 11, 12
 * - NNNN: Sequential number (4 digits) - Ex: 0001, 0002, ...
 *
 * Examples:
 * - 25070001 = Enrolled in 2025, Grade 7, Student #1
 * - 25120045 = Enrolled in 2025, Grade 12, Student #45
 * - 26080123 = Enrolled in 2026, Grade 8, Student #123
 */
export async function generateStudentId(classId?: string): Promise<string> {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 Generating Student ID...");

    // Get current year (last 2 digits)
    const year = new Date().getFullYear().toString().slice(-2);
    console.log(`   Year: 20${year}`);

    // Get grade code from class
    let gradeCode = "00"; // Default if no class assigned

    if (classId) {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        select: { grade: true, name: true },
      });

      if (classInfo) {
        // Extract grade number (7, 8, 9, 10, 11, 12)
        const gradeMatch = classInfo.grade.match(/\d+/);
        if (gradeMatch) {
          const gradeNum = parseInt(gradeMatch[0]);
          gradeCode = gradeNum.toString().padStart(2, "0");
          console.log(`   Class: ${classInfo.name} (Grade ${gradeNum})`);
        }
      }
    } else {
      console.log(`   Class: Not assigned (using default 00)`);
    }

    // Find highest sequential number for this year+grade combination
    const prefix = `${year}${gradeCode}`;
    console.log(`   Prefix: ${prefix}`);

    const lastStudent = await prisma.student.findFirst({
      where: {
        studentId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        studentId: "desc",
      },
      select: {
        studentId: true,
      },
    });

    let sequential = 1;

    if (lastStudent?.studentId) {
      // Extract last 4 digits and increment
      const lastSeq = parseInt(lastStudent.studentId.slice(-4));
      sequential = lastSeq + 1;
      console.log(
        `   Last Student ID: ${lastStudent.studentId} → Sequential: ${sequential}`
      );
    } else {
      console.log(`   First student for ${prefix}`);
    }

    // Format: YYCCNNNN
    const studentId = `${prefix}${sequential.toString().padStart(4, "0")}`;

    console.log(`✅ Generated: ${studentId}`);
    console.log(
      `   └─ ${year} (Year) + ${gradeCode} (Grade) + ${sequential
        .toString()
        .padStart(4, "0")} (Sequential)`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return studentId;
  } catch (error: any) {
    console.error("❌ Error generating student ID:", error);
    // Fallback: timestamp-based unique ID
    const fallback = `99${Date.now().toString().slice(-6)}`;
    console.log(`⚠️  Using fallback ID: ${fallback}`);
    return fallback;
  }
}

/**
 * 🔍 Parse Student ID to extract information
 */
export function parseStudentId(studentId: string): {
  year: string;
  grade: string;
  sequential: string;
  fullYear: string;
} | null {
  if (!studentId || studentId.length !== 8) {
    return null;
  }

  const year = studentId.slice(0, 2);
  const grade = studentId.slice(2, 4);
  const sequential = studentId.slice(4, 8);

  return {
    year,
    fullYear: `20${year}`,
    grade: parseInt(grade) > 0 ? `Grade ${parseInt(grade)}` : "Unassigned",
    sequential: `#${parseInt(sequential)}`,
  };
}

/**
 * 📊 Get Student ID Statistics
 */
export async function getStudentIdStats(year?: string, grade?: string) {
  const currentYear = year || new Date().getFullYear().toString().slice(-2);
  const gradeCode = grade?.padStart(2, "0") || "";
  const prefix = `${currentYear}${gradeCode}`;

  const count = await prisma.student.count({
    where: {
      studentId: {
        startsWith: prefix,
      },
    },
  });

  return {
    year: `20${currentYear}`,
    grade: grade ? `Grade ${parseInt(grade)}` : "All grades",
    totalStudents: count,
    nextSequential: count + 1,
    nextStudentId: `${prefix}${(count + 1).toString().padStart(4, "0")}`,
  };
}

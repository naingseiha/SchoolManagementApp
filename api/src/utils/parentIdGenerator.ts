import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🎯 Generate Unique Parent ID
 * Format: P-YYYY-NNNN
 *
 * - P: Parent prefix
 * - YYYY: Year registered (4 digits) - Ex: 2025, 2026
 * - NNNN: Sequential number (4 digits) - Ex: 0001, 0002, ...
 *
 * Examples:
 * - P-2025-0001 = First parent registered in 2025
 * - P-2025-0045 = 45th parent registered in 2025
 * - P-2026-0123 = 123rd parent registered in 2026
 */
export async function generateParentId(): Promise<string> {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 Generating Parent ID...");

    // Get current year (4 digits)
    const year = new Date().getFullYear().toString();
    console.log(`   Year: ${year}`);

    // Find highest sequential number for this year
    const prefix = `P-${year}-`;
    console.log(`   Prefix: ${prefix}`);

    const lastParent = await prisma.parent.findFirst({
      where: {
        parentId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        parentId: "desc",
      },
      select: {
        parentId: true,
      },
    });

    let sequential = 1;

    if (lastParent?.parentId) {
      // Extract last 4 digits and increment
      const lastSeq = parseInt(lastParent.parentId.slice(-4));
      sequential = lastSeq + 1;
      console.log(
        `   Last Parent ID: ${lastParent.parentId} → Sequential: ${sequential}`
      );
    } else {
      console.log(`   First parent for ${year}`);
    }

    // Format: P-YYYY-NNNN
    const parentId = `${prefix}${sequential.toString().padStart(4, "0")}`;

    console.log(`✅ Generated: ${parentId}`);
    console.log(
      `   └─ P (Parent) + ${year} (Year) + ${sequential
        .toString()
        .padStart(4, "0")} (Sequential)`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return parentId;
  } catch (error: any) {
    console.error("❌ Error generating parent ID:", error);
    // Fallback: timestamp-based unique ID
    const fallback = `P-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-4)}`;
    console.log(`⚠️  Using fallback ID: ${fallback}`);
    return fallback;
  }
}

/**
 * 🔍 Parse Parent ID to extract information
 */
export function parseParentId(parentId: string): {
  year: string;
  sequential: string;
} | null {
  if (!parentId || !parentId.match(/^P-\d{4}-\d{4}$/)) {
    return null;
  }

  const parts = parentId.split("-");
  const year = parts[1];
  const sequential = parts[2];

  return {
    year,
    sequential: `#${parseInt(sequential)}`,
  };
}

/**
 * 📊 Get Parent ID Statistics
 */
export async function getParentIdStats(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  const prefix = `P-${currentYear}-`;

  const count = await prisma.parent.count({
    where: {
      parentId: {
        startsWith: prefix,
      },
    },
  });

  return {
    year: currentYear,
    totalParents: count,
    nextSequential: count + 1,
    nextParentId: `${prefix}${(count + 1).toString().padStart(4, "0")}`,
  };
}

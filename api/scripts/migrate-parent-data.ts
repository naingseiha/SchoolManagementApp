/**
 * Data Migration Script: Convert Student Parent Data to New Parent Model
 *
 * This script:
 * 1. Reads all students with parent information (fatherName, motherName, parentPhone)
 * 2. Creates Parent records for unique parents
 * 3. Creates User accounts for parents (password = phone number)
 * 4. Links parents to students via StudentParent join table
 * 5. Preserves all existing student data (backward compatible)
 *
 * Run: npx ts-node api/scripts/migrate-parent-data.ts
 */

import { PrismaClient, ParentRelationship } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateParentId } from "../src/utils/parentIdGenerator";

const prisma = new PrismaClient();

interface ParentData {
  phone: string;
  khmerName: string;
  firstName: string;
  lastName: string;
  relationship: ParentRelationship;
  occupation?: string;
  students: string[]; // Student IDs
}

async function migrateParentData() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Starting Parent Data Migration");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Step 1: Get all students with parent information
    console.log("\n📊 Step 1: Fetching all students...");
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { fatherName: { not: null } },
          { motherName: { not: null } },
          { parentPhone: { not: null } },
        ],
      },
      select: {
        id: true,
        studentId: true,
        khmerName: true,
        fatherName: true,
        motherName: true,
        parentPhone: true,
        parentOccupation: true,
      },
    });

    console.log(`✅ Found ${students.length} students with parent data`);

    if (students.length === 0) {
      console.log("⚠️  No students with parent data found. Exiting.");
      return;
    }

    // Step 2: Extract unique parents by phone number
    console.log("\n📊 Step 2: Extracting unique parents...");
    const parentMap = new Map<string, ParentData>();

    const skippedStudents: Array<{
      studentId: string;
      khmerName: string;
      reason: string;
    }> = [];

    for (const student of students) {
      // Skip if no phone number
      if (!student.parentPhone || student.parentPhone.trim() === "") {
        const reason = !student.fatherName && !student.motherName
          ? "No parent data at all"
          : "Has parent name but no phone number";
        skippedStudents.push({
          studentId: student.studentId,
          khmerName: student.khmerName,
          reason,
        });
        continue;
      }

      const phone = student.parentPhone.trim();

      // Validate phone number format
      if (phone.length < 8 || phone.length > 15) {
        skippedStudents.push({
          studentId: student.studentId,
          khmerName: student.khmerName,
          reason: `Invalid phone format: ${phone}`,
        });
        continue;
      }

      // Check if we already have this parent
      if (!parentMap.has(phone)) {
        // Create new parent entry
        // Determine which parent name to use (prefer father, fallback to mother)
        let khmerName = student.fatherName || student.motherName || "ឪពុក/ម្តាយ";
        let relationship: ParentRelationship = student.fatherName
          ? ParentRelationship.FATHER
          : ParentRelationship.MOTHER;

        // Try to split Khmer name into first/last
        const nameParts = khmerName.trim().split(" ");
        const firstName = nameParts[0] || "ឪពុក";
        const lastName = nameParts.slice(1).join(" ") || "ម្តាយ";

        parentMap.set(phone, {
          phone,
          khmerName,
          firstName,
          lastName,
          relationship,
          occupation: student.parentOccupation || "កសិករ",
          students: [student.id],
        });
      } else {
        // Parent already exists, just add this student
        const existingParent = parentMap.get(phone)!;
        existingParent.students.push(student.id);
      }
    }

    console.log(`✅ Identified ${parentMap.size} unique parents`);

    // Step 3: Create Parent records and User accounts
    console.log("\n📊 Step 3: Creating parent records and user accounts...");

    let createdParents = 0;
    let createdUsers = 0;
    let createdLinks = 0;
    let skippedExisting = 0;
    const errors: string[] = [];

    for (const [phone, parentData] of parentMap.entries()) {
      try {
        // Check if parent already exists
        const existingParent = await prisma.parent.findUnique({
          where: { phone },
          include: { user: true },
        });

        let parent = existingParent;

        if (!existingParent) {
          // Create Parent record
          const parentId = await generateParentId();
          parent = await prisma.parent.create({
            data: {
              parentId,
              firstName: parentData.firstName,
              lastName: parentData.lastName,
              khmerName: parentData.khmerName,
              phone: parentData.phone,
              relationship: parentData.relationship,
              occupation: parentData.occupation,
              isAccountActive: true,
            },
          });
          createdParents++;
          console.log(`✅ Created parent: ${parent.khmerName} (${parent.phone})`);
        } else {
          skippedExisting++;
          console.log(`ℹ️  Parent already exists: ${existingParent.khmerName} (${existingParent.phone})`);
        }

        // Create User account if doesn't exist
        if (!parent!.user) {
          const hashedPassword = await bcrypt.hash(phone, 10);

          // Check if user with this phone already exists
          const existingUser = await prisma.user.findUnique({
            where: { phone },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                phone,
                password: hashedPassword,
                firstName: parent!.firstName,
                lastName: parent!.lastName,
                role: "PARENT",
                parentId: parent!.id,
              },
            });
            createdUsers++;
            console.log(`  ✅ Created user account (password: ${phone})`);
          } else {
            console.log(`  ℹ️  User account already exists`);
          }
        }

        // Create StudentParent links
        for (const studentId of parentData.students) {
          try {
            // Check if link already exists
            const existingLink = await prisma.studentParent.findUnique({
              where: {
                studentId_parentId: {
                  studentId,
                  parentId: parent!.id,
                },
              },
            });

            if (!existingLink) {
              // Determine if this should be primary (first link for this student)
              const existingLinksForStudent = await prisma.studentParent.count({
                where: { studentId },
              });

              await prisma.studentParent.create({
                data: {
                  studentId,
                  parentId: parent!.id,
                  relationship: parentData.relationship,
                  isPrimary: existingLinksForStudent === 0, // First link is primary
                },
              });
              createdLinks++;
              console.log(`  ✅ Linked to student ID: ${studentId}`);
            } else {
              console.log(`  ℹ️  Link already exists for student: ${studentId}`);
            }
          } catch (linkError: any) {
            errors.push(`Failed to link parent ${phone} to student ${studentId}: ${linkError.message}`);
          }
        }

      } catch (error: any) {
        errors.push(`Failed to process parent ${phone}: ${error.message}`);
        console.error(`❌ Error processing parent ${phone}:`, error.message);
      }
    }

    // Step 4: Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 MIGRATION SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Parents created:       ${createdParents}`);
    console.log(`✅ User accounts created: ${createdUsers}`);
    console.log(`✅ Student links created: ${createdLinks}`);
    console.log(`ℹ️  Parents skipped (already exist): ${skippedExisting}`);
    console.log(`⚠️  Students skipped (incomplete data): ${skippedStudents.length}`);
    console.log(`❌ Errors encountered:    ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n❌ ERRORS:");
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (skippedStudents.length > 0) {
      console.log("\n⚠️  STUDENTS SKIPPED (Need Manual Parent Account Creation):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      skippedStudents.forEach((student, index) => {
        console.log(`${index + 1}. Student ID: ${student.studentId}`);
        console.log(`   Name: ${student.khmerName}`);
        console.log(`   Reason: ${student.reason}`);
        console.log("");
      });
      console.log("📝 These students need parent accounts created manually.");
      console.log("   See MANUAL_PARENT_CREATION.md for instructions.");
    }

    // Step 5: Verification
    console.log("\n📊 VERIFICATION:");
    const totalParents = await prisma.parent.count();
    const totalUsers = await prisma.user.count({ where: { role: "PARENT" } });
    const totalLinks = await prisma.studentParent.count();

    console.log(`Total parents in database:      ${totalParents}`);
    console.log(`Total parent user accounts:     ${totalUsers}`);
    console.log(`Total student-parent links:     ${totalLinks}`);

    // Export skipped students to CSV for easy review
    if (skippedStudents.length > 0) {
      const fs = require("fs");
      const csvContent = [
        "Student ID,Student Name,Reason",
        ...skippedStudents.map(s =>
          `${s.studentId},"${s.khmerName}","${s.reason}"`
        )
      ].join("\n");

      const csvPath = "./skipped-students-report.csv";
      fs.writeFileSync(csvPath, csvContent, "utf8");
      console.log(`\n📄 Skipped students exported to: ${csvPath}`);
      console.log("   Open this file to review students needing manual parent accounts.");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Parents can now login with:");
    console.log("   - Phone: Their phone number from student records");
    console.log("   - Password: Same as phone number (they should change it)");
    console.log("\n2. Test a parent login:");
    console.log("   curl -X POST http://localhost:5001/api/auth/login \\");
    console.log("     -H \"Content-Type: application/json\" \\");
    console.log("     -d '{\"phone\": \"PARENT_PHONE\", \"password\": \"PARENT_PHONE\"}'");
    console.log("\n3. Access parent portal: http://localhost:3000/login");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateParentData()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

import cron from "node-cron";
import { prisma } from "../config/database";
import { emailService } from "../services/email.service";
import { notificationService } from "../services/notification.service";
import { isDefaultPassword } from "../utils/password.utils";

/**
 * Password Expiration Job
 * Runs daily at midnight (00:00)
 * 
 * Actions:
 * 1. Find all teachers with expired default passwords
 * 2. Suspend their accounts
 * 3. Send email notifications
 * 4. Log actions to audit table
 */

let jobRunning = false;

export const startPasswordExpirationJob = () => {
  // Schedule: Every day at midnight (00:00)
  const schedule = "0 0 * * *"; // minute hour day month dayOfWeek

  const job = cron.schedule(schedule, async () => {
    if (jobRunning) {
      console.log("⚠️  Password expiration job already running, skipping...");
      return;
    }

    jobRunning = true;

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔒 Starting password expiration check...");
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      await checkExpiredPasswords();

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Password expiration check completed");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error) {
      console.error("❌ Error in password expiration job:", error);
    } finally {
      jobRunning = false;
    }
  });

  console.log("✅ Password expiration job scheduled");
  console.log(`📅 Schedule: Daily at 00:00 (midnight)`);
  console.log(`🔄 Next run: ${getNextRunTime(schedule)}`);

  return job;
};

/**
 * Check for expired passwords and suspend accounts
 */
async function checkExpiredPasswords(): Promise<void> {
  const now = new Date();

  // Find teachers with expired passwords
  const expiredTeachers = await prisma.user.findMany({
    where: {
      role: "TEACHER",
      isDefaultPassword: true,
      passwordExpiresAt: {
        lte: now, // Less than or equal to now (expired)
      },
      isSuspended: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      passwordExpiresAt: true,
    },
  });

  if (expiredTeachers.length === 0) {
    console.log("✅ No expired passwords found");
    return;
  }

  console.log(`📊 Found ${expiredTeachers.length} accounts with expired passwords`);

  let suspendedCount = 0;
  let emailsSentCount = 0;

  for (const teacher of expiredTeachers) {
    if (!teacher.phone) continue;

    // Double-check they actually have default password
    const hasDefaultPassword = await isDefaultPassword(
      teacher.password,
      teacher.phone
    );

    if (!hasDefaultPassword) {
      // Fix the database flag if needed
      await prisma.user.update({
        where: { id: teacher.id },
        data: {
          isDefaultPassword: false,
          passwordExpiresAt: null,
        },
      });
      console.log(`✅ Fixed incorrect flag for ${teacher.firstName} ${teacher.lastName}`);
      continue;
    }

    // Suspend account
    try {
      await prisma.user.update({
        where: { id: teacher.id },
        data: {
          isSuspended: true,
          suspensionReason: "Default password expired",
        },
      });

      suspendedCount++;

      // Create audit log
      await prisma.securityAuditLog.create({
        data: {
          userId: teacher.id,
          adminId: "SYSTEM",
          action: "AUTO_SUSPEND",
          reason: "Default password expired",
          metadata: {
            expiredAt: teacher.passwordExpiresAt?.toISOString(),
            suspendedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`🚫 Suspended: ${teacher.firstName} ${teacher.lastName}`);

      // Send email notification
      if (teacher.email && emailService.isReady()) {
        const teacherName = `${teacher.firstName} ${teacher.lastName}`;
        const sent = await notificationService.sendAccountSuspendedNotification(
          teacher.id,
          teacher.email,
          teacherName
        );

        if (sent) {
          emailsSentCount++;
          console.log(`📧 Email sent to: ${teacher.email}`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Failed to suspend ${teacher.firstName} ${teacher.lastName}:`,
        error
      );
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 Summary:`);
  console.log(`   Accounts suspended: ${suspendedCount}`);
  console.log(`   Emails sent: ${emailsSentCount}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/**
 * Get next run time for cron schedule
 */
function getNextRunTime(schedule: string): string {
  // node-cron doesn't provide nextDate method, so we return a description
  if (schedule === "0 0 * * *") {
    return "Daily at 00:00 (midnight)";
  }
  return schedule;
}

/**
 * Manual trigger for testing
 */
export const triggerPasswordExpirationCheck = async (): Promise<void> => {
  console.log("🔧 Manual trigger: Password expiration check");
  await checkExpiredPasswords();
};

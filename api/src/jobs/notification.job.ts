import cron from "node-cron";
import { notificationService } from "../services/notification.service";

/**
 * Notification Job
 * Runs daily at 9:00 AM
 * 
 * Actions:
 * 1. Find teachers with passwords expiring in 7, 5, 3, or 1 day(s)
 * 2. Send email reminders
 * 3. Log notifications sent
 */

let jobRunning = false;

export const startNotificationJob = () => {
  // Schedule: Every day at 9:00 AM
  const schedule = "0 9 * * *"; // minute hour day month dayOfWeek

  const job = cron.schedule(schedule, async () => {
    if (jobRunning) {
      console.log("⚠️  Notification job already running, skipping...");
      return;
    }

    jobRunning = true;

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Starting daily notification job...");
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      await notificationService.sendPasswordExpiringNotifications();

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Daily notification job completed");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error) {
      console.error("❌ Error in notification job:", error);
    } finally {
      jobRunning = false;
    }
  });

  console.log("✅ Notification job scheduled");
  console.log(`📅 Schedule: Daily at 09:00 AM`);
  console.log(`🔄 Next run: ${getNextRunTime(schedule)}`);

  return job;
};

/**
 * Get next run time for cron schedule
 */
function getNextRunTime(schedule: string): string {
  // node-cron doesn't provide nextDate method, so we return a description
  if (schedule === "0 9 * * *") {
    return "Daily at 09:00 AM";
  }
  return schedule;
}

/**
 * Manual trigger for testing
 */
export const triggerNotificationJob = async (): Promise<void> => {
  console.log("🔧 Manual trigger: Notification job");
  await notificationService.sendPasswordExpiringNotifications();
};

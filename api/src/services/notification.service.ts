import { prisma } from "../config/database";
import { emailService } from "./email.service";
import { isDefaultPassword } from "../utils/password.utils";

interface NotificationTarget {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  passwordExpiresAt: Date;
  daysRemaining: number;
}

class NotificationService {
  /**
   * Send password expiring notifications
   * Called by cron job daily at 9 AM
   */
  async sendPasswordExpiringNotifications(): Promise<void> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Starting password expiring notifications...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (!emailService.isReady()) {
      console.warn("⚠️  Email service not configured. Skipping notifications.");
      return;
    }

    try {
      // Get teachers with expiring passwords (7, 5, 3, 1 days)
      const targets = await this.getNotificationTargets([7, 5, 3, 1]);

      if (targets.length === 0) {
        console.log("✅ No expiring passwords found. All clear!");
        return;
      }

      console.log(`📊 Found ${targets.length} teachers with expiring passwords`);

      let sentCount = 0;
      let failedCount = 0;

      // Send notifications
      for (const target of targets) {
        if (!target.email) {
          console.warn(`⚠️  No email for ${target.firstName} ${target.lastName}`);
          failedCount++;
          continue;
        }

        const teacherName = `${target.firstName} ${target.lastName}`;
        const success = await emailService.sendPasswordExpiringEmail(
          target.email,
          teacherName,
          target.daysRemaining
        );

        if (success) {
          sentCount++;
          // Log notification sent
          await this.logNotification(
            target.id,
            "PASSWORD_EXPIRING",
            target.daysRemaining
          );
        } else {
          failedCount++;
        }
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ Sent: ${sentCount} notifications`);
      if (failedCount > 0) {
        console.log(`❌ Failed: ${failedCount} notifications`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error) {
      console.error("❌ Error sending notifications:", error);
    }
  }

  /**
   * Send account suspended notification
   */
  async sendAccountSuspendedNotification(
    userId: string,
    email: string,
    teacherName: string
  ): Promise<boolean> {
    if (!emailService.isReady()) {
      console.warn("⚠️  Email service not configured");
      return false;
    }

    const success = await emailService.sendAccountSuspendedEmail(
      email,
      teacherName
    );

    if (success) {
      await this.logNotification(userId, "ACCOUNT_SUSPENDED", 0);
    }

    return success;
  }

  /**
   * Get teachers with expiring passwords on specific days
   */
  private async getNotificationTargets(
    daysArray: number[]
  ): Promise<NotificationTarget[]> {
    const now = new Date();
    const targets: NotificationTarget[] = [];

    for (const days of daysArray) {
      // Calculate target date (start and end of the day)
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find teachers with passwords expiring on this specific day
      const teachers = await prisma.user.findMany({
        where: {
          role: "TEACHER",
          isDefaultPassword: true,
          passwordExpiresAt: {
            gte: targetDate,
            lt: nextDay,
          },
          isSuspended: false,
          email: {
            not: null,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          passwordExpiresAt: true,
          password: true,
        },
      });

      // Filter to ensure they actually have default passwords
      for (const teacher of teachers) {
        if (!teacher.phone) continue;

        const hasDefaultPassword = await isDefaultPassword(
          teacher.password,
          teacher.phone
        );

        if (hasDefaultPassword && teacher.passwordExpiresAt) {
          // Check if we've already sent a notification today
          const alreadySentToday = await this.hasNotificationSentToday(
            teacher.id,
            "PASSWORD_EXPIRING"
          );

          if (!alreadySentToday) {
            targets.push({
              id: teacher.id,
              firstName: teacher.firstName,
              lastName: teacher.lastName,
              email: teacher.email,
              phone: teacher.phone,
              passwordExpiresAt: teacher.passwordExpiresAt,
              daysRemaining: days,
            });
          }
        }
      }
    }

    return targets;
  }

  /**
   * Check if notification was already sent today
   */
  private async hasNotificationSentToday(
    userId: string,
    notificationType: string
  ): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await prisma.notificationLog.count({
      where: {
        userId,
        type: notificationType,
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return count > 0;
  }

  /**
   * Log notification sent
   */
  private async logNotification(
    userId: string,
    type: string,
    daysRemaining: number
  ): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          type,
          metadata: {
            daysRemaining,
            sentAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to log notification:", error);
      // Don't throw - logging failure shouldn't stop the notification process
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<{
    todaySent: number;
    weekSent: number;
    failedToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaySent = await prisma.notificationLog.count({
      where: {
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const weekSent = await prisma.notificationLog.count({
      where: {
        sentAt: {
          gte: weekAgo,
        },
      },
    });

    return {
      todaySent,
      weekSent,
      failedToday: 0, // TODO: Implement failed tracking
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

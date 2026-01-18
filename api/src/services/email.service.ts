import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_FROM_EMAIL,
      SMTP_FROM_NAME,
    } = process.env;

    // Check if SMTP is configured
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
      console.warn("⚠️  SMTP not configured. Email notifications disabled.");
      console.warn("   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env");
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      this.isConfigured = true;
      console.log("✅ Email service initialized");
      console.log(`📧 SMTP Host: ${SMTP_HOST}:${SMTP_PORT}`);
      console.log(`👤 SMTP User: ${SMTP_USER}`);
      console.log(`📤 From: ${SMTP_FROM_NAME || "School System"} <${SMTP_FROM_EMAIL || SMTP_USER}>`);
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn("⚠️  Email not sent - SMTP not configured");
      return false;
    }

    try {
      const { SMTP_FROM_EMAIL, SMTP_FROM_NAME, SMTP_USER } = process.env;
      const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;
      const fromName = SMTP_FROM_NAME || "School Management System";

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
        html: options.html,
      });

      console.log("✅ Email sent:", {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send password expiring notification
   */
  async sendPasswordExpiringEmail(
    to: string,
    teacherName: string,
    daysRemaining: number
  ): Promise<boolean> {
    const subject = daysRemaining === 1
      ? "⚠️ ពាក្យសម្ងាត់របស់អ្នកនឹងផុតកំណត់ថ្ងៃស្អែក! Password Expires Tomorrow!"
      : `⚠️ ពាក្យសម្ងាត់របស់អ្នកនឹងផុតកំណត់នៅ ${daysRemaining} ថ្ងៃទៀត! Password Expires in ${daysRemaining} Days`;

    const urgencyColor = daysRemaining === 1 ? "#dc2626" : daysRemaining <= 3 ? "#f59e0b" : "#3b82f6";
    const urgencyLabel = daysRemaining === 1 ? "URGENT" : daysRemaining <= 3 ? "WARNING" : "NOTICE";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .urgency-badge { display: inline-block; background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
    .days-remaining { font-size: 48px; font-weight: bold; color: ${urgencyColor}; margin: 20px 0; }
    .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
    .khmer { font-family: 'Battambang', Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 ការជូនដំណឹងសុវត្ថិភាព</h1>
      <h2>Security Notification</h2>
    </div>
    
    <div class="content">
      <span class="urgency-badge">${urgencyLabel}</span>
      
      <h2 class="khmer">សួស្តី ${teacherName},</h2>
      <h3>Hello ${teacherName},</h3>
      
      <p class="khmer">
        <strong>ពាក្យសម្ងាត់លំនាំដើមរបស់អ្នកនឹងផុតកំណត់ឆាប់ៗនេះ!</strong>
      </p>
      <p>
        <strong>Your default password is about to expire!</strong>
      </p>
      
      <div class="days-remaining">
        ${daysRemaining}
        <span style="font-size: 24px;">${daysRemaining === 1 ? "ថ្ងៃទៀត / Day Left" : "ថ្ងៃទៀត / Days Left"}</span>
      </div>
      
      <p class="khmer">
        សូមប្តូរពាក្យសម្ងាត់របស់អ្នកភ្លាមៗ ដើម្បីរក្សាសុវត្ថិភាពគណនីរបស់អ្នក។
      </p>
      <p>
        Please change your password immediately to keep your account secure.
      </p>
      
      <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p class="khmer" style="margin: 0;">
          <strong>⚠️ ប្រសិនបើអ្នកមិនប្តូរពាក្យសម្ងាត់នៅពេលផុតកំណត់ គណនីរបស់អ្នកនឹងត្រូវបានផ្អាក។</strong>
        </p>
        <p style="margin: 5px 0 0 0;">
          <strong>⚠️ If you don't change your password before it expires, your account will be suspended.</strong>
        </p>
      </div>
      
      <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/teacher-portal" class="button">
        ប្តូរពាក្យសម្ងាត់ឥឡូវនេះ / Change Password Now
      </a>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p class="khmer" style="font-size: 14px; color: #6b7280;">
          <strong>របៀបប្តូរពាក្យសម្ងាត់:</strong><br>
          1. ចូលទៅកាន់ប្រព័ន្ធ<br>
          2. ចុចលើរូបតំណាងគណនីរបស់អ្នក<br>
          3. ជ្រើសរើស "ប្តូរពាក្យសម្ងាត់"<br>
          4. បញ្ចូលពាក្យសម្ងាត់ថ្មីដែលមានសុវត្ថិភាព
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          <strong>How to change your password:</strong><br>
          1. Log in to the system<br>
          2. Click on your profile icon<br>
          3. Select "Change Password"<br>
          4. Enter a secure new password
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p class="khmer">
        អ៊ីម៉ែលនេះត្រូវបានផ្ញើដោយស្វ័យប្រវត្តិពីប្រព័ន្ធគ្រប់គ្រងសាលា។
      </p>
      <p>
        This is an automated email from School Management System.
      </p>
      <p>
        © ${new Date().getFullYear()} School Management System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send account suspended notification
   */
  async sendAccountSuspendedEmail(
    to: string,
    teacherName: string
  ): Promise<boolean> {
    const subject = "🚫 គណនីរបស់អ្នកត្រូវបានផ្អាក! Your Account Has Been Suspended";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
    .khmer { font-family: 'Battambang', Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚫 គណនីត្រូវបានផ្អាក</h1>
      <h2>Account Suspended</h2>
    </div>
    
    <div class="content">
      <h2 class="khmer">សួស្តី ${teacherName},</h2>
      <h3>Hello ${teacherName},</h3>
      
      <div class="alert">
        <p class="khmer">
          <strong>គណនីរបស់អ្នកត្រូវបានផ្អាកដោយសារតែពាក្យសម្ងាត់លំនាំដើមបានផុតកំណត់។</strong>
        </p>
        <p>
          <strong>Your account has been suspended because your default password has expired.</strong>
        </p>
      </div>
      
      <p class="khmer">
        ដើម្បីដោះស្រាយបញ្ហានេះ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី។
      </p>
      <p>
        To resolve this issue, please contact your system administrator to reset your password.
      </p>
      
      <p class="khmer">
        <strong>ការពារសុវត្ថិភាព:</strong><br>
        • ប្រើពាក្យសម្ងាត់ដែលមានសុវត្ថិភាព (យ៉ាងតិច 8 តួអក្សរ)<br>
        • រួមបញ្ចូលអក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា<br>
        • កុំប្រើពាក្យសម្ងាត់ដែលងាយស្រាយ<br>
        • កុំចែករំលែកពាក្យសម្ងាត់របស់អ្នកជាមួយអ្នកដទៃ
      </p>
      
      <p>
        <strong>Security Tips:</strong><br>
        • Use a strong password (at least 8 characters)<br>
        • Include uppercase, lowercase, numbers, and symbols<br>
        • Don't use easily guessable passwords<br>
        • Never share your password with others
      </p>
    </div>
    
    <div class="footer">
      <p class="khmer">
        អ៊ីម៉ែលនេះត្រូវបានផ្ញើដោយស្វ័យប្រវត្តិពីប្រព័ន្ធគ្រប់គ្រងសាលា។
      </p>
      <p>
        This is an automated email from School Management System.
      </p>
      <p>
        © ${new Date().getFullYear()} School Management System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error("❌ Email service not configured");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Email connection test failed:", error);
      return false;
    }
  }

  /**
   * Check if email service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();

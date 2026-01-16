# Password Security System - Quick Start Guide

**🚀 Fast Implementation Reference**

This is a condensed guide for quick reference during implementation. For complete details, see [PASSWORD_SECURITY_IMPLEMENTATION.md](./PASSWORD_SECURITY_IMPLEMENTATION.md).

---

## ⚠️ CRITICAL: Existing System

### ✅ What Already Exists and Works Perfectly

**Password Change Feature - ALREADY IMPLEMENTED** ✅
- **Modal:** `src/components/modals/TeacherPasswordModal.tsx`
- **API:** `POST /api/teacher-portal/change-password`
- **Controller:** `api/src/controllers/teacher-portal.controller.ts` (line 265+)
- **Status:** FULLY FUNCTIONAL, NO BUGS

**The Problem:** Teachers aren't using it! Almost all still use default passwords (phone numbers).

**What We're Building:** Detection + Warnings + Enforcement (NOT rebuilding password change!)

---

## 📋 Overview

**What:** Force all teachers using default passwords (phone number) to use the EXISTING password change feature within 7 days, or account gets suspended.

**Why:** Eliminate security risk of predictable passwords by driving adoption of existing feature.

**Where:** 
- Teacher profile screen (NEW warning banner)
- Login flow (NEW detection & blocking)
- Admin security dashboard (NEW management tools)
- Password change modal (EXISTING - already works!)

---

## 🗄️ Database Changes

### Add to User Model (Prisma)

```prisma
model User {
  // ... existing fields
  
  // Password Security Fields
  isDefaultPassword     Boolean   @default(true)
  passwordExpiresAt     DateTime?
  passwordChangedAt     DateTime?
  passwordResetToken    String?   @unique
  passwordResetExpiry   DateTime?
  accountSuspendedAt    DateTime?
  suspensionReason      String?
  lastPasswordHashes    String[]  // Store last 3 password hashes
  
  // Indexes for performance
  @@index([isDefaultPassword])
  @@index([passwordExpiresAt])
}
```

### Add Audit Log Model

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  teacherId   String
  action      String   // "RESET_PASSWORD", "SUSPEND", "EXTEND", etc.
  reason      String?
  details     Json?
  createdAt   DateTime @default(now())
  
  admin       User     @relation("AuditLogAdmin", fields: [adminId], references: [id])
  teacher     User     @relation("AuditLogTeacher", fields: [teacherId], references: [id])
  
  @@index([createdAt])
  @@index([teacherId])
}
```

### Migration Command

```bash
npx prisma migrate dev --name add_password_security_fields
```

---

## 🔧 Key Backend Functions

### 1. Password Detection

```typescript
// api/src/utils/password.utils.ts

export function isDefaultPassword(user: User, phone: string): boolean {
  return bcrypt.compareSync(phone, user.password);
}

export function calculatePasswordExpiry(days: number = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  expiry.setHours(23, 59, 59, 999);
  return expiry;
}

export function getAlertLevel(expiresAt: Date): 'critical' | 'urgent' | 'notice' {
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 2) return 'critical';
  if (daysRemaining <= 4) return 'urgent';
  return 'notice';
}

export function validatePasswordStrength(password: string, user: User): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  if (password === user.phone || password === user.email) {
    errors.push('Password cannot be your phone number or email');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 2. Login Enhancement

```typescript
// api/src/controllers/auth.controller.ts

async login(req, res) {
  // ... existing login logic
  
  // After successful authentication
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Check if using default password
  const isDefault = isDefaultPassword(user, user.phone);
  
  // If default and first time, set expiration
  if (isDefault && !user.passwordExpiresAt) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDefaultPassword: true,
        passwordExpiresAt: calculatePasswordExpiry(7)
      }
    });
  }
  
  // Check if password expired
  if (user.isDefaultPassword && user.passwordExpiresAt < new Date()) {
    // Suspend account
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        accountSuspendedAt: new Date(),
        suspensionReason: 'Password change deadline exceeded'
      }
    });
    
    return res.status(403).json({
      error: 'Account suspended',
      message: 'Your account has been suspended due to password change deadline exceeded. Please contact administrator.'
    });
  }
  
  // Return with security status
  return res.json({
    token,
    user,
    security: {
      isDefaultPassword: user.isDefaultPassword,
      passwordExpiresAt: user.passwordExpiresAt,
      daysRemaining: calculateDaysRemaining(user.passwordExpiresAt)
    }
  });
}
```

### 3. Enhance EXISTING Password Change (MINIMAL CHANGES)

```typescript
// api/src/controllers/teacher-portal.controller.ts (line 265+)
// NOTE: This endpoint ALREADY EXISTS and WORKS!
// Only ADD the highlighted lines below:

async changePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.userId;
  
  // --- EXISTING CODE (Don't change) ---
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // --- END EXISTING CODE ---
  
  // Update user - ADD these new fields to existing update:
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      isDefaultPassword: false,        // 🆕 ADD THIS
      passwordExpiresAt: null,         // 🆕 ADD THIS
      passwordChangedAt: new Date(),   // 🆕 ADD THIS
    }
  });
  
  // Enhance response - ADD these fields:
  return res.json({
    message: 'Password changed successfully',
    isDefaultPassword: false,          // 🆕 ADD THIS
    passwordChangedAt: new Date()      // 🆕 ADD THIS
  });
}

// ⚠️ IMPORTANT: Don't rewrite the entire function!
// Just ADD the three new database fields and two response fields.
// Keep all existing validation logic intact!
```

---

## 🎨 Frontend Components

### 1. Password Warning Banner

```tsx
// src/components/security/PasswordExpiryWarning.tsx

interface PasswordExpiryWarningProps {
  daysRemaining: number;
  hoursRemaining: number;
  alertLevel: 'critical' | 'urgent' | 'notice';
  onChangePassword: () => void;
}

export function PasswordExpiryWarning({ 
  daysRemaining, 
  hoursRemaining, 
  alertLevel,
  onChangePassword 
}: PasswordExpiryWarningProps) {
  const colorMap = {
    critical: 'bg-red-50 border-red-500 text-red-800',
    urgent: 'bg-orange-50 border-orange-400 text-orange-800',
    notice: 'bg-blue-50 border-blue-400 text-blue-800'
  };
  
  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${colorMap[alertLevel]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            ⚠️ PASSWORD CHANGE REQUIRED
          </h3>
          <p className="mt-1">
            Your account is using a default password. For security, you must change it within:
          </p>
          <div className="text-2xl font-bold mt-2">
            🕐 {daysRemaining} Days {hoursRemaining} Hours
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onChangePassword}
          className="bg-white px-4 py-2 rounded font-semibold hover:bg-gray-100"
        >
          Change Password Now
        </button>
      </div>
    </div>
  );
}
```

### 2. Add Warning to EXISTING Teacher Profile

```tsx
// src/app/teacher-portal/page.tsx
// NOTE: This file ALREADY EXISTS with working profile UI
// Just ADD the warning banner and password status logic

export default function TeacherProfile() {
  // 🆕 ADD: Password status state
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // 🆕 ADD: Fetch password status on mount
  useEffect(() => {
    fetch('/api/auth/password-status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPasswordStatus(data));
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      {/* 🆕 ADD: Password Warning Banner (NEW) */}
      {passwordStatus?.isDefaultPassword && (
        <PasswordExpiryWarning
          daysRemaining={passwordStatus.daysRemaining}
          hoursRemaining={passwordStatus.hoursRemaining}
          alertLevel={passwordStatus.alertLevel}
          onChangePassword={() => setShowPasswordModal(true)}
        />
      )}
      
      {/* ✅ EXISTING: Profile Picture and all existing UI */}
      <div className="text-center mb-6">
        <img src={profilePhoto} className="w-32 h-32 rounded-full mx-auto" />
        <h1 className="text-2xl font-bold mt-4">{teacher.name}</h1>
      </div>
      
      {/* ✅ EXISTING: All the rest of your profile UI... */}
      {/* Stats, contact info, classes, etc. */}
      
      {/* ✅ EXISTING: Password Modal (Already works!) */}
      {/* Just update the onSuccess handler to refresh status */}
      {showPasswordModal && (
        <TeacherPasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            // 🆕 ADD: Refresh password status after change
            setPasswordStatus({ ...passwordStatus, isDefaultPassword: false });
            setShowPasswordModal(false);
          }}
        />
      )}
    </div>
  );
}

// Summary of Changes:
// ✅ Keep all existing profile UI
// 🆕 Add password status fetch
// 🆕 Add warning banner component
// 🆕 Update modal success handler
// ⚠️ Don't break existing features!
```

### 3. Auto-Logout Guard

```tsx
// src/components/layout/AuthGuard.tsx

export function AuthGuard({ children }) {
  const { user, logout } = useAuth();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  
  useEffect(() => {
    // Check password expiration every route change
    async function checkExpiration() {
      try {
        const response = await fetch('/api/auth/password-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.status === 403) {
          // Password expired - force logout
          setShowExpiredModal(true);
          logout();
        }
      } catch (error) {
        console.error('Failed to check password status:', error);
      }
    }
    
    checkExpiration();
    
    // Also check every 5 minutes
    const interval = setInterval(checkExpiration, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [logout]);
  
  if (showExpiredModal) {
    return <PasswordExpiredModal />;
  }
  
  return <>{children}</>;
}
```

---

## 👨‍💼 Admin Dashboard

### API Endpoints

```typescript
// api/src/routes/admin-security.routes.ts

router.get('/admin/security/dashboard', adminAuth, async (req, res) => {
  const stats = await prisma.user.groupBy({
    by: ['isDefaultPassword', 'isActive'],
    where: { role: 'TEACHER' },
    _count: true
  });
  
  const teachers = await prisma.user.findMany({
    where: { 
      role: 'TEACHER',
      isDefaultPassword: true 
    },
    include: { teacher: true },
    orderBy: { passwordExpiresAt: 'asc' }
  });
  
  // Calculate alert levels
  const teachersWithAlerts = teachers.map(t => ({
    ...t,
    daysRemaining: calculateDaysRemaining(t.passwordExpiresAt),
    alertLevel: getAlertLevel(t.passwordExpiresAt)
  }));
  
  return res.json({
    statistics: {
      total: stats.reduce((sum, s) => sum + s._count, 0),
      critical: teachersWithAlerts.filter(t => t.alertLevel === 'critical').length,
      urgent: teachersWithAlerts.filter(t => t.alertLevel === 'urgent').length,
      notice: teachersWithAlerts.filter(t => t.alertLevel === 'notice').length,
      secure: stats.find(s => !s.isDefaultPassword)?._count || 0,
      suspended: stats.find(s => !s.isActive)?._count || 0
    },
    teachers: teachersWithAlerts
  });
});

router.post('/admin/security/teachers/:id/reset-password', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { reason, expirationDays = 7 } = req.body;
  
  // Generate temporary password
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  
  // Update teacher
  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      isDefaultPassword: true,
      passwordExpiresAt: calculatePasswordExpiry(expirationDays),
      lastPasswordHashes: []
    }
  });
  
  // Log action
  await prisma.auditLog.create({
    data: {
      adminId: req.userId,
      teacherId: id,
      action: 'RESET_PASSWORD',
      reason,
      details: { expirationDays }
    }
  });
  
  // Send notification email
  await sendPasswordResetEmail(id, tempPassword);
  
  return res.json({
    success: true,
    temporaryPassword: tempPassword,
    expiresAt: calculatePasswordExpiry(expirationDays)
  });
});
```

---

## 📧 Email Templates

### Initial Warning (Day 7)

```html
<!-- api/templates/email/password-initial-warning.html -->

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Action Required: Change Your Password</h1>
    </div>
    <div class="content">
      <p>Dear {{teacherName}},</p>
      
      <div class="warning">
        <strong>⚠️ Security Alert:</strong> You are using a default password for your School Management System account.
      </div>
      
      <p><strong>Why this matters:</strong><br>
      Default passwords are easy to guess and put your account at risk.</p>
      
      <p><strong>What you need to do:</strong></p>
      <ol>
        <li>Log in to your account</li>
        <li>Go to your Profile</li>
        <li>Click "Change Password"</li>
        <li>Create a strong, unique password</li>
      </ol>
      
      <p><strong>Deadline:</strong> {{expirationDate}} (7 days from today)<br>
      <strong>Days Remaining:</strong> <span style="font-size: 24px; color: #dc2626;">7</span></p>
      
      <center>
        <a href="{{loginUrl}}" class="button">Change Password Now</a>
      </center>
      
      <p><strong>What happens if I don't change it?</strong><br>
      Your account will be temporarily suspended, and you'll need to contact an administrator.</p>
      
      <p>If you need assistance, please contact:<br>
      📧 Email: support@school.com<br>
      📞 Phone: 855-XXX-XXXX</p>
    </div>
    <div class="footer">
      <p>School Management System | Automated Security Notification</p>
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Scheduled Jobs

### Daily Expiration Check

```typescript
// api/src/jobs/password-expiration.job.ts

import cron from 'node-cron';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running password expiration check...');
  
  const expiredUsers = await prisma.user.findMany({
    where: {
      isDefaultPassword: true,
      passwordExpiresAt: { lt: new Date() },
      isActive: true
    }
  });
  
  for (const user of expiredUsers) {
    // Suspend account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: false,
        accountSuspendedAt: new Date(),
        suspensionReason: 'Password change deadline exceeded'
      }
    });
    
    // Send notification
    await sendAccountSuspendedEmail(user.id);
    
    console.log(`Suspended user ${user.id} - password expired`);
  }
  
  console.log(`Suspended ${expiredUsers.length} accounts`);
});
```

### Daily Reminders

```typescript
// api/src/jobs/password-notification.job.ts

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Sending password reminders...');
  
  const usersToNotify = await prisma.user.findMany({
    where: {
      isDefaultPassword: true,
      passwordExpiresAt: { gt: new Date() },
      isActive: true
    }
  });
  
  for (const user of usersToNotify) {
    const daysRemaining = calculateDaysRemaining(user.passwordExpiresAt);
    
    // Send reminder on days 7, 5, 3, 1
    if ([7, 5, 3, 1].includes(daysRemaining)) {
      await sendPasswordReminderEmail(user.id, daysRemaining);
      console.log(`Sent reminder to user ${user.id} - ${daysRemaining} days remaining`);
    }
  }
  
  console.log('Password reminders sent');
});
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Backup production database
- [ ] Test migration in staging
- [ ] Test all endpoints in staging
- [ ] Get stakeholder approval
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window

### Deployment

1. **Run migration:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Initialize data:**
   ```bash
   node scripts/initialize-password-security.js
   ```

3. **Deploy backend:**
   ```bash
   npm run build
   npm run start:prod
   ```

4. **Deploy frontend:**
   ```bash
   npm run build
   # Upload to hosting
   ```

5. **Enable cron jobs:**
   ```bash
   pm2 start api/src/jobs/index.js --name "security-jobs"
   ```

6. **Send initial emails:**
   ```bash
   node scripts/send-initial-notifications.js
   ```

### Post-Deployment

- [ ] Verify login works
- [ ] Verify password change works
- [ ] Check admin dashboard
- [ ] Monitor error logs
- [ ] Monitor email delivery
- [ ] Be ready for support

---

## 📊 Monitoring

### Key Metrics to Track

```typescript
// Daily report query
SELECT 
  COUNT(*) FILTER (WHERE "isDefaultPassword" = true AND "isActive" = true) as active_default,
  COUNT(*) FILTER (WHERE "isDefaultPassword" = false) as changed,
  COUNT(*) FILTER (WHERE "isActive" = false) as suspended,
  AVG(EXTRACT(DAY FROM ("passwordExpiresAt" - NOW()))) as avg_days_remaining
FROM "User"
WHERE role = 'TEACHER';
```

### Alert Thresholds

- 🔴 Critical: > 10 suspensions in one day
- 🟡 Warning: < 50% compliance after 7 days
- 🟢 Good: > 90% compliance after 10 days

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Teacher can't log in after password change**
- Check if new password meets requirements
- Verify password was saved correctly
- Check if account is active

**Issue: Email notifications not sending**
- Check email service configuration
- Verify email templates exist
- Check spam folder
- Verify email queue is running

**Issue: Auto-logout not working**
- Check if password expiration check is running
- Verify JWT token includes security status
- Check AuthGuard is wrapping protected routes

**Issue: Admin can't reset password**
- Verify admin has correct permissions
- Check if teacher exists
- Verify temporary password generation works
- Check audit log for errors

---

## 📞 Support

**Development Team:**
- Lead: [Name] - [Email]
- Backend: [Name] - [Email]
- Frontend: [Name] - [Email]

**Stakeholders:**
- Admin: [Name] - [Phone]
- IT Manager: [Name] - [Phone]

---

## ✅ Final Checklist

Before going live:

- [ ] Database migration tested
- [ ] All NEW API endpoints tested
- [ ] **EXISTING password change still works** (regression test!)
- [ ] Warning banner displays correctly
- [ ] Warning banner opens existing modal correctly
- [ ] Password change clears warnings
- [ ] UI components work on mobile
- [ ] Email templates tested
- [ ] Cron jobs scheduled
- [ ] Admin dashboard functional
- [ ] Auto-logout works
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Monitoring setup
- [ ] Rollback plan ready
- [ ] Stakeholder approval

## ⚠️ Critical Regression Tests

**Test these EXISTING features still work:**
- [ ] Teachers can log in normally
- [ ] Teachers can access profile normally
- [ ] Password change modal opens and works
- [ ] Password change validates correctly
- [ ] Password change saves successfully
- [ ] No errors in existing login flow
- [ ] Admin accounts page still works

## 🎯 What Makes This Project Simple

**We're NOT building:**
- ❌ Password change feature (exists!)
- ❌ Teacher profile page (exists!)
- ❌ Login system (exists!)
- ❌ Validation logic (exists!)

**We're ONLY building:**
- ✅ Detection logic (bcrypt compare)
- ✅ Warning banner (new component)
- ✅ Expiration checking (new background job)
- ✅ Admin dashboard (new page)
- ✅ Email notifications (new system)

**This should be a relatively quick implementation because the core password change feature already works!**

---

**Ready to implement? Start with [PASSWORD_SECURITY_TODO.md](./PASSWORD_SECURITY_TODO.md)!**

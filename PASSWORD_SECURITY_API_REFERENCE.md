# Password Security API Reference

Quick reference for using the password security endpoints.

---

## 🔐 Authentication Endpoints

### Check Password Status
```http
GET /api/auth/password-status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isDefaultPassword": true,
    "passwordExpiresAt": "2026-01-23T18:55:08.266Z",
    "passwordChangedAt": null,
    "daysRemaining": 3,
    "hoursRemaining": 12,
    "isExpired": false,
    "alertLevel": "warning",
    "canExtend": true
  }
}
```

**Alert Levels:**
- `none` - More than 5 days remaining
- `info` - 3-5 days remaining  
- `warning` - 1-3 days remaining
- `danger` - Less than 1 day remaining
- `expired` - Password has expired

---

## 👨‍💼 Admin Security Endpoints

All admin endpoints require:
- Authentication: `Authorization: Bearer {admin_token}`
- User role: `ADMIN`

### 1. Security Dashboard

Get overview statistics.

```http
GET /api/admin/security/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTeachers": 50,
    "defaultPasswordCount": 35,
    "expiredCount": 5,
    "expiringInDay": 3,
    "expiringIn3Days": 8,
    "suspendedCount": 2,
    "securityScore": 30
  }
}
```

---

### 2. Teacher Security List

Get paginated list of teachers with security status.

```http
GET /api/admin/security/teachers?page=1&limit=20&filter=default
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `filter` (optional) - Filter type:
  - `all` - All teachers
  - `default` - Using default passwords
  - `expired` - Expired passwords
  - `expiring` - Expiring in next 7 days
  - `suspended` - Suspended accounts

**Response:**
```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "user123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "isActive": true,
        "isDefaultPassword": true,
        "passwordExpiresAt": "2026-01-23T18:55:08.266Z",
        "passwordChangedAt": null,
        "lastLogin": "2026-01-16T10:30:00.000Z",
        "daysRemaining": 3,
        "hoursRemaining": 12,
        "isExpired": false,
        "alertLevel": "warning",
        "teacher": {
          "teacherId": "T001",
          "firstName": "John",
          "lastName": "Doe",
          "khmerName": "ចន ដូ",
          "position": "Teacher"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "totalPages": 2
    }
  }
}
```

---

### 3. Force Password Reset

Generate temporary password and reset teacher's account.

```http
POST /api/admin/security/force-reset
Content-Type: application/json

{
  "teacherId": "user123",
  "reason": "Security concern - account compromised"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "tempPassword": "appleorangepear742",
    "teacherName": "John Doe",
    "expiresAt": "2026-01-23T18:55:08.266Z"
  }
}
```

**Important:**
- Temporary password is shown only once
- Copy it immediately to give to teacher
- Teacher must change it within 7 days
- Action is logged in audit trail

---

### 4. Extend Password Expiration

Give teacher more time to change password.

```http
POST /api/admin/security/extend-expiration
Content-Type: application/json

{
  "teacherId": "user123",
  "days": 7,
  "reason": "Teacher on sick leave"
}
```

**Request Body:**
- `teacherId` (required) - User ID
- `days` (required) - Number of days (1-30)
- `reason` (optional) - Reason for extension

**Response:**
```json
{
  "success": true,
  "message": "Password expiration extended by 7 days",
  "data": {
    "newExpiresAt": "2026-01-30T18:55:08.266Z"
  }
}
```

---

### 5. Suspend/Unsuspend Account

Temporarily disable or enable a teacher account.

```http
POST /api/admin/security/toggle-suspension
Content-Type: application/json

{
  "teacherId": "user123",
  "suspend": true,
  "reason": "Password change deadline exceeded"
}
```

**Request Body:**
- `teacherId` (required) - User ID
- `suspend` (required) - true to suspend, false to unsuspend
- `reason` (optional) - Reason for action

**Response:**
```json
{
  "success": true,
  "message": "Account suspended"
}
```

**Note:** Suspended users cannot login until unsuspended.

---

### 6. Audit Logs

View all admin actions.

```http
GET /api/admin/security/audit-logs?page=1&limit=20&teacherId=user123
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `teacherId` (optional) - Filter by specific teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log123",
        "action": "FORCE_PASSWORD_RESET",
        "reason": "Security concern",
        "createdAt": "2026-01-16T18:55:08.266Z",
        "details": {
          "tempPassword": "appleorangepear742"
        },
        "admin": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "teacher": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Action Types:**
- `FORCE_PASSWORD_RESET` - Admin reset password
- `EXTEND_EXPIRATION` - Extended expiration date
- `SUSPEND_ACCOUNT` - Suspended account
- `UNSUSPEND_ACCOUNT` - Unsuspended account

---

## 🔄 Teacher Password Change

Teachers can change their own password.

```http
POST /api/teacher-portal/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "0123456789",
  "newPassword": "MyNewSecure123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "isDefaultPassword": false,
  "passwordChangedAt": "2026-01-16T18:55:08.266Z"
}
```

**Password Requirements:**
- At least 8 characters long
- Cannot be phone number
- Should not be all numbers

---

## 📊 Login Response

Login endpoint now includes password status.

```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0123456789",
  "password": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ចូលប្រើប្រាស់បានជោគជ័យ\nLogin successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "expiresIn": "365d",
    "passwordStatus": {
      "isDefaultPassword": true,
      "passwordExpiresAt": "2026-01-23T18:55:08.266Z",
      "alertLevel": "warning",
      "daysRemaining": 3,
      "hoursRemaining": 12,
      "isExpired": false
    }
  }
}
```

**Error if Expired:**
```json
{
  "success": false,
  "message": "ពាក្យសម្ងាត់របស់អ្នកផុតកំណត់\nYour password has expired. Please contact admin.",
  "passwordExpired": true
}
```

---

## 🎯 Common Use Cases

### Check All Teachers Using Default Passwords
```bash
curl -X GET "http://localhost:5001/api/admin/security/teachers?filter=default" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Find Teachers with Expired Passwords
```bash
curl -X GET "http://localhost:5001/api/admin/security/teachers?filter=expired" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Reset Teacher Password
```bash
curl -X POST "http://localhost:5001/api/admin/security/force-reset" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teacherId":"user123","reason":"Teacher forgot password"}'
```

### Give Teacher 7 More Days
```bash
curl -X POST "http://localhost:5001/api/admin/security/extend-expiration" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teacherId":"user123","days":7,"reason":"Teacher on leave"}'
```

### View Recent Admin Actions
```bash
curl -X GET "http://localhost:5001/api/admin/security/audit-logs?page=1" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔒 Error Codes

- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin)
- `404` - Teacher not found
- `400` - Bad request (invalid parameters)
- `500` - Server error

---

## 💡 Tips

1. **Always check passwordStatus in login response** to show warnings to users
2. **Use the dashboard endpoint** for quick overview
3. **Filter teachers by status** to find those needing attention
4. **Save temporary passwords** when doing force resets
5. **Include reasons** in admin actions for audit trail
6. **Check audit logs** regularly to track security actions

---

**Last Updated:** January 16, 2026

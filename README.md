# 🏫 School Management System (ប្រព័ន្ធគ្រប់គ្រងសាលា)

A professional full-stack **Progressive Web App (PWA)** for Khmer educational institutions with comprehensive student tracking, grade management, reporting capabilities, and **mobile-optimized UI**.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)
![Mobile](https://img.shields.io/badge/Mobile-Optimized-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Report System](#-report-system)
- [Tracking Book](#-tracking-book-សៀវភៅតាមដាន)
- [Grade Calculation](#-grade-calculation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Development Guide](#-development-guide)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- 👥 **Student Management** (គ្រប់គ្រងសិស្ស)

  - Add, edit, delete student records
  - Bulk import from Excel
  - Student registration with detailed information
  - Track student progress and performance
  - Assign students to classes

- 👨‍🏫 **Teacher Management** (គ្រប់គ្រងគ្រូបង្រៀន)

  - Manage teacher profiles
  - Assign teachers to subjects and classes
  - Track teaching assignments
  - Homeroom teacher assignment

- 🏫 **Class Management** (គ្រប់គ្រងថ្នាក់រៀន)

  - Create and manage classes
  - Support for multiple tracks (Grade 11/12)
  - Assign students and teachers to classes
  - Track class capacity
  - Academic year management

- 📚 **Subject Management** (គ្រប់គ្រងមុខវិជ្ជា)

  - Add/remove subjects
  - Subject coefficients (មេគុណ)
  - Max score configuration
  - Track-based subject filtering
  - Grade-level subject assignment

- 📊 **Grade Entry & Tracking** (បញ្ចូលពិន្ទុ)

  - Excel-like grid interface for grade entry
  - Real-time validation
  - Bulk grade import from Excel
  - Monthly grade tracking
  - Subject-wise grade levels (A-F)
  - Automatic average calculation
  - Class ranking system

- 📈 **Advanced Reporting System** (របាយការណ៍)

  - **Monthly Report** (របាយការណ៍ប្រចាំខែ)

    - Class performance reports
    - Student rankings
    - Attendance tracking
    - Subject-wise analysis

  - **Grade-wide Report** (របាយការណ៍តាមកម្រិតថ្នាក់)

    - Combined report for all classes in a grade
    - Cross-class comparison
    - Track-based filtering

  - **Tracking Book** (សៀវភៅតាមដាន) ⭐ **NEW**

    - Individual student progress tracking
    - Multi-month aggregation
    - Subject grade levels
    - Attendance summary
    - Print-ready format (A4 Landscape)
    - Single/All student view modes
    - Export to CSV

  - **Monthly Statistics** (ស្ថិតិប្រចាំខែ)
    - Gender-based analysis
    - Pass/Fail statistics
    - Grade distribution (A-F)
    - Subject-wise performance

- 📅 **Attendance Management** (គ្រប់គ្រងវត្តមាន)

  - Daily attendance tracking
  - Absence with/without permission
  - Monthly attendance reports
  - Integration with tracking book

- 🖨️ **Print-ready Reports**

  - Student transcripts
  - Class performance summaries
  - Tracking books
  - Monthly reports
  - Statistical reports

- 🔐 **Security Features**
  - JWT-based authentication
  - Role-based Access Control (RBAC)
  - Protected routes
  - Session management
  - Secure password hashing

---

## 🛠 Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.0
- **UI Components:** Custom components with Tailwind
- **Icons:** Lucide React
- **State Management:** React Context API
- **HTTP Client:** Fetch API

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5.22
- **Authentication:** JWT (jsonwebtoken)
- **File Processing:** ExcelJS, Multer
- **Validation:** express-validator

### Development Tools

- **Package Manager:** npm
- **Code Quality:** ESLint, Prettier
- **Version Control:** Git
- **Database Tool:** Prisma Studio

---

## 📁 Project Structure

```
SchoolManagementApp/
│
├── api/                             # Backend (Express + Prisma)
│   ├── prisma/                      # Prisma schema & migrations
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Database seeding
│   │   └── migrations/              # Database migrations
│   │
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller. ts
│   │   │   ├── student.controller.ts
│   │   │   ├── teacher.controller.ts
│   │   │   ├── class.controller.ts
│   │   │   ├── subject. controller.ts
│   │   │   ├── grade.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   └── report.controller.ts  # ⭐ Report generation
│   │   │
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── student.routes. ts
│   │   │   ├── teacher.routes.ts
│   │   │   ├── grade.routes.ts
│   │   │   └── report.routes.ts      # ⭐ Report endpoints
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── grade-calculation.service.ts
│   │   │   └── grade-import.service.ts
│   │   │
│   │   ├── middleware/              # Auth & validation
│   │   ├── utils/                   # Utilities
│   │   └── server.ts                # Express server
│   │
│   └── package.json
│
├── src/                             # Frontend (Next.js)
│   ├── app/                         # Next.js App Router
│   │   ├── page.tsx                 # Dashboard
│   │   ├── students/                # Student management
│   │   ├── teachers/                # Teacher management
│   │   ├── classes/                 # Class management
│   │   ├── subjects/                # Subject management
│   │   ├── grades/                  # Grade viewing
│   │   ├── grade-entry/             # Grade entry grid
│   │   ├── attendance/              # Attendance tracking
│   │   │
│   │   ├── reports/                 # ⭐ Report Pages
│   │   │   ├── monthly/             # Monthly reports
│   │   │   ├── grade-wide/          # Grade-wide reports
│   │   │   ├── tracking-book/       # ⭐ Tracking book
│   │   │   └── statistics/          # Statistical reports
│   │   │
│   │   └── (auth)/                  # Authentication
│   │       └── login/
│   │
│   ├── components/                  # React components
│   │   ├── reports/                 # ⭐ Report components
│   │   │   ├── StudentTranscript.tsx      # Individual student report
│   │   │   ├── MonthlyReportTable.tsx     # Monthly class report
│   │   │   ├── StatisticsView.tsx         # Statistics dashboard
│   │   │   └── PrintLayout.tsx            # Print wrapper
│   │   │
│   │   ├── grades/                  # Grade entry components
│   │   │   ├── GradeGridEditor.tsx        # Excel-like grid
│   │   │   ├── useGradeCalculations.ts    # Grade calculations
│   │   │   └── useGradeSorting.ts         # Subject sorting
│   │   │
│   │   ├── layout/                  # Layout components
│   │   ├── ui/                      # Generic UI components
│   │   └── ...
│   │
│   ├── lib/                         # Utilities & helpers
│   │   ├── api/                     # API client functions
│   │   │   ├── students.ts
│   │   │   ├── teachers.ts
│   │   │   ├── grades.ts
│   │   │   └── reports.ts           # ⭐ Report API client
│   │   │
│   │   ├── gradeUtils.ts            # Grade calculations
│   │   ├── subjectOrder.ts          # Subject sorting logic
│   │   └── constants.ts             # App constants
│   │
│   ├── context/                     # React Context
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   │
│   └── types/                       # TypeScript types
│       ├── index.ts
│       ├── student.ts
│       ├── grade.ts
│       └── ...
│
├── . env. example                     # Environment template
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

```bash
# Required
- Node.js 18+ (LTS recommended)
- PostgreSQL 16+
- npm (comes with Node.js)

# Optional
- Git for version control
- VS Code or preferred IDE
- Prisma Studio (npm i -g prisma)
```

### Step 1: Clone Repository

```bash
# HTTPS
git clone https://github.com/naingseiha/SchoolManagementApp.git

# SSH
git clone git@github.com:naingseiha/SchoolManagementApp.git

cd SchoolManagementApp
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### Step 3: Database Setup

```bash
cd api

# Create PostgreSQL database
createdb school_management

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed: all

# Open Prisma Studio (optional)
npx prisma studio
```

---

## ⚙️ Environment Setup

### Frontend (`.env.local`)

Create `.env.local` in root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# App Configuration
NEXT_PUBLIC_APP_NAME="School Management System"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`api/. env`)

Create `.env` in `api/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd api
npm run dev

# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**

```bash
npm run dev

# App runs on http://localhost:3000
```

### Production Build

```bash
# Build frontend
npm run build
npm start

# Build & run backend
cd api
npm run build
npm start
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5001/api
```

### Report Endpoints ⭐

#### 1. Monthly Report

**GET** `/api/reports/monthly/: classId`

Get monthly performance report for a specific class.

**Query Parameters:**

- `month` (required): Khmer month name (e.g., "មករា", "កុម្ភៈ")
- `year` (required): Year (e.g., 2025)

**Response:**

```json
{
  "success": true,
  "data":  {
    "classId": "xxx",
    "className": "ថ្នាក់ទី៧A",
    "grade": "7",
    "month": "មករា",
    "year": 2025,
    "totalCoefficient": 19,
    "subjects": [... ],
    "students": [
      {
        "studentId": "xxx",
        "studentName": "សុខ សំណាង",
        "gender": "MALE",
        "grades": { "subjectId": score },
        "totalScore": "85. 00",
        "average": "44.74",
        "gradeLevel": "A",
        "rank": 1,
        "absent": 0,
        "permission": 0
      }
    ]
  }
}
```

#### 2. Grade-wide Report

**GET** `/api/reports/grade-wide/:grade`

Get combined report for all classes in a grade level.

**Query Parameters:**

- `month` (required): Khmer month name
- `year` (required): Year

**Response:** Similar to monthly report but with multiple classes combined.

#### 3. Student Tracking Book ⭐ **NEW**

**GET** `/api/reports/tracking-book/:classId`

Get comprehensive student tracking report with all grades.

**Query Parameters:**

- `year` (required): Academic year
- `month` (optional): Filter by specific month or leave empty for all months
- `subjectId` (optional): Filter by specific subject

**Response:**

```json
{
  "success": true,
  "data": {
    "classId": "xxx",
    "className": "ថ្នាក់ទី៧A",
    "grade":  "7",
    "track": null,
    "year": 2025,
    "month": "មករា",
    "teacherName": "សុខ រតនា",
    "totalCoefficient": 19,
    "subjects": [
      {
        "id": "xxx",
        "nameKh": "គណិតវិទ្យា",
        "nameEn":  "Mathematics",
        "code": "MATH",
        "maxScore": 10,
        "coefficient": 2
      }
    ],
    "students":  [
      {
        "studentId": "xxx",
        "studentName": "សុខ សំណាង",
        "gender": "MALE",
        "dateOfBirth": "15/05/2010",
        "subjectScores": {
          "subjectId": {
            "score": 8. 5,
            "maxScore": 10,
            "gradeLevel": "A",
            "gradeLevelKhmer": "ល្អប្រសើរ",
            "percentage": 85.0
          }
        },
        "totalScore": "162",
        "averageScore": "42.63",
        "gradeLevel":  "B",
        "gradeLevelKhmer": "ល្អ",
        "rank": 1,
        "subjectsRecorded": 17,
        "attendance": {
          "totalAbsent": 2,
          "permission": 1,
          "withoutPermission": 1
        }
      }
    ]
  }
}
```

#### 4. Monthly Statistics

**GET** `/api/reports/monthly-statistics/:classId`

Get detailed statistics with gender breakdown.

**Query Parameters:**

- `month` (required): Khmer month name
- `year` (required): Year

**Response:**

```json
{
  "success": true,
  "data": {
    "classId":  "xxx",
    "className":  "ថ្នាក់ទី៧A",
    "statistics": {
      "totalStudents": 45,
      "femaleStudents": 22,
      "maleStudents": 23,
      "totalPassed": 40,
      "femalePassed": 20,
      "malePassed": 20,
      "totalFailed":  5,
      "gradeDistribution": {
        "A": { "total": 10, "female": 5, "male": 5 },
        "B": { "total": 15, "female": 8, "male": 7 },
        ...
      },
      "subjectStatistics": {
        "subjectId": {
          "subjectName": "គណិតវិទ្យា",
          "averageScore": 7.5,
          "femaleAverageScore": 7.8,
          "maleAverageScore": 7.2,
          ...
        }
      }
    }
  }
}
```

### Other Endpoints

For complete API documentation of other endpoints (students, teachers, classes, subjects, grades, attendance), refer to the main API documentation or use tools like Postman.

---

## 📚 Tracking Book (សៀវភៅតាមដាន)

### Overview

The **Tracking Book** is a comprehensive student progress report that aggregates academic performance across multiple months and subjects. It provides:

- ✅ **Individual student transcripts**
- ✅ **Subject-wise grade levels** (A-F based on percentage)
- ✅ **Overall performance** (average & grade level)
- ✅ **Class ranking**
- ✅ **Attendance summary**
- ✅ **Multi-month aggregation**
- ✅ **Print-ready format** (A4 Landscape)

### Features

1. **Flexible Filtering**

   - View all months or specific month
   - Filter by subject
   - Academic year selection

2. **View Modes**

   - **Single Mode**: Navigate through students one by one
   - **All Mode**: Display all students on one page

3. **Export Options**

   - 🖨️ Print (Landscape A4)
   - 📊 Export to CSV

4. **Track Support** (Grade 11 & 12)
   - Science Track subjects
   - Social Track subjects
   - Common subjects for both tracks

### How to Access

1. Navigate to **Reports** → **Tracking Book** (របាយការណ៍ → សៀវភៅតាមដាន)
2. Select:
   - **Class** (ថ្នាក់)
   - **Year** (ឆ្នាំ)
   - **Month** (ខែ) - Optional: "ទាំងអស់" for all months
   - **Subject** (មុខវិជ្ជា) - Optional: "ទាំងអស់" for all subjects
3. Click **Generate** (បង្កើត)
4. Use navigation buttons to browse students (Single Mode)
5. Print or export as needed

### Technical Implementation

#### Frontend

- **Page**: `src/app/reports/tracking-book/page.tsx`
- **Component**: `src/components/reports/StudentTranscript.tsx`
- **API Client**: `src/lib/api/reports. ts` → `getStudentTrackingBook()`

#### Backend

- **Controller**: `api/src/controllers/report.controller.ts` → `getStudentTrackingBook()`
- **Route**: `GET /api/reports/tracking-book/:classId`

#### Key Logic

```typescript
// Subject filtering (Grade 11/12 track support)
if ((gradeNum === 11 || gradeNum === 12) && classInfo.track) {
  subjectWhereClause.OR = [
    { track: classInfo.track },
    { track: null },
    { track: "common" },
  ];
}

// Average calculation
const totalCoefficient = subjects.reduce((sum, s) => sum + s.coefficient, 0);
const averageScore = totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

// Grade level determination
let gradeLevel = "F";
if (averageScore >= 45) gradeLevel = "A";
else if (averageScore >= 40) gradeLevel = "B";
else if (averageScore >= 35) gradeLevel = "C";
else if (averageScore >= 30) gradeLevel = "D";
else if (averageScore >= 25) gradeLevel = "E";
```

---

## 🔢 Grade Calculation

### Grading System

#### Overall Grade (មធ្យមភាគសរុប)

Based on: **Total Score ÷ Total Coefficient**

| Average | Grade | Khmer      | Description |
| ------- | ----- | ---------- | ----------- |
| ≥ 45    | A     | ល្អបំផុត   | Excellent   |
| 40-44   | B     | ល្អ        | Very Good   |
| 35-39   | C     | ល្អបុរេ    | Good        |
| 30-34   | D     | មធ្យម      | Fair        |
| 25-29   | E     | ខ្សោយ      | Weak        |
| < 25    | F     | ខ្សោយបំផុត | Very Weak   |

#### Subject Grade (និទ្ទេសតាមមុខវិជ្ជា)

Based on: **(Score ÷ Max Score) × 100%**

| Percentage | Grade | Khmer     | Description |
| ---------- | ----- | --------- | ----------- |
| ≥ 80%      | A     | ល្អប្រសើរ | Excellent   |
| 70-79%     | B     | ល្អណាស់   | Very Good   |
| 60-69%     | C     | ល្អ       | Good        |
| 50-59%     | D     | ល្អបង្គួរ | Fair        |
| 40-49%     | E     | មធ្យម     | Average     |
| < 40%      | F     | ខ្សោយ     | Weak        |

### Example Calculation

```
Student: សុខ សំណាង
Class: ថ្នាក់ទី៧A
Month: មករា 2025

Subjects & Scores:
1. គណិតវិទ្យា (Math): 8/10, Coefficient: 2 → 16 points
2. រូបវិទ្យា (Physics): 7/10, Coefficient: 1 → 7 points
3. គីមីវិទ្យា (Chemistry): 8/10, Coefficient: 1 → 8 points
4. ជីវវិទ្យា (Biology): 9/10, Coefficient: 1 → 9 points
...

Total Score: 162
Total Coefficient: 19
Average:  162 ÷ 19 = 42.63
Grade Level: B (ល្អ)
```

---

## 🔐 User Roles & Permissions

### Default Credentials

| Role        | Email                 | Password    | Permissions               |
| ----------- | --------------------- | ----------- | ------------------------- |
| **Admin**   | admin@school.edu. kh  | Admin@123   | Full system access        |
| **Teacher** | teacher@school.edu.kh | Teacher@123 | Grade entry, view reports |
| **Student** | student@school.edu.kh | Student@123 | View own grades           |

### Permission Matrix

| Feature          | Admin | Teacher          | Student        |
| ---------------- | ----- | ---------------- | -------------- |
| Dashboard        | ✅    | ✅               | ✅             |
| Manage Students  | ✅    | ❌               | ❌             |
| Manage Teachers  | ✅    | ❌               | ❌             |
| Manage Classes   | ✅    | ❌               | ❌             |
| Manage Subjects  | ✅    | ❌               | ❌             |
| Grade Entry      | ✅    | ✅               | ❌             |
| View All Grades  | ✅    | ✅ (own classes) | ✅ (own only)  |
| Generate Reports | ✅    | ✅               | ❌             |
| Monthly Report   | ✅    | ✅               | ❌             |
| Tracking Book    | ✅    | ✅               | ❌             |
| Statistics       | ✅    | ✅               | ❌             |
| Attendance       | ✅    | ✅               | ✅ (view only) |

---

## 💡 Development Guide

### Adding New Features

#### 1. Backend API Route

```typescript
// api/src/controllers/my-feature.controller.ts
import { Request, Response } from "express";
import { prisma } from "../utils/db";

export class MyFeatureController {
  static async getMyData(req: Request, res: Response) {
    try {
      const data = await prisma.myModel.findMany();
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
```

#### 2. Frontend API Client

```typescript
// src/lib/api/my-feature.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const myFeatureApi = {
  async getMyData(): Promise<MyData[]> {
    const response = await fetch(`${API_BASE_URL}/my-feature`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },
};
```

#### 3. Frontend Page

```typescript
// src/app/my-feature/page.tsx
"use client";

import { useState, useEffect } from "react";
import { myFeatureApi } from "@/lib/api/my-feature";

export default function MyFeaturePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    myFeatureApi.getMyData().then(setData);
  }, []);

  return <div>{/* Your UI */}</div>;
}
```

### Code Style Guidelines

- ✅ Use TypeScript for all files
- ✅ Follow Airbnb style guide
- ✅ Use functional components with hooks
- ✅ Keep components under 200 lines
- ✅ Write meaningful variable/function names
- ✅ Add JSDoc comments for complex functions
- ✅ Use Tailwind CSS classes
- ✅ Handle errors gracefully
- ✅ Add loading states

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Prisma Relation Errors

**Error:** `Unknown field 'teacher' for include statement`

**Solution:**

```typescript
// ❌ Wrong
include: {
  teacher: true;
}

// ✅ Correct
include: {
  homeroomTeacher: true;
}
```

#### 2. Missing Total Coefficient

**Error:** `totalCoefficientForClass is not defined`

**Solution:** Calculate before using:

```typescript
const totalCoefficientForClass = subjects.reduce(
  (sum, s) => sum + s.coefficient,
  0
);
```

#### 3. Month Filter Not Working

**Error:** No data returned for specific month

**Solution:** Use OR clause for multiple month formats:

```typescript
gradeWhereClause.OR = [{ month: "មករា" }, { month: "1" }, { monthNumber: 1 }];
```

#### 4. Subject Sorting Issues

**Error:** Subjects not in correct order

**Solution:** Use `sortSubjectsByOrder()` helper:

```typescript
import { sortSubjectsByOrder } from "@/lib/subjectOrder";

const sortedSubjects = sortSubjectsByOrder(subjects, gradeNumber);
```

### Debug Mode

Enable detailed logging:

```typescript
// api/src/server.ts
console.log(JSON.stringify(data, null, 2));
```

```typescript
// Frontend
console.table(students);
```

---

## 🚢 Deployment

### Prerequisites

- PostgreSQL database (production)
- Node.js 18+ server
- Domain name (optional)

### Deploy Backend (Express)

```bash
cd api

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start
npm start

# Or use PM2
pm2 start dist/server.js --name school-api
```

### Deploy Frontend (Next.js)

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api. com/api
```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM node: 18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t school-app .
docker run -p 3000:3000 school-app
```

#### Option 3: PM2

```bash
npm run build
pm2 start npm --name school-app -- start
```

### Environment Variables (Production)

```env
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret
NODE_ENV=production
PORT=5001

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourschool.com/api
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Make your changes
4. Write/update tests
5. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
6. Push to your branch
   ```bash
   git push origin feature/AmazingFeature
   ```
7. Open a Pull Request

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**

```
feat(reports): add tracking book export to PDF

- Add PDF generation service
- Implement print layout
- Add export button to UI

Closes #123
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Naing Seiha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Naing Seiha**

- GitHub: [@naingseiha](https://github.com/naingseiha)
- Email: naingseiha@school.edu.kh
- Project: [SchoolManagementApp](https://github.com/naingseiha/SchoolManagementApp)

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Prisma Team** - Excellent ORM
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vercel** - Hosting platform
- **All Contributors** - Thank you for your contributions!

---

## 📞 Support

### Get Help

- 📖 **Documentation**: Read this README thoroughly
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/naingseiha/SchoolManagementApp/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/naingseiha/SchoolManagementApp/discussions)
- 📧 **Email**: naingseiha@school. edu.kh

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📊 Project Status

- ✅ **Core Features**: Complete
- ✅ **Grade Management**: Complete
- ✅ **Tracking Book**: Complete
- ✅ **Report System**: Complete
- 🚧 **Statistics Dashboard**: In Progress
- 🔮 **Mobile App**: Planned
- 🔮 **Parent Portal**: Planned

---

## 🗺️ Roadmap

### Q1 2025

- [ ] Enhanced statistics dashboard
- [ ] Export reports to PDF
- [ ] Email notification system
- [ ] Parent portal (view student progress)

### Q2 2025

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Online payment integration
- [ ] Advanced analytics

### Q3 2025

- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated report generation
- [ ] Integration with Ministry of Education

---

**🎓 Made with ❤️ for Khmer Education System**

**ប្រព័ន្ធគ្រប់គ្រងសាលាសម្រាប់ប្រទេសកម្ពុជា**

---

_Last Updated: December 2025_
_Version: 1.0.0_

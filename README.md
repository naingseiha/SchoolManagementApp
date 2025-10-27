# 🏫 School Management System (ប្រព័ន្ធគ្រប់គ្រងសាលា)

A professional full-stack Next.js application for managing students, teachers, classes, grades, and reports in Khmer educational institutions.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)
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
- [User Roles & Permissions](#-user-roles--permissions)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- 👥 **Student Management** (គ្រប់គ្រងសិស្ស)

  - Add, edit, delete student records
  - Student registration with detailed information
  - Track student progress and performance
  - Assign students to classes

- 👨‍🏫 **Teacher Management** (គ្រប់គ្រងគ្រូបង្រៀន)

  - Manage teacher profiles
  - Assign teachers to subjects and classes
  - Track teaching assignments
  - Set class teachers

- 🏫 **Class Management** (គ្រប់គ្រងថ្នាក់រៀន)

  - Create and manage classes
  - Assign students to classes
  - Link teachers to classes
  - Track class capacity

- 📚 **Subject Management** (គ្រប់គ្រងមុខវិជ្ជា)

  - Add/remove subjects
  - Link subjects to classes
  - Assign teachers to subjects
  - Manage subject curriculum

- 📊 **Grade Entry & Tracking** (បញ្ចូលពិន្ទុ)

  - Enter student grades by subject
  - Track attendance
  - Monitor student performance
  - Calculate GPA/averages

- 📈 **Reports & Statistics** (របាយការណ៍)

  - Class performance reports
  - Student progress reports
  - Attendance reports
  - Statistical dashboards

- 🏆 **Honor Certificates** (សារណីយកិត្តិយស)

  - Generate certificates for top students
  - Print-ready format
  - Customizable templates

- 🔐 **Security Features**

  - Role-based Access Control (RBAC)
  - Secure authentication
  - Protected routes
  - Session management

- 💾 **Data Management**

  - Local Storage persistence
  - Export/Import functionality
  - Backup and restore

- 🖨️ **Print-ready Reports**
  - Student report cards
  - Class lists
  - Attendance sheets
  - Performance summaries

---

## 🛠 Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.0
- **UI Components:** Custom components with Tailwind
- **Icons:** Lucide React
- **State Management:** React Context API
- **Form Handling:** React Hook Form (recommended)

### Backend (API Routes)

- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Data Storage:** LocalStorage (Browser-based)
- **Authentication:** JWT-based (session management)
- **API Architecture:** RESTful API

### Development Tools

- **Package Manager:** npm / yarn / pnpm
- **Code Quality:** ESLint, Prettier
- **Version Control:** Git

---

## 📁 Project Structure

```
SchoolManagementApp/
│
├── public/                          # Static assets
│   ├── images/                      # Images and graphics
│   └── icons/                       # Icon files
│
├── src/                             # Source code
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Authentication routes (Route Group)
│   │   │   ├── login/               # Login page
│   │   │   │   └── page.tsx
│   │   │   ├── register/            # Registration page
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx           # Auth layout
│   │   │
│   │   ├── (dashboard)/             # Protected dashboard routes
│   │   │   ├── admin/               # Admin-only routes
│   │   │   │   ├── students/        # Student management
│   │   │   │   ├── teachers/        # Teacher management
│   │   │   │   ├── classes/         # Class management
│   │   │   │   ├── subjects/        # Subject management
│   │   │   │   └── reports/         # Reports & statistics
│   │   │   ├── teacher/             # Teacher routes
│   │   │   │   ├── grades/          # Grade entry
│   │   │   │   ├── attendance/      # Attendance tracking
│   │   │   │   └── my-classes/      # Teacher's classes
│   │   │   ├── student/             # Student routes
│   │   │   │   ├── profile/         # Student profile
│   │   │   │   ├── grades/          # View grades
│   │   │   │   └── attendance/      # View attendance
│   │   │   └── layout.tsx           # Dashboard layout
│   │   │
│   │   ├── api/                     # Backend API Routes
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts     # POST /api/auth/login
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts     # POST /api/auth/logout
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts     # POST /api/auth/register
│   │   │   │   └── me/
│   │   │   │       └── route.ts     # GET /api/auth/me
│   │   │   │
│   │   │   ├── students/            # Student CRUD endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/students
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE /api/students/:id
│   │   │   │
│   │   │   ├── teachers/            # Teacher CRUD endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/teachers
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE /api/teachers/:id
│   │   │   │
│   │   │   ├── classes/             # Class CRUD endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/classes
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE /api/classes/:id
│   │   │   │
│   │   │   ├── subjects/            # Subject CRUD endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/subjects
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE /api/subjects/:id
│   │   │   │
│   │   │   ├── grades/              # Grade management endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/grades
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts     # GET, PUT, DELETE /api/grades/:id
│   │   │   │   └── student/
│   │   │   │       └── [studentId]/
│   │   │   │           └── route.ts # GET /api/grades/student/:studentId
│   │   │   │
│   │   │   ├── attendance/          # Attendance endpoints
│   │   │   │   ├── route.ts         # GET, POST /api/attendance
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE /api/attendance/:id
│   │   │   │
│   │   │   └── reports/             # Report generation endpoints
│   │   │       ├── class/
│   │   │       │   └── [classId]/
│   │   │       │       └── route.ts # GET /api/reports/class/:classId
│   │   │       ├── student/
│   │   │       │   └── [studentId]/
│   │   │       │       └── route.ts # GET /api/reports/student/:studentId
│   │   │       └── statistics/
│   │   │           └── route.ts     # GET /api/reports/statistics
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   ├── globals.css              # Global styles
│   │   └── not-found.tsx            # 404 page
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   │
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── DashboardHeader.tsx
│   │   │
│   │   ├── forms/                   # Form components
│   │   │   ├── StudentForm.tsx
│   │   │   ├── TeacherForm.tsx
│   │   │   ├── ClassForm.tsx
│   │   │   ├── SubjectForm.tsx
│   │   │   └── GradeEntryForm.tsx
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── reports/                 # Report components
│   │   │   ├── StudentReportCard.tsx
│   │   │   ├── ClassReport.tsx
│   │   │   ├── AttendanceReport.tsx
│   │   │   └── PrintLayout.tsx
│   │   │
│   │   ├── tables/                  # Table components
│   │   │   ├── DataTable.tsx
│   │   │   ├── StudentTable.tsx
│   │   │   ├── TeacherTable.tsx
│   │   │   └── ClassTable.tsx
│   │   │
│   │   └── ui/                      # Generic UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Alert.tsx
│   │       └── Loading.tsx
│   │
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication context
│   │   ├── StudentContext.tsx       # Student data context
│   │   ├── TeacherContext.tsx       # Teacher data context
│   │   └── ThemeContext.tsx         # Theme/UI context
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── api/                     # API client functions
│   │   │   ├── client.ts            # Base API client
│   │   │   ├── students.ts          # Student API calls
│   │   │   ├── teachers.ts          # Teacher API calls
│   │   │   ├── classes.ts           # Class API calls
│   │   │   └── grades.ts            # Grade API calls
│   │   │
│   │   ├── storage/                 # LocalStorage management
│   │   │   ├── index.ts             # Storage utilities
│   │   │   ├── students.ts          # Student storage
│   │   │   ├── teachers.ts          # Teacher storage
│   │   │   └── auth.ts              # Auth storage
│   │   │
│   │   ├── utils.ts                 # General utilities
│   │   ├── constants.ts             # App constants
│   │   ├── validators.ts            # Validation functions
│   │   └── formatters.ts            # Data formatters
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── index.ts                 # Main type exports
│   │   ├── models.ts                # Data models
│   │   ├── api.ts                   # API types
│   │   └── auth.ts                  # Auth types
│   │
│   └── middleware.ts                # Next.js middleware (Auth guard)
│
├── .env.local                       # Environment variables (local)
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── ARCHITECTURE.md                  # Architecture documentation
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## 🚀 Installation

### Prerequisites

```bash
# Required
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

# Optional
- Git for version control
- VS Code or your preferred IDE
```

### Clone the Repository

```bash
# HTTPS
git clone https://github.com/naingseiha/SchoolManagementApp.git

# SSH
git clone git@github.com:naingseiha/SchoolManagementApp.git

# Navigate to project directory
cd SchoolManagementApp
```

### Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="School Management System"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_SESSION_TIMEOUT=3600000  # 1 hour in milliseconds

# Storage
NEXT_PUBLIC_STORAGE_KEY=school_management_data

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false

# Development
NODE_ENV=development
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# or
yarn dev

# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

---

## 🔐 User Roles & Permissions

### Default Login Credentials

| Role              | Username | Password   | Permissions                                              |
| ----------------- | -------- | ---------- | -------------------------------------------------------- |
| **Admin**         | admin    | admin123   | Full system access, manage all users, settings, and data |
| **Class Teacher** | teacher1 | teacher123 | Manage assigned classes, enter grades, view students     |
| **Teacher**       | teacher2 | teacher123 | View classes, enter grades, limited access               |
| **Student**       | student1 | student123 | View own grades, attendance, and profile                 |

### Permission Matrix

| Feature           | Admin | Class Teacher    | Teacher           | Student       |
| ----------------- | ----- | ---------------- | ----------------- | ------------- |
| Dashboard Access  | ✅    | ✅               | ✅                | ✅            |
| Add/Edit Students | ✅    | ✅               | ❌                | ❌            |
| Add/Edit Teachers | ✅    | ❌               | ❌                | ❌            |
| Manage Classes    | ✅    | ✅               | ❌                | ❌            |
| Manage Subjects   | ✅    | ✅               | ❌                | ❌            |
| Enter Grades      | ✅    | ✅               | ✅                | ❌            |
| View All Grades   | ✅    | ✅ (own classes) | ✅ (own subjects) | ✅ (own only) |
| Generate Reports  | ✅    | ✅               | ✅                | ❌            |
| View Statistics   | ✅    | ✅               | ✅                | ❌            |
| System Settings   | ✅    | ❌               | ❌                | ❌            |

---

## 📡 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST `/api/auth/login`

Login user and get access token

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "username": "admin",
      "role": "admin",
      "name": "System Administrator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/logout`

Logout current user

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`

Get current user profile

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "admin",
    "role": "admin",
    "name": "System Administrator"
  }
}
```

### Student Endpoints

#### GET `/api/students`

Get all students (with pagination and filtering)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `class` (optional): Filter by class ID
- `search` (optional): Search by name or ID

**Response:**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "1",
        "name": "John Doe",
        "khmerName": "ចន ដូ",
        "gender": "male",
        "dateOfBirth": "2010-05-15",
        "classId": "1",
        "className": "Grade 10A",
        "phoneNumber": "012345678",
        "address": "Phnom Penh",
        "enrollmentDate": "2024-01-15"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### POST `/api/students`

Create new student

**Request:**

```json
{
  "name": "John Doe",
  "khmerName": "ចន ដូ",
  "gender": "male",
  "dateOfBirth": "2010-05-15",
  "classId": "1",
  "phoneNumber": "012345678",
  "address": "Phnom Penh",
  "guardianName": "Jane Doe",
  "guardianPhone": "012345679"
}
```

#### GET `/api/students/[id]`

Get student by ID

#### PUT `/api/students/[id]`

Update student

#### DELETE `/api/students/[id]`

Delete student

### Teacher Endpoints

#### GET `/api/teachers`

Get all teachers

#### POST `/api/teachers`

Create new teacher

**Request:**

```json
{
  "name": "Dr. Smith",
  "khmerName": "វេជ្ជបណ្ឌិត ស្មីត",
  "gender": "male",
  "phoneNumber": "012345680",
  "email": "smith@school.com",
  "subjectIds": ["1", "2"],
  "address": "Phnom Penh",
  "hireDate": "2023-01-15"
}
```

#### GET `/api/teachers/[id]`

Get teacher by ID

#### PUT `/api/teachers/[id]`

Update teacher

#### DELETE `/api/teachers/[id]`

Delete teacher

### Class Endpoints

#### GET `/api/classes`

Get all classes

#### POST `/api/classes`

Create new class

**Request:**

```json
{
  "name": "Grade 10A",
  "grade": "10",
  "section": "A",
  "classTeacherId": "1",
  "academicYear": "2024-2025",
  "capacity": 40
}
```

#### GET `/api/classes/[id]`

Get class by ID with students

#### PUT `/api/classes/[id]`

Update class

#### DELETE `/api/classes/[id]`

Delete class

### Subject Endpoints

#### GET `/api/subjects`

Get all subjects

#### POST `/api/subjects`

Create new subject

**Request:**

```json
{
  "name": "Mathematics",
  "khmerName": "គណិតវិទ្យា",
  "code": "MATH101",
  "credits": 4,
  "description": "Advanced Mathematics"
}
```

### Grade Endpoints

#### GET `/api/grades`

Get all grades

#### POST `/api/grades`

Enter grades for student

**Request:**

```json
{
  "studentId": "1",
  "subjectId": "1",
  "examType": "midterm",
  "score": 85,
  "maxScore": 100,
  "academicYear": "2024-2025",
  "semester": "1"
}
```

#### GET `/api/grades/student/[studentId]`

Get all grades for a student

### Report Endpoints

#### GET `/api/reports/class/[classId]`

Generate class report

#### GET `/api/reports/student/[studentId]`

Generate student report card

#### GET `/api/reports/statistics`

Get system-wide statistics

**Response:**

```json
{
  "success": true,
  "data": {
    "totalStudents": 450,
    "totalTeachers": 25,
    "totalClasses": 15,
    "averageAttendance": 92.5,
    "topPerformers": []
  }
}
```

---

## 💡 Development Guide

### Adding New Features

1. **Create API Route** (Backend)

```typescript
// src/app/api/my-feature/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

2. **Create UI Component** (Frontend)

```typescript
// src/components/my-feature/MyComponent.tsx
"use client";

import React from "react";

export default function MyComponent() {
  return <div>{/* Your component */}</div>;
}
```

3. **Add Route**

```typescript
// src/app/(dashboard)/my-feature/page.tsx
import MyComponent from "@/components/my-feature/MyComponent";

export default function MyFeaturePage() {
  return <MyComponent />;
}
```

### Code Style Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Write meaningful variable names
- Add comments for complex logic
- Use Tailwind CSS for styling

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Naing Seiha**

- GitHub: [@naingseiha](https://github.com/naingseiha)
- Project: [SchoolManagementApp](https://github.com/naingseiha/SchoolManagementApp)

---

## 🙏 Acknowledgments

- Next.js Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide React for beautiful icons
- All contributors and supporters

---

## 📞 Support

For issues and questions:

- Open an issue on [GitHub Issues](https://github.com/naingseiha/SchoolManagementApp/issues)
- Contact: [Create an issue](https://github.com/naingseiha/SchoolManagementApp/issues/new)

---

**Made with ❤️ for Khmer Education System**

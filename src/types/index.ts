// Main Types

export type Gender = "MALE" | "FEMALE" | "male" | "female";
export type Role = "ADMIN" | "TEACHER" | "CLASS_TEACHER" | "STUDENT";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

// Student Type (matching Prisma schema)
export interface Student {
  id: string;
  studentId?: string; // Auto-generated ID from backend
  khmerName?: string;
  englishName?: string;
  // For backward compatibility
  firstName?: string;
  lastName?: string;
  gender: "male" | "female" | "MALE" | "FEMALE";
  dateOfBirth: string;
  placeOfBirth?: string;
  currentAddress?: string;
  phoneNumber?: string;
  // Legacy fields
  email?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  // Relations
  classId?: string;
  class?: Class;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Teacher Type (matching Prisma schema)
export interface Teacher {
  id: string;
  teacherId?: string; // Auto-generated ID from backend
  khmerName?: string;
  englishName?: string;
  // For backward compatibility
  firstName?: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  position?: string;
  // Relations
  userId?: string;
  subjects?: Subject[];
  classes?: Class[];
  createdAt?: string;
  updatedAt?: string;
}

// Class Type (matching Prisma schema)
export interface Class {
  id: string;
  classId?: string; // Auto-generated ID from backend
  name: string;
  grade: string;
  section?: string;
  academicYear: string;
  capacity?: number;
  classTeacherId?: string;
  classTeacher?: Teacher;
  students?: Student[];
  subjects?: Subject[];
  createdAt?: string;
  updatedAt?: string;
}

// Subject Type (matching Prisma schema)
export interface Subject {
  id: string;
  subjectId?: string; // Auto-generated ID from backend
  name: string;
  code: string;
  credits?: number;
  description?: string;
  classId?: string;
  teacherId?: string;
  teacher?: Teacher;
  class?: Class;
  createdAt?: string;
  updatedAt?: string;
}

// Grade Type (matching Prisma schema)
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  semester: number;
  month1Score?: number;
  month2Score?: number;
  month3Score?: number;
  semesterScore?: number;
  finalScore?: number;
  grade?: string;
  teacherId?: string;
  student?: Student;
  subject?: Subject;
  teacher?: Teacher;
  createdAt?: string;
  updatedAt?: string;
}

// Attendance Type (matching Prisma schema)
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  student?: Student;
  class?: Class;
  createdAt?: string;
  updatedAt?: string;
}

// Schedule Type (existing - keep for now)
export interface Schedule {
  id: string;
  classId: string;
  day: string;
  periods: SchedulePeriod[];
}

export interface SchedulePeriod {
  time: string;
  subject: string;
  teacher: string;
  room?: string;
}

import { User, Class, Subject, Teacher, Student, GradeScale } from "@/types";

export const DEFAULT_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "superadmin",
    name: "អ្នកគ្រប់គ្រង",
    phone: "012345678",
  },
  {
    id: "2",
    username: "teacher1",
    password: "teacher123",
    role: "classteacher",
    name: "លោកគ្រូ ស៊ិន សុផល",
    teacherId: "t1",
    phone: "012345679",
  },
  {
    id: "3",
    username: "teacher2",
    password: "teacher123",
    role: "teacher",
    name: "លោកគ្រូ ចាន់ ដារ៉ា",
    teacherId: "t2",
    phone: "012345680",
  },
  {
    id: "4",
    username: "student1",
    password: "student123",
    role: "student",
    name: "សិស្ស ១",
    studentId: "s1",
  },
];

export const DEFAULT_CLASSES: Class[] = [
  {
    id: "c1",
    name: "ថ្នាក់ទី៧ A",
    grade: 7,
    section: "A",
    year: 2025,
    level: "អនុវិទ្យាល័យ",
    classTeacherId: "t1",
  },
  {
    id: "c2",
    name: "ថ្នាក់ទី៧ B",
    grade: 7,
    section: "B",
    year: 2025,
    level: "អនុវិទ្យាល័យ",
  },
  {
    id: "c3",
    name: "ថ្នាក់ទី១២ A",
    grade: 12,
    section: "A",
    year: 2025,
    level: "វិទ្យាល័យ",
  },
];

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "sub1",
    name: "គណិតវិទ្យា",
    nameEn: "Mathematics",
    level: "both",
    maxScore: { "7": 100, "8": 100, "9": 100, "10": 100, "11": 100, "12": 100 },
  },
  {
    id: "sub2",
    name: "រូបវិទ្យា",
    nameEn: "Physics",
    level: "both",
    maxScore: { "7": 50, "8": 50, "9": 50, "10": 100, "11": 100, "12": 100 },
  },
  {
    id: "sub3",
    name: "គីមីវិទ្យា",
    nameEn: "Chemistry",
    level: "both",
    maxScore: { "7": 50, "8": 50, "9": 50, "10": 100, "11": 100, "12": 100 },
  },
  {
    id: "sub4",
    name: "ភាសាខ្មែរ",
    nameEn: "Khmer",
    level: "both",
    maxScore: { "7": 100, "8": 100, "9": 100, "10": 100, "11": 100, "12": 100 },
  },
  {
    id: "sub5",
    name: "ភាសាអង់គ្លេស",
    nameEn: "English",
    level: "both",
    maxScore: { "7": 100, "8": 100, "9": 100, "10": 100, "11": 100, "12": 100 },
  },
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: "t1",
    name: "លោកគ្រូ ស៊ិន សុផល",
    phone: "012345679",
    email: "sophal@school.edu.kh",
    subjects: ["sub1", "sub2"],
    classes: ["c1"],
    isClassTeacher: true,
    classTeacherOf: "c1",
  },
  {
    id: "t2",
    name: "លោកគ្រូ ចាន់ ដារ៉ា",
    phone: "012345680",
    email: "dara@school.edu.kh",
    subjects: ["sub4", "sub5"],
    classes: ["c1", "c2"],
    isClassTeacher: false,
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: "s1",
    firstName: "សុខ",
    lastName: "ចន្ទា",
    gender: "female",
    dateOfBirth: "2010-05-15",
    classId: "c1",
    phone: "012111222",
    guardianName: "លោក ចន្ទា សុភា",
    guardianPhone: "012111223",
  },
  {
    id: "s2",
    firstName: "វិចិត្រ",
    lastName: "ម៉េង",
    gender: "male",
    dateOfBirth: "2010-08-20",
    classId: "c1",
    phone: "012222333",
    guardianName: "លោក ម៉េង សុវណ្ណ",
    guardianPhone: "012222334",
  },
  {
    id: "s3",
    firstName: "សុភា",
    lastName: "លី",
    gender: "female",
    dateOfBirth: "2010-03-10",
    classId: "c1",
    phone: "012333444",
    guardianName: "លោកស្រី លី ម៉ារី",
    guardianPhone: "012333445",
  },
];

export const GRADE_SCALE: GradeScale[] = [
  { grade: "A", min: 90, max: 100, description: "ល្អបំផុត" },
  { grade: "B", min: 80, max: 89, description: "ល្អ" },
  { grade: "C", min: 70, max: 79, description: "ល្អបង្គួរ" },
  { grade: "D", min: 60, max: 69, description: "មធ្យម" },
  { grade: "E", min: 50, max: 59, description: "ខ្សោយ" },
  { grade: "F", min: 0, max: 49, description: "ធ្លាក់" },
];

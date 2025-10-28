"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Student, Teacher, Class, Subject, Grade, Schedule } from "@/types";
import { storage } from "@/lib/storage";
import { studentsApi } from "@/lib/api/students";
import { classesApi } from "@/lib/api/classes";
import { teachersApi } from "@/lib/api/teachers";
import { subjectsApi } from "@/lib/api/subjects";
import {
  DEFAULT_STUDENTS,
  DEFAULT_TEACHERS,
  DEFAULT_CLASSES,
  DEFAULT_SUBJECTS,
} from "@/lib/constants";

interface DataContextType {
  // Students (API)
  students: Student[];
  isLoadingStudents: boolean;
  studentsError: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, "id">) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Teachers (API)
  teachers: Teacher[];
  isLoadingTeachers: boolean;
  teachersError: string | null;
  fetchTeachers: () => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  // Classes (API)
  classes: Class[];
  isLoadingClasses: boolean;
  classesError: string | null;
  fetchClasses: () => Promise<void>;
  addClass: (classData: Omit<Class, "id">) => Promise<void>;
  updateClass: (classData: Class) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  assignStudentsToClass: (
    classId: string,
    studentIds: string[]
  ) => Promise<void>;
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>;

  // Subjects (API)
  subjects: Subject[];
  isLoadingSubjects: boolean;
  subjectsError: string | null;
  fetchSubjects: () => Promise<void>;
  addSubject: (subject: Omit<Subject, "id">) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  assignTeachersToSubject: (
    subjectId: string,
    teacherIds: string[]
  ) => Promise<void>;
  removeTeacherFromSubject: (
    subjectId: string,
    teacherId: string
  ) => Promise<void>;

  // Grades (localStorage for now)
  grades: Grade[];
  updateGrades: (grades: Grade[]) => void;
  getStudentGrades: (studentId: string) => Grade[];

  // Schedules (localStorage for now)
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  getScheduleByClass: (classId: string) => Schedule | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // ✅ Initialize with empty arrays to prevent undefined errors
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Load initial data when component mounts
  useEffect(() => {
    console.log("🔄 DataContext mounted, checking for token...");
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      console.log("✅ Token found, loading initial data...");
      loadInitialData();
    } else {
      console.log("⏸️ No token found, waiting for auth...");
    }
  }, []); // Run once on mount

  // ✅ Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("🔐 Auth state changed, reloading data...");
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (token && !isInitialized) {
        console.log("✅ Auth changed (logged in), loading data...");
        loadInitialData();
      } else if (!token) {
        console.log("🔐 Auth changed (logged out), clearing data...");
        setStudents([]);
        setTeachers([]);
        setClasses([]);
        setSubjects([]);
        setGrades([]);
        setSchedules([]);
        setIsInitialized(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-change", handleAuthChange);
      return () => window.removeEventListener("auth-change", handleAuthChange);
    }
  }, []);

  const loadInitialData = async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 Loading initial data...");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.log("⏸️ No token found - skipping data load");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return;
    }

    try {
      console.log("🔑 Token found, loading data from API...");

      // ✅ Load students
      setIsLoadingStudents(true);
      const studentsData = await studentsApi.getAll();
      console.log("📥 Students loaded:", studentsData.length);
      setStudents(studentsData);
      setIsLoadingStudents(false);

      // ✅ Load teachers
      setIsLoadingTeachers(true);
      const teachersData = await teachersApi.getAll();
      console.log("📥 Teachers loaded:", teachersData.length);
      setTeachers(teachersData);
      setIsLoadingTeachers(false);

      // ✅ Load classes
      setIsLoadingClasses(true);
      const classesData = await classesApi.getAll();
      console.log("📥 Classes loaded:", classesData.length);
      setClasses(classesData);
      setIsLoadingClasses(false);

      // ✅ Load subjects
      setIsLoadingSubjects(true);
      const subjectsData = await subjectsApi.getAll();
      console.log("📥 Subjects loaded:", subjectsData.length);
      setSubjects(subjectsData);
      setIsLoadingSubjects(false);

      console.log("✅ All API data loaded:");
      console.log("  - Students:", studentsData.length);
      console.log("  - Teachers:", teachersData.length);
      console.log("  - Classes:", classesData.length);
      console.log("  - Subjects:", subjectsData.length);

      // Load other data from localStorage
      const loadedGrades = storage.get("grades") || [];
      const loadedSchedules = storage.get("schedules") || [];

      setGrades(loadedGrades);
      setSchedules(loadedSchedules);

      setIsInitialized(true);
      console.log("✅ Initial data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
      setIsLoadingStudents(false);
      setIsLoadingTeachers(false);
      setIsLoadingClasses(false);
      setIsLoadingSubjects(false);
    } finally {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const fetchStudentsData = async (): Promise<Student[]> => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setStudentsError(error.message);
      setStudents([]);
      return [];
    }
  };

  const fetchClassesData = async (): Promise<Class[]> => {
    try {
      const data = await classesApi.getAll();
      setClasses(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      setClassesError(error.message);
      setClasses([]);
      return [];
    }
  };

  const fetchTeachersData = async (): Promise<Teacher[]> => {
    try {
      const data = await teachersApi.getAll();
      setTeachers(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      setTeachersError(error.message);
      setTeachers([]);
      return [];
    }
  };

  const fetchSubjectsData = async (): Promise<Subject[]> => {
    try {
      const data = await subjectsApi.getAll();
      setSubjects(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      setSubjectsError(error.message);
      setSubjects([]);
      return [];
    }
  };

  // ==================== STUDENTS API METHODS ====================

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);
      await fetchStudentsData();
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const addStudent = async (studentData: Omit<Student, "id">) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);

      const newStudent = await studentsApi.create({
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        email: studentData.email,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        address: studentData.address,
        phone: studentData.phone,
        classId: studentData.classId,
      });

      setStudents((prev) => [...prev, newStudent]);
      await fetchClasses();
    } catch (error: any) {
      setStudentsError(error.message || "Failed to add student");
      throw error;
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);

      const updatedStudent = await studentsApi.update(student.id, {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        phone: student.phone,
        classId: student.classId,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? updatedStudent : s))
      );
      await fetchClasses();
    } catch (error: any) {
      setStudentsError(error.message || "Failed to update student");
      throw error;
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);

      await studentsApi.delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      await fetchClasses();
    } catch (error: any) {
      setStudentsError(error.message || "Failed to delete student");
      throw error;
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ==================== TEACHERS API METHODS ====================

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);
      await fetchTeachersData();
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const addTeacher = async (teacherData: Omit<Teacher, "id">) => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);

      const newTeacher = await teachersApi.create({
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        email: teacherData.email,
        phone: teacherData.phone,
        subject: teacherData.subject,
        employeeId: teacherData.employeeId,
      });

      setTeachers((prev) => [...prev, newTeacher]);
    } catch (error: any) {
      setTeachersError(error.message || "Failed to add teacher");
      throw error;
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const updateTeacher = async (teacher: Teacher) => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);

      const updatedTeacher = await teachersApi.update(teacher.id, {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        subject: teacher.subject,
        employeeId: teacher.employeeId,
      });

      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? updatedTeacher : t))
      );
    } catch (error: any) {
      setTeachersError(error.message || "Failed to update teacher");
      throw error;
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);

      await teachersApi.delete(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      setTeachersError(error.message || "Failed to delete teacher");
      throw error;
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // ==================== CLASSES API METHODS ====================

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);
      await fetchClassesData();
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const addClass = async (classData: Omit<Class, "id">) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      const newClass = await classesApi.create({
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        teacherId: classData.teacherId,
      });

      setClasses((prev) => [...prev, newClass]);
    } catch (error: any) {
      setClassesError(error.message || "Failed to add class");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const updateClass = async (classData: Class) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      const updatedClass = await classesApi.update(classData.id, {
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        teacherId: classData.teacherId,
      });

      setClasses((prev) =>
        prev.map((c) => (c.id === classData.id ? updatedClass : c))
      );
    } catch (error: any) {
      setClassesError(error.message || "Failed to update class");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      await classesApi.delete(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      setClassesError(error.message || "Failed to delete class");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const assignStudentsToClass = async (
    classId: string,
    studentIds: string[]
  ) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      await classesApi.assignStudents(classId, studentIds);
      await fetchClasses();
      await fetchStudents();
    } catch (error: any) {
      setClassesError(error.message || "Failed to assign students");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      await classesApi.removeStudent(classId, studentId);
      await fetchClasses();
      await fetchStudents();
    } catch (error: any) {
      setClassesError(error.message || "Failed to remove student");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // ==================== SUBJECTS API METHODS ====================

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      await fetchSubjectsData();
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const addSubject = async (subjectData: Omit<Subject, "id">) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      const newSubject = await subjectsApi.create({
        name: subjectData.name,
        nameKh: subjectData.nameKh,
        nameEn: subjectData.nameEn,
        code: subjectData.code,
        description: subjectData.description,
        grade: subjectData.grade,
        track: subjectData.track,
        category: subjectData.category,
        weeklyHours: subjectData.weeklyHours,
        annualHours: subjectData.annualHours,
        isActive: subjectData.isActive,
      });

      setSubjects((prev) => [...prev, newSubject]);
    } catch (error: any) {
      setSubjectsError(error.message || "Failed to add subject");
      throw error;
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const updateSubject = async (subject: Subject) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      const updatedSubject = await subjectsApi.update(subject.id, {
        name: subject.name,
        nameKh: subject.nameKh,
        nameEn: subject.nameEn,
        code: subject.code,
        description: subject.description,
        grade: subject.grade,
        track: subject.track,
        category: subject.category,
        weeklyHours: subject.weeklyHours,
        annualHours: subject.annualHours,
        isActive: subject.isActive,
      });

      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? updatedSubject : s))
      );
    } catch (error: any) {
      setSubjectsError(error.message || "Failed to update subject");
      throw error;
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      await subjectsApi.delete(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      setSubjectsError(error.message || "Failed to delete subject");
      throw error;
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const assignTeachersToSubject = async (
    subjectId: string,
    teacherIds: string[]
  ) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      await subjectsApi.assignTeachers(subjectId, teacherIds);
      await fetchSubjects();
    } catch (error: any) {
      setSubjectsError(error.message || "Failed to assign teachers");
      throw error;
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const removeTeacherFromSubject = async (
    subjectId: string,
    teacherId: string
  ) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      await subjectsApi.removeTeacher(subjectId, teacherId);
      await fetchSubjects();
    } catch (error: any) {
      setSubjectsError(error.message || "Failed to remove teacher");
      throw error;
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // ==================== GRADES (localStorage) ====================

  const updateGrades = (newGrades: Grade[]) => {
    setGrades(newGrades);
    storage.set("grades", newGrades);
  };

  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter((g) => g.studentId === studentId);
  };

  // ==================== SCHEDULES (localStorage) ====================

  const addSchedule = (schedule: Schedule) => {
    const updated = [...schedules, schedule];
    setSchedules(updated);
    storage.set("schedules", updated);
  };

  const updateSchedule = (schedule: Schedule) => {
    const updated = schedules.map((s) => (s.id === schedule.id ? schedule : s));
    setSchedules(updated);
    storage.set("schedules", updated);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    storage.set("schedules", updated);
  };

  const getScheduleByClass = (classId: string): Schedule | undefined => {
    return schedules.find((s) => s.classId === classId);
  };

  return (
    <DataContext.Provider
      value={{
        // Students (API)
        students,
        isLoadingStudents,
        studentsError,
        fetchStudents,
        addStudent,
        updateStudent,
        deleteStudent,

        // Teachers (API)
        teachers,
        isLoadingTeachers,
        teachersError,
        fetchTeachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,

        // Classes (API)
        classes,
        isLoadingClasses,
        classesError,
        fetchClasses,
        addClass,
        updateClass,
        deleteClass,
        assignStudentsToClass,
        removeStudentFromClass,

        // Subjects (API)
        subjects,
        isLoadingSubjects,
        subjectsError,
        fetchSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        assignTeachersToSubject,
        removeTeacherFromSubject,

        // Grades (localStorage)
        grades,
        updateGrades,
        getStudentGrades,

        // Schedules (localStorage)
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getScheduleByClass,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

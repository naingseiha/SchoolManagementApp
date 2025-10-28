"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Student, Teacher, Class, Subject, Grade, Schedule } from "@/types";
import { storage } from "@/lib/storage";
import { studentsApi } from "@/lib/api/students";
import { classesApi } from "@/lib/api/classes";
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

  // Teachers (localStorage for now)
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;

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

  // Subjects (localStorage for now)
  subjects: Subject[];
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

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
  // Students State (API-based)
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Classes State (API-based)
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Other states (localStorage-based for now)
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data only when authenticated
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token && !isInitialized) {
      console.log("🔄 Token found, loading initial data...");
      loadInitialData();
      setIsInitialized(true);
    } else if (!token) {
      console.log("⏸️ No token found, skipping data load");
      setIsInitialized(false);
    }
  }, []); // Run once on mount

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (token) {
        console.log("🔐 Auth changed (logged in), reloading data...");
        loadInitialData();
        setIsInitialized(true);
      } else {
        console.log("🔐 Auth changed (logged out), clearing data...");
        setStudents([]);
        setClasses([]);
        setTeachers([]);
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

    try {
      // Load students and classes from API in parallel
      await Promise.all([fetchStudents(), fetchClasses()]);

      // Load other data from localStorage
      const loadedTeachers = storage.get("teachers") || DEFAULT_TEACHERS;
      const loadedSubjects = storage.get("subjects") || DEFAULT_SUBJECTS;
      const loadedGrades = storage.get("grades") || [];
      const loadedSchedules = storage.get("schedules") || [];

      setTeachers(loadedTeachers);
      setSubjects(loadedSubjects);
      setGrades(loadedGrades);
      setSchedules(loadedSchedules);

      // Initialize localStorage if empty
      if (!storage.get("teachers")) storage.set("teachers", DEFAULT_TEACHERS);
      if (!storage.get("subjects")) storage.set("subjects", DEFAULT_SUBJECTS);

      console.log("✅ Initial data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
    } finally {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  };

  // ==================== STUDENTS API METHODS ====================

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);
      const data = await studentsApi.getAll();
      console.log("✅ Loaded students:", data.length);
      setStudents(data);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setStudentsError(error.message || "Failed to load students");
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const addStudent = async (studentData: Omit<Student, "id">) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);

      console.log("📤 Adding student:", studentData);

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

      console.log("✅ Student created:", newStudent);

      // Update local state
      setStudents((prev) => [...prev, newStudent]);

      // Refresh classes to update student count
      await fetchClasses();
    } catch (error: any) {
      console.error("Error adding student:", error);
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

      // Update local state
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? updatedStudent : s))
      );

      // Refresh classes to update student count
      await fetchClasses();
    } catch (error: any) {
      console.error("Error updating student:", error);
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

      // Update local state
      setStudents((prev) => prev.filter((s) => s.id !== id));

      // Refresh classes to update student count
      await fetchClasses();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      setStudentsError(error.message || "Failed to delete student");
      throw error;
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ==================== CLASSES API METHODS ====================

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);
      const data = await classesApi.getAll();
      console.log("✅ Loaded classes:", data.length);
      setClasses(data);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      setClassesError(error.message || "Failed to load classes");
      setClasses([]);
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
      console.error("Error adding class:", error);
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
      console.error("Error updating class:", error);
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
      console.error("Error deleting class:", error);
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

      // Refresh both classes and students
      await fetchClasses();
      await fetchStudents();
    } catch (error: any) {
      console.error("Error assigning students:", error);
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

      // Refresh both classes and students
      await fetchClasses();
      await fetchStudents();
    } catch (error: any) {
      console.error("Error removing student:", error);
      setClassesError(error.message || "Failed to remove student");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // ==================== TEACHERS (localStorage) ====================

  const addTeacher = (teacher: Teacher) => {
    const updated = [...teachers, teacher];
    setTeachers(updated);
    storage.set("teachers", updated);
  };

  const updateTeacher = (teacher: Teacher) => {
    const updated = teachers.map((t) => (t.id === teacher.id ? teacher : t));
    setTeachers(updated);
    storage.set("teachers", updated);
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    storage.set("teachers", updated);
  };

  // ==================== SUBJECTS (localStorage) ====================

  const addSubject = (subject: Subject) => {
    const updated = [...subjects, subject];
    setSubjects(updated);
    storage.set("subjects", updated);
  };

  const updateSubject = (subject: Subject) => {
    const updated = subjects.map((s) => (s.id === subject.id ? subject : s));
    setSubjects(updated);
    storage.set("subjects", updated);
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    storage.set("subjects", updated);
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

        // Teachers (localStorage)
        teachers,
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

        // Subjects (localStorage)
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,

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

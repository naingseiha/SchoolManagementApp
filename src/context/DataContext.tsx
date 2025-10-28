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

  // Subjects (API) - ✅ UPDATED
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
  // Students State (API-based)
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Teachers State (API-based)
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Classes State (API-based)
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Subjects State (API-based) - ✅ NEW
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  // Other states (localStorage-based for now)
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
  }, []);

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

    try {
      // Load students, classes, teachers, and subjects from API in parallel
      await Promise.all([
        fetchStudents(),
        fetchClasses(),
        fetchTeachers(),
        fetchSubjects(), // ✅ NEW
      ]);

      // Load other data from localStorage
      const loadedGrades = storage.get("grades") || [];
      const loadedSchedules = storage.get("schedules") || [];

      setGrades(loadedGrades);
      setSchedules(loadedSchedules);

      console.log("✅ Initial data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
    } finally {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  };

  // ==================== STUDENTS API METHODS ====================
  // ... (keep existing student methods) ...

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
      setStudents((prev) => [...prev, newStudent]);
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

      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? updatedStudent : s))
      );
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
      setStudents((prev) => prev.filter((s) => s.id !== id));
      await fetchClasses();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      setStudentsError(error.message || "Failed to delete student");
      throw error;
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ==================== TEACHERS API METHODS ====================
  // ... (keep existing teacher methods) ...

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);
      const data = await teachersApi.getAll();
      console.log("✅ Loaded teachers:", data.length);
      setTeachers(data);
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      setTeachersError(error.message || "Failed to load teachers");
      setTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const addTeacher = async (teacherData: Omit<Teacher, "id">) => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);

      console.log("📤 Adding teacher:", teacherData);

      const newTeacher = await teachersApi.create({
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        email: teacherData.email,
        phone: teacherData.phone,
        subject: teacherData.subject,
        employeeId: teacherData.employeeId,
      });

      console.log("✅ Teacher created:", newTeacher);
      setTeachers((prev) => [...prev, newTeacher]);
    } catch (error: any) {
      console.error("Error adding teacher:", error);
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
      console.error("Error updating teacher:", error);
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
      console.error("Error deleting teacher:", error);
      setTeachersError(error.message || "Failed to delete teacher");
      throw error;
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // ==================== CLASSES API METHODS ====================
  // ... (keep existing class methods) ...

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

  // ==================== SUBJECTS API METHODS - ✅ NEW ====================

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      const data = await subjectsApi.getAll();
      console.log("✅ Loaded subjects:", data.length);
      setSubjects(data);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      setSubjectsError(error.message || "Failed to load subjects");
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const addSubject = async (subjectData: Omit<Subject, "id">) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      console.log("📤 Adding subject:", subjectData);

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

      console.log("✅ Subject created:", newSubject);
      setSubjects((prev) => [...prev, newSubject]);
    } catch (error: any) {
      console.error("Error adding subject:", error);
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
      console.error("Error updating subject:", error);
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
      console.error("Error deleting subject:", error);
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
      console.error("Error assigning teachers:", error);
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
      console.error("Error removing teacher:", error);
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

        // Subjects (API) - ✅ NEW
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

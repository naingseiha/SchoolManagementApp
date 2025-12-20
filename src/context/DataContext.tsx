"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Student, Teacher, Class, Subject, Grade, Schedule } from "@/types";
import { storage } from "@/lib/storage";
import { studentsApi } from "@/lib/api/students";
import { classesApi } from "@/lib/api/classes";
import { teachersApi } from "@/lib/api/teachers";
import { subjectsApi } from "@/lib/api/subjects";

interface DataContextType {
  // Students (API)
  students: Student[];
  isLoadingStudents: boolean;
  studentsError: string | null;
  fetchStudents: () => Promise<void>;
  refreshStudents: () => Promise<void>; // Alias for compatibility
  addStudent: (student: any) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Teachers (API)
  teachers: Teacher[];
  isLoadingTeachers: boolean;
  teachersError: string | null;
  fetchTeachers: () => Promise<void>;
  refreshTeachers: () => Promise<void>; // Alias
  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  // Classes (API)
  classes: Class[];
  isLoadingClasses: boolean;
  classesError: string | null;
  fetchClasses: () => Promise<void>;
  refreshClasses: () => Promise<void>; // Alias
  addClass: (classData: any) => Promise<void>;
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
  refreshSubjects: () => Promise<void>; // Alias
  addSubject: (subject: any) => Promise<void>;
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

  // Grades (localStorage)
  grades: Grade[];
  updateGrades: (grades: Grade[]) => void;
  getStudentGrades: (studentId: string) => Grade[];

  // Schedules (localStorage)
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  getScheduleByClass: (classId: string) => Schedule | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Students State
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Teachers State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Classes State
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Subjects State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  // LocalStorage State
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  // ==================== INITIAL LOAD ====================

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
  }, []);

  // Listen for auth changes
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
  }, [isInitialized]);

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

      // ✅ Add timeout helper with increased timeout for better reliability
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("DATA_LOAD_TIMEOUT")), timeoutMs)
          ),
        ]);
      };

      // Load Students (lightweight)
      setIsLoadingStudents(true);
      try {
        const studentsData = await withTimeout(studentsApi.getAllLightweight());
        console.log("⚡ Students loaded (lightweight):", studentsData.length);
        setStudents(studentsData);
      } catch (err: any) {
        console.warn("⚠️ Students load failed:", err.message);
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }

      // Load Teachers (lightweight)
      setIsLoadingTeachers(true);
      try {
        const teachersData = await withTimeout(teachersApi.getAllLightweight());
        console.log("⚡ Teachers loaded (lightweight):", teachersData.length);
        setTeachers(teachersData);
      } catch (err: any) {
        console.warn("⚠️ Teachers load failed:", err.message);
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }

      // Load Classes (lightweight)
      setIsLoadingClasses(true);
      try {
        const classesData = await withTimeout(classesApi.getAllLightweight());
        console.log("⚡ Classes loaded (lightweight):", classesData.length);
        setClasses(classesData);
      } catch (err: any) {
        console.warn("⚠️ Classes load failed:", err.message);
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }

      // Load Subjects (lightweight)
      setIsLoadingSubjects(true);
      try {
        const subjectsData = await withTimeout(subjectsApi.getAllLightweight());
        console.log("⚡ Subjects loaded (lightweight):", subjectsData.length);
        setSubjects(subjectsData);
      } catch (err: any) {
        console.warn("⚠️ Subjects load failed:", err.message);
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }

      // Load localStorage data
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

  // ==================== STUDENTS ====================

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);
      const data = await studentsApi.getAllLightweight();
      setStudents(data);
    } catch (error: any) {
      console.error("❌ Error fetching students:", error);
      setStudentsError(error.message);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);

      const newStudent = await studentsApi.create(studentData);
      setStudents((prev) => [...prev, newStudent]);
      await fetchClasses(); // Refresh classes
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

      const updatedStudent = await studentsApi.update(student.id, student);
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

  // ==================== TEACHERS ====================

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);
      const data = await teachersApi.getAllLightweight();
      setTeachers(data);
    } catch (error: any) {
      console.error("❌ Error fetching teachers:", error);
      setTeachersError(error.message);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const addTeacher = async (teacherData: Omit<Teacher, "id">) => {
    try {
      setIsLoadingTeachers(true);
      setTeachersError(null);

      const newTeacher = await teachersApi.create(teacherData);
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

      const updatedTeacher = await teachersApi.update(teacher.id, teacher);
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

  // ==================== CLASSES ====================

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);
      console.log("📚 Fetching classes...");

      const data = await classesApi.getAllLightweight();

      console.log(`✅ Fetched ${data.length} classes successfully`);
      setClasses(data);
      setClassesError(null);
    } catch (error: any) {
      console.error("❌ Error fetching classes:", error);
      const errorMsg = error.message || "Failed to load classes";
      setClassesError(errorMsg);
      // Don't clear classes on error - keep existing data
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const addClass = async (classData: any) => {
    try {
      setIsLoadingClasses(true);
      setClassesError(null);

      const newClass = await classesApi.create(classData);
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

      const updatedClass = await classesApi.update(classData.id, classData);
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
      await Promise.all([fetchClasses(), fetchStudents()]);
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
      await Promise.all([fetchClasses(), fetchStudents()]);
    } catch (error: any) {
      setClassesError(error.message || "Failed to remove student");
      throw error;
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // ==================== SUBJECTS ====================

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      const data = await subjectsApi.getAllLightweight();
      setSubjects(data);
    } catch (error: any) {
      console.error("❌ Error fetching subjects:", error);
      setSubjectsError(error.message);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const addSubject = async (subjectData: any) => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);

      const newSubject = await subjectsApi.create(subjectData);
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

      const updatedSubject = await subjectsApi.update(subject.id, subject);
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
        // Students
        students,
        isLoadingStudents,
        studentsError,
        fetchStudents,
        refreshStudents: fetchStudents, // Alias
        addStudent,
        updateStudent,
        deleteStudent,

        // Teachers
        teachers,
        isLoadingTeachers,
        teachersError,
        fetchTeachers,
        refreshTeachers: fetchTeachers, // Alias
        addTeacher,
        updateTeacher,
        deleteTeacher,

        // Classes
        classes,
        isLoadingClasses,
        classesError,
        fetchClasses,
        refreshClasses: fetchClasses, // Alias
        addClass,
        updateClass,
        deleteClass,
        assignStudentsToClass,
        removeStudentFromClass,

        // Subjects
        subjects,
        isLoadingSubjects,
        subjectsError,
        fetchSubjects,
        refreshSubjects: fetchSubjects, // Alias
        addSubject,
        updateSubject,
        deleteSubject,
        assignTeachersToSubject,
        removeTeacherFromSubject,

        // Grades
        grades,
        updateGrades,
        getStudentGrades,

        // Schedules
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

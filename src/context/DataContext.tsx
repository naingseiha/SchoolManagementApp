"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Student, Teacher, Class, Subject, Grade, Schedule } from "@/types";
import { storage } from "@/lib/storage";
import {
  DEFAULT_STUDENTS,
  DEFAULT_TEACHERS,
  DEFAULT_CLASSES,
  DEFAULT_SUBJECTS,
} from "@/lib/constants";

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  grades: Grade[];
  schedules: Schedule[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  addClass: (classData: Class) => void;
  updateClass: (classData: Class) => void;
  deleteClass: (id: string) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  updateGrades: (grades: Grade[]) => void;
  getStudentGrades: (studentId: string) => Grade[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  getScheduleByClass: (classId: string) => Schedule | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const loadedStudents = storage.get("students") || DEFAULT_STUDENTS;
    const loadedTeachers = storage.get("teachers") || DEFAULT_TEACHERS;
    const loadedClasses = storage.get("classes") || DEFAULT_CLASSES;
    const loadedSubjects = storage.get("subjects") || DEFAULT_SUBJECTS;
    const loadedGrades = storage.get("grades") || [];
    const loadedSchedules = storage.get("schedules") || [];

    setStudents(loadedStudents);
    setTeachers(loadedTeachers);
    setClasses(loadedClasses);
    setSubjects(loadedSubjects);
    setGrades(loadedGrades);
    setSchedules(loadedSchedules);

    if (!storage.get("students")) storage.set("students", DEFAULT_STUDENTS);
    if (!storage.get("teachers")) storage.set("teachers", DEFAULT_TEACHERS);
    if (!storage.get("classes")) storage.set("classes", DEFAULT_CLASSES);
    if (!storage.get("subjects")) storage.set("subjects", DEFAULT_SUBJECTS);
  }, []);

  const addStudent = (student: Student) => {
    const updated = [...students, student];
    setStudents(updated);
    storage.set("students", updated);
  };

  const updateStudent = (student: Student) => {
    const updated = students.map((s) => (s.id === student.id ? student : s));
    setStudents(updated);
    storage.set("students", updated);
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    storage.set("students", updated);
  };

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

  const addClass = (classData: Class) => {
    const updated = [...classes, classData];
    setClasses(updated);
    storage.set("classes", updated);
  };

  const updateClass = (classData: Class) => {
    const updated = classes.map((c) => (c.id === classData.id ? classData : c));
    setClasses(updated);
    storage.set("classes", updated);
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    storage.set("classes", updated);
  };

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

  const updateGrades = (newGrades: Grade[]) => {
    setGrades(newGrades);
    storage.set("grades", newGrades);
  };

  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter((g) => g.studentId === studentId);
  };

  // Schedule Management Functions
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
        students,
        teachers,
        classes,
        subjects,
        grades,
        schedules,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        updateGrades,
        getStudentGrades,
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

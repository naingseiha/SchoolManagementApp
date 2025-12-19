"use client";

import { useState, useEffect, useCallback } from "react";
import { classesApi, Class, CreateClassData } from "@/lib/api/classes";

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all classes from database
   */
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("⚡ Fetching classes (lightweight)...");

      const data = await classesApi.getAllLightweight();
      console.log(`⚡ Loaded ${data.length} classes (lightweight)`);

      setClasses(data);
    } catch (err: any) {
      console.error("❌ Error fetching classes:", err);
      setError(err.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add new class
   */
  const addClass = useCallback(async (data: CreateClassData) => {
    try {
      console.log("➕ Creating new class:", data);
      const newClass = await classesApi.create(data);
      console.log("✅ Class created:", newClass.id);

      setClasses((prev) => [...prev, newClass]);
      return newClass;
    } catch (err: any) {
      console.error("❌ Error adding class:", err);
      throw err;
    }
  }, []);

  /**
   * Update existing class
   */
  const updateClass = useCallback(
    async (id: string, data: Partial<CreateClassData>) => {
      try {
        console.log(`✏️ Updating class ${id}:`, data);
        const updatedClass = await classesApi.update(id, data);
        console.log("✅ Class updated:", updatedClass.id);

        setClasses((prev) => prev.map((c) => (c.id === id ? updatedClass : c)));
        return updatedClass;
      } catch (err: any) {
        console.error("❌ Error updating class:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Delete class
   */
  const deleteClass = useCallback(async (id: string) => {
    try {
      console.log(`🗑️ Deleting class ${id}...`);
      await classesApi.delete(id);
      console.log("✅ Class deleted");

      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error("❌ Error deleting class:", err);
      throw err;
    }
  }, []);

  /**
   * Assign students to class
   */
  const assignStudents = useCallback(
    async (classId: string, studentIds: string[]) => {
      try {
        console.log(`🔗 Assigning students to class ${classId}...`);
        const updatedClass = await classesApi.assignStudents(
          classId,
          studentIds
        );
        console.log("✅ Students assigned");

        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? updatedClass : c))
        );
        return updatedClass;
      } catch (err: any) {
        console.error("❌ Error assigning students:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Remove student from class
   */
  const removeStudent = useCallback(
    async (classId: string, studentId: string) => {
      try {
        console.log(
          `🔓 Removing student ${studentId} from class ${classId}...`
        );
        await classesApi.removeStudent(classId, studentId);
        console.log("✅ Student removed");

        // Refresh classes to get updated student count
        await fetchClasses();
      } catch (err: any) {
        console.error("❌ Error removing student:", err);
        throw err;
      }
    },
    [fetchClasses]
  );

  /**
   * Reload classes
   */
  const refresh = useCallback(() => {
    console.log("🔄 Refreshing classes...");
    fetchClasses();
  }, [fetchClasses]);

  // Initial load
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    assignStudents,
    removeStudent,
    refresh,
  };
}

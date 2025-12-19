"use client";

import { useState, useEffect, useCallback } from "react";
import { subjectsApi, Subject, CreateSubjectData } from "@/lib/api/subjects";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all subjects from database
   */
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("⚡ Fetching subjects (lightweight)...");

      const data = await subjectsApi.getAllLightweight();
      console.log(`⚡ Loaded ${data.length} subjects (lightweight)`);

      setSubjects(data);
    } catch (err: any) {
      console.error("❌ Error fetching subjects:", err);
      setError(err.message || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add new subject
   */
  const addSubject = useCallback(async (data: CreateSubjectData) => {
    try {
      console.log("➕ Creating new subject:", data);
      const newSubject = await subjectsApi.create(data);
      console.log("✅ Subject created:", newSubject.id);

      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    } catch (err: any) {
      console.error("❌ Error adding subject:", err);
      throw err;
    }
  }, []);

  /**
   * Update existing subject
   */
  const updateSubject = useCallback(
    async (id: string, data: Partial<CreateSubjectData>) => {
      try {
        console.log(`✏️ Updating subject ${id}:`, data);
        const updatedSubject = await subjectsApi.update(id, data);
        console.log("✅ Subject updated:", updatedSubject.id);

        setSubjects((prev) =>
          prev.map((s) => (s.id === id ? updatedSubject : s))
        );
        return updatedSubject;
      } catch (err: any) {
        console.error("❌ Error updating subject:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Delete subject
   */
  const deleteSubject = useCallback(async (id: string) => {
    try {
      console.log(`🗑️ Deleting subject ${id}...`);
      await subjectsApi.delete(id);
      console.log("✅ Subject deleted");

      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("❌ Error deleting subject:", err);
      throw err;
    }
  }, []);

  /**
   * Reload subjects
   */
  const refresh = useCallback(() => {
    console.log("🔄 Refreshing subjects...");
    fetchSubjects();
  }, [fetchSubjects]);

  // Initial load
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    refresh,
  };
}

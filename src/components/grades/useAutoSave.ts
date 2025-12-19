import { useCallback } from "react";
import type { CellState } from "./types";
import type { BulkSaveGradeItem } from "@/lib/api/grades";

export function useAutoSave(
  pendingChanges: Set<string>,
  cells: { [key: string]: CellState },
  setCells: React.Dispatch<React.SetStateAction<{ [key: string]: CellState }>>,
  setPendingChanges: React.Dispatch<React.SetStateAction<Set<string>>>,
  onSave: (grades: BulkSaveGradeItem[]) => Promise<void>,
  pasteMode: boolean
) {
  const handleAutoSave = useCallback(async () => {
    const changesToSave: BulkSaveGradeItem[] = [];

    pendingChanges.forEach((cellKey) => {
      const cell = cells[cellKey];
      if (cell && cell.isModified && !cell.error && cell.isEditable) {
        const score = cell.value.trim() === "" ? null : parseFloat(cell.value);
        changesToSave.push({
          studentId: cell.studentId,
          subjectId: cell.subjectId,
          score,
        });

        setCells((prev) => ({
          ...prev,
          [cellKey]: { ...prev[cellKey], isSaving: true },
        }));
      }
    });

    if (changesToSave.length === 0) return;

    console.log("💾 Auto-saving", changesToSave.length, "changes (SILENT)");

    try {
      // ✅ CHANGED: Pass true for isAutoSave (silent save)
      await onSave(changesToSave, true);

      setCells((prev) => {
        const updated = { ...prev };
        changesToSave.forEach((change) => {
          const cellKey = `${change.studentId}_${change.subjectId}`;
          updated[cellKey] = {
            ...updated[cellKey],
            originalValue: change.score,
            isModified: false,
            isSaving: false,
            error: null,
          };
        });
        return updated;
      });

      setPendingChanges(new Set());
      console.log("✅ Auto-save completed SILENTLY (no toast)");
    } catch (error: any) {
      console.error("❌ Auto-save failed:", error);
      setCells((prev) => {
        const updated = { ...prev };
        changesToSave.forEach((change) => {
          const cellKey = `${change.studentId}_${change.subjectId}`;
          updated[cellKey] = {
            ...updated[cellKey],
            isSaving: false,
            error: "Failed",
          };
        });
        return updated;
      });
    }
  }, [pendingChanges, cells, onSave]);

  return { handleAutoSave };
}

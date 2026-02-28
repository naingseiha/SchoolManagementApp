import { useMemo } from "react";
import { sortSubjectsByOrder } from "@/lib/subjectOrder";
import type { StudentSortMode } from "./types";

const GOOGLE_SHEETS_KHMER_COLLATOR = new Intl.Collator("km-KH", {
  usage: "sort",
  sensitivity: "variant",
  numeric: true,
  ignorePunctuation: false,
});

const LEGACY_EN_COLLATOR = new Intl.Collator("en-US", {
  usage: "sort",
  sensitivity: "base",
  numeric: true,
});

const normalizeNameForKhmerSort = (name: string): string => {
  return name
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const compareKhmerGoogleSheetsStyle = (
  rawNameA: string,
  rawNameB: string
): number => {
  const nameA = normalizeNameForKhmerSort(rawNameA);
  const nameB = normalizeNameForKhmerSort(rawNameB);

  const collatorDiff = GOOGLE_SHEETS_KHMER_COLLATOR.compare(nameA, nameB);
  if (collatorDiff !== 0) return collatorDiff;

  // Keep deterministic order when collator considers values equal.
  if (nameA !== nameB) return nameA < nameB ? -1 : 1;

  return LEGACY_EN_COLLATOR.compare(rawNameA, rawNameB);
};

export function useGradeSorting(
  subjects: any[],
  students: any[],
  className: string,
  sortMode: StudentSortMode = "google-khmer"
) {
  const sortedSubjects = useMemo(() => {
    let grade: number | undefined;

    const pattern1 = className.match(/^(\d+)/);
    if (pattern1) {
      grade = parseInt(pattern1[1]);
    }

    if (!grade) {
      const khmerNumerals: { [key: string]: number } = {
        "១": 1,
        "២": 2,
        "៣": 3,
        "៤": 4,
        "៥": 5,
        "៦": 6,
        "៧": 7,
        "៨": 8,
        "៩": 9,
        "០": 0,
      };
      const pattern2 = className.match(/[១២៣៤៥៦៧៨៩០]/);
      if (pattern2) {
        grade = khmerNumerals[pattern2[0]];
      }
    }

    if (!grade) {
      const pattern3 = className.match(/(\d+)/);
      if (pattern3) {
        grade = parseInt(pattern3[1]);
      }
    }

    const sorted = sortSubjectsByOrder(subjects, grade);

    // Re-apply isEditable from original
    return sorted.map((sortedSubject) => {
      const original = subjects.find((s) => s.id === sortedSubject.id);
      return {
        ...sortedSubject,
        isEditable: original?.isEditable ?? false,
      };
    });
  }, [subjects, className]);

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const nameA = a.studentName || "";
      const nameB = b.studentName || "";

      if (sortMode === "legacy-en") {
        return LEGACY_EN_COLLATOR.compare(nameA, nameB);
      }

      return compareKhmerGoogleSheetsStyle(nameA, nameB);
    });
  }, [students, sortMode]);

  return { sortedSubjects, sortedStudents };
}

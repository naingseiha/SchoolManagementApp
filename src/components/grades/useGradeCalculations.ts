import { useMemo } from "react";
import type { CellState } from "./types";

export function useGradeCalculations(
  students: any[],
  subjects: any[],
  cells: { [key: string]: CellState },
  totalCoefficient: number,
  attendanceSummary: { [key: string]: { absent: number; permission: number } }
) {
  const calculatedStudents = useMemo(() => {
    return students.map((student) => {
      let totalScore = 0;
      let totalMaxScore = 0;

      subjects.forEach((subject) => {
        const cellKey = `${student.studentId}_${subject.id}`;
        const cell = cells[cellKey];

        if (cell && cell.value.trim() !== "" && !cell.error) {
          const score = parseFloat(cell.value);
          if (!isNaN(score)) {
            totalScore += score;
            totalMaxScore += subject.maxScore;
          }
        }
      });

      const average = totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

      let gradeLevel = "F";
      if (average >= 45) gradeLevel = "A";
      else if (average >= 40) gradeLevel = "B";
      else if (average >= 35) gradeLevel = "C";
      else if (average >= 30) gradeLevel = "D";
      else if (average >= 25) gradeLevel = "E";

      return {
        ...student,
        totalScore: totalScore.toFixed(2),
        totalMaxScore,
        totalCoefficient: totalCoefficient.toFixed(2),
        average: average.toFixed(2),
        gradeLevel,
      };
    });
  }, [cells, students, subjects, totalCoefficient]);

  const rankedStudents = useMemo(() => {
    const sorted = [...calculatedStudents]
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        absent: attendanceSummary[student.studentId]?.absent || 0,
        permission: attendanceSummary[student.studentId]?.permission || 0,
      }));

    return calculatedStudents.map((student) => {
      const ranked = sorted.find((s) => s.studentId === student.studentId);
      return {
        ...student,
        rank: ranked?.rank || 0,
        absent: ranked?.absent || 0,
        permission: ranked?.permission || 0,
      };
    });
  }, [calculatedStudents, attendanceSummary]);

  return { rankedStudents };
}

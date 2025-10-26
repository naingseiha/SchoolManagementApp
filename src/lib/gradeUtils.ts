import { GradeScale, Grade } from "@/types";

export function getLetterGrade(
  score: number,
  gradeScale: GradeScale[]
): string {
  for (const scale of gradeScale) {
    if (score >= scale.min && score <= scale.max) {
      return scale.grade;
    }
  }
  return "F";
}

export function calculateAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;
  const total = grades.reduce((sum, grade) => {
    const score =
      typeof grade.score === "string" ? parseFloat(grade.score) : grade.score;
    return sum + (isNaN(score) ? 0 : score);
  }, 0);
  return total / grades.length;
}

export function getStudentRank(
  studentId: string,
  classId: string,
  allGrades: Grade[],
  students: any[]
): number {
  const classStudents = students.filter((s) => s.classId === classId);

  const studentAverages = classStudents.map((student) => {
    const studentGrades = allGrades.filter((g) => g.studentId === student.id);
    const avg = calculateAverage(studentGrades);
    return { studentId: student.id, average: avg };
  });

  studentAverages.sort((a, b) => b.average - a.average);

  const rank = studentAverages.findIndex((s) => s.studentId === studentId);
  return rank !== -1 ? rank + 1 : 0;
}

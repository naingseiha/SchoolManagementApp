"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useData } from "@/context/DataContext";

interface Subject {
  id: string;
  nameKh: string;
  code: string;
  maxScore: number;
  coefficient: number;
}

interface StudentGrade {
  studentId: string;
  khmerName: string;
  gender: string;
  rollNumber?: number;
  subjects: {
    [subjectId: string]: {
      score: number | null;
      maxScore: number;
    };
  };
}

interface MobileGradeEntryProps {
  classId?: string;
  month?: string;
  year?: number;
}

export default function MobileGradeEntry({
  classId,
  month,
  year,
}: MobileGradeEntryProps) {
  const { classes } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [selectedMonth, setSelectedMonth] = useState(month || "មករា");
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());

  // Khmer months
  const khmerMonths = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ];

  const currentStudent = students[currentIndex];

  // Calculate totals and average for current student
  const calculateTotals = useCallback(() => {
    if (!currentStudent) return { total: 0, maxTotal: 0, average: 0 };

    let total = 0;
    let maxTotal = 0;
    let totalCoefficient = 0;

    subjects.forEach((subject) => {
      const grade = currentStudent.subjects[subject.id];
      if (grade && grade.score !== null) {
        total += grade.score * subject.coefficient;
        maxTotal += grade.maxScore * subject.coefficient;
        totalCoefficient += subject.coefficient;
      }
    });

    const average = totalCoefficient > 0 ? total / totalCoefficient : 0;

    return {
      total: total.toFixed(2),
      maxTotal: maxTotal.toFixed(2),
      average: average.toFixed(2),
      totalCoefficient,
    };
  }, [currentStudent, subjects]);

  const totals = calculateTotals();

  // Load grade data
  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedClass) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/grades/grid/${selectedClass}?month=${selectedMonth}&year=${selectedYear}`
        );
        const result = await response.json();

        if (result.success) {
          setStudents(result.data.students || []);
          setSubjects(result.data.subjects || []);
        }
      } catch (error) {
        console.error("Error loading grades:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [selectedClass, selectedMonth, selectedYear]);

  const handleNext = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleScoreChange = (subjectId: string, value: string) => {
    const score = value === "" ? null : parseFloat(value);
    const subject = subjects.find((s) => s.id === subjectId);

    // Validate score doesn't exceed max
    if (score !== null && subject && score > subject.maxScore) {
      return;
    }

    setStudents((prev) =>
      prev.map((student, idx) =>
        idx === currentIndex
          ? {
              ...student,
              subjects: {
                ...student.subjects,
                [subjectId]: {
                  ...student.subjects[subjectId],
                  score,
                },
              },
            }
          : student
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare bulk save data
      const gradesToSave = students.flatMap((student) =>
        subjects
          .filter((subject) => student.subjects[subject.id]?.score !== null)
          .map((subject) => ({
            studentId: student.studentId,
            subjectId: subject.id,
            classId: selectedClass,
            score: student.subjects[subject.id].score,
            maxScore: subject.maxScore,
            month: selectedMonth,
            year: selectedYear,
          }))
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/grades/bulk-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grades: gradesToSave }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("ការរក្សាទុកជោគជ័យ! • Saved successfully!");
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក • Error saving grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Grade Entry">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Grade Entry • បញ្ចូលពិន្ទុ">
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ថ្នាក់ • Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              style={{ fontSize: "16px" }}
            >
              <option value="">-- ជ្រើសរើសថ្នាក់ • Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ខែ • Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              >
                {khmerMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ឆ្នាំ • Year
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              មិនមានសិស្ស • No students found
            </p>
          </div>
        ) : (
          <>
            {/* Student Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow p-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 touch-target touch-feedback disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">
                  Student {currentIndex + 1} of {students.length}
                </span>
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex === students.length - 1}
                className="p-2 touch-target touch-feedback disabled:opacity-30"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Student Card */}
            {currentStudent && (
              <>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-4 text-white">
                  <h2 className="text-xl font-bold">{currentStudent.khmerName}</h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    {currentStudent.gender === "MALE" ? "ប្រុស • Male" : "ស្រី • Female"}
                    {currentStudent.rollNumber && ` • Roll #${currentStudent.rollNumber}`}
                  </p>
                </div>

                {/* Subject Scores */}
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const grade = currentStudent.subjects[subject.id];
                    return (
                      <div
                        key={subject.id}
                        className="bg-white rounded-lg shadow p-4"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {subject.nameKh}
                          <span className="text-gray-500 text-xs ml-2">
                            (Max: {subject.maxScore})
                          </span>
                        </label>
                        <input
                          type="number"
                          value={grade?.score ?? ""}
                          onChange={(e) =>
                            handleScoreChange(subject.id, e.target.value)
                          }
                          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder={`0 - ${subject.maxScore}`}
                          min="0"
                          max={subject.maxScore}
                          step="0.5"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total:</span>
                    <span className="font-semibold text-gray-900">
                      {totals.total} / {totals.maxTotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Average:</span>
                    <span className="font-semibold text-indigo-600 text-lg">
                      {totals.average}
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 touch-feedback shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      កំពុងរក្សាទុក • Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      រក្សាទុក • Save All
                    </>
                  )}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}

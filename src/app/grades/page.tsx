"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Select from "@/components/ui/Select";
import { Check, AlertCircle, Download, Upload } from "lucide-react";
import Button from "@/components/ui/Button";

export default function GradesPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { students, classes, subjects, grades, updateGrades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [gradeData, setGradeData] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [saveStatus, setSaveStatus] = useState("");
  const [focusedCell, setFocusedCell] = useState<{
    studentId: string;
    subjectId: string;
  } | null>(null);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Filter classes based on user role
  const accessibleClasses =
    currentUser?.role === "superadmin"
      ? classes
      : currentUser?.role === "classteacher"
      ? classes.filter((c) => c.classTeacherId === currentUser.teacherId)
      : [];

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...accessibleClasses.map((c) => ({ value: c.id, label: c.name })),
  ];

  const monthOptions = [
    { value: "1", label: "មករា - January" },
    { value: "2", label: "កុម្ភៈ - February" },
    { value: "3", label: "មីនា - March" },
    { value: "4", label: "មេសា - April" },
    { value: "5", label: "ឧសភា - May" },
    { value: "6", label: "មិថុនា - June" },
    { value: "7", label: "កក្កដា - July" },
    { value: "8", label: "សីហា - August" },
    { value: "9", label: "កញ្ញា - September" },
    { value: "10", label: "តុលា - October" },
    { value: "11", label: "វិច្ឆិកា - November" },
    { value: "12", label: "ធ្នូ - December" },
  ];

  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Load existing grades when class or month changes
  useEffect(() => {
    if (!selectedClassId) return;

    const data: { [key: string]: { [key: string]: string } } = {};
    classStudents.forEach((student) => {
      data[student.id] = {};
      subjects.forEach((subject) => {
        const grade = grades.find(
          (g) =>
            g.studentId === student.id &&
            g.subjectId === subject.id &&
            g.classId === selectedClassId &&
            g.month === selectedMonth
        );
        data[student.id][subject.id] = grade?.score || "";
      });
    });
    setGradeData(data);
  }, [selectedClassId, selectedMonth, classStudents.length, grades.length]);

  // Auto-save function with debounce
  const autoSave = useCallback(
    (studentId: string, subjectId: string, score: string) => {
      if (!selectedClassId) return;

      setSaveStatus("កំពុងរក្សាទុក... Saving...");

      // Find existing grade
      const existingGrades = [...grades];
      const existingGradeIndex = existingGrades.findIndex(
        (g) =>
          g.studentId === studentId &&
          g.subjectId === subjectId &&
          g.classId === selectedClassId &&
          g.month === selectedMonth
      );

      if (existingGradeIndex !== -1) {
        // Update existing grade
        existingGrades[existingGradeIndex] = {
          ...existingGrades[existingGradeIndex],
          score: score,
        };
      } else {
        // Add new grade
        existingGrades.push({
          id: `g${Date.now()}_${studentId}_${subjectId}`,
          studentId,
          subjectId,
          classId: selectedClassId,
          score: score,
          month: selectedMonth,
          term: "1",
          year: new Date().getFullYear(),
        });
      }

      updateGrades(existingGrades);

      setTimeout(() => {
        setSaveStatus("រក្សាទុករួចរាល់ ✓ Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }, 300);
    },
    [selectedClassId, selectedMonth, grades, updateGrades]
  );

  // Handle score change with auto-save
  const handleScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    setGradeData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value,
      },
    }));

    // Auto-save after typing
    autoSave(studentId, subjectId, value);
  };

  // Calculate totals and averages
  const calculateStudentStats = (studentId: string) => {
    let total = 0;
    let count = 0;

    subjects.forEach((subject) => {
      const score = parseFloat(gradeData[studentId]?.[subject.id] || "0");
      if (score > 0) {
        total += score;
        count++;
      }
    });

    const average = count > 0 ? total / count : 0;
    return { total, average };
  };

  // Handle keyboard navigation (Arrow keys, Tab, Enter)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => {
    const student = classStudents[studentIndex];
    const subject = subjects[subjectIndex];

    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (studentIndex < classStudents.length - 1) {
        const nextStudent = classStudents[studentIndex + 1];
        setFocusedCell({ studentId: nextStudent.id, subjectId: subject.id });
        const nextInput = document.getElementById(
          `grade-${nextStudent.id}-${subject.id}`
        );
        nextInput?.focus();
        (nextInput as HTMLInputElement)?.select();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (studentIndex > 0) {
        const prevStudent = classStudents[studentIndex - 1];
        setFocusedCell({ studentId: prevStudent.id, subjectId: subject.id });
        const prevInput = document.getElementById(
          `grade-${prevStudent.id}-${subject.id}`
        );
        prevInput?.focus();
        (prevInput as HTMLInputElement)?.select();
      }
    } else if (e.key === "ArrowRight" || e.key === "Tab") {
      if (e.key === "Tab") e.preventDefault();
      if (subjectIndex < subjects.length - 1) {
        const nextSubject = subjects[subjectIndex + 1];
        setFocusedCell({ studentId: student.id, subjectId: nextSubject.id });
        const nextInput = document.getElementById(
          `grade-${student.id}-${nextSubject.id}`
        );
        nextInput?.focus();
        (nextInput as HTMLInputElement)?.select();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (subjectIndex > 0) {
        const prevSubject = subjects[subjectIndex - 1];
        setFocusedCell({ studentId: student.id, subjectId: prevSubject.id });
        const prevInput = document.getElementById(
          `grade-${student.id}-${prevSubject.id}`
        );
        prevInput?.focus();
        (prevInput as HTMLInputElement)?.select();
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 animate-fadeIn">
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              បញ្ចូលពិន្ទុ Excel Style Grade Entry
            </h1>
            <p className="text-gray-600">
              បញ្ចូលពិន្ទុរបៀប Excel/Google Sheets ដោយ Auto-save ស្វ័យប្រវត្តិ
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-slideUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="ជ្រើសរើសថ្នាក់ Select Class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classOptions}
              />
              <Select
                label="ខែ Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
              />
            </div>

            {saveStatus && (
              <div className="mt-4 flex items-center space-x-2 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl animate-scaleIn">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {saveStatus}
                </span>
              </div>
            )}
          </div>

          {selectedClassId && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedClass?.name}</h2>
                  <p className="text-blue-100 mt-1">
                    សិស្សសរុប: {classStudents.length} នាក់ | មុខវិជ្ជា:{" "}
                    {subjects.length}
                  </p>
                </div>
                <div className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <p className="font-semibold">
                    ខែ{" "}
                    {
                      monthOptions
                        .find((m) => m.value === selectedMonth)
                        ?.label.split(" - ")[0]
                    }
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <th className="px-3 py-4 text-left text-sm font-bold border-2 border-gray-300 sticky left-0 bg-gray-100 z-10 min-w-[60px]">
                        ល.រ
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-bold border-2 border-gray-300 sticky left-[60px] bg-gray-100 z-10 min-w-[200px]">
                        គោត្តនាម និងនាម
                      </th>
                      {subjects.map((subject) => (
                        <th
                          key={subject.id}
                          className="px-4 py-4 text-center text-sm font-bold border-2 border-gray-300 min-w-[120px]"
                        >
                          <div>{subject.name}</div>
                          <div className="text-xs font-normal text-gray-600 mt-1">
                            (/
                            {subject.maxScore?.[
                              String(selectedClass?.grade || 7)
                            ] || 100}
                            )
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-4 text-center text-sm font-bold border-2 border-gray-300 bg-yellow-100 min-w-[100px]">
                        សរុប
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-bold border-2 border-gray-300 bg-blue-100 min-w-[100px]">
                        មធ្យម
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student, studentIndex) => {
                      const stats = calculateStudentStats(student.id);

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-3 py-2 text-sm text-center border-2 border-gray-200 font-semibold sticky left-0 bg-white z-10">
                            {studentIndex + 1}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium border-2 border-gray-200 sticky left-[60px] bg-white z-10">
                            {student.lastName} {student.firstName}
                          </td>
                          {subjects.map((subject, subjectIndex) => {
                            const maxScore =
                              subject.maxScore?.[
                                String(selectedClass?.grade || 7)
                              ] || 100;
                            const currentScore = parseFloat(
                              gradeData[student.id]?.[subject.id] || "0"
                            );
                            const isFailing =
                              currentScore > 0 && currentScore < 50;

                            return (
                              <td
                                key={subject.id}
                                className={`px-2 py-2 border-2 border-gray-200 ${
                                  isFailing ? "bg-red-50" : ""
                                } ${
                                  focusedCell?.studentId === student.id &&
                                  focusedCell?.subjectId === subject.id
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                }`}
                              >
                                <input
                                  id={`grade-${student.id}-${subject.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={maxScore}
                                  value={
                                    gradeData[student.id]?.[subject.id] || ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      subject.id,
                                      e.target.value
                                    )
                                  }
                                  onFocus={(e) => {
                                    e.target.select();
                                    setFocusedCell({
                                      studentId: student.id,
                                      subjectId: subject.id,
                                    });
                                  }}
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, studentIndex, subjectIndex)
                                  }
                                  className={`w-full px-2 py-2 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded transition-all ${
                                    isFailing ? "text-red-700 font-bold" : ""
                                  }`}
                                  placeholder="-"
                                />
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-sm border-2 border-gray-200 font-bold text-center bg-yellow-50">
                            {stats.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm border-2 border-gray-200 font-bold text-center bg-blue-50">
                            {stats.average.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t-4 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      💡 ជំនួយក្តារចុច Keyboard Shortcuts:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        •{" "}
                        <kbd className="px-2 py-1 bg-gray-200 rounded">Tab</kbd>{" "}
                        ឬ <kbd className="px-2 py-1 bg-gray-200 rounded">→</kbd>{" "}
                        = ទៅក្រឡាបន្ទាប់
                      </li>
                      <li>
                        •{" "}
                        <kbd className="px-2 py-1 bg-gray-200 rounded">
                          Enter
                        </kbd>{" "}
                        ឬ <kbd className="px-2 py-1 bg-gray-200 rounded">↓</kbd>{" "}
                        = ទៅសិស្សបន្ទាប់
                      </li>
                      <li>
                        • <kbd className="px-2 py-1 bg-gray-200 rounded">↑</kbd>{" "}
                        <kbd className="px-2 py-1 bg-gray-200 rounded">←</kbd> =
                        ត្រឡប់ក្រោយ
                      </li>
                      <li>• Auto-save ស្វ័យប្រវត្តិនៅពេលវាយបញ្ចូល</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      📊 ស្ថិតិ Statistics:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • ចំនួនសិស្ស:{" "}
                        <span className="font-bold text-blue-600">
                          {classStudents.length} នាក់
                        </span>
                      </li>
                      <li>
                        • មុខវិជ្ជា:{" "}
                        <span className="font-bold text-green-600">
                          {subjects.length}
                        </span>
                      </li>
                      <li>
                        • ពិន្ទុបានបញ្ចូល:{" "}
                        <span className="font-bold text-purple-600">
                          {Object.values(gradeData).reduce(
                            (sum, studentGrades) =>
                              sum +
                              Object.values(studentGrades).filter(
                                (score) => score !== ""
                              ).length,
                            0
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedClassId && (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-gray-500 mb-2">
                សូមជ្រើសរើសថ្នាក់ដើម្បីចាប់ផ្តើមបញ្ចូលពិន្ទុ
              </p>
              <p className="text-gray-400">
                Please select a class to start entering grades
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

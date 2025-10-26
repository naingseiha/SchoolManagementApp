"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { Save } from "lucide-react";

export default function GradesPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades, updateGrades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [gradeInputs, setGradeInputs] = useState<{ [key: string]: string }>({});

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const subjectOptions = [
    { value: "", label: "ជ្រើសរើសមុខវិជ្ជា - Select Subject" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleGradeChange = (studentId: string, score: string) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: score,
    }));
  };

  const handleSave = () => {
    if (!selectedClassId || !selectedSubjectId) {
      alert("សូមជ្រើសរើសថ្នាក់និងមុខវិជ្ជា Please select class and subject");
      return;
    }

    const newGrades = classStudents.map((student) => {
      const existingGrade = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subjectId === selectedSubjectId &&
          g.classId === selectedClassId
      );

      const score = gradeInputs[student.id] || existingGrade?.score || "";

      return {
        id: existingGrade?.id || `g${Date.now()}_${student.id}`,
        studentId: student.id,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        score: score,
        term: "1",
        year: new Date().getFullYear(),
      };
    });

    const otherGrades = grades.filter(
      (g) =>
        !(g.subjectId === selectedSubjectId && g.classId === selectedClassId)
    );

    updateGrades([...otherGrades, ...newGrades]);
    alert("បានរក្សាទុកពិន្ទុ Grades saved successfully!");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              បញ្ចូលពិន្ទុ Grade Entry
            </h1>
            <p className="text-gray-600">
              ជ្រើសរើសថ្នាក់និងមុខវិជ្ជាដើម្បីបញ្ចូលពិន្ទុ
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Select
                label="ជ្រើសរើសថ្នាក់ Select Class"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setGradeInputs({});
                }}
                options={classOptions}
              />
              <Select
                label="ជ្រើសរើសមុខវិជ្ជា Select Subject"
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setGradeInputs({});
                }}
                options={subjectOptions}
              />
            </div>

            {selectedClassId && selectedSubjectId && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    ចំនួនសិស្ស:{" "}
                    <span className="font-medium">{classStudents.length}</span>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    រក្សាទុក Save
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ឈ្មោះសិស្ស Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ពិន្ទុ Score (Max:{" "}
                          {selectedSubject?.maxScore?.[
                            String(
                              classes.find((c) => c.id === selectedClassId)
                                ?.grade || 7
                            )
                          ] || 100}
                          )
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classStudents.map((student, index) => {
                        const existingGrade = grades.find(
                          (g) =>
                            g.studentId === student.id &&
                            g.subjectId === selectedSubjectId &&
                            g.classId === selectedClassId
                        );

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {student.lastName} {student.firstName}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Input
                                type="number"
                                min="0"
                                max={
                                  selectedSubject?.maxScore?.[
                                    String(
                                      classes.find(
                                        (c) => c.id === selectedClassId
                                      )?.grade || 7
                                    )
                                  ] || 100
                                }
                                value={
                                  gradeInputs[student.id] !== undefined
                                    ? gradeInputs[student.id]
                                    : existingGrade?.score || ""
                                }
                                onChange={(e) =>
                                  handleGradeChange(student.id, e.target.value)
                                }
                                placeholder="0-100"
                                className="max-w-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {classStudents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      គ្មានសិស្សក្នុងថ្នាក់នេះទេ No students in this class
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedClassId && !selectedSubjectId && (
              <div className="text-center py-12 text-gray-500">
                សូមជ្រើសរើសថ្នាក់និងមុខវិជ្ជា Please select a class and subject
                to enter grades
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

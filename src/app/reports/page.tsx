"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { calculateAverage, getLetterGrade } from "@/lib/gradeUtils";
import { GRADE_SCALE } from "@/lib/constants";
import { Download, Printer } from "lucide-react";

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const { students, classes, subjects, grades } = useData();
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("");

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const studentReports = classStudents.map((student) => {
    const studentGrades = grades.filter((g) => g.studentId === student.id);
    const average = calculateAverage(studentGrades);
    const letterGrade = getLetterGrade(average, GRADE_SCALE);

    return {
      student,
      grades: studentGrades,
      average,
      letterGrade,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6 no-print">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              របាយការណ៍ Reports
            </h1>
            <p className="text-gray-600">
              របាយការណ៍ពិន្ទុសិស្ស Student Grade Reports
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6 no-print">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Select
                  label="ជ្រើសរើសថ្នាក់ Select Class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  options={classOptions}
                />
              </div>
              <Button onClick={handlePrint} variant="secondary">
                <Printer className="w-4 h-4 mr-2" />
                បោះពុម្ព Print
              </Button>
            </div>
          </div>

          {selectedClassId && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  របាយការណ៍ពិន្ទុ {selectedClass?.name}
                </h2>
                <p className="text-gray-600">
                  ឆ្នាំសិក្សា {selectedClass?.year}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ឈ្មោះសិស្ស
                      </th>
                      {subjects.map((subject) => (
                        <th
                          key={subject.id}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {subject.name}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        មធ្យមភាគ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ពិន្ទុ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentReports.map((report, index) => (
                      <tr key={report.student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {report.student.lastName} {report.student.firstName}
                          </div>
                        </td>
                        {subjects.map((subject) => {
                          const grade = report.grades.find(
                            (g) => g.subjectId === subject.id
                          );
                          return (
                            <td
                              key={subject.id}
                              className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600"
                            >
                              {grade?.score || "-"}
                            </td>
                          );
                        })}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="font-medium text-gray-900">
                            {report.average.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              report.letterGrade === "A"
                                ? "bg-green-100 text-green-800"
                                : report.letterGrade === "B"
                                ? "bg-blue-100 text-blue-800"
                                : report.letterGrade === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : report.letterGrade === "D"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {report.letterGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {studentReports.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    គ្មានទិន្នន័យទេ No data available
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedClassId && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">
                សូមជ្រើសរើសថ្នាក់ដើម្បីមើលរបាយការណ៍ Please select a class to
                view the report
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

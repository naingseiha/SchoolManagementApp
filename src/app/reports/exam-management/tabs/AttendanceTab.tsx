"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import Button from "@/components/ui/Button";
import { Printer, Plus, Trash2 } from "lucide-react";
import { classesApi } from "@/lib/api/classes";
import KhmerAttendanceReport from "@/components/reports/KhmerAttendanceReport";
import { getAcademicYearOptionsCustom } from "@/utils/academicYear";

interface PageConfig {
  id: string;
  studentCount: number;
}

export default function AttendanceTab() {
  const { classes } = useData();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [province, setProvince] = useState("ខេត្តសៀមរាប");
  const [examCenter, setExamCenter] = useState("វិទ្យាល័យហ៊ុនសែនស្វាយធំ");
  const [roomNumber, setRoomNumber] = useState("01");
  const [reportTitle, setReportTitle] = useState(
    "បញ្ជីវត្តមានសិស្សប្រឡងប្រចាំខែ",
  );
  const [reportDate, setReportDate] = useState(
    "ថ្ងៃទី........ ខែ........ ឆ្នាំ........",
  );
  const [principalName, setPrincipalName] = useState(".......................");
  const [teacherName, setTeacherName] = useState(".......................");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([
    { id: "1", studentCount: 25 },
  ]);
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>([]);
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const exclusionStorageKey = useMemo(() => {
    if (!selectedClassId) return "";
    return `exam-attendance-exclusions:${currentMonthKey}:${selectedYear}:${selectedClassId}`;
  }, [currentMonthKey, selectedYear, selectedClassId]);

  const academicYearOptions = getAcademicYearOptionsCustom();

  // Fetch full class data when class is selected
  useEffect(() => {
    let isMounted = true;

    const fetchClassData = async () => {
      if (!selectedClassId) {
        if (isMounted) setSelectedClass(null);
        return;
      }

      try {
        // Fetch class with subjects
        const classData = await classesApi.getById(selectedClassId);

        // Filter out ICT, Sport, Agriculture subjects
        const excludedSubjects = [
          "ICT",
          "Sport",
          "Agriculture",
          "ព័ត៌មានវិទ្យា",
          "កីឡា",
          "កសិកម្ម",
        ];
        const filteredSubjects = (classData.subjects || []).filter(
          (subject: any) => {
            const name = subject.name || "";
            return !excludedSubjects.some(
              (excluded) =>
                name.includes(excluded) ||
                name.toLowerCase().includes(excluded.toLowerCase()),
            );
          },
        );

        if (!isMounted) return;
        setSelectedClass({
          ...classData,
          subjects: filteredSubjects,
        });
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching class data:", error);
        }
      }
    };

    fetchClassData();

    return () => {
      isMounted = false;
    };
  }, [selectedClassId]);

  useEffect(() => {
    if (!exclusionStorageKey) {
      setExcludedStudentIds([]);
      return;
    }

    const savedExclusions = window.localStorage.getItem(exclusionStorageKey);
    if (!savedExclusions) {
      setExcludedStudentIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedExclusions);
      setExcludedStudentIds(
        Array.isArray(parsed) ? parsed.map((id: unknown) => String(id)) : [],
      );
    } catch (error) {
      console.error("Failed to parse attendance exclusions:", error);
      setExcludedStudentIds([]);
    }
  }, [exclusionStorageKey]);

  // Sort students by name (same as grade entry)
  const sortStudents = (students: any[]) => {
    return [...students].sort((a, b) => {
      // Sort by khmerName
      const nameA = a.khmerName || "";
      const nameB = b.khmerName || "";
      return nameA.localeCompare(nameB, "en-US");
    });
  };

  const normalizeStudentId = (studentId: unknown) => String(studentId ?? "");

  useEffect(() => {
    if (!exclusionStorageKey) return;
    window.localStorage.setItem(
      exclusionStorageKey,
      JSON.stringify(excludedStudentIds),
    );
  }, [exclusionStorageKey, excludedStudentIds]);

  const sortedClassStudents = useMemo(
    () => sortStudents(selectedClass?.students || []),
    [selectedClass],
  );

  const filteredClassStudents = useMemo(() => {
    const excludedSet = new Set(excludedStudentIds);
    return sortedClassStudents.filter(
      (student: any) => !excludedSet.has(normalizeStudentId(student.id)),
    );
  }, [sortedClassStudents, excludedStudentIds]);

  const selectedClassForReport = useMemo(
    () =>
      selectedClass
        ? {
            ...selectedClass,
            students: filteredClassStudents,
          }
        : null,
    [selectedClass, filteredClassStudents],
  );

  const removeStudentFromExamList = (studentId: string) => {
    setExcludedStudentIds((prev) => {
      if (prev.includes(studentId)) return prev;
      return [...prev, studentId];
    });
  };

  const restoreAllStudents = () => {
    setExcludedStudentIds([]);
  };

  const handleAddPage = () => {
    const newId = String(pageConfigs.length + 1);
    setPageConfigs([...pageConfigs, { id: newId, studentCount: 25 }]);
  };

  const handleRemovePage = (id: string) => {
    if (pageConfigs.length > 1) {
      setPageConfigs(pageConfigs.filter((config) => config.id !== id));
    }
  };

  const handlePageConfigChange = (id: string, studentCount: number) => {
    setPageConfigs(
      pageConfigs.map((config) =>
        config.id === id ? { ...config, studentCount } : config,
      ),
    );
  };

  const handleGenerate = () => {
    if (!selectedClass) {
      alert("សូមជ្រើសរើសថ្នាក់រៀនសិន");
      return;
    }
    setIsGenerating(true);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  return (
    <>
      {/* Configuration Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-gray-700">
          ការកំណត់រចនាសម្ព័ន្ធ
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Class Selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ថ្នាក់រៀន
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">ជ្រើសរើសថ្នាក់រៀន</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ឆ្នាំសិក្សា
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {academicYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ខេត្ត
            </label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Exam Center */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              មណ្ឌលប្រឡង
            </label>
            <input
              type="text"
              value={examCenter}
              onChange={(e) => setExamCenter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Room Number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              លេខបន្ទប់
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Report Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ចំណងជើង
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Report Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              កាលបរិច្ឆេទ
            </label>
            <input
              type="text"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Principal Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ឈ្មោះនាយក
            </label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Teacher Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ឈ្មោះគ្រូ
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedClass && (
          <div className="mt-6 border-t pt-6">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  កែតារាងសិស្សមុនបោះពុម្ព
                </h4>
                <p className="text-sm text-gray-600">
                  ដកសិស្សចេញតែពីបញ្ជីវត្តមានប្រឡងខែនេះ មិនលុបចេញពីថ្នាក់ទេ
                </p>
              </div>
              <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                សម្រាប់បោះពុម្ពតែប៉ុណ្ណោះ
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
                <div className="text-sm font-semibold text-gray-800">
                  {selectedClass.name}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    បង្ហាញ {filteredClassStudents.length}/
                    {sortedClassStudents.length} នាក់
                  </span>
                </div>
                <button
                  type="button"
                  onClick={restoreAllStudents}
                  disabled={excludedStudentIds.length === 0}
                  className="text-xs font-medium text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  ស្តារវិញ ({excludedStudentIds.length})
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="border-b px-2 py-2 text-left">ល.រ</th>
                      <th className="border-b px-2 py-2 text-left">ឈ្មោះ</th>
                      <th className="border-b px-2 py-2 text-center">ភេទ</th>
                      <th className="border-b px-2 py-2 text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClassStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-4 text-center text-sm text-gray-500"
                        >
                          មិនមានសិស្សនៅក្នុងបញ្ជី
                        </td>
                      </tr>
                    ) : (
                      filteredClassStudents.map((student: any, index: number) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border-b px-2 py-2">{index + 1}</td>
                          <td className="border-b px-2 py-2">
                            {student.khmerName ||
                              `${student.lastName} ${student.firstName}`}
                          </td>
                          <td className="border-b px-2 py-2 text-center">
                            {student.gender === "MALE" || student.gender === "male"
                              ? "ប"
                              : "ស"}
                          </td>
                          <td className="border-b px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeStudentFromExamList(
                                  normalizeStudentId(student.id),
                                )
                              }
                              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              ដកចេញ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Page Configuration */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              ការកំណត់ចំនួនសិស្សក្នុងមួយទំព័រ
            </h4>
            <Button onClick={handleAddPage} size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              បន្ថែមទំព័រ
            </Button>
          </div>

          <div className="space-y-2">
            {pageConfigs.map((config, index) => (
              <div
                key={config.id}
                className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3"
              >
                <span className="min-w-[80px] text-sm font-medium text-gray-700">
                  ទំព័រទី {index + 1}:
                </span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    value={config.studentCount}
                    onChange={(e) =>
                      handlePageConfigChange(
                        config.id,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ចំនួនសិស្ស"
                  />
                </div>
                {pageConfigs.length > 1 && (
                  <button
                    onClick={() => handleRemovePage(config.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleGenerate} variant="primary">
            បង្កើតរបាយការណ៍
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {isGenerating && selectedClassForReport && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">
              មើលរបាយការណ៍
            </h4>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              បោះពុម្ព
            </Button>
          </div>

          <div ref={printRef} className="mx-auto" style={{ width: "210mm" }}>
            <KhmerAttendanceReport
              selectedClass={selectedClassForReport}
              province={province}
              examCenter={examCenter}
              roomNumber={roomNumber}
              reportTitle={reportTitle}
              reportDate={reportDate}
              principalName={principalName}
              teacherName={teacherName}
              selectedYear={selectedYear}
              pageConfigs={pageConfigs}
              sortStudents={sortStudents}
            />
          </div>
        </div>
      )}
    </>
  );
}

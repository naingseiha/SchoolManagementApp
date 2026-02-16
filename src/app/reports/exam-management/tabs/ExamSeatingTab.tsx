"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Button from "@/components/ui/Button";
import { Printer, Loader2, AlertCircle, Users, Plus, Trash2 } from "lucide-react";
import { getAcademicYearOptionsCustom } from "@/utils/academicYear";
import { classesApi } from "@/lib/api/classes";

// Import the exam report component
import KhmerExamReport from "@/components/reports/KhmerExamReport";

interface PageConfig {
  id: string;
  class1Count: number;
  class2Count: number;
}

export default function ExamSeatingTab() {
  const { currentUser } = useAuth();
  const { classes, isLoadingClasses } = useData();

  // State management
  const [selectedClassId1, setSelectedClassId1] = useState("");
  const [selectedClassId2, setSelectedClassId2] = useState("");
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return month >= 10 ? year : year - 1;
  });
  const [province, setProvince] = useState("មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប");
  const [examCenter, setExamCenter] = useState("វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ");
  const [roomNumber, setRoomNumber] = useState("01");
  const [reportTitle, setReportTitle] = useState("បញ្ជីរាយនាមសិស្សប្រឡងប្រចាំខែ");
  const [reportDate, setReportDate] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [loadingClassData, setLoadingClassData] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Full class data with students
  const [class1Data, setClass1Data] = useState<any>(null);
  const [class2Data, setClass2Data] = useState<any>(null);

  // Page configurations for pagination
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([
    { id: "1", class1Count: 20, class2Count: 20 },
  ]);

  // Filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "ADMIN") return classes;
    if (currentUser.role === "TEACHER") {
      const classIdsSet = new Set<string>();
      if (currentUser.teacher?.teacherClasses) {
        currentUser.teacher.teacherClasses.forEach((tc: any) => {
          const classId = tc.classId || tc.class?.id;
          if (classId) classIdsSet.add(classId);
        });
      }
      if (currentUser.teacher?.homeroomClassId) {
        classIdsSet.add(currentUser.teacher.homeroomClassId);
      }
      const teacherClassIds = Array.from(classIdsSet);
      return classes.filter((c) => teacherClassIds.includes(c.id));
    }
    return [];
  }, [currentUser, classes]);

  // Fetch full class data with students when classes are selected
  useEffect(() => {
    const fetchClassData = async () => {
      if (selectedClassId1 && selectedClassId2) {
        setLoadingClassData(true);
        try {
          const [data1, data2] = await Promise.all([
            classesApi.getById(selectedClassId1),
            classesApi.getById(selectedClassId2),
          ]);
          setClass1Data(data1);
          setClass2Data(data2);
        } catch (error) {
          console.error("Error fetching class data:", error);
        } finally {
          setLoadingClassData(false);
        }
      }
    };
    fetchClassData();
  }, [selectedClassId1, selectedClassId2]);

  // Sort students by gender (male first) then by name
  const sortStudents = (students: any[]) => {
    if (!students) return [];
    return [...students].sort((a, b) => {
      // First sort by gender (male first)
      if (a.gender === "male" && b.gender === "female") return -1;
      if (a.gender === "female" && b.gender === "male") return 1;
      // Then sort by khmerName if available, otherwise use lastName
      const nameA = a.khmerName || a.lastName;
      const nameB = b.khmerName || b.lastName;
      return nameA.localeCompare(nameB, "km");
    });
  };

  const addPageConfig = () => {
    setPageConfigs([
      ...pageConfigs,
      { id: Date.now().toString(), class1Count: 20, class2Count: 20 },
    ]);
  };

  const removePageConfig = (id: string) => {
    if (pageConfigs.length > 1) {
      setPageConfigs(pageConfigs.filter((p) => p.id !== id));
    }
  };

  const updatePageConfig = (
    id: string,
    field: "class1Count" | "class2Count",
    value: number
  ) => {
    setPageConfigs(
      pageConfigs.map((p) =>
        p.id === id ? { ...p, [field]: Math.max(1, value) } : p
      )
    );
  };

  const handleGenerateReport = async () => {
    if (!selectedClassId1 || !selectedClassId2 || !class1Data || !class2Data) {
      alert("សូមជ្រើសរើសថ្នាក់ទាំងពីរ");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 500);
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

  if (isLoadingClasses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  const academicYearOptions = getAcademicYearOptionsCustom();

  return (
    <>
      {/* Configuration Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          ការកំណត់របាយការណ៍
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ថ្នាក់ទី១ (ខាងឆ្វេង)
              </label>
              <select
                value={selectedClassId1}
                onChange={(e) => setSelectedClassId1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ជ្រើសរើសថ្នាក់</option>
                {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - {cls.studentCount || 0} សិស្ស
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ថ្នាក់ទី២ (ខាងស្តាំ)
                    </label>
                    <select
                      value={selectedClassId2}
                      onChange={(e) => setSelectedClassId2(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">ជ្រើសរើសថ្នាក់</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - {cls.studentCount || 0} សិស្ស
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ឆ្នាំសិក្សា
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {academicYearOptions.map((option) => (
                        <option key={option.year} value={option.year}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ខេត្ត/ក្រុង
                    </label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      មជ្ឈមណ្ឌលប្រឡង
                    </label>
                    <input
                      type="text"
                      value={examCenter}
                      onChange={(e) => setExamCenter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      លេខបន្ទប់
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ចំណងជើង
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      កាលបរិច្ឆេទ
                    </label>
                    <input
                      type="text"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      placeholder="ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២៥"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Full Width Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    នាយកសាលា
                  </label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    គ្រូឃ្លាំមើល
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Page Configuration Section */}
              {selectedClassId1 && selectedClassId2 && class1Data && class2Data && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      កំណត់ចំនួនសិស្សក្នុងមួយទំព័រ
                    </h3>
                    <Button
                      onClick={addPageConfig}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      បន្ថែមទំព័រ
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {pageConfigs.map((config, index) => (
                      <div
                        key={config.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-700 w-20">
                          ទំព័រ {index + 1}:
                        </span>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {class1Data.name} (ខាងឆ្វេង)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={config.class1Count}
                              onChange={(e) =>
                                updatePageConfig(
                                  config.id,
                                  "class1Count",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {class2Data.name} (ខាងស្តាំ)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={config.class2Count}
                              onChange={(e) =>
                                updatePageConfig(
                                  config.id,
                                  "class2Count",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        {pageConfigs.length > 1 && (
                          <button
                            onClick={() => removePageConfig(config.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Loading indicator */}
                  {loadingClassData && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">កំពុងផ្ទុកទិន្នន័យសិស្ស...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedClassId1 || !selectedClassId2 || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      កំពុងបង្កើត...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      បង្កើតតារាង
                    </>
                  )}
                </Button>

                {reportGenerated && (
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="w-5 h-5 mr-2" />
                    បោះពុម្ព
                  </Button>
                )}
              </div>
            </div>

            {/* Report Preview */}
            {reportGenerated && class1Data && class2Data && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  មើលរបាយការណ៍
                </h2>
                <div ref={printRef}>
                  <KhmerExamReport
                    class1={class1Data}
                    class2={class2Data}
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

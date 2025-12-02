"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface MonthlyReportSettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  province: string;
  setProvince: (value: string) => void;
  examCenter: string;
  setExamCenter: (value: string) => void;
  roomNumber: string;
  setRoomNumber: (value: string) => void;
  reportTitle: string;
  setReportTitle: (value: string) => void;
  examSession: string;
  setExamSession: (value: string) => void;
  reportDate: string;
  setReportDate: (value: string) => void;
  teacherName: string;
  setTeacherName: (value: string) => void;
  principalName: string;
  setPrincipalName: (value: string) => void;
  showCircles: boolean;
  setShowCircles: (value: boolean) => void;
  autoCircle: boolean;
  setAutoCircle: (value: boolean) => void;
  showDateOfBirth: boolean;
  setShowDateOfBirth: (value: boolean) => void;
  showGrade: boolean;
  setShowGrade: (value: boolean) => void;
  showOther: boolean;
  setShowOther: (value: boolean) => void;
  showSubjects?: boolean;
  setShowSubjects?: (value: boolean) => void;
  showAttendance?: boolean;
  setShowAttendance?: (value: boolean) => void;
  showTotal?: boolean;
  setShowTotal?: (value: boolean) => void;
  showAverage?: boolean;
  setShowAverage?: (value: boolean) => void;
  showGradeLevel?: boolean;
  setShowGradeLevel?: (value: boolean) => void;
  showRank?: boolean;
  setShowRank?: (value: boolean) => void;
  showRoomNumber?: boolean;
  setShowRoomNumber?: (value: boolean) => void;
}

export default function MonthlyReportSettings({
  showSettings,
  setShowSettings,
  province,
  setProvince,
  examCenter,
  setExamCenter,
  roomNumber,
  setRoomNumber,
  reportTitle,
  setReportTitle,
  examSession,
  setExamSession,
  reportDate,
  setReportDate,
  teacherName,
  setTeacherName,
  principalName,
  setPrincipalName,
  showCircles,
  setShowCircles,
  autoCircle,
  setAutoCircle,
  showDateOfBirth,
  setShowDateOfBirth,
  showGrade,
  setShowGrade,
  showOther,
  setShowOther,
  showSubjects = false,
  setShowSubjects = () => {},
  showAttendance = true,
  setShowAttendance = () => {},
  showTotal = true,
  setShowTotal = () => {},
  showAverage = true,
  setShowAverage = () => {},
  showGradeLevel = true,
  setShowGradeLevel = () => {},
  showRank = true,
  setShowRank = () => {},
  showRoomNumber = true,
  setShowRoomNumber = () => {},
}: MonthlyReportSettingsProps) {
  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
      >
        {showSettings ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        កំណត់សេវាកម្ម Report Settings
      </button>

      {showSettings && (
        <div className="mt-4 space-y-6">
          {/* General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                មន្ទីរ/ខេត្ត Province
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="មន្ទីរអប់រំយុវជន និងកីឡា ខេត្តសៀមរាប"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ឈ្មោះសាលា School Name
              </label>
              <input
                type="text"
                value={examCenter}
                onChange={(e) => setExamCenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                បន្ទប់ប្រឡង Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ចំណងជើង Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="តារាងលទ្ធផលប្រចាំខែ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                វគ្គប្រឡង Session
              </label>
              <input
                type="text"
                value={examSession}
                onChange={(e) => setExamSession(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="សប្តាហ៍ទី ១២៖ ខែធ្នូ ២០២៤-២០២៥"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                កាលបរិច្ឆេទ Date
              </label>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="ថ្ងៃទី. ....  ខែ..... ឆ្នាំ២០២៥"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                គ្រូបន្ទុក Teacher
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="គ្រូបន្ទុកថ្នាក់"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                នាយក Principal
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="នាយកសាលា"
              />
            </div>
          </div>

          {/* Column Visibility Settings */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              បង្ហាញ/លាក់ជួរឈរ Show/Hide Columns
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSubjects}
                  onChange={(e) => setShowSubjects(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">បង្ហាញមុខវិជ្ជា</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAttendance}
                  onChange={(e) => setShowAttendance(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">អវត្តមាន</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTotal}
                  onChange={(e) => setShowTotal(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">ពិន្ទុសរុប</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAverage}
                  onChange={(e) => setShowAverage(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">មធ្យមភាគ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRank}
                  onChange={(e) => setShowRank(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">ចំណាត់ថ្នាក់</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGradeLevel}
                  onChange={(e) => setShowGradeLevel(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">និទ្ទេស</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoomNumber}
                  onChange={(e) => setShowRoomNumber(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">បន្ទប់ប្រឡង</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCircles}
                  onChange={(e) => setShowCircles(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">រង្វង់ខ្ពស់</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCircle}
                  onChange={(e) => setAutoCircle(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">រង្វង់ស្វ័យ</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

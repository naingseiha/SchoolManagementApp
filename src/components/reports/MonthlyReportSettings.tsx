"use client";

import { Settings } from "lucide-react";

interface MonthlyReportSettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  province: string;
  setProvince: (province: string) => void;
  examCenter: string;
  setExamCenter: (center: string) => void;
  roomNumber: string;
  setRoomNumber: (number: string) => void;
  reportTitle: string;
  setReportTitle: (title: string) => void;
  examSession: string;
  setExamSession: (session: string) => void;
  reportDate: string;
  setReportDate: (date: string) => void;
  teacherName: string;
  setTeacherName: (name: string) => void;
  principalName: string;
  setPrincipalName: (name: string) => void;
  showCircles: boolean;
  setShowCircles: (show: boolean) => void;
  autoCircle: boolean;
  setAutoCircle: (auto: boolean) => void;
  showDateOfBirth: boolean;
  setShowDateOfBirth: (show: boolean) => void;
  showGrade: boolean;
  setShowGrade: (show: boolean) => void;
  showOther: boolean;
  setShowOther: (show: boolean) => void;
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
}: MonthlyReportSettingsProps) {
  return (
    <div className="mt-4 space-y-4">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 rounded-lg transition-colors"
      >
        <Settings className="w-5 h-5 text-blue-700" />
        <span className="text-sm font-semibold text-blue-700">
          កំណត់របាយការណ៍
        </span>
      </button>
      {showSettings && (
        <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold text-blue-800 mb-3">
              ព័ត៌មានរបាយការណ៍
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  ខេត្ត Province
                </label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  មណ្ឌលប្រឡង Exam Center
                </label>
                <input
                  type="text"
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  បន្ទប់លេខ Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  ចំណងជើង Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  សម័យប្រឡង Exam Session
                </label>
                <input
                  type="text"
                  value={examSession}
                  onChange={(e) => setExamSession(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  កាលបរិច្ឆេទ Date
                </label>
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  គ្រូបន្ទុក Teacher
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  នាយកសាលា Principal
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold text-blue-800 mb-3">
              ជម្រើសបង្ហាញ Display Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCircles}
                  onChange={(e) => setShowCircles(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  បង្ហាញរង្វង់ Show Circles
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCircle}
                  onChange={(e) => setAutoCircle(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  រង្វង់ស្វ័យប្រវត្តិ Auto Circle
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDateOfBirth}
                  onChange={(e) => setShowDateOfBirth(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  ថ្ងៃខែឆ្នាំកំណើត Date of Birth
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrade}
                  onChange={(e) => setShowGrade(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  និទ្ទេស Grade
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOther}
                  onChange={(e) => setShowOther(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  ផ្សេងៗ Other
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

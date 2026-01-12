"use client";

import { useState, useCallback } from "react";
import { Save, X, Loader2, User } from "lucide-react";
import { StudentProfile } from "@/lib/api/student-portal";

interface StudentProfileEditFormProps {
  profile: StudentProfile;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Move InputField outside component to prevent re-creation
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium bg-white"
    />
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-indigo-600">
    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
    <h1 className="text-lg font-black text-gray-900">{title}</h1>
  </div>
);

export default function StudentProfileEditForm({
  profile,
  onSave,
  onCancel,
  isSubmitting,
}: StudentProfileEditFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    khmerName: profile.student.khmerName || "",
    englishName: `${profile.firstName} ${profile.lastName}`,
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    gender: profile.student.gender || "MALE",
    dateOfBirth: profile.student.dateOfBirth || "",
    placeOfBirth: profile.student.placeOfBirth || "",

    // Contact Info
    phoneNumber: profile.student.phoneNumber || profile.phone || "",
    email: profile.email || "",
    currentAddress: profile.student.currentAddress || "",

    // Parent Info
    fatherName: (profile.student as any).fatherName || "",
    motherName: (profile.student as any).motherName || "",
    parentPhone: profile.student.parentPhone || "",
    parentOccupation: profile.student.parentOccupation || "",

    // Academic History
    previousGrade: (profile.student as any).previousGrade || "",
    previousSchool: (profile.student as any).previousSchool || "",
    repeatingGrade: (profile.student as any).repeatingGrade || "",
    transferredFrom: (profile.student as any).transferredFrom || "",

    // Grade 9 Exam
    grade9ExamSession: (profile.student as any).grade9ExamSession || "",
    grade9ExamCenter: (profile.student as any).grade9ExamCenter || "",
    grade9ExamRoom: (profile.student as any).grade9ExamRoom || "",
    grade9ExamDesk: (profile.student as any).grade9ExamDesk || "",
    grade9PassStatus: (profile.student as any).grade9PassStatus || "",

    // Grade 12 Exam
    grade12ExamSession: (profile.student as any).grade12ExamSession || "",
    grade12ExamCenter: (profile.student as any).grade12ExamCenter || "",
    grade12ExamRoom: (profile.student as any).grade12ExamRoom || "",
    grade12ExamDesk: (profile.student as any).grade12ExamDesk || "",
    grade12Track: (profile.student as any).grade12Track || "",
    grade12PassStatus: (profile.student as any).grade12PassStatus || "",

    // Remarks
    remarks: (profile.student as any).remarks || "",
  });

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.khmerName.trim()) {
      alert("សូមបញ្ចូលគោត្តនាមនិងនាមជាអក្សរខ្មែរ");
      return;
    }

    if (!formData.dateOfBirth) {
      alert("សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើត");
      return;
    }

    await onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 -m-5 mb-0 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</h1>
            <p className="text-sm text-indigo-100">
              សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ព័ត៌មានទូទៅ" />
          <div className="space-y-4">
            <InputField
              label="គោត្តនាមនិងនាម (ខ្មែរ)"
              name="khmerName"
              value={formData.khmerName}
              onChange={handleChange}
              required
              placeholder="ឧ. សុខ ចន្ទា"
            />
            <InputField
              label="ឈ្មោះជាអក្សរឡាតាំង"
              name="englishName"
              value={formData.englishName}
              onChange={handleChange}
              placeholder="Sok Chantha"
            />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ភេទ <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="MALE">ប្រុស (Male)</option>
                <option value="FEMALE">ស្រី (Female)</option>
              </select>
            </div>
            <InputField
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              type="date"
              required
            />
            <InputField
              label="ទីកន្លែងកំណើត"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleChange}
              placeholder="ភ្នំពេញ"
            />
            <InputField
              label="អាសយដ្ឋានបច្ចុប្បន្ន"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
              placeholder="ភ្នំពេញ"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ព័ត៌មានទំនាក់ទំនង" />
          <div className="space-y-4">
            <InputField
              label="លេខទូរសព្ទ"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              type="tel"
              placeholder="012345678"
            />
            <InputField
              label="អ៊ីមែល"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="student@school.edu.kh"
            />
          </div>
        </div>

        {/* Parent Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ព័ត៌មានឪពុកម្តាយ" />
          <div className="space-y-4">
            <InputField
              label="ឈ្មោះឪពុក"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="ឈ្មោះឪពុក"
            />
            <InputField
              label="ឈ្មោះម្តាយ"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="ឈ្មោះម្តាយ"
            />
            <InputField
              label="លេខទូរសព្ទឪពុកម្តាយ"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              type="tel"
              placeholder="012345678"
            />
            <InputField
              label="មុខរបរឪពុកម្តាយ"
              name="parentOccupation"
              value={formData.parentOccupation}
              onChange={handleChange}
              placeholder="កសិករ"
            />
          </div>
        </div>

        {/* Academic History */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ប្រវត្តិសិក្សា" />
          <div className="space-y-4">
            <InputField
              label="ឡើងពីថ្នាក់"
              name="previousGrade"
              value={formData.previousGrade}
              onChange={handleChange}
              placeholder="៦ក"
            />
            <InputField
              label="មកពីសាលា"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
              placeholder="សាលាចាស់"
            />
            <InputField
              label="ត្រួតថ្នាក់ទី"
              name="repeatingGrade"
              value={formData.repeatingGrade}
              onChange={handleChange}
              placeholder="៧ខ"
            />
            <InputField
              label="ផ្ទេរមកពី"
              name="transferredFrom"
              value={formData.transferredFrom}
              onChange={handleChange}
              placeholder="ខេត្ត/ក្រុង"
            />
          </div>
        </div>

        {/* Grade 9 Exam */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ប្រឡងថ្នាក់ទី៩ (សញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ)" />
          <div className="space-y-4">
            <InputField
              label="សម័យប្រឡង"
              name="grade9ExamSession"
              value={formData.grade9ExamSession}
              onChange={handleChange}
              placeholder="២០២៤"
            />
            <InputField
              label="មណ្ឌលប្រឡង"
              name="grade9ExamCenter"
              value={formData.grade9ExamCenter}
              onChange={handleChange}
              placeholder="មណ្ឌល១"
            />
            <InputField
              label="បន្ទប់ប្រឡង"
              name="grade9ExamRoom"
              value={formData.grade9ExamRoom}
              onChange={handleChange}
              placeholder="១"
            />
            <InputField
              label="លេខតុប្រឡង"
              name="grade9ExamDesk"
              value={formData.grade9ExamDesk}
              onChange={handleChange}
              placeholder="០១"
            />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ស្ថានភាពប្រឡង
              </label>
              <select
                name="grade9PassStatus"
                value={formData.grade9PassStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="">-- ជ្រើសរើស --</option>
                <option value="ជាប់">ជាប់ (Passed)</option>
                <option value="ធ្លាក់">ធ្លាក់ (Failed)</option>
                <option value="មិនប្រឡង">មិនប្រឡង (Not Taken)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grade 12 Exam */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="ប្រឡងថ្នាក់ទី១២ (សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ)" />
          <div className="space-y-4">
            <InputField
              label="សម័យប្រឡង"
              name="grade12ExamSession"
              value={formData.grade12ExamSession}
              onChange={handleChange}
              placeholder="២០២៧"
            />
            <InputField
              label="មណ្ឌលប្រឡង"
              name="grade12ExamCenter"
              value={formData.grade12ExamCenter}
              onChange={handleChange}
              placeholder="មណ្ឌល១"
            />
            <InputField
              label="បន្ទប់ប្រឡង"
              name="grade12ExamRoom"
              value={formData.grade12ExamRoom}
              onChange={handleChange}
              placeholder="១"
            />
            <InputField
              label="លេខតុប្រឡង"
              name="grade12ExamDesk"
              value={formData.grade12ExamDesk}
              onChange={handleChange}
              placeholder="០១"
            />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ផ្លូវសិក្សា
              </label>
              <select
                name="grade12Track"
                value={formData.grade12Track}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="">-- ជ្រើសរើស --</option>
                <option value="វិទ្យាសាស្ត្រ">វិទ្យាសាស្ត្រ (Science)</option>
                <option value="សង្គម">សង្គម (Social)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ស្ថានភាពប្រឡង
              </label>
              <select
                name="grade12PassStatus"
                value={formData.grade12PassStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="">-- ជ្រើសរើស --</option>
                <option value="ជាប់">ជាប់ (Passed)</option>
                <option value="ធ្លាក់">ធ្លាក់ (Failed)</option>
                <option value="មិនប្រឡង">មិនប្រឡង (Not Taken)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <SectionTitle title="កំណត់សម្គាល់" />
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={4}
            placeholder="កំណត់សម្គាល់ផ្សេងៗ..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <X className="w-5 h-5" />
            បោះបង់
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                កំពុងរក្សាទុក...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                រក្សាទុក
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

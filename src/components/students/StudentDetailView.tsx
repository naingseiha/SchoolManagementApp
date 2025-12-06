"use client";

import { Student } from "@/lib/api/students";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Users,
  FileText,
  Award,
  BookOpen,
} from "lucide-react";

interface StudentDetailViewProps {
  student: Student;
}

export default function StudentDetailView({ student }: StudentDetailViewProps) {
  const formatGender = (gender: string) => {
    return gender === "male" || gender === "MALE"
      ? "ប្រុស (Male)"
      : "ស្រី (Female)";
  };

  const InfoRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
      <div className="bg-blue-100 p-3 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600 font-medium">{label}</div>
        <div className="text-base font-bold text-gray-900 mt-1">
          {value || "-"}
        </div>
      </div>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-black text-gray-900">{title}</h3>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Student Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">
              {student.gender === "male" || student.gender === "MALE"
                ? "👦"
                : "👧"}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-100 mb-1">
              អត្តលេខសិស្ស
            </div>
            <div className="text-3xl font-black mb-2">
              {student.studentId || "N/A"}
            </div>
            <div className="text-2xl font-bold">
              {student.khmerName || `${student.firstName} ${student.lastName}`}
            </div>
            {student.englishName && (
              <div className="text-lg text-blue-100 mt-1">
                {student.englishName}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">ថ្នាក់</div>
            <div className="text-2xl font-black">
              {student.class?.name || "មិនមានថ្នាក់"}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <SectionTitle title="ព័ត៌មានទូទៅ" icon={User} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            label="គោត្តនាម និងនាម (ខ្មែរ)"
            value={student.khmerName}
            icon={User}
          />
          <InfoRow
            label="ឈ្មោះជាអក្សរឡាតាំង"
            value={
              student.englishName || `${student.firstName} ${student.lastName}`
            }
            icon={User}
          />
          <InfoRow
            label="ភេទ"
            value={formatGender(student.gender)}
            icon={User}
          />
          <InfoRow
            label="ថ្ងៃខែឆ្នាំកំណើត"
            value={student.dateOfBirth}
            icon={Calendar}
          />
          <InfoRow
            label="ទីកន្លែងកំណើត"
            value={student.placeOfBirth}
            icon={MapPin}
          />
          <InfoRow
            label="អាសយដ្ឋានបច្ចុប្បន្ន"
            value={student.currentAddress}
            icon={MapPin}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <SectionTitle title="ព័ត៌មានទំនាក់ទំនង" icon={Phone} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            label="លេខទូរសព្ទ"
            value={student.phoneNumber || student.phone}
            icon={Phone}
          />
          <InfoRow label="អ៊ីមែល" value={student.email} icon={Mail} />
        </div>
      </div>

      {/* Parent/Guardian Information */}
      <div>
        <SectionTitle title="ព័ត៌មានឪពុកម្តាយ" icon={Users} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            label="ឈ្មោះឪពុក"
            value={(student as any).fatherName}
            icon={User}
          />
          <InfoRow
            label="ឈ្មោះម្តាយ"
            value={(student as any).motherName}
            icon={User}
          />
          <InfoRow
            label="លេខទូរសព្ទឪពុកម្តាយ"
            value={(student as any).parentPhone}
            icon={Phone}
          />
          <InfoRow
            label="មុខរបរឪពុកម្តាយ"
            value={(student as any).parentOccupation}
            icon={FileText}
          />
        </div>
      </div>

      {/* Academic History */}
      <div>
        <SectionTitle title="ប្រវត្តិសិក្សា" icon={BookOpen} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            label="ឡើងពីថ្នាក់"
            value={(student as any).previousGrade}
            icon={GraduationCap}
          />
          <InfoRow
            label="មកពីសាលា"
            value={(student as any).previousSchool}
            icon={GraduationCap}
          />
          <InfoRow
            label="ត្រួតថ្នាក់ទី"
            value={(student as any).repeatingGrade}
            icon={GraduationCap}
          />
          <InfoRow
            label="ផ្ទេរមកពី"
            value={(student as any).transferredFrom}
            icon={MapPin}
          />
        </div>
      </div>

      {/* Grade 9 Exam (if applicable) */}
      {((student as any).grade9ExamSession ||
        (student as any).grade9ExamCenter) && (
        <div>
          <SectionTitle
            title="ប្រឡងថ្នាក់ទី៩ (សញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ)"
            icon={Award}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="សម័យប្រឡង"
              value={(student as any).grade9ExamSession}
              icon={Calendar}
            />
            <InfoRow
              label="មណ្ឌលប្រឡង"
              value={(student as any).grade9ExamCenter}
              icon={MapPin}
            />
            <InfoRow
              label="បន្ទប់ប្រឡង"
              value={(student as any).grade9ExamRoom}
              icon={FileText}
            />
            <InfoRow
              label="លេខតុប្រឡង"
              value={(student as any).grade9ExamDesk}
              icon={FileText}
            />
            <InfoRow
              label="ស្ថានភាពប្រឡង"
              value={(student as any).grade9PassStatus}
              icon={Award}
            />
          </div>
        </div>
      )}

      {/* Grade 12 Exam (if applicable) */}
      {((student as any).grade12ExamSession ||
        (student as any).grade12ExamCenter) && (
        <div>
          <SectionTitle
            title="ប្រឡងថ្នាក់ទី១២ (សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ)"
            icon={Award}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="សម័យប្រឡង"
              value={(student as any).grade12ExamSession}
              icon={Calendar}
            />
            <InfoRow
              label="មណ្ឌលប្រឡង"
              value={(student as any).grade12ExamCenter}
              icon={MapPin}
            />
            <InfoRow
              label="បន្ទប់ប្រឡង"
              value={(student as any).grade12ExamRoom}
              icon={FileText}
            />
            <InfoRow
              label="លេខតុប្រឡង"
              value={(student as any).grade12ExamDesk}
              icon={FileText}
            />
            <InfoRow
              label="ផ្លូវសិក្សា"
              value={(student as any).grade12Track}
              icon={BookOpen}
            />
            <InfoRow
              label="ស្ថានភាពប្រឡង"
              value={(student as any).grade12PassStatus}
              icon={Award}
            />
          </div>
        </div>
      )}

      {/* Remarks */}
      {(student as any).remarks && (
        <div>
          <SectionTitle title="កំណត់សម្គាល់" icon={FileText} />
          <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
            <p className="text-gray-800 font-medium">
              {(student as any).remarks}
            </p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">បង្កើតនៅ:</span>{" "}
            {student.createdAt
              ? new Date(student.createdAt).toLocaleString("km-KH")
              : "N/A"}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">កែប្រែចុងក្រោយ:</span>{" "}
            {student.updatedAt
              ? new Date(student.updatedAt).toLocaleString("km-KH")
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

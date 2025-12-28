"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  School,
  Users,
  BookOpen,
  Edit,
  Trash2,
  X,
  Shield,
  Info,
} from "lucide-react";
import { studentsApi, Student } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface MobileStudentDetailsProps {
  studentId: string;
}

export default function MobileStudentDetails({
  studentId,
}: MobileStudentDetailsProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("📚 Loading student details:", studentId);
      const data = await studentsApi.getById(studentId);
      console.log("✅ Student loaded:", data);
      setStudent(data);
    } catch (error: any) {
      console.error("❌ Error loading student:", error);
      setError(error.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      alert("អ្នកមិនមានសិទ្ធិលុបសិស្សទេ • You don't have permission to delete students");
      return;
    }

    if (!confirm(`តើអ្នកប្រាកដថាចង់លុបសិស្ស ${student?.khmerName} ទេ?`)) {
      return;
    }

    try {
      console.log("🗑️ Deleting student:", student?.id);
      await studentsApi.delete(student!.id);
      alert("លុបសិស្សបានជោគជ័យ • Student deleted successfully");
      router.push("/students");
    } catch (error: any) {
      console.error("❌ Error deleting student:", error);
      alert(`មានបញ្ហា: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse mb-4"></div>
              <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-khmer-title text-xl font-bold text-gray-900 mb-2">
            មានបញ្ហា
          </h2>
          <p className="font-khmer-body text-gray-600 mb-6">
            {error || "រកមិនឃើញសិស្ស"}
          </p>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-900 text-white font-khmer-body font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all"
          >
            ត្រឡប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="font-khmer-title text-lg font-bold text-gray-900">
                  ព័ត៌មានសិស្ស
                </h1>
                <p className="font-khmer-body text-xs text-gray-500">
                  Student Details
                </p>
              </div>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-khmer-body text-xs text-blue-700 font-medium">
                  មើលប៉ុណ្ណោះ
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Profile Card - Modern Clean Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 ${
                  student.gender === "male"
                    ? "bg-blue-500"
                    : "bg-pink-500"
                }`}
              >
                <User className="w-12 h-12 text-white" />
              </div>

              {/* Name */}
              <h2 className="font-khmer-title text-2xl font-bold text-gray-900 mb-2">
                {student.khmerName ||
                  `${student.firstName} ${student.lastName}`}
              </h2>

              {/* Student ID */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full mb-4">
                <span className="font-mono font-bold text-sm">
                  {student.studentId}
                </span>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    student.gender === "male"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-pink-50 text-pink-700"
                  }`}
                >
                  {student.gender === "male" ? "ប្រុស • Male" : "ស្រី • Female"}
                </span>
                {student.class && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                    {student.class.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid - Clean Sections */}
        <div className="space-y-3">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-khmer-title text-sm font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                ព័ត៌មានផ្ទាល់ខ្លួន
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {student.khmerName && (
                <CleanInfoRow label="ឈ្មោះខ្មែរ" value={student.khmerName} />
              )}
              {(student.firstName || student.lastName) && (
                <CleanInfoRow
                  label="ឈ្មោះអង់គ្លេស"
                  value={`${student.firstName} ${student.lastName}`}
                />
              )}
              {student.dateOfBirth && (
                <CleanInfoRow
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  value={formatDate(student.dateOfBirth)}
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                />
              )}
              {student.placeOfBirth && (
                <CleanInfoRow
                  label="ទីកន្លែងកំណើត"
                  value={student.placeOfBirth}
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
                />
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(student.email ||
            student.phoneNumber ||
            student.phone ||
            student.currentAddress ||
            student.address) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-khmer-title text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  ទំនាក់ទំនង
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {student.email && (
                  <CleanInfoRow
                    label="អ៊ីមែល"
                    value={student.email}
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                )}
                {(student.phoneNumber || student.phone) && (
                  <CleanInfoRow
                    label="លេខទូរស័ព្ទ"
                    value={student.phoneNumber || student.phone || ""}
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />
                )}
                {(student.currentAddress || student.address) && (
                  <CleanInfoRow
                    label="អាសយដ្ឋាន"
                    value={student.currentAddress || student.address || ""}
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                )}
              </div>
            </div>
          )}

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-khmer-title text-sm font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-600" />
                ព័ត៌មានសិក្សា
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {student.class ? (
                <>
                  <CleanInfoRow
                    label="ថ្នាក់រៀន"
                    value={student.class.name}
                    icon={<School className="w-4 h-4 text-gray-400" />}
                  />
                  <CleanInfoRow
                    label="កម្រិត"
                    value={`ថ្នាក់ទី${student.class.grade}`}
                    icon={<BookOpen className="w-4 h-4 text-gray-400" />}
                  />
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="font-khmer-body text-sm text-gray-500">
                    សិស្សមិនទាន់ចុះឈ្មោះថ្នាក់
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          {(student.guardianName || student.guardianPhone) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-khmer-title text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  អាណាព្យាបាល
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {student.guardianName && (
                  <CleanInfoRow
                    label="ឈ្មោះអាណាព្យាបាល"
                    value={student.guardianName}
                    icon={<User className="w-4 h-4 text-gray-400" />}
                  />
                )}
                {student.guardianPhone && (
                  <CleanInfoRow
                    label="លេខទូរស័ព្ទ"
                    value={student.guardianPhone}
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only for Admins */}
        {isAdmin && (
          <div className="pt-2 space-y-3">
            {/* Permission Notice */}
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="font-khmer-body text-xs text-blue-700">
                អ្នកមានសិទ្ធិគ្រប់គ្រងសិស្សនេះ • You have admin permissions
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/students/edit/${student.id}`)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-khmer-body font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                <Edit className="w-5 h-5" />
                កែប្រែ
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white font-khmer-body font-semibold rounded-xl hover:bg-red-700 transition-all active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
                លុប
              </button>
            </div>
          </div>
        )}

        {/* Non-Admin Notice */}
        {!isAdmin && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <p className="font-khmer-body text-xs text-gray-600">
              អ្នកមិនមានសិទ្ធិកែប្រែព័ត៌មានសិស្សទេ • You can only view student information
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Clean Info Row Component
function CleanInfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <span className="font-khmer-body text-xs text-gray-500 flex-shrink-0">
          {label}
        </span>
      </div>
      <span className="font-khmer-body text-sm font-semibold text-gray-900 text-right break-words">
        {value}
      </span>
    </div>
  );
}

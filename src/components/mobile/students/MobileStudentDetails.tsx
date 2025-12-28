"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Copy,
  Check,
  ExternalLink,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized values
  const isAdmin = useMemo(() => currentUser?.role === "ADMIN", [currentUser]);

  useEffect(() => {
    loadStudent();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [studentId]);

  const loadStudent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const data = await studentsApi.getById(studentId);
      setStudent(data);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setError(error.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស");
      }
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!isAdmin || !student) return;

    try {
      await studentsApi.delete(student.id);
      setShowDeleteModal(false);
      router.push("/students");
    } catch (error: any) {
      setError(error.message || "មានបញ្ហាក្នុងការលុបសិស្ស");
      setShowDeleteModal(false);
    }
  }, [isAdmin, student, router]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy");
    } catch {
      return dateString;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Header skeleton */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Content skeleton */}
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {/* Profile skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse mb-4"></div>
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
              <div className="h-8 w-32 bg-gray-900/10 rounded-full animate-pulse mb-3"></div>
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Info cards skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="font-koulen text-2xl text-gray-900 mb-2">
            មានបញ្ហា
          </h2>
          <p className="font-battambang text-gray-600 mb-6 leading-relaxed">
            {error || "រកមិនឃើញសិស្ស"}
          </p>
          <button
            onClick={() => router.back()}
            className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-battambang font-bold rounded-2xl hover:from-gray-900 hover:to-black transition-all active:scale-95 shadow-lg"
          >
            ត្រឡប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Clean Modern Header */}
      <div className="bg-white px-5 pt-6 pb-5 shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-blue-700" />
            </button>
            <div>
              <h1 className="font-koulen text-xl text-gray-900 leading-tight">
                ព័ត៌មានសិស្ស
              </h1>
              <p className="font-battambang text-xs text-gray-500">
                Student Details
              </p>
            </div>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-battambang text-xs text-blue-700 font-semibold">
                មើលប៉ុណ្ណោះ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-5 pb-24 space-y-4 max-w-2xl mx-auto">
        {/* Profile Card - Enhanced Modern Design */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className={`absolute inset-0 rounded-3xl ${
            student.gender === "male"
              ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
              : "bg-gradient-to-br from-pink-500 via-rose-600 to-pink-700"
          }`}></div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          {/* Content */}
          <div className="relative p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-28 h-28 bg-white/20 backdrop-blur-sm border-4 border-white/40 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                <User className="w-14 h-14 text-white" />
              </div>

              {/* Name */}
              <h1 className="font-koulen text-3xl text-white mb-2 leading-tight drop-shadow-lg">
                {student.khmerName ||
                  `${student.firstName} ${student.lastName}`}
              </h1>

              {/* Student ID with Copy */}
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg">
                  <span className="font-mono font-bold text-base text-white">
                    {student.studentId}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(student.studentId, "studentId")}
                  className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 rounded-2xl transition-all active:scale-95 shadow-lg"
                >
                  {copiedField === "studentId" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl font-battambang text-sm font-semibold text-white shadow-lg">
                  {student.gender === "male" ? "ប្រុស • Male" : "ស្រី • Female"}
                </span>
                {student.class && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl font-battambang text-sm font-semibold text-white shadow-lg">
                    {student.class.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid - Modern Sections */}
        <div className="space-y-3">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
              <h3 className="font-koulen text-base text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
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

          {/* Contact Information with Quick Actions */}
          {(student.email ||
            student.phoneNumber ||
            student.phone ||
            student.currentAddress ||
            student.address) && (
            <div className="bg-white rounded-3xl shadow-md border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <h3 className="font-koulen text-base text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  ទំនាក់ទំនង
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {student.email && (
                  <div className="flex items-center justify-between gap-2">
                    <CleanInfoRow
                      label="អ៊ីមែល"
                      value={student.email}
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(student.email!, "email")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                        title="Copy email"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <a
                        href={`mailto:${student.email}`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors active:scale-95"
                        title="Send email"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}
                {(student.phoneNumber || student.phone) && (
                  <div className="flex items-center justify-between gap-2">
                    <CleanInfoRow
                      label="លេខទូរស័ព្ទ"
                      value={student.phoneNumber || student.phone || ""}
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleCopy(
                            student.phoneNumber || student.phone || "",
                            "phone"
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                        title="Copy phone"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <a
                        href={`tel:${student.phoneNumber || student.phone}`}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors active:scale-95"
                        title="Call"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                      </a>
                    </div>
                  </div>
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
          <div className="bg-white rounded-3xl shadow-md border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
              <h3 className="font-koulen text-base text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                ព័ត៌មានសិក្សា
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {student.class ? (
                <>
                  <CleanInfoRow
                    label="ថ្នាក់រៀន"
                    value={student.class.name}
                    icon={<School className="w-4 h-4 text-purple-500" />}
                  />
                  <CleanInfoRow
                    label="កម្រិត"
                    value={`ថ្នាក់ទី${student.class.grade}`}
                    icon={<BookOpen className="w-4 h-4 text-purple-500" />}
                  />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="font-battambang text-sm text-gray-500">
                    សិស្សមិនទាន់ចុះឈ្មោះថ្នាក់
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          {(student.guardianName || student.guardianPhone) && (
            <div className="bg-white rounded-3xl shadow-md border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <h3 className="font-koulen text-base text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
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
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-battambang text-xs font-semibold text-blue-900 mb-0.5">
                    អ្នកមានសិទ្ធិគ្រប់គ្រង
                  </p>
                  <p className="font-battambang text-[10px] text-blue-600">
                    You have admin permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/students/edit/${student.id}`)}
                className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-battambang font-bold rounded-2xl hover:from-gray-900 hover:to-black transition-all active:scale-95 shadow-lg"
              >
                <Edit className="w-5 h-5" />
                កែប្រែ
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-red-600 to-rose-600 text-white font-battambang font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all active:scale-95 shadow-lg"
              >
                <Trash2 className="w-5 h-5" />
                លុប
              </button>
            </div>
          </div>
        )}

        {/* Non-Admin Notice */}
        {!isAdmin && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-battambang text-xs font-semibold text-gray-700 mb-0.5">
                  អ្នកមិនមានសិទ្ធិកែប្រែ
                </p>
                <p className="font-battambang text-[10px] text-gray-500">
                  You can only view student information
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-8 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                  <Trash2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-koulen text-2xl text-white leading-tight drop-shadow-lg">
                  លុបសិស្ស
                </h2>
                <p className="font-battambang text-white/90 text-sm mt-1">Delete Student</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="font-battambang text-gray-700 text-center mb-2">
                តើអ្នកប្រាកដថាចង់លុបសិស្ស
              </p>
              <p className="font-koulen text-xl text-gray-900 text-center mb-2">
                {student?.khmerName ||
                  `${student?.firstName} ${student?.lastName}`}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-6">
                <p className="font-battambang text-sm text-red-700 text-center font-semibold mb-1">
                  ទិន្នន័យនឹងត្រូវលុបជាអចិន្ត្រៃយ៍
                </p>
                <p className="font-battambang text-xs text-red-600 text-center">
                  This action cannot be undone
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-battambang font-bold rounded-2xl transition-all active:scale-95"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-battambang font-bold rounded-2xl transition-all active:scale-95 shadow-lg"
                >
                  លុប
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <span className="font-battambang text-xs text-gray-500 flex-shrink-0 font-medium">
          {label}
        </span>
      </div>
      <span className="font-battambang text-sm font-bold text-gray-900 text-right break-words">
        {value}
      </span>
    </div>
  );
}

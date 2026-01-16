"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Download,
} from "lucide-react";
import {
  adminSecurityApi,
  type SecurityDashboard,
  type TeacherSecurity,
} from "@/lib/api/admin-security";
import ResetPasswordModal from "@/components/admin/modals/ResetPasswordModal";
import ExtendExpirationModal from "@/components/admin/modals/ExtendExpirationModal";
import SuspendAccountModal from "@/components/admin/modals/SuspendAccountModal";

export default function AdminSecurityPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [teachers, setTeachers] = useState<TeacherSecurity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "default" | "expired" | "expiring" | "suspended"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadData();
  }, [currentUser, filter, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, teacherData] = await Promise.all([
        adminSecurityApi.getDashboard(),
        adminSecurityApi.getTeacherList({ page, limit: 20, filter }),
      ]);
      setDashboard(dashboardData);
      setTeachers(teacherData.teachers);
      setTotalPages(teacherData.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Password Security Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Manage teacher password security and compliance
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Teachers"
            value={dashboard.totalTeachers}
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Default Passwords"
            value={dashboard.defaultPasswordCount}
            color="orange"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Expired"
            value={dashboard.expiredCount}
            color="red"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Security Score"
            value={`${dashboard.securityScore}%`}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { value: "all", label: "All" },
              { value: "default", label: "Default" },
              { value: "expiring", label: "Expiring" },
              { value: "expired", label: "Expired" },
              { value: "suspended", label: "Suspended" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers
                .filter((t) => {
                  if (!search) return true;
                  const searchLower = search.toLowerCase();
                  return (
                    t.firstName.toLowerCase().includes(searchLower) ||
                    t.lastName.toLowerCase().includes(searchLower) ||
                    t.email?.toLowerCase().includes(searchLower) ||
                    t.phone?.includes(search) ||
                    t.teacher?.khmerName?.toLowerCase().includes(searchLower)
                  );
                })
                .map((teacher) => (
                  <TeacherRow key={teacher.id} teacher={teacher} onUpdate={loadData} />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "orange" | "red" | "green";
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`inline-flex p-3 bg-gradient-to-br ${colors[color]} rounded-xl mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Teacher Row Component
function TeacherRow({
  teacher,
  onUpdate,
}: {
  teacher: TeacherSecurity;
  onUpdate: () => void;
}) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = () => {
    if (!teacher.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          Suspended
        </span>
      );
    }

    if (!teacher.isDefaultPassword) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Secure
        </span>
      );
    }

    if (teacher.isExpired) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Expired
        </span>
      );
    }

    const colors = {
      danger: "bg-red-100 text-red-800",
      warning: "bg-orange-100 text-orange-800",
      info: "bg-blue-100 text-blue-800",
      none: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[teacher.alertLevel]}`}>
        Default Password
      </span>
    );
  };

  const teacherName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-4">
          <div>
            <p className="font-medium text-gray-900">{teacherName}</p>
            {teacher.teacher?.khmerName && (
              <p className="text-sm text-gray-500">{teacher.teacher.khmerName}</p>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm">
            {teacher.email && <p className="text-gray-900">{teacher.email}</p>}
            {teacher.phone && <p className="text-gray-500">{teacher.phone}</p>}
          </div>
        </td>
        <td className="px-4 py-4">{getStatusBadge()}</td>
        <td className="px-4 py-4">
          {teacher.isDefaultPassword && !teacher.isExpired && (
            <div className="text-sm">
              <p className="text-gray-900 font-medium">
                {teacher.daysRemaining} days, {teacher.hoursRemaining} hours
              </p>
            </div>
          )}
          {teacher.isExpired && <p className="text-sm text-red-600 font-medium">Expired</p>}
        </td>
        <td className="px-4 py-4">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Actions
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setShowResetModal(true);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg"
                >
                  Reset Password
                </button>
                {teacher.isDefaultPassword && teacher.passwordExpiresAt && (
                  <button
                    onClick={() => {
                      setShowExtendModal(true);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Extend Deadline
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSuspendModal(true);
                    setShowActions(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg ${
                    teacher.isActive ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {teacher.isActive ? "Suspend Account" : "Unsuspend Account"}
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Modals */}
      {showResetModal && (
        <ResetPasswordModal
          teacherId={teacher.id}
          teacherName={teacherName}
          onClose={() => setShowResetModal(false)}
          onSuccess={onUpdate}
        />
      )}
      {showExtendModal && teacher.passwordExpiresAt && (
        <ExtendExpirationModal
          teacherId={teacher.id}
          teacherName={teacherName}
          currentExpiresAt={teacher.passwordExpiresAt}
          onClose={() => setShowExtendModal(false)}
          onSuccess={onUpdate}
        />
      )}
      {showSuspendModal && (
        <SuspendAccountModal
          teacherId={teacher.id}
          teacherName={teacherName}
          isSuspended={!teacher.isActive}
          onClose={() => setShowSuspendModal(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}

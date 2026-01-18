"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { adminApi, type AccountStatistics } from "@/lib/api/admin";
import { studentsApi, type Student } from "@/lib/api/students";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Loader2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  Eye,
  Lock,
  Unlock,
  MoreVertical,
  BarChart3,
  Activity,
  Calendar,
  ChevronDown,
  AlertCircle,
  X,
  FileDown
} from "lucide-react";

// Tab type
type TabType = "overview" | "students" | "bulk" | "logs";

// Filter state
interface FilterState {
  search: string;
  grade: string;
  classId: string;
  status: "all" | "active" | "inactive";
  gender: "all" | "male" | "female";
}

export default function EnhancedAccountsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentActions, setShowStudentActions] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    grade: "all",
    classId: "all",
    status: "all",
    gender: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, students]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats] = await Promise.all([
        adminApi.getAccountStatistics(),
      ]);
      setStatistics(stats);
      
      // Load ALL students (not just 1000)
      let allStudents: Student[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const studentsData = await studentsApi.getAllLightweight(page, 500);
        allStudents = [...allStudents, ...(studentsData.data || [])];
        hasMore = studentsData.pagination?.hasMore || false;
        page++;
      }
      
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.khmerName?.toLowerCase().includes(searchLower) ||
        student.englishName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toLowerCase().includes(searchLower)
      );
    }

    // Grade filter
    if (filters.grade !== "all") {
      filtered = filtered.filter(student => student.class?.grade === filters.grade);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(student => {
        const isActive = student.isAccountActive;
        // Treat undefined/null as inactive (no account created yet)
        return filters.status === "active" 
          ? isActive === true 
          : (isActive === false || isActive === undefined || isActive === null);
      });
    }

    // Gender filter
    if (filters.gender !== "all") {
      filtered = filtered.filter(student => student.gender === filters.gender);
    }

    setFilteredStudents(filtered);
  };

  const handleToggleAccountStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      if (currentStatus) {
        // Deactivate
        await adminApi.deactivateByClass(studentId, "Individual deactivation");
      } else {
        // Activate
        await adminApi.activateStudents({ studentIds: [studentId] });
      }
      await loadData();
      setMessage({ 
        type: 'success', 
        text: currentStatus ? 'បានបិទគណនីដោយជោគជ័យ' : 'បានបើកគណនីដោយជោគជ័យ'
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update account status' });
    } finally {
      setActionLoading(false);
      setShowStudentActions(null);
    }
  };

  const handleResetPassword = async (studentId: string) => {
    try {
      setActionLoading(true);
      const result = await adminApi.resetStudentPassword(studentId);
      setMessage({ 
        type: 'success', 
        text: `បានកំណត់ពាក្យសម្ងាត់ថ្មី: ${result.defaultPassword}`
      });
      setShowStudentActions(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const csvData = filteredStudents.map(student => ({
        'Student ID': student.studentId,
        'Khmer Name': student.khmerName,
        'English Name': student.englishName,
        'Gender': student.gender,
        'Class': student.class?.name || '',
        'Grade': student.class?.grade || '',
        'Status': student.isAccountActive ? 'Active' : 'Inactive',
        'Phone': student.phone || '',
      }));

      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_accounts_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'បានទាញយកទិន្នន័យដោយជោគជ័យ' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  const handleDeactivateAll = async () => {
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'សូមបញ្ចូលមូលហេតុ (Please enter reason)' });
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await adminApi.deactivateAllStudents(reason);
      setMessage({ 
        type: 'success', 
        text: `បានបិទគណនី ${result.deactivatedCount} គណនី`
      });
      setReason("");
      setShowConfirm(null);
      await loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to deactivate accounts' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateByGrade = async () => {
    if (!selectedGrade) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើសថ្នាក់' });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'សូមបញ្ចូលមូលហេតុ' });
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await adminApi.deactivateByGrade(selectedGrade, reason);
      setMessage({ 
        type: 'success', 
        text: `បានបិទគណនីថ្នាក់ទី ${selectedGrade} ចំនួន ${result.deactivatedCount} គណនី` 
      });
      setReason("");
      setSelectedGrade("");
      setShowConfirm(null);
      await loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to deactivate by grade' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateAll = async () => {
    try {
      setActionLoading(true);
      const result = await adminApi.activateStudents({ activateAll: true });
      setMessage({ 
        type: 'success', 
        text: `បានបើកគណនី ${result.activatedCount} គណនី`
      });
      setShowConfirm(null);
      await loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to activate accounts' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateByGrade = async () => {
    if (!selectedGrade) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើសថ្នាក់' });
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await adminApi.activateStudents({ grade: selectedGrade });
      setMessage({ 
        type: 'success', 
        text: `បានបើកគណនីថ្នាក់ទី ${selectedGrade} ចំនួន ${result.activatedCount} គណនី` 
      });
      setSelectedGrade("");
      setShowConfirm(null);
      await loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to activate by grade' });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="font-battambang text-gray-600">កំពុងផ្ទុកទិន្នន័យ...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const grades = statistics?.byGrade ? Object.keys(statistics.byGrade).sort((a, b) => Number(a) - Number(b)) : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-indigo-600" />
                  <h1 className="font-moul text-3xl md:text-4xl text-gray-900">គ្រប់គ្រងគណនីសិស្ស</h1>
                </div>
                <p className="font-battambang text-gray-600 md:ml-11">គ្រប់គ្រងការបើក បិទ និងកំណត់គណនីសិស្ស</p>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'កំពុងផ្ទុក...' : 'ផ្ទុកឡើងវិញ'}
              </button>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl shadow-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-battambang ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
                </div>
                <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-4 font-battambang whitespace-nowrap border-b-2 transition-all ${
                    activeTab === "overview"
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>ទិដ្ឋភាពទូទៅ</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("students")}
                  className={`px-6 py-4 font-battambang whitespace-nowrap border-b-2 transition-all ${
                    activeTab === "students"
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>បញ្ជីសិស្ស ({filteredStudents.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("bulk")}
                  className={`px-6 py-4 font-battambang whitespace-nowrap border-b-2 transition-all ${
                    activeTab === "bulk"
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span>សកម្មភាពជាក្រុម</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && statistics && (
            <OverviewTab statistics={statistics} grades={grades} />
          )}

          {activeTab === "students" && (
            <StudentsTab 
              students={filteredStudents}
              filters={filters}
              setFilters={setFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              onExport={handleExportData}
              onToggleStatus={handleToggleAccountStatus}
              onResetPassword={handleResetPassword}
              actionLoading={actionLoading}
              showStudentActions={showStudentActions}
              setShowStudentActions={setShowStudentActions}
            />
          )}

          {activeTab === "bulk" && (
            <BulkActionsTab
              grades={grades}
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              reason={reason}
              setReason={setReason}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
              actionLoading={actionLoading}
              onDeactivateAll={handleDeactivateAll}
              onDeactivateByGrade={handleDeactivateByGrade}
              onActivateAll={handleActivateAll}
              onActivateByGrade={handleActivateByGrade}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ statistics, grades }: { statistics: AccountStatistics; grades: string[] }) {
  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-battambang text-gray-600 text-sm">សិស្សទាំងអស់</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{statistics.overall.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-battambang text-gray-600 text-sm">គណនីសកម្ម</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">{statistics.overall.activeStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <UserX className="w-5 h-5 text-red-600" />
            <h3 className="font-battambang text-gray-600 text-sm">គណនីបិទ</h3>
          </div>
          <p className="text-4xl font-bold text-red-600">{statistics.overall.inactiveStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-battambang text-gray-600 text-sm">អត្រាសកម្ម</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600">{statistics.overall.activationRate}</p>
        </div>
      </div>

      {/* By Grade */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="font-moul text-2xl mb-6 text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          ស្ថិតិតាមថ្នាក់
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {grades.map((grade) => {
            const data = statistics.byGrade[grade];
            const activePercentage = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;
            return (
              <div key={grade} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <h3 className="font-battambang font-semibold text-lg mb-3 text-gray-900">ថ្នាក់ទី {grade}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-battambang text-gray-600">សរុប:</span>
                    <span className="font-bold">{data.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-battambang text-gray-600">សកម្ម:</span>
                    <span className="font-bold text-green-600">{data.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-battambang text-gray-600">បិទ:</span>
                    <span className="font-bold text-red-600">{data.inactive}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ width: `${activePercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-battambang text-xs text-gray-500">អត្រា:</span>
                      <span className="font-bold text-blue-600">{activePercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Students Tab Component
function StudentsTab({ 
  students, 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters,
  onExport,
  onToggleStatus,
  onResetPassword,
  actionLoading,
  showStudentActions,
  setShowStudentActions
}: any) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ស្វែងរកសិស្ស (ឈ្មោះ, លេខសិស្ស)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-battambang"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-battambang transition-all"
          >
            <Filter className="w-5 h-5" />
            <span>តម្រង</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-battambang shadow-lg hover:shadow-xl transition-all"
          >
            <FileDown className="w-5 h-5" />
            <span>ទាញយក</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-battambang text-gray-700 mb-2">ស្ថានភាព</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-xl font-battambang focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">ទាំងអស់</option>
                <option value="active">សកម្ម</option>
                <option value="inactive">បិទ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-battambang text-gray-700 mb-2">ភេទ</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-xl font-battambang focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">ទាំងអស់</option>
                <option value="male">ប្រុស</option>
                <option value="female">ស្រី</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-battambang text-gray-700 mb-2">ថ្នាក់</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl font-battambang focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">ទាំងអស់</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>ថ្នាក់ទី {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-battambang text-gray-700">លេខសិស្ស</th>
                <th className="px-6 py-4 text-left text-sm font-battambang text-gray-700">ឈ្មោះ</th>
                <th className="px-6 py-4 text-left text-sm font-battambang text-gray-700">ភេទ</th>
                <th className="px-6 py-4 text-left text-sm font-battambang text-gray-700">ថ្នាក់</th>
                <th className="px-6 py-4 text-left text-sm font-battambang text-gray-700">ស្ថានភាព</th>
                <th className="px-6 py-4 text-right text-sm font-battambang text-gray-700">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-battambang text-gray-600">មិនមានសិស្សទេ</p>
                  </td>
                </tr>
              ) : (
                students.map((student: Student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-battambang text-gray-900">{student.khmerName}</div>
                        <div className="text-sm text-gray-500">{student.englishName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-battambang">
                      {student.gender === 'male' ? 'ប្រុស' : 'ស្រី'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-battambang">
                      {student.class?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {student.isAccountActive === true ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-battambang">
                          <CheckCircle className="w-3 h-3" />
                          សកម្ម
                        </span>
                      ) : student.isAccountActive === false ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-battambang">
                          <XCircle className="w-3 h-3" />
                          បិទ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-battambang">
                          <AlertCircle className="w-3 h-3" />
                          មិនទាន់កំណត់
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowStudentActions(showStudentActions === student.id ? null : student.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={actionLoading}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        {showStudentActions === student.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                            <div className="py-2">
                              <button
                                onClick={() => onToggleStatus(student.id, student.isAccountActive)}
                                className="w-full px-4 py-2 text-left font-battambang text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                {student.isAccountActive ? (
                                  <>
                                    <Lock className="w-4 h-4 text-red-600" />
                                    <span className="text-red-600">បិទគណនី</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600">បើកគណនី</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => onResetPassword(student.id)}
                                className="w-full px-4 py-2 text-left font-battambang text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                              >
                                <RefreshCw className="w-4 h-4" />
                                កំណត់ពាក្យសម្ងាត់ថ្មី
                              </button>
                              <button
                                onClick={() => window.open(`/students/${student.id}`, '_blank')}
                                className="w-full px-4 py-2 text-left font-battambang text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                                មើលព័ត៌មាន
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Bulk Actions Tab Component
function BulkActionsTab({
  grades,
  selectedGrade,
  setSelectedGrade,
  reason,
  setReason,
  showConfirm,
  setShowConfirm,
  actionLoading,
  onDeactivateAll,
  onDeactivateByGrade,
  onActivateAll,
  onActivateByGrade
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Deactivate Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-red-100">
        <h2 className="font-moul text-2xl mb-6 text-red-700 flex items-center gap-2">
          <Lock className="w-6 h-6" />
          បិទគណនី
        </h2>
        
        {/* Deactivate All */}
        <div className="mb-6 pb-6 border-b border-red-200">
          <h3 className="font-battambang font-semibold mb-3 text-gray-900">បិទគណនីទាំងអស់</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="មូលហេតុនៃការបិទគណនី (ចាំបាច់)"
            className="w-full p-3 border border-red-200 rounded-xl mb-3 font-battambang focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={2}
          />
          {showConfirm === 'deactivate-all' ? (
            <div className="space-y-3">
              <p className="text-red-600 font-battambang text-sm bg-red-50 p-3 rounded-lg border border-red-200">តើអ្នកប្រាកដថាចង់បិទគណនីទាំងអស់?</p>
              <div className="flex gap-2">
                <button
                  onClick={onDeactivateAll}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
                >
                  {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-battambang transition-all"
                >
                  បោះបង់
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('deactivate-all')}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
            >
              បិទគណនីទាំងអស់
            </button>
          )}
        </div>

        {/* Deactivate by Grade */}
        <div>
          <h3 className="font-battambang font-semibold mb-3 text-gray-900">បិទគណនីតាមថ្នាក់</h3>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full p-3 border border-red-200 rounded-xl mb-2 font-battambang focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">ជ្រើសរើសថ្នាក់</option>
            {grades.map((grade: string) => (
              <option key={grade} value={grade}>ថ្នាក់ទី {grade}</option>
            ))}
          </select>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="មូលហេតុនៃការបិទគណនី (ចាំបាច់)"
            className="w-full p-3 border border-red-200 rounded-xl mb-3 font-battambang focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={2}
          />
          {showConfirm === 'deactivate-grade' ? (
            <div className="space-y-3">
              <p className="text-red-600 font-battambang text-sm bg-red-50 p-3 rounded-lg border border-red-200">បិទគណនីថ្នាក់ទី {selectedGrade}?</p>
              <div className="flex gap-2">
                <button
                  onClick={onDeactivateByGrade}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
                >
                  {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-battambang transition-all"
                >
                  បោះបង់
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('deactivate-grade')}
              disabled={actionLoading || !selectedGrade}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
            >
              បិទគណនីតាមថ្នាក់
            </button>
          )}
        </div>
      </div>

      {/* Activate Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
        <h2 className="font-moul text-2xl mb-6 text-green-700 flex items-center gap-2">
          <Unlock className="w-6 h-6" />
          បើកគណនី
        </h2>
        
        {/* Activate All */}
        <div className="mb-6 pb-6 border-b border-green-200">
          <h3 className="font-battambang font-semibold mb-3 text-gray-900">បើកគណនីទាំងអស់</h3>
          {showConfirm === 'activate-all' ? (
            <div className="space-y-3">
              <p className="text-green-600 font-battambang text-sm bg-green-50 p-3 rounded-lg border border-green-200">តើអ្នកចង់បើកគណនីទាំងអស់?</p>
              <div className="flex gap-2">
                <button
                  onClick={onActivateAll}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
                >
                  {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-battambang transition-all"
                >
                  បោះបង់
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('activate-all')}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
            >
              បើកគណនីទាំងអស់
            </button>
          )}
        </div>

        {/* Activate by Grade */}
        <div>
          <h3 className="font-battambang font-semibold mb-3 text-gray-900">បើកគណនីតាមថ្នាក់</h3>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full p-3 border border-green-200 rounded-xl mb-3 font-battambang focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">ជ្រើសរើសថ្នាក់</option>
            {grades.map((grade: string) => (
              <option key={grade} value={grade}>ថ្នាក់ទី {grade}</option>
            ))}
          </select>
          {showConfirm === 'activate-grade' ? (
            <div className="space-y-3">
              <p className="text-green-600 font-battambang text-sm bg-green-50 p-3 rounded-lg border border-green-200">បើកគណនីថ្នាក់ទី {selectedGrade}?</p>
              <div className="flex gap-2">
                <button
                  onClick={onActivateByGrade}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
                >
                  {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-battambang transition-all"
                >
                  បោះបង់
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('activate-grade')}
              disabled={actionLoading || !selectedGrade}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all"
            >
              បើកគណនីតាមថ្នាក់
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

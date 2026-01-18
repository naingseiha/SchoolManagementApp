"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { teachersApi, Teacher } from "@/lib/api/teachers";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Loader2, Shield, RefreshCw, Users, Key, UserPlus, Search, 
  Filter, CheckCircle, XCircle, Mail, Phone, UserCog, Lock, Unlock 
} from "lucide-react";

export default function AdminTeachersPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (error: any) {
      console.error("Failed to load teachers:", error);
      setMessage({ type: 'error', text: 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យគ្រូបង្រៀន' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedTeacher) return;
    
    try {
      setActionLoading(true);
      // TODO: Implement API call
      setMessage({ 
        type: 'success', 
        text: `បានបង្កើតគណនីសម្រាប់ ${selectedTeacher.firstName} ${selectedTeacher.lastName}` 
      });
      setShowAccountModal(false);
      setSelectedTeacher(null);
      await loadTeachers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការបង្កើតគណនី' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedTeacher) return;
    
    try {
      setActionLoading(true);
      // TODO: Implement API call
      setMessage({ 
        type: 'success', 
        text: `បានកំណត់ពាក្យសម្ងាត់ឡើងវិញសម្រាប់ ${selectedTeacher.firstName} ${selectedTeacher.lastName}` 
      });
      setShowPasswordModal(false);
      setSelectedTeacher(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការកំណត់ពាក្យសម្ងាត់ឡើងវិញ' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedTeacher) return;
    
    try {
      setActionLoading(true);
      // TODO: Implement API call
      const action = statusAction === 'activate' ? 'បើក' : 'បិទ';
      setMessage({ 
        type: 'success', 
        text: `បាន${action}គណនីរបស់ ${selectedTeacher.firstName} ${selectedTeacher.lastName}` 
      });
      setShowStatusModal(false);
      setSelectedTeacher(null);
      await loadTeachers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការកែប្រែស្ថានភាព' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === "" || 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "" || 
      (filterStatus === "active" && teacher.user?.isActive) ||
      (filterStatus === "inactive" && teacher.user && !teacher.user.isActive) ||
      (filterStatus === "no-account" && !teacher.user);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: teachers.length,
    withAccount: teachers.filter(t => t.user).length,
    active: teachers.filter(t => t.user?.isActive).length,
    inactive: teachers.filter(t => t.user && !t.user.isActive).length,
  };

  if (authLoading || !currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                <p className="font-khmer-body text-gray-600">កំពុងផ្ទុកទិន្នន័យ...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-green-600" />
                  <h1 className="font-khmer-title text-4xl text-gray-900">គ្រប់គ្រងគ្រូបង្រៀន</h1>
                </div>
                <p className="font-khmer-body text-gray-600 ml-11">គ្រប់គ្រងគណនី និងសិទ្ធិគ្រូបង្រៀន</p>
              </div>
              <button
                onClick={loadTeachers}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'កំពុងផ្ទុក...' : 'ផ្ទុកឡើងវិញ'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl shadow-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <p className="font-khmer-body whitespace-pre-line">{message.text}</p>
              </div>
              <button onClick={() => setMessage(null)} className="text-sm underline mt-2 font-khmer-body">បិទ</button>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <h3 className="font-khmer-body text-gray-600 text-sm mb-2">គ្រូបង្រៀនទាំងអស់</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
              <h3 className="font-khmer-body text-gray-600 text-sm mb-2">មានគណនី</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.withAccount}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-green-100">
              <h3 className="font-khmer-body text-gray-600 text-sm mb-2">គណនីសកម្ម</h3>
              <p className="text-4xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-red-100">
              <h3 className="font-khmer-body text-gray-600 text-sm mb-2">គណនីបិទ</h3>
              <p className="text-4xl font-bold text-red-600">{stats.inactive}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-khmer-body font-semibold text-gray-900">ការស្វែងរក និងតម្រង</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl font-khmer-body focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">ស្ថានភាពទាំងអស់</option>
                <option value="active">គណនីសកម្ម</option>
                <option value="inactive">គណនីបិទ</option>
                <option value="no-account">គ្មានគណនី</option>
              </select>
            </div>
          </div>

          {/* Teachers List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">ឈ្មោះ</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">ទំនាក់ទំនង</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">មុខវិជ្ជា</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">គណនី</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">ស្ថានភាព</th>
                    <th className="px-6 py-4 text-right font-khmer-body text-sm font-bold text-gray-700">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </div>
                          <div>
                            <p className="font-khmer-body font-medium text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-khmer-body">{teacher.gender === 'MALE' ? 'ប្រុស' : 'ស្រី'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {teacher.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{teacher.email}</span>
                            </div>
                          )}
                          {teacher.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{teacher.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-khmer-body text-gray-700">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs border border-green-200">
                                {subject.nameKh || subject.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-khmer-body ${
                          teacher.user ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {teacher.user ? '✓ មានគណនី' : '✕ គ្មានគណនី'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.user && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-khmer-body ${
                            teacher.user.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {teacher.user.isActive ? '✓ សកម្ម' : '✕ បិទ'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {!teacher.user && (
                            <button
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setShowAccountModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="បង្កើតគណនី"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {teacher.user && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  setShowPasswordModal(true);
                                }}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="កំណត់ពាក្យសម្ងាត់ឡើងវិញ"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  setStatusAction(teacher.user!.isActive ? 'deactivate' : 'activate');
                                  setShowStatusModal(true);
                                }}
                                className={`p-2 ${teacher.user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} rounded-lg transition-colors`}
                                title={teacher.user.isActive ? 'បិទគណនី' : 'បើកគណនី'}
                              >
                                {teacher.user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeachers.length === 0 && (
                <div className="text-center py-16 font-khmer-body text-gray-500 bg-gray-50">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>មិនមានទិន្នន័យគ្រូបង្រៀន</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Account Modal */}
      {showAccountModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">បង្កើតគណនីគ្រូបង្រៀន</h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              តើអ្នកចង់បង្កើតគណនីសម្រាប់គ្រូ <span className="font-semibold">{selectedTeacher.firstName} {selectedTeacher.lastName}</span>?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-khmer-body">អ៊ីមែល:</span>
                <span className="font-medium">{selectedTeacher.email || 'មិនមាន'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-khmer-body">ពាក្យសម្ងាត់ដំបូង:</span>
                <span className="font-mono font-bold text-green-600">លេខទូរស័ព្ទ</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateAccount}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
              >
                {actionLoading ? 'កំពុងបង្កើត...' : 'បង្កើតគណនី'}
              </button>
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setSelectedTeacher(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">កំណត់ពាក្យសម្ងាត់ឡើងវិញ</h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              តើអ្នកចង់កំណត់ពាក្យសម្ងាត់ឡើងវិញសម្រាប់គ្រូ <span className="font-semibold">{selectedTeacher.firstName} {selectedTeacher.lastName}</span>?
            </p>
            <p className="text-sm text-gray-600 font-khmer-body mb-4 bg-orange-50 p-3 rounded-lg border border-orange-200">
              ពាក្យសម្ងាត់ថ្មីនឹងត្រឡប់ទៅជាលេខទូរស័ព្ទរបស់គ្រូ
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
              >
                {actionLoading ? 'កំពុងកំណត់...' : 'កំណត់ឡើងវិញ'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedTeacher(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {showStatusModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">
              {statusAction === 'activate' ? 'បើកគណនី' : 'បិទគណនី'}
            </h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              តើអ្នកចង់{statusAction === 'activate' ? 'បើក' : 'បិទ'}គណនីរបស់គ្រូ <span className="font-semibold">{selectedTeacher.firstName} {selectedTeacher.lastName}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex-1 px-4 py-3 text-white rounded-xl disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all ${
                  statusAction === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedTeacher(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { studentsApi, Student } from "@/lib/api/students";
import { adminApi } from "@/lib/api/admin";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Loader2, UserCog, RefreshCw, Shield, Crown, Star, Users, Key, UserPlus, Search, Filter, CheckCircle, XCircle } from "lucide-react";

const STUDENT_ROLES = {
  GENERAL: { label: "សិស្សធម្មតា", icon: Users, color: "gray" },
  CLASS_LEADER: { label: "ប្រធានថ្នាក់", icon: Crown, color: "yellow" },
  VICE_LEADER_1: { label: "អនុប្រធានទី១", icon: Star, color: "blue" },
  VICE_LEADER_2: { label: "អនុប្រធានទី២", icon: Star, color: "purple" },
};

export default function AdminStudentsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error: any) {
      console.error("Failed to load students:", error);
      setMessage({ type: 'error', text: 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedStudent || !selectedRole) return;
    
    try {
      setActionLoading(true);
      await adminApi.updateStudentRole(selectedStudent.id, selectedRole);
      setMessage({ 
        type: 'success', 
        text: `បានកែប្រែតួនាទីរបស់ ${selectedStudent.firstName} ${selectedStudent.lastName} ជាជោគជ័យ` 
      });
      setShowRoleModal(false);
      setSelectedStudent(null);
      setSelectedRole("");
      await loadStudents();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការកែប្រែតួនាទី' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedStudent) return;
    
    try {
      setActionLoading(true);
      const result = await adminApi.createStudentAccount(selectedStudent.id);
      setMessage({ 
        type: 'success', 
        text: `បានបង្កើតគណនីសម្រាប់ ${selectedStudent.firstName} ${selectedStudent.lastName}\nលេខកូដ: ${result.studentCode}\nពាក្យសម្ងាត់: ${result.defaultPassword}` 
      });
      setShowAccountModal(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការបង្កើតគណនី' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;
    
    try {
      setActionLoading(true);
      const result = await adminApi.resetStudentPassword(selectedStudent.id);
      setMessage({ 
        type: 'success', 
        text: `បានកំណត់ពាក្យសម្ងាត់ឡើងវិញសម្រាប់ ${selectedStudent.firstName} ${selectedStudent.lastName}\nពាក្យសម្ងាត់ថ្មី: ${result.defaultPassword}` 
      });
      setShowPasswordModal(false);
      setSelectedStudent(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'មានបញ្ហាក្នុងការកំណត់ពាក្យសម្ងាត់ឡើងវិញ' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === "" || student.class?.grade.toString() === filterGrade;
    const matchesRole = filterRole === "" || student.studentRole === filterRole;
    
    return matchesSearch && matchesGrade && matchesRole;
  });

  const grades = Array.from(new Set(students.map(s => s.class?.grade).filter(Boolean))).sort();

  if (authLoading || !currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto min-h-0 p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="font-khmer-body text-gray-600">កំពុងផ្ទុកទិន្នន័យ...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto min-h-0 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <UserCog className="w-8 h-8 text-indigo-600" />
                  <h1 className="font-khmer-title text-4xl text-gray-900">គ្រប់គ្រងសិស្ស</h1>
                </div>
                <p className="font-khmer-body text-gray-600 ml-11">គ្រប់គ្រងគណនី តួនាទី និងសិទ្ធិសិស្ស</p>
              </div>
              <button
                onClick={loadStudents}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
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

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-khmer-body font-semibold text-gray-900">ការស្វែងរក និងតម្រង</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខកូដ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl font-khmer-body focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">ថ្នាក់ទាំងអស់</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>ថ្នាក់ទី {grade}</option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">តួនាទីទាំងអស់</option>
                {Object.entries(STUDENT_ROLES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {Object.entries(STUDENT_ROLES).map(([key, value]) => {
              const count = students.filter(s => s.studentRole === key).length;
              const Icon = value.icon;
              return (
                <div key={key} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="font-khmer-body text-sm text-gray-600 mb-1">{value.label}</h3>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Students List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">លេខកូដ</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">ឈ្មោះ</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">ថ្នាក់</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">តួនាទី</th>
                    <th className="px-6 py-4 text-left font-khmer-body text-sm font-bold text-gray-700">គណនី</th>
                    <th className="px-6 py-4 text-right font-khmer-body text-sm font-bold text-gray-700">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => {
                    const roleData = STUDENT_ROLES[student.studentRole as keyof typeof STUDENT_ROLES] || STUDENT_ROLES.GENERAL;
                    const Icon = roleData.icon;
                    
                    return (
                      <tr key={student.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{student.studentId}</td>
                        <td className="px-6 py-4 font-khmer-body font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                        <td className="px-6 py-4 font-khmer-body text-gray-700">{student.class?.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-khmer-body bg-gray-100 text-gray-800 border border-gray-200">
                            <Icon className="w-3 h-3" />
                            {roleData.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-khmer-body ${student.user ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            {student.user ? '✓ មានគណនី' : '✕ គ្មានគណនី'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedRole(student.studentRole || 'GENERAL');
                                setShowRoleModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="កែប្រែតួនាទី"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            {!student.user && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowAccountModal(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="បង្កើតគណនី"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                            {student.user && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowPasswordModal(true);
                                }}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="កំណត់ពាក្យសម្ងាត់ឡើងវិញ"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-16 font-khmer-body text-gray-500 bg-gray-50">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>មិនមានទិន្នន័យសិស្ស</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">កែប្រែតួនាទីសិស្ស</h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              សិស្ស: <span className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</span>
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 font-khmer-body focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Object.entries(STUDENT_ROLES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateRole}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
              >
                {actionLoading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedStudent(null);
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

      {/* Account Modal */}
      {showAccountModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">បង្កើតគណនីសិស្ស</h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              តើអ្នកចង់បង្កើតគណនីសម្រាប់សិស្ស <span className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</span>?
            </p>
            <p className="text-sm text-gray-600 font-khmer-body mb-4 bg-gray-50 p-3 rounded-lg">
              ពាក្យសម្ងាត់ដំបូងនឹងជាលេខកូដសិស្ស: <span className="font-mono font-bold">{selectedStudent.studentId}</span>
            </p>
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
                  setSelectedStudent(null);
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
      {showPasswordModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-khmer-title text-2xl mb-4 text-gray-900">កំណត់ពាក្យសម្ងាត់ឡើងវិញ</h2>
            <p className="font-khmer-body mb-4 text-gray-700">
              តើអ្នកចង់កំណត់ពាក្យសម្ងាត់ឡើងវិញសម្រាប់សិស្ស <span className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</span>?
            </p>
            <p className="text-sm text-gray-600 font-khmer-body mb-4 bg-gray-50 p-3 rounded-lg">
              ពាក្យសម្ងាត់ថ្មីនឹងជាលេខកូដសិស្ស: <span className="font-mono font-bold">{selectedStudent.studentId}</span>
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
                  setSelectedStudent(null);
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

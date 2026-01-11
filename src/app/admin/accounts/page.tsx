"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { adminApi, type AccountStatistics } from "@/lib/api/admin";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Loader2, Shield, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function AdminAccountsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAccountStatistics();
      setStatistics(data);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to load statistics' });
    } finally {
      setLoading(false);
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
        text: `បានបិទគណនី ${result.deactivatedCount} គណនី (Deactivated ${result.deactivatedCount} accounts)` 
      });
      setReason("");
      setShowConfirm(null);
      await loadStatistics();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to deactivate accounts' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateByGrade = async () => {
    if (!selectedGrade) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើសថ្នាក់ (Please select grade)' });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'សូមបញ្ចូលមូលហេតុ (Please enter reason)' });
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
      await loadStatistics();
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
        text: `បានបើកគណនី ${result.activatedCount} គណនី (Activated ${result.activatedCount} accounts)` 
      });
      setShowConfirm(null);
      await loadStatistics();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to activate accounts' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateByGrade = async () => {
    if (!selectedGrade) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើសថ្នាក់ (Please select grade)' });
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
      await loadStatistics();
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
                <p className="font-khmer-body text-gray-600">កំពុងផ្ទុកទិន្នន័យ...</p>
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
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-indigo-600" />
                  <h1 className="font-khmer-title text-4xl text-gray-900">គ្រប់គ្រងគណនីសិស្ស</h1>
                </div>
                <p className="font-khmer-body text-gray-600 ml-11">គ្រប់គ្រងការបើក និងបិទគណនីសិស្ស</p>
              </div>
              <button
                onClick={loadStatistics}
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
                <p className="font-khmer-body">{message.text}</p>
              </div>
              <button onClick={() => setMessage(null)} className="text-sm underline mt-2 font-khmer-body">បិទ</button>
            </div>
          )}

          {/* Statistics Overview */}
          {statistics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <h3 className="font-khmer-body text-gray-600 text-sm mb-2">សិស្សទាំងអស់</h3>
                  <p className="text-4xl font-bold text-gray-900">{statistics.overall.totalStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-green-100">
                  <h3 className="font-khmer-body text-gray-600 text-sm mb-2">គណនីសកម្ម</h3>
                  <p className="text-4xl font-bold text-green-600">{statistics.overall.activeStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-red-100">
                  <h3 className="font-khmer-body text-gray-600 text-sm mb-2">គណនីបិទ</h3>
                  <p className="text-4xl font-bold text-red-600">{statistics.overall.inactiveStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
                  <h3 className="font-khmer-body text-gray-600 text-sm mb-2">អត្រាសកម្ម</h3>
                  <p className="text-4xl font-bold text-blue-600">{statistics.overall.activationRate}</p>
                </div>
              </div>

              {/* By Grade */}
              <div className="bg-white rounded-2xl shadow-lg mb-8 p-6 border border-gray-100">
                <h2 className="font-khmer-title text-2xl mb-6 text-gray-900">ស្ថិតិតាមថ្នាក់</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {grades.map((grade) => {
                    const data = statistics.byGrade[grade];
                    const activePercentage = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;
                    return (
                      <div key={grade} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <h3 className="font-khmer-body font-semibold text-lg mb-3 text-gray-900">ថ្នាក់ទី {grade}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-khmer-body text-gray-600">សរុប:</span>
                            <span className="font-bold">{data.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-khmer-body text-gray-600">សកម្ម:</span>
                            <span className="font-bold text-green-600">{data.active}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-khmer-body text-gray-600">បិទ:</span>
                            <span className="font-bold text-red-600">{data.inactive}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-khmer-body text-xs text-gray-500">អត្រា:</span>
                              <span className="font-bold text-blue-600">{activePercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deactivate Section */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-red-100">
                  <h2 className="font-khmer-title text-2xl mb-6 text-red-700">បិទគណនី</h2>
                  
                  {/* Deactivate All */}
                  <div className="mb-6 pb-6 border-b border-red-200">
                    <h3 className="font-khmer-body font-semibold mb-3 text-gray-900">បិទគណនីទាំងអស់</h3>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="មូលហេតុនៃការបិទគណនី (ចាំបាច់)"
                      className="w-full p-3 border border-red-200 rounded-xl mb-3 font-khmer-body focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={2}
                    />
                    {showConfirm === 'deactivate-all' ? (
                      <div className="space-y-3">
                        <p className="text-red-600 font-khmer-body text-sm bg-red-50 p-3 rounded-lg border border-red-200">តើអ្នកប្រាកដថាចង់បិទគណនីទាំងអស់?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeactivateAll}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                          >
                            {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
                          >
                            បោះបង់
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirm('deactivate-all')}
                        disabled={actionLoading}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                      >
                        បិទគណនីទាំងអស់
                      </button>
                    )}
                  </div>

                  {/* Deactivate by Grade */}
                  <div>
                    <h3 className="font-khmer-body font-semibold mb-3 text-gray-900">បិទគណនីតាមថ្នាក់</h3>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full p-3 border border-red-200 rounded-xl mb-2 font-khmer-body focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">ជ្រើសរើសថ្នាក់</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>ថ្នាក់ទី {grade}</option>
                      ))}
                    </select>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="មូលហេតុនៃការបិទគណនី (ចាំបាច់)"
                      className="w-full p-3 border border-red-200 rounded-xl mb-3 font-khmer-body focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={2}
                    />
                    {showConfirm === 'deactivate-grade' ? (
                      <div className="space-y-3">
                        <p className="text-red-600 font-khmer-body text-sm bg-red-50 p-3 rounded-lg border border-red-200">បិទគណនីថ្នាក់ទី {selectedGrade}?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeactivateByGrade}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                          >
                            {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
                          >
                            បោះបង់
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirm('deactivate-grade')}
                        disabled={actionLoading || !selectedGrade}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                      >
                        បិទគណនីតាមថ្នាក់
                      </button>
                    )}
                  </div>
                </div>

                {/* Activate Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
                  <h2 className="font-khmer-title text-2xl mb-6 text-green-700">បើកគណនី</h2>
                  
                  {/* Activate All */}
                  <div className="mb-6 pb-6 border-b border-green-200">
                    <h3 className="font-khmer-body font-semibold mb-3 text-gray-900">បើកគណនីទាំងអស់</h3>
                    {showConfirm === 'activate-all' ? (
                      <div className="space-y-3">
                        <p className="text-green-600 font-khmer-body text-sm bg-green-50 p-3 rounded-lg border border-green-200">តើអ្នកចង់បើកគណនីទាំងអស់?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleActivateAll}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                          >
                            {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
                          >
                            បោះបង់
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirm('activate-all')}
                        disabled={actionLoading}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                      >
                        បើកគណនីទាំងអស់
                      </button>
                    )}
                  </div>

                  {/* Activate by Grade */}
                  <div>
                    <h3 className="font-khmer-body font-semibold mb-3 text-gray-900">បើកគណនីតាមថ្នាក់</h3>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full p-3 border border-green-200 rounded-xl mb-3 font-khmer-body focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">ជ្រើសរើសថ្នាក់</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>ថ្នាក់ទី {grade}</option>
                      ))}
                    </select>
                    {showConfirm === 'activate-grade' ? (
                      <div className="space-y-3">
                        <p className="text-green-600 font-khmer-body text-sm bg-green-50 p-3 rounded-lg border border-green-200">បើកគណនីថ្នាក់ទី {selectedGrade}?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleActivateByGrade}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                          >
                            {actionLoading ? 'កំពុងដំណើរការ...' : 'បាទ/ចាស ប្រាកដ'}
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-khmer-body transition-all"
                          >
                            បោះបង់
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirm('activate-grade')}
                        disabled={actionLoading || !selectedGrade}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-khmer-body shadow-lg hover:shadow-xl transition-all"
                      >
                        បើកគណនីតាមថ្នាក់
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 font-khmer-body text-red-600 bg-red-50 rounded-2xl border border-red-200">
              មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

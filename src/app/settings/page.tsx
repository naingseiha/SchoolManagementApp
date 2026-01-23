"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import { 
  Shield, 
  UserCog, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Activity,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  Bell,
  Database,
  Server,
  Zap
} from "lucide-react";
import { adminSecurityApi } from "@/lib/api/admin-security";
import { adminApi } from "@/lib/api/admin";

interface SettingsCard {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  gradient: string;
  href: string;
  count?: number;
  countLabel?: string;
  alertLevel?: "success" | "warning" | "danger";
  badge?: string;
  description?: string;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  color: string;
  disabled?: boolean;
}

interface SystemStats {
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  recentActivity: number;
}

export default function SettingsPage() {
  const { isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const deviceType = useDeviceType();
  const [stats, setStats] = useState<any>(null);
  const [accountStats, setAccountStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (currentUser?.role === "ADMIN") {
      loadAllStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, currentUser]);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [dashboard, accounts] = await Promise.all([
        adminSecurityApi.getDashboard(),
        adminApi.getAccountStatistics().catch(() => null)
      ]);
      setStats(dashboard);
      setAccountStats(accounts);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-battambang text-lg">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  const settingsCards: SettingsCard[] = [
    {
      id: "students",
      title: "គ្រប់គ្រងសិស្ស",
      subtitle: "Student Account Control",
      description: "គ្រប់គ្រងគណនីសិស្ស បើក/បិទគណនី កំណត់សិទ្ធិ",
      icon: UserCog,
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      href: "/admin/accounts",
      count: accountStats?.overall?.totalStudents || stats?.totalStudents || 0,
      countLabel: "សិស្ស",
      badge: accountStats?.overall?.activeStudents 
        ? `${accountStats.overall.activeStudents} សកម្ម` 
        : undefined,
    },
    {
      id: "teachers",
      title: "គ្រប់គ្រងគ្រូបង្រៀន",
      subtitle: "Teacher Account Control",
      description: "គ្រប់គ្រងគណនីគ្រូបង្រៀន សុវត្ថិភាព និងសិទ្ធិ",
      icon: Shield,
      gradient: "from-green-500 via-green-600 to-emerald-600",
      href: "/admin/teachers",
      count: stats?.totalTeachers || 0,
      countLabel: "គ្រូបង្រៀន",
      badge: stats?.activeTeachers 
        ? `${stats.activeTeachers} សកម្ម` 
        : undefined,
    },
    {
      id: "parents",
      title: "គ្រប់គ្រងឪពុកម្តាយ",
      subtitle: "Parent Account Control",
      description: "គ្រប់គ្រងគណនីឪពុកម្តាយ ភ្ជាប់កូន និងសិទ្ធិ",
      icon: Users,
      gradient: "from-pink-500 via-rose-600 to-purple-600",
      href: "/admin/parents",
      count: stats?.totalParents || 0,
      countLabel: "ឪពុកម្តាយ",
      badge: stats?.activeParents 
        ? `${stats.activeParents} សកម្ម` 
        : undefined,
    },
    {
      id: "security",
      title: "សុវត្ថិភាពប្រព័ន្ធ",
      subtitle: "System Security Dashboard",
      description: "ត្រួតពិនិត្យសុវត្ថិភាព ពាក្យសម្ងាត់ និងគណនី",
      icon: ShieldCheck,
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      href: "/admin/security",
      count: stats?.defaultPasswordCount || 0,
      countLabel: "ការជូនដំណឹង",
      alertLevel:
        stats?.defaultPasswordCount > 5
          ? "danger"
          : stats?.defaultPasswordCount > 0
          ? "warning"
          : "success",
      badge: stats?.suspendedAccounts 
        ? `${stats.suspendedAccounts} ផ្អាក` 
        : undefined,
    },
  ];

  // Mobile Layout
  if (deviceType === "mobile") {
    return (
      <MobileLayout>
        <SettingsContent 
          cards={settingsCards} 
          loading={loading} 
          refreshing={refreshing}
          isAdmin={currentUser?.role === "ADMIN"} 
          stats={stats}
          accountStats={accountStats}
          onRefresh={handleRefresh}
          router={router}
        />
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto min-h-0">
          <SettingsContent 
            cards={settingsCards} 
            loading={loading} 
            refreshing={refreshing}
            isAdmin={currentUser?.role === "ADMIN"} 
            stats={stats}
            accountStats={accountStats}
            onRefresh={handleRefresh}
            router={router}
          />
        </main>
      </div>
    </div>
  );
}

function SettingsContent({
  cards,
  loading,
  refreshing,
  isAdmin,
  stats,
  accountStats,
  onRefresh,
  router,
}: {
  cards: SettingsCard[];
  loading: boolean;
  refreshing: boolean;
  isAdmin: boolean;
  stats: any;
  accountStats: any;
  onRefresh: () => void;
  router: any;
}) {
  // Calculate system statistics
  const totalAccounts = (stats?.totalStudents || 0) + (stats?.totalTeachers || 0);
  const activeAccounts = (accountStats?.overall?.activeStudents || 0) + (stats?.activeTeachers || 0);
  const suspendedAccounts = stats?.suspendedAccounts || 0;
  const securityAlerts = stats?.defaultPasswordCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-4 md:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-moul text-gray-900 mb-1">
                ការកំណត់ប្រព័ន្ធ
              </h1>
              <p className="text-gray-600 font-battambang flex items-center gap-2">
                <Activity className="w-4 h-4" />
                គ្រប់គ្រងគណនី សុវត្ថិភាព និងការកំណត់
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-battambang shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'កំពុងផ្ទុក...' : 'ផ្ទុកឡើងវិញ'}
          </button>
        </div>
      </div>

      {/* System Overview Stats */}
      {isAdmin && !loading && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-1">
            <div className="bg-white rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-gray-600 font-battambang">សិស្សសរុប</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{accountStats?.overall?.totalStudents || stats?.totalStudents || 0}</p>
                  <p className="text-xs text-gray-500 mt-1 font-battambang">Total Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600 font-battambang">សិស្សសកម្ម</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{accountStats?.overall?.activeStudents || 0}</p>
                  <p className="text-xs text-gray-500 mt-1 font-battambang">Active Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-gray-600 font-battambang">គ្រូបង្រៀន</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.totalTeachers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1 font-battambang">Total Teachers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-gray-600 font-battambang">ការជូនដំណឹង</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{securityAlerts}</p>
                  <p className="text-xs text-gray-500 mt-1 font-battambang">Security Alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Settings Cards */}
      {isAdmin && (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900 font-battambang">
                ការគ្រប់គ្រងគណនី
              </h2>
            </div>
            <p className="text-sm text-gray-600 font-battambang">
              គ្រប់គ្រងគណនីសិស្ស គ្រូបង្រៀន និងសុវត្ថិភាពប្រព័ន្ធ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cards.map((card) => (
              <EnhancedSettingsCard 
                key={card.id} 
                card={card} 
                loading={loading} 
                onClick={() => router.push(card.href)} 
              />
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900 font-battambang">
                សកម្មភាពរហ័ស
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="មើលគណនីសិស្ស"
                subtitle="Student Accounts"
                icon={Eye}
                color="blue"
                onClick={() => router.push('/admin/accounts')}
              />
              <QuickActionCard
                title="សុវត្ថិភាព"
                subtitle="Security Dashboard"
                icon={ShieldCheck}
                color="purple"
                onClick={() => router.push('/admin/security')}
              />
              <QuickActionCard
                title="រៀបចំគ្រូបង្រៀន"
                subtitle="Teacher Settings"
                icon={UserCog}
                color="green"
                onClick={() => router.push('/admin/teachers')}
              />
              <QuickActionCard
                title="របាយការណ៍"
                subtitle="View Reports"
                icon={BarChart3}
                color="orange"
                onClick={() => router.push('/admin/students')}
              />
            </div>
          </div>
        </>
      )}

      {/* General Settings Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900 font-battambang">
            ព័ត៌មានប្រព័ន្ធ
          </h2>
        </div>
        <p className="text-sm text-gray-600 font-battambang">
          ស្ថានភាព និងព័ត៌មានលម្អិតប្រព័ន្ធ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-battambang">
                ព័ត៌មានប្រព័ន្ធ
              </h3>
              <p className="text-sm text-gray-600 mb-4">System Information</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-battambang">កំណែ:</span>
                  <span className="font-medium text-gray-900">v2.5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-battambang">ឆ្នាំសិក្សា:</span>
                  <span className="font-medium text-gray-900">
                    {new Date().getFullYear()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-battambang">ប្រភេទ:</span>
                  <span className="font-medium text-gray-900">Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-battambang">
                ស្ថានភាពប្រព័ន្ធ
              </h3>
              <p className="text-sm text-gray-600 mb-4">System Status</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-battambang text-gray-700">Database</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-battambang text-gray-700">API</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-battambang text-gray-700">Server</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Monitor */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-battambang">
                សកម្មភាពថ្មី
              </h3>
              <p className="text-sm text-gray-600 mb-4">Recent Activity</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-battambang">ថ្ងៃនេះ</span>
                  <span className="font-bold text-blue-600">{stats?.todayActivity || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-battambang">ការជូនដំណឹង</span>
                  <span className="font-bold text-orange-600">{securityAlerts}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-battambang">អ្នកប្រើប្រាស់</span>
                  <span className="font-bold text-green-600">{activeAccounts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhancedSettingsCard({
  card,
  loading,
  onClick,
}: {
  card: SettingsCard;
  loading: boolean;
  onClick: () => void;
}) {
  const Icon = card.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden transform hover:-translate-y-2 hover:scale-105"
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
      
      <div className="p-6">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          {card.badge && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full font-battambang">
              {card.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 font-battambang">
          {card.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{card.subtitle}</p>
        {card.description && (
          <p className="text-xs text-gray-500 mb-4 font-battambang">{card.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div>
              {card.count !== undefined && (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.count}
                  </span>
                  <span className="text-sm text-gray-600 font-battambang">
                    {card.countLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Alert Badge */}
          {card.alertLevel && card.count !== undefined && card.count > 0 && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                card.alertLevel === "danger"
                  ? "bg-red-100 text-red-600"
                  : card.alertLevel === "warning"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {card.alertLevel === "danger" ? (
                <AlertTriangle className="w-3 h-3" />
              ) : card.alertLevel === "warning" ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {card.alertLevel === "danger"
                ? "ចាំបាច់"
                : card.alertLevel === "warning"
                ? "ប្រុងប្រយ័ត្ន"
                : "ល្អ"}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900 font-battambang flex items-center gap-2">
            <Eye className="w-4 h-4" />
            បើកមើលលម្អិត
          </span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-2 transition-all" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  subtitle,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  };

  return (
    <button
      onClick={onClick}
      className={`group bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg font-battambang mb-1">{title}</h3>
          <p className="text-xs text-white/80">{subtitle}</p>
        </div>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform mt-2" />
      </div>
    </button>
  );
}

function SettingsCard({
  card,
  loading,
  onClick,
}: {
  card: SettingsCard;
  loading: boolean;
  onClick: () => void;
}) {
  const Icon = card.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="p-6">
        {/* Icon */}
        <div
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 font-battambang">
          {card.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{card.subtitle}</p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div>
              {card.count !== undefined && (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.count}
                  </span>
                  <span className="text-sm text-gray-600 font-battambang">
                    {card.countLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Alert Badge */}
          {card.alertLevel && card.count !== undefined && card.count > 0 && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                card.alertLevel === "danger"
                  ? "bg-red-100 text-red-600"
                  : card.alertLevel === "warning"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {card.alertLevel === "danger"
                ? "ចាំបាច់"
                : card.alertLevel === "warning"
                ? "ប្រុងប្រយ័ត្ន"
                : "ល្អ"}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900 font-battambang">
            បើកមើល
          </span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

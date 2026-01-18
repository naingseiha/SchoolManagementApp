"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import { Shield, UserCog, ShieldCheck, ArrowRight, TrendingUp, Users } from "lucide-react";
import { adminSecurityApi } from "@/lib/api/admin-security";

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
}

export default function SettingsPage() {
  const { isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const deviceType = useDeviceType();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (currentUser?.role === "ADMIN") {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, currentUser]);

  const loadStats = async () => {
    try {
      const dashboard = await adminSecurityApi.getDashboard();
      setStats(dashboard);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const settingsCards: SettingsCard[] = [
    {
      id: "students",
      title: "គ្រប់គ្រងសិស្ស",
      subtitle: "Student Management",
      icon: UserCog,
      gradient: "from-blue-500 to-cyan-500",
      href: "/admin/students",
      count: stats?.totalStudents,
      countLabel: "សិស្ស",
    },
    {
      id: "teachers",
      title: "គ្រប់គ្រងគ្រូបង្រៀន",
      subtitle: "Teacher Management",
      icon: Shield,
      gradient: "from-green-500 to-emerald-500",
      href: "/admin/teachers",
      count: stats?.totalTeachers,
      countLabel: "គ្រូបង្រៀន",
    },
    {
      id: "security",
      title: "សុវត្ថិភាព",
      subtitle: "Password Security",
      icon: ShieldCheck,
      gradient: "from-purple-500 to-pink-500",
      href: "/admin/security",
      count: stats?.defaultPasswordCount || 0,
      countLabel: "ការជូនដំណឹង",
      alertLevel:
        stats?.defaultPasswordCount > 5
          ? "danger"
          : stats?.defaultPasswordCount > 0
          ? "warning"
          : "success",
    },
  ];

  // Mobile Layout
  if (deviceType === "mobile") {
    return (
      <MobileLayout>
        <SettingsContent cards={settingsCards} loading={loading} isAdmin={currentUser?.role === "ADMIN"} />
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <SettingsContent cards={settingsCards} loading={loading} isAdmin={currentUser?.role === "ADMIN"} />
        </main>
      </div>
    </div>
  );
}

function SettingsContent({
  cards,
  loading,
  isAdmin,
}: {
  cards: SettingsCard[];
  loading: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-moul text-gray-900 mb-2">
          ការកំណត់
        </h1>
        <p className="text-gray-600 font-battambang">
          គ្រប់គ្រងការកំណត់ប្រព័ន្ធ និងសុវត្ថិភាព
        </p>
      </div>

      {/* Admin Settings Cards */}
      {isAdmin && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1 font-battambang">
              ការកំណត់អ្នកគ្រប់គ្រង
            </h2>
            <p className="text-sm text-gray-600 font-battambang">
              គ្រប់គ្រងគណនី តួនាទី និងសុវត្ថិភាព
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {cards.map((card) => (
              <SettingsCard key={card.id} card={card} loading={loading} onClick={() => router.push(card.href)} />
            ))}
          </div>
        </>
      )}

      {/* General Settings Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1 font-battambang">
          ការកំណត់ទូទៅ
        </h2>
        <p className="text-sm text-gray-600 font-battambang">
          ព័ត៌មានប្រព័ន្ធ និងការកំណត់ផ្សេងៗ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-battambang">
                ព័ត៌មានប្រព័ន្ធ
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-battambang">
                System Information
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-battambang">កំណែ:</span>
                  <span className="font-medium text-gray-900">v2.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-battambang">ឆ្នាំសិក្សា:</span>
                  <span className="font-medium text-gray-900">
                    {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-battambang">
                ស្ថានភាពប្រព័ន្ធ
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-battambang">
                System Status
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 font-battambang">
                  ដំណើរការល្អ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

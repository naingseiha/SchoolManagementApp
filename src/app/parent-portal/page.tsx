"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  User,
  Users,
  Home,
  Bell,
  Loader2,
} from "lucide-react";
import {
  getProfile,
  getChildren,
  changePassword,
  updateProfile,
  type ParentProfile,
  type ChildWithStats,
} from "@/lib/api/parent-portal";

// Lazy load tab components
const ParentDashboardTab = dynamic(
  () => import("@/components/mobile/parent-portal/tabs/ParentDashboardTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const ParentChildrenTab = dynamic(
  () => import("@/components/mobile/parent-portal/tabs/ParentChildrenTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const ParentProfileTab = dynamic(
  () => import("@/components/mobile/parent-portal/tabs/ParentProfileTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

const ParentNotificationsTab = dynamic(
  () => import("@/components/mobile/parent-portal/tabs/ParentNotificationsTab"),
  { loading: () => <TabLoadingSkeleton /> }
);

function TabLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-gray-200 rounded-3xl h-48 animate-pulse"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
      </div>
    </div>
  );
}

type TabType = "dashboard" | "children" | "profile" | "notifications";

export default function ParentPortalPage() {
  const { currentUser, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Data state
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || currentUser?.role !== "PARENT")) {
      console.log("⚠️ Not a parent, redirecting to dashboard...");
      router.push("/");
    }
  }, [authLoading, isAuthenticated, currentUser, router]);

  // Load initial data
  useEffect(() => {
    if (currentUser?.role === "PARENT") {
      loadProfile();
      loadChildren();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadChildren = async () => {
    try {
      const data = await getChildren();
      setChildren(data);
    } catch (error) {
      console.error("Error loading children:", error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([loadProfile(), loadChildren()]);
    setLoading(false);
    setMessage({ type: "success", text: "ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "ពាក្យសម្ងាត់មិនត្រូវគ្នា" });
      return;
    }

    try {
      setLoading(true);
      await changePassword({ oldPassword, newPassword });
      setMessage({ type: "success", text: "ប្តូរពាក្យសម្ងាត់បានជោគជ័យ" });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "មានបញ្ហាក្នុងការប្តូរពាក្យសម្ងាត់" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMessage(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated || currentUser?.role !== "PARENT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            ព័ត៌មានសម្រាប់ឪពុកម្តាយ
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile?.parentInfo.khmerName || "កំពុងផ្ទុក..."}
          </p>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`mx-4 mt-4 p-4 rounded-2xl ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-4 py-6">
        {activeTab === "dashboard" && (
          <ParentDashboardTab
            profile={profile}
            children={children}
            onRefresh={handleRefresh}
            isRefreshing={loading}
          />
        )}
        {activeTab === "children" && (
          <ParentChildrenTab
            children={children}
            onRefresh={loadChildren}
          />
        )}
        {activeTab === "profile" && (
          <ParentProfileTab
            profile={profile}
            onRefresh={loadProfile}
            onChangePassword={() => setShowPasswordModal(true)}
          />
        )}
        {activeTab === "notifications" && (
          <ParentNotificationsTab />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 px-2 py-3">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">ទំព័រដើម</span>
          </button>

          <button
            onClick={() => handleTabChange("children")}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "children"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">កូន</span>
          </button>

          <button
            onClick={() => handleTabChange("notifications")}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "notifications"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs font-medium">ការជូនដំណឹង</span>
          </button>

          <button
            onClick={() => handleTabChange("profile")}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">ប្រវត្តិរូប</span>
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ប្តូរពាក្យសម្ងាត់
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ពាក្យសម្ងាត់ចាស់
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ពាក្យសម្ងាត់ថ្មី
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                បោះបង់
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

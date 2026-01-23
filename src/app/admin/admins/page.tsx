"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  UserCheck,
  Shield,
  Key,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
  LogIn,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { adminManagementApi, AdminAccount } from "@/lib/api/admin-management";
import PermissionModal from "@/components/admin/modals/PermissionModal";
import { SuperAdminBadge, PermissionSummary } from "@/components/admin/PermissionBadge";

export default function AdminManagementPage() {
  const { isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const deviceType = useDeviceType();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (currentUser?.role === "ADMIN") {
      loadAdmins();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, currentUser]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = admins.filter(
        (admin) =>
          admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.phone?.includes(searchQuery)
      );
      setFilteredAdmins(filtered);
    } else {
      setFilteredAdmins(admins);
    }
  }, [searchQuery, admins]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminManagementApi.getAdminAccounts();
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (error) {
      console.error("Failed to load admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!selectedAdmin) return;

      // Reset error
      setPasswordError("");
      setIsSubmitting(true);

      // Validation
      if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        setIsSubmitting(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      const isOwnAccount = selectedAdmin.id === currentUser?.id;

      if (isOwnAccount && !currentPassword) {
        setPasswordError("Current password is required");
        setIsSubmitting(false);
        return;
      }

      await adminManagementApi.updateAdminPassword(selectedAdmin.id, {
        newPassword,
        currentPassword: isOwnAccount ? currentPassword : undefined,
      });

      // Show success toast
      setToastMessage("Password updated successfully!");
      setShowSuccessToast(true);
      
      // Close modal and reset
      setShowPasswordModal(false);
      setSelectedAdmin(null);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordError("");
      setShowPassword(false);
      setIsSubmitting(false);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      loadAdmins();
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminAccount) => {
    try {
      const newStatus = !admin.isActive;
      const reason = newStatus
        ? undefined
        : prompt("Enter reason for deactivating this admin:");

      if (!newStatus && !reason) return;

      await adminManagementApi.toggleAdminStatus(admin.id, {
        isActive: newStatus,
        reason,
      });

      setToastMessage(`Admin ${newStatus ? "activated" : "deactivated"} successfully!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      loadAdmins();
    } catch (error: any) {
      setPasswordError(error.message || "Failed to toggle admin status");
    }
  };

  const handleDeleteAdmin = async (admin: AdminAccount) => {
    try {
      // Enhanced confirmation dialog
      const confirmMessage = `⚠️ WARNING: Delete Admin Account

Name: ${admin.firstName} ${admin.lastName}
Email: ${admin.email || "N/A"}

This action will:
• Permanently delete this admin account
• Remove all access permissions
• Cannot be undone

Are you absolutely sure you want to delete this admin?`;

      if (!confirm(confirmMessage)) return;

      // Second confirmation
      const finalConfirm = prompt(
        'Type "DELETE" to confirm this action:',
        ""
      );

      if (finalConfirm !== "DELETE") {
        alert("Deletion cancelled");
        return;
      }

      await adminManagementApi.deleteAdminAccount(admin.id);
      
      setToastMessage("Admin deleted successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      loadAdmins();
    } catch (error: any) {
      setPasswordError(error.message || "Failed to delete admin");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-battambang text-lg">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/settings")}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-moul text-gray-900 mb-1">
                គ្រប់គ្រងអ្នកគ្រប់គ្រង
              </h1>
              <p className="text-gray-600 font-battambang">
                Admin Account Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAdmins}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-battambang shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              ផ្ទុកឡើងវិញ
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-battambang"
            >
              <Plus className="w-4 h-4" />
              បង្កើតថ្មី
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ស្វែងរកអ្នកគ្រប់គ្រង..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-battambang"
          />
        </div>
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            currentUserId={currentUser?.id}
            onPasswordChange={(admin) => {
              setSelectedAdmin(admin);
              setShowPasswordModal(true);
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteAdmin}
            onManagePermissions={(admin) => {
              setSelectedAdmin(admin);
              setShowPermissionModal(true);
            }}
          />
        ))}
      </div>

      {filteredAdmins.length === 0 && !loading && (
        <div className="text-center py-20">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-battambang text-lg">
            មិនមានអ្នកគ្រប់គ្រង
          </p>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && selectedAdmin && (
        <PasswordModal
          admin={selectedAdmin}
          isOwnAccount={selectedAdmin.id === currentUser?.id}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          currentPassword={currentPassword}
          error={passwordError}
          showPassword={showPassword}
          isSubmitting={isSubmitting}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
          onSubmit={handlePasswordChange}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedAdmin(null);
            setNewPassword("");
            setConfirmPassword("");
            setCurrentPassword("");
            setPasswordError("");
            setShowPassword(false);
          }}
        />
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedAdmin && (
        <PermissionModal
          adminId={selectedAdmin.id}
          adminName={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          isSuperAdmin={selectedAdmin.isSuperAdmin || false}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedAdmin(null);
          }}
          onSuccess={() => {
            setToastMessage("Permissions updated successfully");
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
            loadAdmins();
          }}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-semibold">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadAdmins}
        />
      )}
    </div>
  );

  if (deviceType === "mobile") {
    return <MobileLayout>{content}</MobileLayout>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto min-h-0">{content}</main>
      </div>
    </div>
  );
}

function AdminCard({
  admin,
  currentUserId,
  onPasswordChange,
  onToggleStatus,
  onDelete,
  onManagePermissions,
}: {
  admin: AdminAccount;
  currentUserId?: string;
  onPasswordChange: (admin: AdminAccount) => void;
  onToggleStatus: (admin: AdminAccount) => void;
  onDelete: (admin: AdminAccount) => void;
  onManagePermissions: (admin: AdminAccount) => void;
}) {
  const isCurrentUser = admin.id === currentUserId;
  const permissionCount = admin.permissions?.adminPermissions?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 font-battambang">
                {admin.firstName} {admin.lastName}
              </h3>
              {admin.isSuperAdmin && <SuperAdminBadge />}
            </div>
            {isCurrentUser && (
              <span className="text-xs text-indigo-600 font-semibold">
                (You)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {admin.isActive ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          {admin.isDefaultPassword && (
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 text-sm">
        {admin.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Email:</span>
            <span>{admin.email}</span>
          </div>
        )}
        {admin.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Phone:</span>
            <span>{admin.phone}</span>
          </div>
        )}
        {admin.lastLogin && (
          <div className="flex items-center gap-2 text-gray-600">
            <LogIn className="w-4 h-4" />
            <span>
              {new Date(admin.lastLogin).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {admin.isActive ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            សកម្ម
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            មិនសកម្ម
          </span>
        )}
        {admin.isDefaultPassword && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            Default Password
          </span>
        )}
      </div>

      {/* Permission Summary */}
      <PermissionSummary
        permissionCount={permissionCount}
        isSuperAdmin={admin.isSuperAdmin}
        className="mb-4 pb-4 border-b border-gray-100"
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onManagePermissions(admin)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
        >
          <Shield className="w-4 h-4" />
          Permissions
        </button>
        <button
          onClick={() => onPasswordChange(admin)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm"
        >
          <Key className="w-4 h-4" />
          Password
        </button>
        {!isCurrentUser && !admin.isSuperAdmin && (
          <>
            <button
              onClick={() => onToggleStatus(admin)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                admin.isActive
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {admin.isActive ? (
                <>
                  <Lock className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => onDelete(admin)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PasswordModal({
  admin,
  isOwnAccount,
  newPassword,
  confirmPassword,
  currentPassword,
  error,
  showPassword,
  isSubmitting,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onCurrentPasswordChange,
  onTogglePasswordVisibility,
  onSubmit,
  onClose,
}: {
  admin: AdminAccount;
  isOwnAccount: boolean;
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
  error: string;
  showPassword: boolean;
  isSubmitting?: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && e.ctrlKey) {
        if (newPassword && confirmPassword && passwordsMatch && (!isOwnAccount || currentPassword)) {
          onSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newPassword, confirmPassword, currentPassword, isOwnAccount, onClose, onSubmit]);
  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return { strength: 0, label: "Too short", color: "bg-red-500" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 3) return { strength: 50, label: "Fair", color: "bg-orange-500" };
    if (strength === 4) return { strength: 75, label: "Good", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 font-battambang">
            ផ្លាស់ប្តូរពាក្យសម្ងាត់
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          {admin.firstName} {admin.lastName}
          {isOwnAccount && <span className="text-indigo-600 font-semibold">(You)</span>}
        </p>

        {isOwnAccount && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your current password"
                required
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter new password (min 8 characters)"
              required
            />
            <button
              type="button"
              onClick={onTogglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Password Strength</span>
                <span className={`font-semibold ${
                  passwordStrength.strength === 100 ? 'text-green-600' :
                  passwordStrength.strength >= 75 ? 'text-yellow-600' :
                  passwordStrength.strength >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${passwordStrength.color} h-2 rounded-full transition-all`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use 8+ characters with mix of letters, numbers & symbols
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-500'
                  : passwordsMatch
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
              placeholder="Re-enter new password"
              required
            />
            {confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
            )}
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newPassword || !confirmPassword || !passwordsMatch || (isOwnAccount && !currentPassword) || isSubmitting}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> to cancel or <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Enter</kbd> to submit
        </div>
      </div>
    </div>
  );
}

function CreateAdminModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formData.firstName || !formData.lastName) {
        setError("First name and last name are required");
        return;
      }

      if (!formData.email && !formData.phone) {
        setError("Either email or phone is required");
        return;
      }

      const result = await adminManagementApi.createAdminAccount(formData);

      if (result.defaultPassword) {
        setGeneratedPassword(result.defaultPassword);
        setShowGeneratedPassword(true);
        // Don't close immediately, show the password modal
      } else {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      setError(error.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  // Handle closing after password is shown
  const handleCloseWithPassword = () => {
    onSuccess();
    onClose();
  };

  // Show generated password modal
  if (showGeneratedPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="text-center mb-6">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-battambang">
              Admin Created Successfully!
            </h2>
            <p className="text-gray-600">
              Please save this password. It will not be shown again.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Default Password</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword);
                  alert("Password copied to clipboard!");
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Copy
              </button>
            </div>
            <div className="font-mono text-lg font-bold text-gray-900 bg-white p-3 rounded border border-gray-200">
              {generatedPassword}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Save this password securely</li>
                  <li>Share it with the admin user</li>
                  <li>They should change it on first login</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleCloseWithPassword}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
          >
            Got it, Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 font-battambang">
            បង្កើតអ្នកគ្រប់គ្រងថ្មី
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password (optional - will auto-generate if empty)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Leave empty to auto-generate"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Admin
              </>
            )}
          </button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> to cancel
        </div>
      </div>
    </div>
  );
}

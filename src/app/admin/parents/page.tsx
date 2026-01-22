"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useDeviceType } from "@/lib/utils/deviceDetection";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileLayout from "@/components/layout/MobileLayout";
import ParentStatistics from "@/components/admin/parents/ParentStatistics";
import ParentFilters from "@/components/admin/parents/ParentFilters";
import ParentTable from "@/components/admin/parents/ParentTable";
import Modal from "@/components/ui/Modal";
import { adminParentsApi, Parent, CreateParentData } from "@/lib/api/admin-parents";
import { studentsApi, Student } from "@/lib/api/students";
import {
  Users,
  UserPlus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ParentsManagementPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const deviceType = useDeviceType();

  // State management
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateParentData>({
    firstName: "",
    lastName: "",
    khmerName: "",
    gender: "MALE",
    phone: "",
    email: "",
    address: "",
    relationship: "FATHER",
    occupation: "",
    emergencyPhone: "",
  });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [linkRelationship, setLinkRelationship] = useState("FATHER");

  // Message
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  // Load data
  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Only load parents initially - students will be loaded when needed
      const parentsData = await adminParentsApi.getAll();
      
      // Ensure data is an array
      console.log("Parents data received:", parentsData);
      console.log("Parents data type:", typeof parentsData);
      console.log("Is array:", Array.isArray(parentsData));
      
      setParents(Array.isArray(parentsData) ? parentsData : []);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      showMessage("error", "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ");
      setParents([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Lazy load students only when link modal opens
  const loadStudentsForLinking = async () => {
    if (students.length === 0) {
      try {
        // Use lightweight endpoint with high limit for dropdown
        const response = await studentsApi.getAllLightweight(1, 10000);
        if (response.success && Array.isArray(response.data)) {
          setStudents(response.data);
        }
      } catch (error: any) {
        console.error("Failed to load students:", error);
        showMessage("error", "មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស");
      }
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateParent = async () => {
    try {
      setActionLoading(true);
      await adminParentsApi.create(formData);
      showMessage("success", "បានបង្កើតឪពុកម្តាយជាជោគជ័យ");
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការបង្កើត");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditParent = async () => {
    if (!selectedParent) return;
    try {
      setActionLoading(true);
      await adminParentsApi.update(selectedParent.id, formData);
      showMessage("success", "បានកែប្រែជាជោគជ័យ");
      setShowEditModal(false);
      setSelectedParent(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការកែប្រែ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent) return;
    try {
      setActionLoading(true);
      await adminParentsApi.delete(selectedParent.id);
      showMessage("success", "បានលុបជាជោគជ័យ");
      setShowDeleteModal(false);
      setSelectedParent(null);
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការលុប");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedParent) return;
    try {
      setActionLoading(true);
      const result = await adminParentsApi.createAccount(selectedParent.id);
      showMessage(
        "success",
        `បានបង្កើតគណនីជាជោគជ័យ\nឈ្មោះប្រើប្រាស់: ${result.username}\nពាក្យសម្ងាត់: ${result.defaultPassword}`
      );
      setShowCreateAccountModal(false);
      setSelectedParent(null);
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការបង្កើតគណនី");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedParent) return;
    try {
      setActionLoading(true);
      const result = await adminParentsApi.resetPassword(selectedParent.id);
      showMessage(
        "success",
        `បានប្តូរពាក្យសម្ងាត់ជាជោគជ័យ\nឈ្មោះប្រើប្រាស់: ${result.username}\nពាក្យសម្ងាត់ថ្មី: ${result.defaultPassword}`
      );
      setShowResetPasswordModal(false);
      setSelectedParent(null);
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការប្តូរពាក្យសម្ងាត់");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (parent: Parent) => {
    try {
      setActionLoading(true);
      await adminParentsApi.toggleStatus(parent.id);
      showMessage("success", "បានប្តូរស្ថានភាពជាជោគជ័យ");
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការប្តូរស្ថានភាព");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedParent || !selectedStudentId) return;
    try {
      setActionLoading(true);
      await adminParentsApi.linkStudent({
        parentId: selectedParent.id,
        studentId: selectedStudentId,
        relationship: linkRelationship,
      });
      showMessage("success", "បានភ្ជាប់សិស្សជាជោគជ័យ");
      setShowLinkModal(false);
      setSelectedParent(null);
      setSelectedStudentId("");
      await loadData();
    } catch (error: any) {
      showMessage("error", error.message || "មានបញ្ហាក្នុងការភ្ជាប់សិស្ស");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      khmerName: "",
      gender: "MALE",
      phone: "",
      email: "",
      address: "",
      relationship: "FATHER",
      occupation: "",
      emergencyPhone: "",
    });
  };

  const openEditModal = (parent: Parent) => {
    setSelectedParent(parent);
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      khmerName: parent.khmerName,
      gender: parent.gender,
      phone: parent.phone,
      email: parent.email || "",
      address: parent.address || "",
      relationship: parent.relationship,
      occupation: parent.occupation || "",
      emergencyPhone: parent.emergencyPhone || "",
    });
    setShowEditModal(true);
  };

  // Filter parents
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.khmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm) ||
      (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "with-account" && parent.user) ||
      (statusFilter === "without-account" && !parent.user) ||
      (statusFilter === "active" && parent.user?.isActive) ||
      (statusFilter === "inactive" && parent.user && !parent.user.isActive);

    const matchesRelationship =
      relationshipFilter === "all" || parent.relationship === relationshipFilter;

    return matchesSearch && matchesStatus && matchesRelationship;
  });

  // Calculate statistics
  const stats = {
    totalParents: parents.length,
    withAccounts: parents.filter((p) => p.user).length,
    withoutAccounts: parents.filter((p) => !p.user).length,
    linkedStudents: parents.reduce(
      (sum, p) => sum + p.studentParents.length,
      0
    ),
  };

  if (authLoading || loading) {
    // Mobile Layout
    if (deviceType === "mobile") {
      return (
        <MobileLayout>
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/30">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-khmer-body text-lg">កំពុងផ្ទុក...</p>
            </div>
          </div>
        </MobileLayout>
      );
    }

    // Desktop Layout with Sidebar
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 font-khmer-body text-lg">កំពុងផ្ទុក...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/30 p-4 md:p-8">
      {/* Message Alert */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-khmer-body whitespace-pre-line">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <h1 className="font-khmer-title text-4xl text-gray-900">
                គ្រប់គ្រងគណនីឪពុកម្តាយ
              </h1>
            </div>
            <p className="font-khmer-body text-gray-600 ml-11">
              បង្កើត កែប្រែ និងគ្រប់គ្រងគណនីឪពុកម្តាយ
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300
                text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-lg
                disabled:opacity-50 font-khmer-body"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "កំពុងផ្ទុក..." : "ផ្ទុកឡើងវិញ"}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r
                from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700
                hover:to-pink-700 transition-all shadow-lg font-khmer-body"
            >
              <UserPlus className="w-4 h-4" />
              បង្កើតគណនីថ្មី
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <ParentStatistics {...stats} />

      {/* Filters */}
      <ParentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        relationshipFilter={relationshipFilter}
        onRelationshipChange={setRelationshipFilter}
      />

      {/* Table */}
      <ParentTable
        parents={filteredParents}
        onEdit={openEditModal}
        onLink={async (parent) => {
          setSelectedParent(parent);
          setShowLinkModal(true);
          await loadStudentsForLinking(); // Load students when modal opens
        }}
        onCreateAccount={(parent) => {
          setSelectedParent(parent);
          setShowCreateAccountModal(true);
        }}
        onResetPassword={(parent) => {
          setSelectedParent(parent);
          setShowResetPasswordModal(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(parent) => {
          setSelectedParent(parent);
          setShowDeleteModal(true);
        }}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="បង្កើតឪពុកម្តាយថ្មី"
        size="lg"
      >
        <ParentFormContent
          formData={formData}
          onChange={setFormData}
          onSubmit={handleCreateParent}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          loading={actionLoading}
          submitLabel="បង្កើត"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedParent(null);
          resetForm();
        }}
        title="កែប្រែព័ត៌មានឪពុកម្តាយ"
        size="lg"
      >
        <ParentFormContent
          formData={formData}
          onChange={setFormData}
          onSubmit={handleEditParent}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedParent(null);
            resetForm();
          }}
          loading={actionLoading}
          submitLabel="រក្សាទុក"
        />
      </Modal>

      {/* Link Student Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedParent(null);
          setSelectedStudentId("");
        }}
        title="ភ្ជាប់សិស្ស"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              ជ្រើសរើសសិស្ស
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body"
            >
              <option value="">-- ជ្រើសរើសសិស្ស --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.khmerName} - {student.class?.name || student.class?.grade || "គ្មានថ្នាក់"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              ទំនាក់ទំនង
            </label>
            <select
              value={linkRelationship}
              onChange={(e) => setLinkRelationship(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body"
            >
              <option value="FATHER">ឪពុក</option>
              <option value="MOTHER">ម្តាយ</option>
              <option value="GUARDIAN">អាណាព្យាបាល</option>
              <option value="STEP_FATHER">ឪពុកចុង</option>
              <option value="STEP_MOTHER">ម្តាយចុង</option>
              <option value="GRANDPARENT">ជីតា/យាយ</option>
              <option value="OTHER">ផ្សេងៗ</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowLinkModal(false);
                setSelectedParent(null);
                setSelectedStudentId("");
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200 transition-all font-khmer-body"
            >
              បោះបង់
            </button>
            <button
              onClick={handleLinkStudent}
              disabled={!selectedStudentId || actionLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                text-white rounded-xl hover:from-purple-700 hover:to-pink-700
                transition-all disabled:opacity-50 font-khmer-body"
            >
              {actionLoading ? "កំពុងភ្ជាប់..." : "ភ្ជាប់"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedParent(null);
        }}
        title="លុបឪពុកម្តាយ"
      >
        <div className="space-y-4">
          <p className="font-khmer-body text-gray-700">
            តើអ្នកប្រាកដថាចង់លុប{" "}
            <span className="font-bold">{selectedParent?.khmerName}</span> មែនទេ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedParent(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200 transition-all font-khmer-body"
            >
              បោះបង់
            </button>
            <button
              onClick={handleDeleteParent}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl
                hover:bg-red-700 transition-all disabled:opacity-50 font-khmer-body"
            >
              {actionLoading ? "កំពុងលុប..." : "លុប"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedParent(null);
        }}
        title="ប្តូរពាក្យសម្ងាត់"
      >
        <div className="space-y-4">
          <p className="font-khmer-body text-gray-700">
            តើអ្នកប្រាកដថាចង់ប្តូរពាក្យសម្ងាត់របស់{" "}
            <span className="font-bold">{selectedParent?.khmerName}</span> មែនទេ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResetPasswordModal(false);
                setSelectedParent(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200 transition-all font-khmer-body"
            >
              បោះបង់
            </button>
            <button
              onClick={handleResetPassword}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl
                hover:bg-orange-700 transition-all disabled:opacity-50 font-khmer-body"
            >
              {actionLoading ? "កំពុងប្តូរ..." : "ប្តូរពាក្យសម្ងាត់"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateAccountModal}
        onClose={() => {
          setShowCreateAccountModal(false);
          setSelectedParent(null);
        }}
        title="បង្កើតគណនី"
      >
        <div className="space-y-4">
          <p className="font-khmer-body text-gray-700">
            តើអ្នកប្រាកដថាចង់បង្កើតគណនីសម្រាប់{" "}
            <span className="font-bold">{selectedParent?.khmerName}</span> មែនទេ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCreateAccountModal(false);
                setSelectedParent(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200 transition-all font-khmer-body"
            >
              បោះបង់
            </button>
            <button
              onClick={handleCreateAccount}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl
                hover:bg-purple-700 transition-all disabled:opacity-50 font-khmer-body"
            >
              {actionLoading ? "កំពុងបង្កើត..." : "បង្កើតគណនី"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );

  // Mobile Layout
  if (deviceType === "mobile") {
    return <MobileLayout>{content}</MobileLayout>;
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto min-h-0">{content}</main>
      </div>
    </div>
  );
}

// Parent Form Component
function ParentFormContent({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  formData: CreateParentData;
  onChange: (data: CreateParentData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const handleChange = (field: keyof CreateParentData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="font-khmer-body font-semibold text-gray-900 mb-4">
          ព័ត៌មានផ្ទាល់ខ្លួន
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              នាមត្រកូល (ឡាតាំង)
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              នាមខ្លួន (ឡាតាំង)
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              ឈ្មោះពេញជាអក្សរខ្មែរ *
            </label>
            <input
              type="text"
              value={formData.khmerName}
              onChange={(e) => handleChange("khmerName", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              ភេទ
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="MALE">ប្រុស</option>
              <option value="FEMALE">ស្រី</option>
            </select>
          </div>

          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              ទំនាក់ទំនង *
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => handleChange("relationship", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="FATHER">ឪពុក</option>
              <option value="MOTHER">ម្តាយ</option>
              <option value="GUARDIAN">អាណាព្យាបាល</option>
              <option value="STEP_FATHER">ឪពុកចុង</option>
              <option value="STEP_MOTHER">ម្តាយចុង</option>
              <option value="GRANDPARENT">ជីតា/យាយ</option>
              <option value="OTHER">ផ្សេងៗ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="font-khmer-body font-semibold text-gray-900 mb-4">
          ព័ត៌មានទំនាក់ទំនង
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              លេខទូរស័ព្ទ *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              លេខទូរស័ព្ទបន្ទាន់
            </label>
            <input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              អ៊ីមែល
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              អាសយដ្ឋាន
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-khmer-body text-sm font-medium text-gray-700 mb-2">
              មុខរបរ
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-khmer-body
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
            hover:bg-gray-200 transition-all font-khmer-body"
        >
          បោះបង់
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !formData.khmerName || !formData.phone}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
            text-white rounded-xl hover:from-purple-700 hover:to-pink-700
            transition-all disabled:opacity-50 font-khmer-body"
        >
          {loading ? "កំពុងដំណើរការ..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

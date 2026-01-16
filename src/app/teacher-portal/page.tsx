"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  Loader2,
  AlertCircle,
  Settings,
  Award,
  Users,
  BookOpen,
  Home,
  TrendingUp,
  Calendar,
  Star,
  CheckCircle2,
  Edit3,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Target,
  Activity,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  teacherPortalApi,
  type TeacherProfile,
} from "@/lib/api/teacher-portal";
import MobileLayout from "@/components/layout/MobileLayout";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/useToast";

// Lazy load heavy components
const TeacherProfileEditModal = dynamic(
  () => import("@/components/mobile/teacher-portal/TeacherProfileEditModal"),
  { ssr: false }
);
const TeacherPasswordModal = dynamic(
  () => import("@/components/mobile/teacher-portal/TeacherPasswordModal"),
  { ssr: false }
);

const ROLE_LABELS = {
  TEACHER: "គ្រូបង្រៀន",
  INSTRUCTOR: "គ្រូថ្នាក់",
  ADMIN: "អ្នកគ្រប់គ្រង",
};

// Cache profile data to avoid refetching
const profileCache: { [key: string]: TeacherProfile } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function TeacherPortalPage() {
  const { currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cacheTimeRef = useRef<number>(0);
  const { success, error: showErrorToast, ToastContainer } = useToast();

  // State management
  const [profile, setProfile] = useState<TeacherProfile | null>(() => {
    // Initialize with cached data if available
    if (currentUser?.id && profileCache[currentUser.id]) {
      return profileCache[currentUser.id];
    }
    return null;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize computed values
  const studentCount = useMemo(() => {
    if (!profile) return "0";
    return (
      profile.homeroomClass?._count?.students ||
      profile.teachingClasses?.reduce(
        (acc, c) => acc + (c._count?.students || 0),
        0
      ) ||
      "53"
    );
  }, [profile?.homeroomClass, profile?.teachingClasses]);

  const classCount = useMemo(() => {
    if (!profile) return "0";
    return profile.role === "INSTRUCTOR" && profile.homeroomClass
      ? "20"
      : profile.teachingClasses?.length || "0";
  }, [profile?.role, profile?.homeroomClass, profile?.teachingClasses]);

  const subjectCount = useMemo(() => {
    return profile?.subjects?.length || "1";
  }, [profile?.subjects]);

  // Redirect check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    } else if (
      !authLoading &&
      currentUser &&
      currentUser.role !== "TEACHER" &&
      currentUser.role !== "INSTRUCTOR" &&
      currentUser.role !== "ADMIN"
    ) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, currentUser, router]);

  // Load profile photo from localStorage immediately
  useEffect(() => {
    if (currentUser?.id) {
      const savedPhoto = localStorage.getItem(
        `teacher_photo_${currentUser.id}`
      );
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
    }
  }, [currentUser?.id]);

  // Fetch profile data with caching
  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      const now = Date.now();
      const isCacheValid =
        profileCache[currentUser.id] &&
        now - cacheTimeRef.current < CACHE_DURATION;

      if (isCacheValid) {
        setProfile(profileCache[currentUser.id]);
      } else {
        fetchProfile();
      }
    }
  }, [isAuthenticated, currentUser?.id]);

  const fetchProfile = async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoadingProfile(true);
      setError(null);
      const profileData = await teacherPortalApi.getMyProfile();

      // Cache the data
      profileCache[currentUser.id] = profileData;
      cacheTimeRef.current = Date.now();

      setProfile(profileData);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.message || "មិនអាចទាញយកទិន្នន័យបានទេ");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("ទំហំរូបភាពធំពេក។ សូមជ្រើសរើសរូបភាពតូចជាង 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setProfilePhoto(photoUrl);
        if (currentUser?.id) {
          requestIdleCallback(() => {
            localStorage.setItem(`teacher_photo_${currentUser.id}`, photoUrl);
          });
        }
        setShowPhotoOptions(false);
        success("រូបភាពត្រូវបានដាក់ដោយជោគជ័យ");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (currentUser?.id) {
      requestIdleCallback(() => {
        localStorage.removeItem(`teacher_photo_${currentUser.id}`);
      });
    }
    setShowPhotoOptions(false);
    success("រូបភាពត្រូវបានលុបដោយជោគជ័យ");
  };

  // Show skeleton loading
  if (authLoading || (isLoadingProfile && !profile)) {
    return (
      <MobileLayout title="ព័ត៌មានរបស់ខ្ញុំ">
        <ProfileSkeleton />
      </MobileLayout>
    );
  }

  // Show error state
  if (error && !profile) {
    return (
      <MobileLayout title="ព័ត៌មានរបស់ខ្ញុំ">
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="text-center bg-white rounded-3xl p-8 shadow-xl max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              មានបញ្ហាកើតឡើង
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) return null;

  return (
    <MobileLayout title="ព័ត៌មានរបស់ខ្ញុំ">
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
        {/* Hero Section - Optimized */}
        <HeroSection
          profile={profile}
          profilePhoto={profilePhoto}
          onSettingsClick={() => setIsEditingProfile(true)}
          onCameraClick={() => setShowPhotoOptions(true)}
          classCount={classCount}
          studentCount={studentCount}
          subjectCount={subjectCount}
        />

        {/* Action Buttons */}
        <ActionButtons
          onEdit={() => setIsEditingProfile(true)}
          onPassword={() => setShowPasswordModal(true)}
        />

        {/* Main Content Area */}
        <div className="px-4 space-y-4 pb-8">
          {/* Achievement Badges */}
          <AchievementBadges />

          {/* Contact Information */}
          <ContactInfo profile={profile} />

          {/* Teaching Information */}
          {((profile.subjects && profile.subjects.length > 0) ||
            (profile.teachingClasses && profile.teachingClasses.length > 0) ||
            profile.homeroomClass) && <TeachingInfo profile={profile} />}

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoOptions && (
        <PhotoUploadModal
          profilePhoto={profilePhoto}
          onClose={() => setShowPhotoOptions(false)}
          onChoosePhoto={() => fileInputRef.current?.click()}
          onRemovePhoto={handleRemovePhoto}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <TeacherProfileEditModal
          profile={profile}
          onClose={() => setIsEditingProfile(false)}
          onSave={async (data) => {
            try {
              const updated = await teacherPortalApi.updateMyProfile(data);
              if (currentUser?.id) {
                profileCache[currentUser.id] = updated;
                cacheTimeRef.current = Date.now();
              }
              setProfile(updated);
              setIsEditingProfile(false);
              // Show success toast after modal closes
              setTimeout(() => {
                success("ព័ត៌មានត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ");
              }, 100);
            } catch (error: any) {
              showErrorToast(error.message || "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ");
              throw error;
            }
          }}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <TeacherPasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </MobileLayout>
  );
}

// Memoized Hero Section Component
const HeroSection = memo(
  ({
    profile,
    profilePhoto,
    onSettingsClick,
    onCameraClick,
    classCount,
    studentCount,
    subjectCount,
  }: any) => (
    <div className="relative overflow-hidden will-change-transform">
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Settings Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onSettingsClick}
          className="p-3 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg hover:bg-white/30 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 pt-16 pb-6 px-4">
        <div className="flex flex-col items-center mb-4">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full blur-xl opacity-75"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-white to-gray-100 rounded-full p-1 shadow-2xl">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <button
              onClick={onCameraClick}
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Name & Title */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-black text-white mb-1 drop-shadow-lg">
              {profile.khmerName || `${profile.firstName} ${profile.lastName}`}
            </h1>
            <p className="text-white/90 text-sm mb-2 drop-shadow">
              {profile.englishName ||
                `${profile.firstName} ${profile.lastName}`}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full shadow-lg">
              <Award className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold text-white">
                {ROLE_LABELS[profile.role] || profile.role}
              </span>
            </div>
          </div>

          {profile.position && (
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>{profile.position}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 px-2">
          <StatCard
            icon={Home}
            value={classCount}
            label={
              profile.role === "INSTRUCTOR"
                ? "ថ្នាក់ទទួលបន្ទុក"
                : "ថ្នាក់បង្រៀន"
            }
            color="from-blue-400 to-blue-600"
          />
          <StatCard
            icon={Users}
            value={studentCount}
            label="សិស្សសរុប"
            color="from-pink-400 to-rose-600"
          />
          <StatCard
            icon={BookOpen}
            value={subjectCount}
            label="មុខវិជ្ជា"
            color="from-green-400 to-emerald-600"
          />
        </div>
      </div>
    </div>
  )
);

HeroSection.displayName = "HeroSection";

// Memoized Stat Card
const StatCard = memo(({ icon: Icon, value, label, color }: any) => (
  <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-4 border border-white/25 shadow-lg will-change-transform">
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-2 shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-xs font-bold text-white/90 text-center leading-tight">
        {label}
      </p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

// Action Buttons Component
const ActionButtons = memo(({ onEdit, onPassword }: any) => (
  <div className="px-4 -mt-2 mb-6 relative z-20">
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onEdit}
        className="flex items-center justify-center gap-2 bg-white rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl border border-gray-200 hover:border-indigo-300 transition-all active:scale-95 group"
      >
        <Edit3 className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
        <span className="font-bold font-koulen text-gray-900">កែប្រែ</span>
      </button>
      <button
        onClick={onPassword}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
      >
        <Lock className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        <span className="font-bold font-koulen text-white">ពាក្យសម្ងាត់</span>
      </button>
    </div>
  </div>
));

ActionButtons.displayName = "ActionButtons";

// Achievement Badges Component
const AchievementBadges = memo(() => (
  <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-koulen font-black text-gray-900 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <span>សមិទ្ធផល</span>
      </h4>
      <TrendingUp className="w-5 h-5 text-green-500" />
    </div>
    <div className="grid grid-cols-4 gap-3">
      {["⭐", "🏆", "🎯", "✅"].map((emoji, index) => (
        <div
          key={index}
          className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-3 flex items-center justify-center border-2 border-gray-200 shadow-md hover:scale-105 active:scale-95 transition-transform will-change-transform"
        >
          <span className="text-4xl">{emoji}</span>
        </div>
      ))}
    </div>
  </div>
));

AchievementBadges.displayName = "AchievementBadges";

// Contact Info Component
const ContactInfo = memo(({ profile }: { profile: TeacherProfile }) => (
  <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
        <Phone className="w-5 h-5 text-white" />
      </div>
      <h4 className="text-lg font-koulen font-black text-gray-900">
        ព័ត៌មានទំនាក់ទំនង
      </h4>
    </div>
    <div className="space-y-3">
      <InfoRow
        icon={<Mail className="w-4 h-4" />}
        label="អ៊ីមែល"
        value={profile.email}
        color="blue"
      />
      {profile.phone && (
        <InfoRow
          icon={<Phone className="w-4 h-4" />}
          label="លេខទូរស័ព្ទ"
          value={profile.phone}
          color="green"
        />
      )}
      {profile.address && (
        <InfoRow
          icon={<MapPin className="w-4 h-4" />}
          label="អាសយដ្ឋាន"
          value={profile.address}
          color="red"
        />
      )}
      {profile.dateOfBirth && (
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="ថ្ងៃខែឆ្នាំកំណើត"
          value={new Date(profile.dateOfBirth).toLocaleDateString("km-KH")}
          color="purple"
        />
      )}
      {profile.hireDate && (
        <InfoRow
          icon={<Clock className="w-4 h-4" />}
          label="ថ្ងៃចូលបម្រើការងារ"
          value={new Date(profile.hireDate).toLocaleDateString("km-KH")}
          color="orange"
        />
      )}
    </div>
  </div>
));

ContactInfo.displayName = "ContactInfo";

// Teaching Info Component
const TeachingInfo = memo(({ profile }: { profile: TeacherProfile }) => (
  <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <h4 className="text-lg font-koulen font-black text-gray-900">
        ព័ត៌មានការបង្រៀន
      </h4>
    </div>
    <div className="space-y-4">
      {profile.role === "INSTRUCTOR" && profile.homeroomClass && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            ថ្នាក់ទទួលបន្ទុក
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {profile.homeroomClass.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Users className="w-3.5 h-3.5" />
                  {profile.homeroomClass._count?.students || 0} សិស្ស
                </p>
              </div>
              {profile.homeroomClass.track && (
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                  {profile.homeroomClass.track}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {profile.teachingClasses && profile.teachingClasses.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            ថ្នាក់បង្រៀន ({profile.teachingClasses.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {profile.teachingClasses.slice(0, 4).map((cls) => (
              <div
                key={cls.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-3"
              >
                <p className="font-bold text-sm text-gray-900">{cls.name}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  {cls._count?.students || 0} សិស្ស
                </p>
              </div>
            ))}
          </div>
          {profile.teachingClasses.length > 4 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{profile.teachingClasses.length - 4} ថ្នាក់ទៀត
            </p>
          )}
        </div>
      )}

      {profile.subjects && profile.subjects.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            មុខវិជ្ជាបង្រៀន ({profile.subjects.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl px-4 py-2"
              >
                <p className="text-sm font-bold text-gray-900">
                  {subject.nameKh || subject.name}
                </p>
                <p className="text-[10px] text-gray-600">{subject.code}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
));

TeachingInfo.displayName = "TeachingInfo";

// Activity Feed Component
const ActivityFeed = memo(() => {
  const activities = [
    {
      icon: CheckCircle2,
      text: "បានបញ្ចូលពិន្ទុថ្មី",
      time: "២ម៉ោងមុន",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Users,
      text: "បានចូលរួមថ្នាក់រៀន",
      time: "៣ម៉ោងមុន",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Award,
      text: "បានទទួលសមិទ្ធផលថ្មី",
      time: "៥ម៉ោងមុន",
      color: "from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-koulen font-black text-gray-900">
          សកម្មភាពថ្មីៗ
        </h4>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
          >
            <div
              className={`p-2.5 bg-gradient-to-br ${activity.color} rounded-xl shadow-md`}
            >
              <activity.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{activity.text}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ActivityFeed.displayName = "ActivityFeed";

// Photo Upload Modal Component
const PhotoUploadModal = memo(
  ({ profilePhoto, onClose, onChoosePhoto, onRemovePhoto }: any) => (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center max-w-md mx-auto backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h2 className="text-xl font-black text-gray-900 mb-4 text-center">
          ជ្រើសរើសរូបភាព
        </h2>
        <div className="space-y-3">
          <button
            onClick={onChoosePhoto}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl active:scale-95 transition-transform"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-900">ជ្រើសពីរូបថត</p>
              <p className="text-xs text-gray-600">
                ជ្រើសរូបភាពពីឧបករណ៍របស់អ្នក
              </p>
            </div>
          </button>
          <button
            onClick={onChoosePhoto}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl active:scale-95 transition-transform"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-900">ថតរូបថ្មី</p>
              <p className="text-xs text-gray-600">ប្រើកាមេរ៉ាថតរូបភាពថ្មី</p>
            </div>
          </button>
          {profilePhoto && (
            <button
              onClick={onRemovePhoto}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-900">លុបរូបភាព</p>
                <p className="text-xs text-gray-600">ដកចេញរូបភាពបច្ចុប្បន្ន</p>
              </div>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            បោះបង់
          </button>
        </div>
      </div>
    </div>
  )
);

PhotoUploadModal.displayName = "PhotoUploadModal";

// Info Row Component
const InfoRow = memo(({ icon, label, value, color = "gray" }: any) => {
  const colorClasses = {
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    green: "from-green-50 to-emerald-50 border-green-200",
    red: "from-red-50 to-rose-50 border-red-200",
    purple: "from-purple-50 to-pink-50 border-purple-200",
    orange: "from-orange-50 to-amber-50 border-orange-200",
    gray: "from-gray-50 to-gray-100 border-gray-200",
  };

  return (
    <div
      className={`flex items-start gap-3 p-3.5 bg-gradient-to-r ${colorClasses[color]} border-2 rounded-2xl`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
});

InfoRow.displayName = "InfoRow";

// Skeleton Loading Component
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 animate-pulse">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 h-80 relative">
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-32 h-32 bg-white/30 rounded-full mb-4"></div>
          <div className="w-48 h-6 bg-white/30 rounded-full mb-2"></div>
          <div className="w-32 h-4 bg-white/30 rounded-full"></div>
        </div>
      </div>
      <div className="px-4 -mt-12 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/50 rounded-3xl h-32"></div>
          ))}
        </div>
        <div className="bg-white rounded-3xl h-48"></div>
        <div className="bg-white rounded-3xl h-32"></div>
      </div>
    </div>
  );
}

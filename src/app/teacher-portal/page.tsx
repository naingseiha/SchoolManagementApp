"use client";

import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
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
  Image as ImageIcon,
  MessageSquare,
  UserPlus,
  Share2,
  Bell,
  BarChart3,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import {
  teacherPortalApi,
  type TeacherProfile,
  type TeacherActivity,
} from "@/lib/api/teacher-portal";
import MobileLayout from "@/components/layout/MobileLayout";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/useToast";
import { usePasswordStatus } from "@/hooks/usePasswordStatus";
import {
  compressImage,
  getBase64Size,
  formatBytes,
  isImageSizeAcceptable,
} from "@/lib/utils/imageCompression";

// Lazy load heavy components
const TeacherProfileEditModal = dynamic(
  () => import("@/components/mobile/teacher-portal/TeacherProfileEditModal"),
  { ssr: false },
);
const TeacherPasswordModal = dynamic(
  () => import("@/components/mobile/teacher-portal/TeacherPasswordModal"),
  { ssr: false },
);
const PasswordExpiryWarning = dynamic(
  () => import("@/components/security/PasswordExpiryWarning"),
  { ssr: false },
);
const FirstLoginModal = dynamic(
  () => import("@/components/security/FirstLoginModal"),
  { ssr: false },
);

const ROLE_LABELS = {
  TEACHER: "គ្រូបង្រៀន",
  INSTRUCTOR: "គ្រូថ្នាក់",
  ADMIN: "អ្នកគ្រប់គ្រង",
};

// Cache profile data to avoid refetching
const profileCache: { [key: string]: TeacherProfile } = {};
const activitiesCache: { [key: string]: TeacherActivity[] } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function TeacherPortalPage() {
  const { currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cacheTimeRef = useRef<{ [key: string]: number }>({});
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
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const { status: passwordStatus, refetch: refetchPasswordStatus } =
    usePasswordStatus();
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  // Check if this is first time seeing the warning
  useEffect(() => {
    if (passwordStatus?.isDefaultPassword) {
      const hasSeenWarning = localStorage.getItem("hasSeenPasswordWarning");
      if (!hasSeenWarning) {
        setShowFirstLoginModal(true);
      }
    }
  }, [passwordStatus]);

  // Memoized computed values
  const studentCount = useMemo(() => {
    if (!profile) return "0";
    return (
      profile.homeroomClass?._count?.students ||
      profile.teachingClasses?.reduce(
        (acc, c) => acc + (c._count?.students || 0),
        0,
      ) ||
      "0"
    );
  }, [profile?.homeroomClass, profile?.teachingClasses]);

  const classCount = useMemo(() => {
    if (!profile) return "0";
    return profile.role === "INSTRUCTOR" && profile.homeroomClass
      ? "1"
      : profile.teachingClasses?.length || "0";
  }, [profile?.role, profile?.homeroomClass, profile?.teachingClasses]);

  const subjectCount = useMemo(() => {
    return profile?.subjects?.length || "0";
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
        `teacher_photo_${currentUser.id}`,
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
        now - (cacheTimeRef.current.profile || 0) < CACHE_DURATION;

      if (isCacheValid) {
        setProfile(profileCache[currentUser.id]);
      } else {
        fetchProfile();
      }
    }
  }, [isAuthenticated, currentUser?.id]);

  // Generate activity feed from profile data
  useEffect(() => {
    let isMounted = true;

    const loadActivities = () => {
      if (!currentUser?.id || !profile) return;

      const cacheKey = `activities_${currentUser.id}`;
      const now = Date.now();
      const isCacheValid =
        activitiesCache[cacheKey] &&
        now - (cacheTimeRef.current[cacheKey] || 0) < CACHE_DURATION;

      if (isCacheValid) {
        setActivities(activitiesCache[cacheKey]);
        return;
      }

      setLoadingActivities(true);

      // Generate activities from profile data
      // Note: Backend API endpoint not implemented yet, using computed activities
      const computedActivities = generateSampleActivities(profile);

      // Cache the data
      activitiesCache[cacheKey] = computedActivities;
      cacheTimeRef.current[cacheKey] = now;

      if (isMounted) {
        setActivities(computedActivities);
        setLoadingActivities(false);
      }
    };

    if (profile) {
      loadActivities();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, profile]);

  // Generate activities from profile data
  // TODO: Replace with API call when backend endpoint /api/teacher-portal/activities is implemented
  const generateSampleActivities = useCallback(
    (profile: TeacherProfile): TeacherActivity[] => {
      const activities: TeacherActivity[] = [];
      const now = new Date();

      // Check localStorage for cached fallback activities
      const cachedKey = `fallback_activities_${currentUser?.id}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.timestamp &&
            now.getTime() - parsed.timestamp < CACHE_DURATION
          ) {
            return parsed.activities;
          }
        } catch (e) {
          // Invalid cache, continue to generate
        }
      }

      // Activity from teaching classes
      if (profile.teachingClasses && profile.teachingClasses.length > 0) {
        const totalStudents = profile.teachingClasses.reduce(
          (acc, c) => acc + (c._count?.students || 0),
          0,
        );
        const timestamp = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        activities.push({
          id: "teaching_classes",
          type: "CLASS_ASSIGNED",
          title: "បង្រៀនថ្នាក់រៀន",
          description: `កំពុងបង្រៀន ${profile.teachingClasses.length} ថ្នាក់ • ${totalStudents} សិស្សសរុប`,
          icon: "Users",
          color: "from-blue-500 to-indigo-600",
          timestamp: timestamp.toISOString(),
          metadata: {
            studentCount: totalStudents,
            classCount: profile.teachingClasses.length,
          },
        });
      }

      // Activity from homeroom class
      if (profile.homeroomClass) {
        const timestamp = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
        activities.push({
          id: "homeroom",
          type: "CLASS_ASSIGNED",
          title: "ថ្នាក់ទទួលបន្ទុក",
          description: `${profile.homeroomClass.name} • ${profile.homeroomClass._count?.students || 0} សិស្ស`,
          icon: "Home",
          color: "from-green-500 to-emerald-600",
          timestamp: timestamp.toISOString(),
          metadata: {
            className: profile.homeroomClass.name,
            studentCount: profile.homeroomClass._count?.students || 0,
          },
        });
      }

      // Activity from subjects
      if (profile.subjects && profile.subjects.length > 0) {
        const timestamp = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
        activities.push({
          id: "subjects",
          type: "ACHIEVEMENT_EARNED",
          title: "មុខវិជ្ជាបង្រៀន",
          description: `កំពុងបង្រៀន ${profile.subjects.length} មុខវិជ្ជា${profile.subjects[0]?.nameKh ? ` រួមមាន ${profile.subjects[0].nameKh}` : ""}`,
          icon: "BookOpen",
          color: "from-purple-500 to-pink-600",
          timestamp: timestamp.toISOString(),
          metadata: {
            subject: profile.subjects[0]?.nameKh,
            subjectCount: profile.subjects.length,
          },
        });
      }

      // Add profile update activity if user has complete profile
      if (profile.phone || profile.email) {
        const timestamp = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
        activities.push({
          id: "profile_complete",
          type: "ACHIEVEMENT_EARNED",
          title: "ព័ត៌មានលម្អិត",
          description: "បានបំពេញព័ត៌មានគណនីរួចរាល់",
          icon: "CheckCircle2",
          color: "from-emerald-500 to-green-600",
          timestamp: timestamp.toISOString(),
          metadata: {},
        });
      }

      // Add welcome activity if no other activities
      if (activities.length === 0) {
        const timestamp = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
        activities.push({
          id: "welcome",
          type: "ACHIEVEMENT_EARNED",
          title: "ស្វាគមន៍",
          description: "ការចូលប្រើប្រាស់គណនីលើកដំបូង",
          icon: "GraduationCap",
          color: "from-indigo-500 to-purple-600",
          timestamp: timestamp.toISOString(),
          metadata: {},
        });
      }

      const finalActivities = activities.slice(0, 5);

      // Cache the fallback activities
      try {
        localStorage.setItem(
          cachedKey,
          JSON.stringify({
            activities: finalActivities,
            timestamp: now.getTime(),
          }),
        );
      } catch (e) {
        // localStorage might be full, ignore
      }

      return finalActivities;
    },
    [currentUser?.id],
  );

  const fetchProfile = async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoadingProfile(true);
      setError(null);
      const profileData = await teacherPortalApi.getMyProfile();

      // Cache the data
      profileCache[currentUser.id] = profileData;
      cacheTimeRef.current.profile = Date.now();

      setProfile(profileData);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.message || "មិនអាចទាញយកទិន្នន័យបានទេ");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePhotoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB for original)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("ទំហំរូបភាពធំពេក។ សូមជ្រើសរើសរូបភាពតូចជាង 5MB");
        return;
      }

      try {
        // Show loading state
        const loadingToast = success("កំពុងដំណើរការរូបភាព...");

        // Compress the image
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.85,
          outputFormat: 'image/jpeg',
        });

        // Validate compressed size
        const compressedSize = getBase64Size(compressedDataUrl);
        if (!isImageSizeAcceptable(compressedDataUrl, 500 * 1024)) {
          showErrorToast(
            `រូបភាពធំពេកបន្ទាប់ពីបង្រួម (${formatBytes(compressedSize)}). សូមជ្រើសរើសរូបភាពតូចជាងនេះ`
          );
          return;
        }

        // Set the compressed photo
        setProfilePhoto(compressedDataUrl);

        // Save to localStorage
        if (currentUser?.id) {
          requestIdleCallback(() => {
            try {
              localStorage.setItem(
                `teacher_photo_${currentUser.id}`,
                compressedDataUrl
              );
            } catch (e) {
              console.error('Failed to save photo to localStorage:', e);
              showErrorToast("មិនអាចរក្សាទុករូបភាពបានទេ (ទំហំផ្ទុកពេញ)");
            }
          });
        }

        setShowPhotoOptions(false);
        success(
          `រូបភាពត្រូវបានដាក់ដោយជោគជ័យ (${formatBytes(compressedSize)})`
        );
      } catch (error: any) {
        console.error('Error compressing image:', error);
        showErrorToast(error.message || "មិនអាចដំណើរការរូបភាពបានទេ");
      }

      // Reset input
      event.target.value = '';
    },
    [currentUser?.id, success, showErrorToast],
  );

  const handleRemovePhoto = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "តើអ្នកប្រាកដថាចង់លុបរូបភាពនេះទេ?\nAre you sure you want to remove this photo?"
    );

    if (!confirmed) {
      return;
    }

    setProfilePhoto(null);
    if (currentUser?.id) {
      requestIdleCallback(() => {
        localStorage.removeItem(`teacher_photo_${currentUser.id}`);
      });
    }
    setShowPhotoOptions(false);
    success("រូបភាពត្រូវបានលុបដោយជោគជ័យ");
  }, [currentUser?.id, success]);

  const handleSocialAction = useCallback(
    (action: string) => {
      switch (action) {
        case "message":
          success("មុខងារផ្ញើសារនឹងមកដល់ឆាប់ៗនេះ");
          break;
        case "connect":
          success("មុខងារភ្ជាប់នឹងមកដល់ឆាប់ៗនេះ");
          break;
        case "share":
          if (navigator.share) {
            navigator
              .share({
                title: profile?.khmerName || "គ្រូបង្រៀន",
                text: `ព័ត៌មានលម្អិតអំពី ${profile?.khmerName || "គ្រូបង្រៀន"}`,
                url: window.location.href,
              })
              .then(() => success("បានចែករំលែកដោយជោគជ័យ"))
              .catch((error) => {
                if (error.name !== "AbortError") {
                  showErrorToast("មិនអាចចែករំលែកបានទេ");
                }
              });
          } else {
            // Fallback: copy to clipboard
            navigator.clipboard
              .writeText(window.location.href)
              .then(() => success("បានចម្លងតំណភ្ជាប់"))
              .catch(() => showErrorToast("មិនអាចចម្លងបានទេ"));
          }
          break;
        case "notify":
          success("មុខងារជូនដំណឹងនឹងមកដល់ឆាប់ៗនេះ");
          break;
        default:
          break;
      }
    },
    [profile, success, showErrorToast],
  );

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 pb-6">
        {/* Hero Section - Enhanced */}
        <HeroSection
          profile={profile}
          profilePhoto={profilePhoto}
          onSettingsClick={() => setIsEditingProfile(true)}
          onCameraClick={() => setShowPhotoOptions(true)}
          classCount={classCount}
          studentCount={studentCount}
          subjectCount={subjectCount}
        />

        <div className="px-4 space-y-4 pt-4 hide-scrollbar">
          {/* Social Action Buttons */}
          <SocialActionButtons onAction={handleSocialAction} />

          {/* Password Expiry Warning */}
          {passwordStatus && !dismissedWarning && (
            <div className="mt-4">
              <PasswordExpiryWarning
                isDefaultPassword={passwordStatus.isDefaultPassword}
                daysRemaining={passwordStatus.daysRemaining}
                hoursRemaining={passwordStatus.hoursRemaining}
                alertLevel={passwordStatus.alertLevel}
                onChangePassword={() => setShowPasswordModal(true)}
                onDismiss={() => setDismissedWarning(true)}
                canDismiss={passwordStatus.alertLevel !== "danger"}
              />
            </div>
          )}

          {/* Action Buttons */}
          <ActionButtons
            onEdit={() => setIsEditingProfile(true)}
            onPassword={() => setShowPasswordModal(true)}
          />

          {/* Achievement Badges - Real Data */}
          <AchievementBadges profile={profile} />

          {/* Activity Feed - Real Data */}
          <ActivityFeed activities={activities} loading={loadingActivities} />

          {/* Contact Information */}
          <ContactInfo profile={profile} />

          {/* Teaching Information */}
          {((profile.subjects && profile.subjects.length > 0) ||
            (profile.teachingClasses && profile.teachingClasses.length > 0) ||
            profile.homeroomClass) && <TeachingInfo profile={profile} />}
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
                cacheTimeRef.current.profile = Date.now();
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
        <TeacherPasswordModal
          onClose={() => {
            setShowPasswordModal(false);
            refetchPasswordStatus(); // Refetch status after password change
            setDismissedWarning(false); // Reset dismissal
          }}
        />
      )}

      {/* First Login Modal */}
      {showFirstLoginModal && passwordStatus && (
        <FirstLoginModal
          daysRemaining={passwordStatus.daysRemaining}
          onChangeNow={() => {
            setShowFirstLoginModal(false);
            localStorage.setItem("hasSeenPasswordWarning", "true");
            setShowPasswordModal(true);
          }}
          onRemindLater={() => {
            setShowFirstLoginModal(false);
            localStorage.setItem("hasSeenPasswordWarning", "true");
          }}
        />
      )}
    </MobileLayout>
  );
}

// Memoized Hero Section Component - Enhanced with custom comparison
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
      {/* Enhanced Background with larger height */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Settings Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onSettingsClick}
          aria-label="កែប្រែព័ត៌មានគណនី / Edit profile settings"
          className="p-3 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg hover:bg-white/30 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Profile Content - Enhanced */}
      <div className="relative z-10 pt-16 pb-6 px-4">
        <div className="flex flex-col items-center mb-4">
          {/* Avatar - Enhanced with glow */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full blur-xl opacity-75"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-white to-gray-100 rounded-full p-1 shadow-2xl">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="រូបភាពគ្រូបង្រៀន / Teacher profile photo"
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
              aria-label="ផ្លាស់ប្តូររូបភាព / Change profile photo"
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Name & Title - Enhanced */}
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
              <span className="text-sm font-koulen text-white">
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

        {/* Stats Grid - Enhanced */}
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
  ),
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.profilePhoto === nextProps.profilePhoto &&
      prevProps.classCount === nextProps.classCount &&
      prevProps.studentCount === nextProps.studentCount &&
      prevProps.subjectCount === nextProps.subjectCount &&
      prevProps.profile.khmerName === nextProps.profile.khmerName &&
      prevProps.profile.englishName === nextProps.profile.englishName &&
      prevProps.profile.role === nextProps.profile.role &&
      prevProps.profile.position === nextProps.profile.position
    );
  },
);

HeroSection.displayName = "HeroSection";

// Memoized Stat Card
const StatCard = memo(({ icon: Icon, value, label, color }: any) => (
  <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-4 border border-white/25 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 will-change-transform">
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-2 shadow-lg animate-pulse-subtle`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl font-black text-white mb-1 tabular-nums">
        {value}
      </p>
      <p className="text-xs font-bold text-white/90 text-center leading-tight">
        {label}
      </p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

// Social Action Buttons Component - NEW!
const SocialActionButtons = memo(
  ({ onAction }: { onAction?: (action: string) => void }) => {
    const handleAction = (action: string) => {
      if (onAction) {
        onAction(action);
      }
    };

    return (
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => handleAction("message")}
          aria-label="ផ្ញើសារ / Send message"
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 hover:border-indigo-400 hover:bg-gray-50 transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-xs font-bold">ផ្ញើសារ</span>
        </button>

        <button
          onClick={() => handleAction("connect")}
          aria-label="ភ្ជាប់ / Connect"
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 hover:border-blue-400 hover:bg-gray-50 transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-bold">ភ្ជាប់</span>
        </button>

        <button
          onClick={() => handleAction("share")}
          aria-label="ចែករំលែក / Share profile"
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 hover:border-green-400 hover:bg-gray-50 transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Share2 className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs font-bold">ចែករំលែក</span>
        </button>

        <button
          onClick={() => handleAction("notify")}
          aria-label="ជូនដំណឹង / Enable notifications"
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 hover:border-amber-400 hover:bg-gray-50 transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs font-bold">ជូនដំណឹង</span>
        </button>
      </div>
    );
  },
);

SocialActionButtons.displayName = "SocialActionButtons";

// Action Buttons Component
const ActionButtons = memo(({ onEdit, onPassword }: any) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={onEdit}
      className="flex items-center justify-center gap-2 bg-white rounded-2xl px-6 py-4 border border-gray-200 hover:border-indigo-400 hover:bg-gray-50 transition-all active:scale-95 group"
    >
      <Edit3 className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
      <span className="font-bold font-koulen text-gray-900">កែប្រែ</span>
    </button>
    <button
      onClick={onPassword}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-6 py-4 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 group"
    >
      <Lock className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      <span className="font-bold font-koulen text-white">ពាក្យសម្ងាត់</span>
    </button>
  </div>
));

ActionButtons.displayName = "ActionButtons";

// Achievement Badges Component - Real Data!
const AchievementBadges = memo(({ profile }: { profile: TeacherProfile }) => {
  // Memoize achievements calculation for better performance
  const achievements = useMemo(() => {
    const badges = [];

    // High Class Count
    if (profile.teachingClasses && profile.teachingClasses.length >= 3) {
      const totalStudents = profile.teachingClasses.reduce(
        (acc, c) => acc + (c._count?.students || 0),
        0,
      );
      badges.push({
        icon: Users,
        title: "គ្រូពេញនិយម",
        subtitle: `Popular Teacher • ${profile.teachingClasses.length} ថ្នាក់`,
        badgeIcon: TrendingUp,
        stats: `${totalStudents} សិស្ស`,
        color: "blue",
      });
    }

    // Multiple Subjects
    if (profile.subjects && profile.subjects.length >= 2) {
      badges.push({
        icon: BookOpen,
        title: "អ្នកជំនាញពហុមុខវិជ្ជា",
        subtitle: `Multi-Subject Expert • ${profile.subjects.length} មុខវិជ្ជា`,
        badgeIcon: Award,
        stats: profile.subjects
          .map((s) => s.nameKh || s.name)
          .slice(0, 2)
          .join(", "),
        color: "purple",
      });
    }

    // Homeroom Teacher
    if (profile.role === "INSTRUCTOR" && profile.homeroomClass) {
      badges.push({
        icon: Home,
        title: "គ្រូថ្នាក់",
        subtitle: `Class Instructor • ${profile.homeroomClass.name}`,
        badgeIcon: CheckCircle2,
        stats: `${profile.homeroomClass._count?.students || 0} សិស្ស`,
        color: "green",
      });
    }

    // High Student Count
    const totalStudents =
      (profile.homeroomClass?._count?.students || 0) +
      (profile.teachingClasses?.reduce(
        (acc, c) => acc + (c._count?.students || 0),
        0,
      ) || 0);

    if (totalStudents >= 50) {
      const level =
        totalStudents >= 100
          ? "Gold"
          : totalStudents >= 75
            ? "Silver"
            : "Bronze";
      badges.push({
        icon: Award,
        title: "គ្រូដ៏មានឥទ្ធិពល",
        subtitle: `Influential Teacher • ${level}`,
        badgeIcon: Sparkles,
        stats: `${totalStudents} សិស្សសរុប`,
        color: "yellow",
      });
    }

    // Admin Role
    if (profile.role === "ADMIN") {
      badges.push({
        icon: Target,
        title: "អ្នកគ្រប់គ្រង",
        subtitle: "System Administrator",
        badgeIcon: Award,
        stats: "Full Access",
        color: "rose",
      });
    }

    // Experience (based on teaching classes and subjects)
    const experienceScore =
      (profile.teachingClasses?.length || 0) * 10 +
      (profile.subjects?.length || 0) * 5 +
      (profile.homeroomClass ? 15 : 0);

    if (experienceScore >= 25) {
      const level =
        experienceScore >= 50
          ? "Expert"
          : experienceScore >= 35
            ? "Advanced"
            : "Intermediate";
      badges.push({
        icon: GraduationCap,
        title: "កម្រិតបទពិសោធន៍",
        subtitle: `Experience Level • ${level}`,
        badgeIcon: BarChart3,
        stats: `Score: ${experienceScore}`,
        color: "indigo",
      });
    }

    return badges;
  }, [
    profile.teachingClasses,
    profile.subjects,
    profile.role,
    profile.homeroomClass,
  ]);

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-koulen font-black text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span>សមិទ្ធផល • Achievements</span>
        </h4>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
          {achievements.length} ពាន់
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement, index) => (
          <AchievementBadge key={index} {...achievement} />
        ))}
      </div>
    </div>
  );
});

AchievementBadges.displayName = "AchievementBadges";

// Achievement Badge Component
const AchievementBadge = memo(
  ({
    icon: Icon,
    title,
    subtitle,
    badgeIcon: BadgeIcon,
    stats,
    color,
  }: any) => {
    const colorConfig: Record<string, {
      bgGradient: string;
      border: string;
      textMain: string;
      iconBg: string;
      iconColor: string;
      badgeGradient: string;
    }> = {
      yellow: {
        bgGradient: "from-yellow-50 via-amber-50 to-yellow-50",
        border: "border-yellow-200",
        textMain: "text-yellow-900",
        iconBg: "bg-yellow-50",
        iconColor: "text-amber-600",
        badgeGradient: "bg-gradient-to-br from-yellow-500 to-orange-600",
      },
      green: {
        bgGradient: "from-green-50 via-emerald-50 to-green-50",
        border: "border-green-200",
        textMain: "text-green-900",
        iconBg: "bg-green-50",
        iconColor: "text-emerald-600",
        badgeGradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      },
      blue: {
        bgGradient: "from-blue-50 via-cyan-50 to-blue-50",
        border: "border-blue-200",
        textMain: "text-blue-900",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        badgeGradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
      },
      purple: {
        bgGradient: "from-purple-50 via-pink-50 to-purple-50",
        border: "border-purple-200",
        textMain: "text-purple-900",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        badgeGradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      },
      rose: {
        bgGradient: "from-rose-50 via-red-50 to-rose-50",
        border: "border-rose-200",
        textMain: "text-rose-900",
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        badgeGradient: "bg-gradient-to-br from-rose-500 to-red-600",
      },
      indigo: {
        bgGradient: "from-indigo-50 via-purple-50 to-indigo-50",
        border: "border-indigo-200",
        textMain: "text-indigo-900",
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        badgeGradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
      },
    };

    const colors = colorConfig[color] || colorConfig.blue;

    return (
      <div
        className={`flex items-center gap-3 bg-gradient-to-r ${colors.bgGradient} border-2 ${colors.border} px-4 py-3.5 rounded-2xl hover:border-opacity-80 transition-all`}
      >
        <div
          className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
        >
          <Icon className={`w-8 h-8 ${colors.iconColor} stroke-[2.5]`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${colors.textMain} mb-0.5`}>{title}</p>
          <p className={`text-xs ${colors.iconColor} font-semibold`}>
            {subtitle}
          </p>
          {stats && (
            <p className="text-xs text-gray-800 font-bold mt-1">
              {stats}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 ${colors.badgeGradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
        >
          <BadgeIcon className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  },
);

AchievementBadge.displayName = "AchievementBadge";

// Activity Feed Component - Real Data!
const ActivityFeed = memo(
  ({
    activities,
    loading,
  }: {
    activities: TeacherActivity[];
    loading: boolean;
  }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-koulen font-black text-gray-900">
              សកម្មភាពថ្មីៗ • Recent Activity
            </h4>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl animate-pulse"
              >
                <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-koulen font-black text-gray-900">
              សកម្មភាពថ្មីៗ • Recent Activity
            </h4>
          </div>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              មិនទាន់មានសកម្មភាព
            </p>
            <p className="text-xs text-gray-500">No activities yet</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-black text-gray-900">
              សកម្មភាពថ្មីៗ • Recent Activity
            </h4>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    );
  },
);

ActivityFeed.displayName = "ActivityFeed";

// Activity Row Component
const ActivityRow = memo(({ activity }: { activity: TeacherActivity }) => {
  const IconComponent = getIconComponent(activity.icon);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
      <div className={`p-2.5 bg-gradient-to-br ${activity.color} rounded-xl`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-600">{activity.description}</p>
      </div>
    </div>
  );
});

ActivityRow.displayName = "ActivityRow";

// Helper function to get icon component by name
function getIconComponent(iconName: string) {
  const icons: { [key: string]: any } = {
    Award,
    CheckCircle2,
    Target,
    TrendingUp,
    Activity,
    BookOpen,
    Users,
    Home,
    GraduationCap,
    FileCheck,
  };
  return icons[iconName] || Activity;
}

// Contact Info Component
const ContactInfo = memo(({ profile }: { profile: TeacherProfile }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
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
  <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
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
            {profile.teachingClasses.slice(0, 6).map((cls) => (
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
          {profile.teachingClasses.length > 6 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{profile.teachingClasses.length - 6} ថ្នាក់ទៀត
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
        <h4 className="text-xl font-koulen font-black text-gray-900 mb-4 text-center">
          ជ្រើសរើសរូបភាព
        </h4>
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
  ),
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 h-80 relative overflow-hidden">
        {/* Animated overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-150"></div>

        {/* Settings button skeleton */}
        <div className="absolute top-4 right-4 w-11 h-11 bg-white/20 rounded-2xl animate-pulse"></div>

        {/* Profile content skeleton */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-white/20 rounded-full animate-pulse delay-100"></div>
          </div>
          {/* Name */}
          <div className="w-48 h-6 bg-white/30 rounded-full mb-2 animate-pulse"></div>
          {/* English name */}
          <div className="w-32 h-4 bg-white/20 rounded-full mb-3 animate-pulse delay-75"></div>
          {/* Role badge */}
          <div className="w-28 h-9 bg-white/20 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 -mt-12 space-y-4 pb-6">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/70 rounded-3xl h-32 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
          ))}
        </div>

        {/* Social buttons skeleton */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-24 animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            ></div>
          ))}
        </div>

        {/* Badges skeleton */}
        <div className="bg-white rounded-3xl p-5 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded-full mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-2xl"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Activity feed skeleton */}
        <div className="bg-white rounded-3xl p-5 animate-pulse">
          <div className="h-6 w-56 bg-gray-200 rounded-full mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact info skeleton */}
        <div className="bg-white rounded-3xl h-40 animate-pulse delay-300"></div>
      </div>
    </div>
  );
}

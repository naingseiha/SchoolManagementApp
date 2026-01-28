"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Award, Sparkles, Code, Target, Briefcase, MessageSquare } from "lucide-react";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import AchievementsSection from "./AchievementsSection";
import ExperienceTimeline from "./ExperienceTimeline";
import RecommendationsSection from "./RecommendationsSection";
import ProfileHeader from "./ProfileHeader";
import RoleBasedStats from "./RoleBasedStats";
import LearningPerformance from "./student/LearningPerformance";
import TeachingExcellence from "./teacher/TeachingExcellence";
import ActivityHeatmap from "./student/ActivityHeatmap";
import SubjectMastery from "./student/SubjectMastery";
import LearningGoals from "./student/LearningGoals";
import EducatorLevel from "./teacher/EducatorLevel";
import EditAvatarModal from "./EditAvatarModal";
import EditCoverModal from "./EditCoverModal";
import EditProfileModal from "./EditProfileModal";
import { getUserProfile } from "@/lib/api/profile";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
    headline?: string;
    bio?: string;
    careerGoals?: string;
    location?: string;
    languages: string[];
    interests?: string[];
    professionalTitle?: string;
    isVerified: boolean;
    profileCompleteness: number;
    profileVisibility?: string;
    totalPoints: number;
    level: number;
    currentStreak: number;
    totalLearningHours: number;
    isOpenToOpportunities: boolean;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
      facebook?: string;
    };
    student?: {
      khmerName: string;
      class?: { name: string; grade: string };
    };
    teacher?: {
      khmerName: string;
      position?: string;
    };
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    projects: number;
    certifications: number;
    skills: number;
    achievements: number;
  };
}

interface ProfilePageProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function ProfilePage({ userId, isOwnProfile = false }: ProfilePageProps) {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"performance" | "skills" | "projects" | "achievements" | "progress" | "experience" | "recommendations">("performance");
  
  // Modal states
  const [showEditAvatar, setShowEditAvatar] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile(userId);
      
      const stats = {
        followers: userData.followersCount || 0,
        following: userData.followingCount || 0,
        posts: userData.postsCount || 0,
        skills: 0,
        projects: 0,
        certifications: 0,
        achievements: 0,
      };
      
      setProfile({ user: userData, stats });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSuccess = async (newAvatarUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        user: { ...profile.user, profilePictureUrl: newAvatarUrl }
      });
    }
    // Refresh AuthContext user data
    await refreshUser();
  };

  const handleCoverSuccess = async (newCoverUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        user: { ...profile.user, coverPhotoUrl: newCoverUrl }
      });
    }
    // Refresh AuthContext user data
    await refreshUser();
  };

  const handleProfileSuccess = async () => {
    await fetchProfile(); // Refresh profile data
    // Refresh AuthContext user data
    await refreshUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile || !profile.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { user, stats } = profile;
  const role = user.student ? "student" : user.teacher ? "teacher" : "student";

  // Mock data for demonstration - will be replaced with real API data
  const mockLearningData = {
    currentStreak: user.currentStreak || 12,
    longestStreak: 45,
    weeklyHours: [5, 2, 3, 1, 4, 2.5, 1],
    courses: [
      { id: "1", name: "Mathematics 101", progress: 80, grade: 85 },
      { id: "2", name: "Physics Advanced", progress: 60, grade: 78 },
      { id: "3", name: "Computer Science", progress: 95, grade: 92 }
    ],
    totalStudyHours: user.totalLearningHours || 142,
    averageGrade: 85
  };

  const mockTeachingData = {
    teachingSince: 2018,
    studentsTaught: 1247,
    coursesCreated: 24,
    teachingHours: 3420,
    successRate: 94,
    averageRating: 4.8,
    activeCourses: [
      { id: "1", name: "Advanced Physics", students: 42, rating: 4.9, completionRate: 92 },
      { id: "2", name: "Intro to Programming", students: 68, rating: 4.7, completionRate: 85 }
    ],
    achievements: [
      "15 students achieved A+ grades",
      "8 students won science competitions",
      "23 students published research projects"
    ]
  };

  const tabs = [
    { id: "performance", label: role === "student" ? "Learning" : "Teaching", icon: TrendingUp },
    { id: "progress", label: role === "student" ? "Goals & Activity" : "Level & Growth", icon: Target },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: Code },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "recommendations", label: "Recommendations", icon: MessageSquare }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-20">
      {/* Profile Header */}
      <ProfileHeader
        user={{
          ...user,
          bio: user.bio,
          interests: user.interests,
        }}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setShowEditProfile(true)}
        onEditCover={() => setShowEditCover(true)}
        onEditAvatar={() => setShowEditAvatar(true)}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Stats Grid */}
        <div className="mb-8">
          <RoleBasedStats
            stats={stats}
            role={role}
            additionalStats={
              role === "student"
                ? {
                    studyHours: user.totalLearningHours || 142,
                    coursesCompleted: 12,
                    averageGrade: 85
                  }
                : {
                    studentsTaught: mockTeachingData.studentsTaught,
                    coursesCreated: mockTeachingData.coursesCreated,
                    averageRating: mockTeachingData.averageRating,
                    teachingHours: mockTeachingData.teachingHours
                  }
            }
          />
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-2 mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "performance" && (
            <div>
              {role === "student" ? (
                <LearningPerformance {...mockLearningData} />
              ) : (
                <TeachingExcellence {...mockTeachingData} />
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-8">
              {role === "student" ? (
                <>
                  {/* Activity Heatmap */}
                  <ActivityHeatmap
                    data={[
                      // Mock data - generate some random activity
                      ...Array.from({ length: 365 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (365 - i));
                        return {
                          date: date.toISOString().split('T')[0],
                          count: Math.random() > 0.6 ? Math.floor(Math.random() * 8) : 0
                        };
                      })
                    ]}
                    title="Learning Activity"
                  />
                  
                  {/* Subject Mastery */}
                  <SubjectMastery
                    subjects={[
                      { subject: "Math", score: 85, fullMark: 100 },
                      { subject: "Science", score: 92, fullMark: 100 },
                      { subject: "English", score: 78, fullMark: 100 },
                      { subject: "History", score: 88, fullMark: 100 },
                      { subject: "CS", score: 95, fullMark: 100 },
                      { subject: "Art", score: 72, fullMark: 100 }
                    ]}
                  />
                  
                  {/* Learning Goals */}
                  <LearningGoals userId={userId} isOwnProfile={isOwnProfile} />
                </>
              ) : (
                <>
                  {/* Educator Level */}
                  <EducatorLevel
                    currentLevel={5}
                    currentXP={18500}
                    nextLevelXP={30000}
                    totalStudentsTaught={mockTeachingData.studentsTaught}
                    averageRating={mockTeachingData.averageRating}
                    coursesCreated={mockTeachingData.coursesCreated}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <SkillsSection userId={userId} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "experience" && (
            <ExperienceTimeline userId={userId} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "projects" && (
            <ProjectsSection userId={userId} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "achievements" && (
            <AchievementsSection userId={userId} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "recommendations" && (
            <RecommendationsSection userId={userId} isOwnProfile={isOwnProfile} />
          )}
        </motion.div>
      </div>

      {/* Edit Modals */}
      <AnimatePresence>
        {showEditAvatar && (
          <EditAvatarModal
            currentAvatar={user.profilePictureUrl}
            userName={`${user.firstName} ${user.lastName}`}
            onClose={() => setShowEditAvatar(false)}
            onSuccess={handleAvatarSuccess}
          />
        )}

        {showEditCover && (
          <EditCoverModal
            currentCover={user.coverPhotoUrl}
            onClose={() => setShowEditCover(false)}
            onSuccess={handleCoverSuccess}
          />
        )}

        {showEditProfile && (
          <EditProfileModal
            currentData={{
              bio: user.bio,
              headline: user.headline,
              location: user.location,
              interests: user.interests,
              socialLinks: user.socialLinks,
              profileVisibility: user.profileVisibility,
            }}
            onClose={() => setShowEditProfile(false)}
            onSuccess={handleProfileSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Award, Sparkles, Code, Target, Briefcase, MessageSquare, User } from "lucide-react";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import AchievementsSection from "./AchievementsSection";
import ExperienceTimeline from "./ExperienceTimeline";
import RecommendationsSection from "./RecommendationsSection";
import ProfileHeader from "./ProfileHeader";
import RoleBasedStats from "./RoleBasedStats";
import ProfileInfoSection from "./ProfileInfoSection";
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

// Inline StatsCard component - Redesigned for elegance
interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: "purple" | "blue" | "green" | "orange" | "yellow" | "pink" | "teal";
}

function StatsCard({ icon, value, label, color }: StatsCardProps) {
  const colorClasses = {
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
  };

  const bgColor = colorClasses[color] || colorClasses.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`${bgColor} rounded-xl p-4 border transition-all cursor-default`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
        </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {label}
        </div>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [activeTab, setActiveTab] = useState<"performance" | "about" | "skills" | "projects" | "achievements" | "progress" | "experience" | "recommendations">("performance");
  
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
    { id: "about", label: "About", icon: User },
    { id: "progress", label: role === "student" ? "Goals & Activity" : "Level & Growth", icon: Target },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: Code },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "recommendations", label: "Recommendations", icon: MessageSquare }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 min-h-screen pb-20">
      {/* Profile Header */}
      <ProfileHeader
        user={{
          ...user,
          bio: user.bio,
          interests: user.interests,
          socialLinks: user.socialLinks,
        }}
        stats={{
          posts: stats.posts,
          followers: stats.followers,
          following: stats.following
        }}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setShowEditProfile(true)}
        onEditCover={() => setShowEditCover(true)}
        onEditAvatar={() => setShowEditAvatar(true)}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Performance Highlights - Simplified clean design */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Performance Highlights
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {role === "student" ? (
              <>
                <StatsCard icon="📚" value={12} label="Courses" color="purple" />
                <StatsCard icon="📈" value="85%" label="Avg Grade" color="green" />
                <StatsCard icon="⏰" value={user.totalLearningHours || 142} label="Study Hours" color="blue" />
                <StatsCard icon="🔥" value={user.currentStreak} label="Day Streak" color="orange" />
                <StatsCard icon="🏆" value={stats.achievements} label="Achievements" color="yellow" />
                <StatsCard icon="💻" value={stats.projects} label="Projects" color="teal" />
              </>
            ) : (
              <>
                <StatsCard icon="👥" value={mockTeachingData.studentsTaught} label="Students" color="purple" />
                <StatsCard icon="📚" value={mockTeachingData.coursesCreated} label="Courses" color="blue" />
                <StatsCard icon="⭐" value={`${mockTeachingData.averageRating}/5`} label="Rating" color="yellow" />
                <StatsCard icon="📈" value={`${mockTeachingData.successRate}%`} label="Success" color="green" />
                <StatsCard icon="⏰" value={`${Math.floor(mockTeachingData.teachingHours/100)/10}K`} label="Teaching Hrs" color="orange" />
                <StatsCard icon="🏆" value={stats.certifications} label="Certifications" color="pink" />
              </>
            )}
        </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-10">
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8"
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
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
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

          {activeTab === "about" && (
            <ProfileInfoSection
              role={role}
              user={{
                bio: user.bio,
                careerGoals: user.careerGoals,
                location: user.location,
                languages: user.languages || [],
                professionalTitle: user.professionalTitle,
                isOpenToOpportunities: user.isOpenToOpportunities,
                socialLinks: user.socialLinks,
                student: user.student,
                teacher: user.teacher ? {
                  position: user.teacher.position,
                  yearsOfExperience: mockTeachingData.teachingSince 
                    ? new Date().getFullYear() - mockTeachingData.teachingSince 
                    : undefined,
                  specializations: ["Computer Science", "Software Engineering", "Web Development"] // Mock data
                } : undefined
              }}
              educationalInfo={
                role === "student" 
                  ? {
                      institution: user.student?.class?.name || "Stunity University",
                      degree: "Bachelor of Science",
                      major: "Computer Science",
                      graduationYear: 2026,
                      certifications: [
                        "React Developer Certificate",
                        "Python Programming",
                        "Data Structures & Algorithms"
                      ]
                    }
                  : role === "teacher"
                  ? {
                      institution: "Royal University of Phnom Penh",
                      degree: "Ph.D. in Computer Science",
                      major: "Software Engineering",
                      graduationYear: 2020,
                      certifications: [
                        "Advanced Teaching Methodology",
                        "Curriculum Design Specialist",
                        "Google Certified Educator",
                        "Microsoft Innovative Educator",
                        "AWS Certified Solutions Architect"
                      ]
                    }
                  : undefined
              }
              availability={
                role === "teacher" || role === "educator"
                  ? {
                      status: "available",
                      responseTime: "Usually responds within 2 hours",
                      acceptingStudents: true,
                      acceptingProjects: true
                    }
                  : undefined
              }
            />
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

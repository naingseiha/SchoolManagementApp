"use client";

import { motion } from "framer-motion";
import { Camera, MapPin, Briefcase, GraduationCap, Star, CheckCircle2, Edit2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ProgressBar from "./shared/ProgressBar";

interface ProfileHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
    headline?: string;
    location?: string;
    professionalTitle?: string;
    isVerified: boolean;
    profileCompleteness: number;
    totalPoints: number;
    level: number;
    currentStreak: number;
    student?: {
      khmerName: string;
      class?: { name: string; grade: string };
    };
    teacher?: {
      khmerName: string;
      position?: string;
    };
  };
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onEditCover?: () => void;
  onEditAvatar?: () => void;
}

export default function ProfileHeader({
  user,
  isOwnProfile = false,
  onEditProfile,
  onEditCover,
  onEditAvatar
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;
  const khmerName = user.student?.khmerName || user.teacher?.khmerName;
  const role = user.student ? "Student" : user.teacher ? "Educator" : "User";
  const roleInfo = user.student 
    ? `${user.student.class?.grade || ''} ${user.student.class?.name || ''}`.trim()
    : user.teacher?.position || user.professionalTitle;

  // Default gradient if no cover photo
  const defaultGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  return (
    <div className="relative">
      {/* Cover Photo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 md:h-64 w-full overflow-hidden rounded-b-3xl"
        style={{
          background: user.coverPhotoUrl ? undefined : defaultGradient
        }}
      >
        {user.coverPhotoUrl && (
          <Image
            src={user.coverPhotoUrl}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        
        {/* Edit Cover Button */}
        {isOwnProfile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditCover}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Cover</span>
          </motion.button>
        )}
      </motion.div>

      {/* Profile Info Section */}
      <div className="relative px-4 md:px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative -mt-16 md:-mt-20"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-white dark:ring-gray-900 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
              {user.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}
            </div>
            
            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1"
            >
              <Star className="w-4 h-4 fill-white" />
              Level {user.level}
            </motion.div>

            {/* Edit Avatar Button */}
            {isOwnProfile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEditAvatar}
                className="absolute bottom-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>

          {/* Name & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex-1 mt-4 md:mt-0 md:mb-4"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {fullName}
                  </h1>
                  {user.isVerified && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500" />
                  )}
                </div>
                
                {khmerName && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-khmer">
                    {khmerName}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {roleInfo && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      {user.student ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : (
                        <Briefcase className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{roleInfo}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </div>

                {user.headline && (
                  <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">
                    {user.headline}
                  </p>
                )}

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                      {user.totalPoints.toLocaleString()} points
                    </span>
                  </div>
                  
                  {user.currentStreak > 0 && (
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-3 py-1 rounded-full"
                    >
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-bold text-orange-800 dark:text-orange-300">
                        {user.currentStreak} day streak
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEditProfile}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all ${
                        isFollowing
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Message
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            {isOwnProfile && user.profileCompleteness < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Completion
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {user.profileCompleteness}%
                  </span>
                </div>
                <ProgressBar 
                  value={user.profileCompleteness} 
                  color="purple"
                  height="h-2"
                  showPercentage={false}
                  delay={0.6}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Complete your profile to increase visibility and opportunities!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

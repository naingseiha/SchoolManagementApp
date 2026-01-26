"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FeedPage from "@/components/feed/FeedPage";
import FeedHeader from "@/components/feed/FeedHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { 
  Loader2,
  Rss,
  FileText,
  GraduationCap,
  Brain,
  HelpCircle,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  BarChart3,
  Briefcase,
  Book,
  Microscope,
  Trophy,
  Lightbulb,
  Users as UsersIcon,
} from "lucide-react";
import type { PostType } from "@/lib/api/feed";

const POST_TYPE_FILTERS: {
  value: PostType | "ALL";
  icon: React.ElementType;
  labelKh: string;
}[] = [
  { value: "ALL", icon: Rss, labelKh: "ទាំងអស់" },
  { value: "ARTICLE", icon: FileText, labelKh: "អត្ថបទ" },
  { value: "COURSE", icon: GraduationCap, labelKh: "វគ្គសិក្សា" },
  { value: "PROJECT", icon: Briefcase, labelKh: "គម្រោង" },
  { value: "TUTORIAL", icon: Book, labelKh: "មេរៀន" },
  { value: "RESEARCH", icon: Microscope, labelKh: "ការស្រាវជ្រាវ" },
  { value: "ACHIEVEMENT", icon: Trophy, labelKh: "សមិទ្ធិផល" },
  { value: "QUIZ", icon: Brain, labelKh: "សំណួរក្លាយ" },
  { value: "QUESTION", icon: HelpCircle, labelKh: "សំណួរ" },
  { value: "EXAM", icon: ClipboardCheck, labelKh: "ប្រឡង" },
  { value: "ANNOUNCEMENT", icon: Megaphone, labelKh: "ប្រកាស" },
  { value: "ASSIGNMENT", icon: BookOpen, labelKh: "កិច្ចការ" },
  { value: "POLL", icon: BarChart3, labelKh: "មតិ" },
  { value: "REFLECTION", icon: Lightbulb, labelKh: "ការពិចារណា" },
  { value: "COLLABORATION", icon: UsersIcon, labelKh: "កិច្ចសហការ" },
];

export default function FeedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<PostType | "ALL">("ALL");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleFilterChange = useCallback((filter: PostType | "ALL") => {
    setSelectedFilter(filter);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header and Filters - Fixed at top with beautiful gradient */}
      <div className="flex-shrink-0">
        <FeedHeader />
        {/* Beautiful Filter Bar with animations */}
        <div className="backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm">
          <div className="px-4 py-3 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2">
              {POST_TYPE_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-stunity text-white shadow-lg shadow-stunity-primary-500/30 scale-105"
                        : "bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "animate-bounce-soft" : ""}`} />
                    <span>{filter.labelKh}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pb-20 pt-2">
          <FeedPage 
            onProfileClick={handleProfileClick}
            selectedFilter={selectedFilter}
          />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

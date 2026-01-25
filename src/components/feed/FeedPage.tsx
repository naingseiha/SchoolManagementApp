"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  RefreshCw,
  Loader2,
  Filter,
  Award,
  Target,
  BookOpen,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Rss,
  ChevronDown,
  X,
} from "lucide-react";
import {
  getFeedPosts,
  Post,
  PostType,
  POST_TYPE_INFO,
} from "@/lib/api/feed";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { useAuth } from "@/context/AuthContext";

interface FeedPageProps {
  showCreatePost?: boolean;
  onProfileClick?: (userId: string) => void;
}

const POST_TYPE_FILTERS: {
  value: PostType | "ALL";
  icon: React.ElementType;
  labelKh: string;
}[] = [
  { value: "ALL", icon: Rss, labelKh: "ទាំងអស់" },
  { value: "STATUS", icon: MessageSquare, labelKh: "ស្ថានភាព" },
  { value: "ACHIEVEMENT", icon: Award, labelKh: "សមិទ្ធផល" },
  { value: "LEARNING_GOAL", icon: Target, labelKh: "គោលដៅ" },
  { value: "RESOURCE_SHARE", icon: BookOpen, labelKh: "ធនធាន" },
  { value: "QUESTION", icon: HelpCircle, labelKh: "សំណួរ" },
  { value: "ANNOUNCEMENT", icon: Megaphone, labelKh: "ប្រកាស" },
];

function FeedPage({ showCreatePost = true, onProfileClick }: FeedPageProps) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<PostType | "ALL">("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts
  const fetchPosts = useCallback(
    async (page: number, refresh: boolean = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        setError(null);

        const response = await getFeedPosts({
          page,
          limit: 10,
          postType: selectedFilter === "ALL" ? undefined : selectedFilter,
        });

        if (refresh || page === 1) {
          setPosts(response.data);
        } else {
          setPosts((prev) => [...prev, ...response.data]);
        }

        setHasMore(response.pagination.hasMore);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("Failed to fetch posts:", err);
        setError(err.message || "មិនអាចទាញយកការផ្សាយបានទេ");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [selectedFilter]
  );

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Handle post created
  const handlePostCreated = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Handle post deleted
  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: PostType | "ALL") => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);
    setCurrentPage(1);
    setPosts([]);
    setHasMore(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchPosts(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchPosts]);

  // Get user info for create post
  const getUserName = () => {
    if (currentUser?.student?.khmerName) return currentUser.student.khmerName;
    if (currentUser?.teacher?.khmerName) return currentUser.teacher.khmerName;
    if (currentUser) return `${currentUser.firstName} ${currentUser.lastName}`;
    return "អ្នកប្រើប្រាស់";
  };

  const selectedFilterInfo = POST_TYPE_FILTERS.find(
    (f) => f.value === selectedFilter
  );
  const FilterIcon = selectedFilterInfo?.icon || Rss;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              មតិព័ត៌មាន
            </span>
          </h1>

          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <FilterIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {selectedFilterInfo?.labelKh}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {POST_TYPE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 ${
                          selectedFilter === filter.value
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-700"
                        }`}
                      >
                        <filter.icon className="w-4 h-4" />
                        <span>{filter.labelKh}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
        {/* Create Post */}
        {showCreatePost && (
          <CreatePost
            userProfilePicture={null}
            userName={getUserName()}
            onPostCreated={handlePostCreated}
            onError={(error) => setError(error)}
          />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-red-600 text-sm underline mt-1"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-gray-500">កំពុងផ្ទុកមតិព័ត៌មាន...</p>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rss className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              មិនមានការផ្សាយនៅឡើយទេ
            </h3>
            <p className="text-gray-500 text-sm">
              ចាប់ផ្តើមចែករំលែកអ្វីមួយជាមួយសហគមន៍សិក្សា!
            </p>
          </div>
        )}

        {!isLoading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onPostDeleted={handlePostDeleted}
              onProfileClick={onProfileClick}
            />
          ))}

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="py-4">
            {isLoadingMore && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">
              អ្នកបានមើលការផ្សាយទាំងអស់ហើយ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FeedPage);

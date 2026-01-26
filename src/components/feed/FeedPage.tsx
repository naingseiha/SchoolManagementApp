"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  Loader2,
  Rss,
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
  selectedFilter?: PostType | "ALL";
}

function FeedPage({ showCreatePost = true, onProfileClick, selectedFilter: externalFilter }: FeedPageProps) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const selectedFilter = externalFilter || "ALL";

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

  return (
    <div className="w-full pt-2">
      {/* Create Post */}
        {showCreatePost && (
          <div className="mb-4 animate-fade-in">
            <CreatePost
              userProfilePicture={null}
              userName={getUserName()}
              onPostCreated={handlePostCreated}
              onError={(error) => setError(error)}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-red-600 text-sm font-medium underline mt-0.5"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading posts...</p>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Rss className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No posts yet
            </h3>
            <p className="text-sm text-gray-500">
              Be the first to share something!
            </p>
          </div>
        )}

        <div>
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
        </div>

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="py-4">
            {isLoadingMore && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-xs">
              You've seen all posts
            </p>
          </div>
        )}
    </div>
  );
}

export default memo(FeedPage);

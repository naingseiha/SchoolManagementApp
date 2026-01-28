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
import PostCardSkeleton from "./PostCardSkeleton";
import { useAuth } from "@/context/AuthContext";
import StunityLoader from "@/components/common/StunityLoader";
import { socketClient } from "@/lib/socket";

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
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const selectedFilter = externalFilter || "ALL";

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Real-time post updates via Socket.IO
  useEffect(() => {
    if (!currentUser) return;

    const handlePostUpdate = (data: {
      postId: string;
      likesCount?: number;
      commentsCount?: number;
      type: "like" | "unlike" | "comment";
      userId: string;
    }) => {
      console.log("📬 Post update received:", data);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === data.postId) {
            const updates: Partial<Post> = {};

            // Update like count
            if (data.likesCount !== undefined) {
              updates.likesCount = data.likesCount;
            }

            // Update comment count
            if (data.commentsCount !== undefined) {
              updates.commentsCount = data.commentsCount;
            }

            // Update isLiked status if this user performed the action
            if (data.userId === currentUser.id) {
              if (data.type === "like") {
                updates.isLiked = true;
              } else if (data.type === "unlike") {
                updates.isLiked = false;
              }
            }

            return { ...post, ...updates };
          }
          return post;
        })
      );
    };

    // Listen for post updates
    socketClient.on("post:updated", handlePostUpdate);

    // Cleanup
    return () => {
      socketClient.off("post:updated", handlePostUpdate);
    };
  }, [currentUser]);

  // Prefetch next page (80% scroll threshold)
  const prefetchNextPage = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      // Clear existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
      // Prefetch with small delay to batch multiple scroll events
      prefetchTimeoutRef.current = setTimeout(() => {
        fetchPosts(currentPage + 1);
      }, 100);
    }
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchPosts]);

  // Infinite scroll observer with prefetching
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Observer for load more trigger at bottom
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

    // Prefetch observer (triggers earlier)
    const prefetchObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prefetchNextPage();
        }
      },
      { rootMargin: '400px' } // Prefetch when 400px away
    );

    if (loadMoreRef.current) {
      prefetchObserver.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      prefetchObserver.disconnect();
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchPosts, prefetchNextPage]);

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
              userProfilePicture={currentUser?.profilePictureUrl || null} // ✅ FIXED: Use actual profile picture
              userName={getUserName()}
              onPostCreated={handlePostCreated}
              onError={(error) => setError(error)}
            />
          </div>
        )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreatePost
              userProfilePicture={currentUser?.profilePictureUrl || null}
              userName={getUserName()}
              editMode={true}
              editPost={{
                id: editingPost.id,
                content: editingPost.content,
                postType: editingPost.postType,
                visibility: editingPost.visibility,
                media: editingPost.media,
                pollOptions: editingPost.pollOptions,
              }}
              onPostCreated={() => {
                setEditingPost(null);
                fetchPosts(1, true);
              }}
              onError={(error) => {
                setError(error);
                setEditingPost(null);
              }}
            />
          </div>
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

        {/* Loading State with Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
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
                onPostEdited={setEditingPost}
                onProfileClick={onProfileClick}
              />
          ))}
        </div>

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="py-4">
            {isLoadingMore && (
              <div className="flex items-center justify-center">
                <StunityLoader size="sm" />
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

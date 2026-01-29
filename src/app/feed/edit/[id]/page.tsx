"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import EditPostForm from "@/components/feed/EditPostForm";
import { getPostById } from "@/lib/api/feed";

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; profilePicture?: string | null }>({
    name: "User",
  });

  // ✅ Memoized user info extraction
  const extractUserInfo = useCallback((author: any) => {
    if (!author) return { name: "User", profilePicture: null };
    
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    const khmerName = author.student?.khmerName || 
                     author.teacher?.khmerName || 
                     author.parent?.khmerName || '';
    
    return {
      name: khmerName || `${firstName} ${lastName}`.trim() || "User",
      profilePicture: author.profilePictureUrl,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        
        if (!isMounted) return;
        
        setPost(data);
        setUserInfo(extractUserInfo(data.author));
      } catch (err) {
        console.error("Failed to fetch post:", err);
        if (isMounted) {
          setError("មិនអាចទាញយកការផ្សាយបានទេ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [postId, extractUserInfo]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col bg-white animate-fade-in">
        {/* Header Skeleton - Slide down animation */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white animate-slide-down">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton - Staggered slide up animations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User info skeleton */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Type badge skeleton */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-32 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
          </div>

          {/* Content skeleton */}
          <div className="animate-slide-up space-y-2" style={{ animationDelay: '0.3s' }}>
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Image skeleton */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-2 gap-2">
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            រកមិនឃើញការផ្សាយ
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || "ការផ្សាយដែលអ្នកកំពុងស្វែងរកមិនមានទេ ឬត្រូវបានលុបចោល។"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            ត្រឡប់ទៅកាន់ Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditPostForm
      post={post}
      userProfilePicture={userInfo.profilePicture}
      userName={userInfo.name}
    />
  );
}

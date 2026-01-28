"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        console.log('📝 Fetched post data:', data);
        console.log('📸 Post mediaUrls:', data.mediaUrls);
        setPost(data);
        
        // Get user info from post author
        if (data.author) {
          const firstName = data.author.firstName || '';
          const lastName = data.author.lastName || '';
          const khmerName = data.author.student?.khmerName || 
                           data.author.teacher?.khmerName || 
                           data.author.parent?.khmerName || '';
          
          setUserInfo({
            name: khmerName || `${firstName} ${lastName}`.trim() || "User",
            profilePicture: data.author.profilePictureUrl,
          });
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("មិនអាចទាញយកការផ្សាយបានទេ");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User info skeleton */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Type badge skeleton */}
          <div className="w-32 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Image skeleton */}
          <div className="grid grid-cols-2 gap-2">
            <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">{error || "រកមិនឃើញការផ្សាយ"}</p>
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

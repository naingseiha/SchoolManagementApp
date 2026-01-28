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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">កំពុងផ្ទុក...</p>
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

// Feed API Client for activity feed and social features

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Types
export type PostType =
  | "STATUS"
  | "ACHIEVEMENT"
  | "LEARNING_GOAL"
  | "RESOURCE_SHARE"
  | "QUESTION"
  | "ANNOUNCEMENT";

export type PostVisibility = "PUBLIC" | "SCHOOL" | "CLASS" | "PRIVATE";

export interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: string;
  student?: {
    khmerName: string;
    class?: {
      name: string;
      grade: string;
    };
  };
  teacher?: {
    khmerName?: string;
    position?: string;
  };
  parent?: {
    khmerName: string;
  };
}

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  mediaUrls: string[];
  postType: PostType;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isEdited: boolean;
  isPinned: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FeedResponse {
  data: Post[];
  pagination: Pagination;
}

export interface CommentsResponse {
  data: Comment[];
  pagination: Pagination;
}

export interface FollowUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  headline?: string;
  role: string;
  followedAt: string;
  isFollowedByMe: boolean;
  student?: {
    khmerName: string;
    class?: {
      name: string;
      grade: string;
    };
  };
  teacher?: {
    khmerName?: string;
    position?: string;
  };
  parent?: {
    khmerName: string;
  };
  suggestionReason?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actor?: PostAuthor;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
  pagination: Pagination;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper for authenticated fetch
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ==================== POST FUNCTIONS ====================

/**
 * Create a new post
 */
export const createPost = async (data: {
  content: string;
  postType?: PostType;
  visibility?: PostVisibility;
  media?: File[];
}): Promise<Post> => {
  const token = getAuthToken();
  const formData = new FormData();

  formData.append("content", data.content);
  if (data.postType) formData.append("postType", data.postType);
  if (data.visibility) formData.append("visibility", data.visibility);

  if (data.media) {
    data.media.forEach((file) => {
      formData.append("media", file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/feed/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create post" }));
    throw new Error(error.message);
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get feed posts (paginated)
 */
export const getFeedPosts = async (params?: {
  page?: number;
  limit?: number;
  postType?: PostType | "ALL";
}): Promise<FeedResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.postType) queryParams.set("postType", params.postType);

  const response = await authFetch(`/feed/posts?${queryParams.toString()}`);
  return response;
};

/**
 * Get single post by ID
 */
export const getPost = async (postId: string): Promise<Post> => {
  const response = await authFetch(`/feed/posts/${postId}`);
  return response.data;
};

/**
 * Update a post
 */
export const updatePost = async (
  postId: string,
  data: {
    content?: string;
    visibility?: PostVisibility;
  }
): Promise<Post> => {
  const response = await authFetch(`/feed/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string): Promise<void> => {
  await authFetch(`/feed/posts/${postId}`, {
    method: "DELETE",
  });
};

/**
 * Like/Unlike a post
 */
export const toggleLike = async (postId: string): Promise<{
  isLiked: boolean;
  likesCount: number;
}> => {
  const response = await authFetch(`/feed/posts/${postId}/like`, {
    method: "POST",
  });
  return response.data;
};

/**
 * Get user's posts
 */
export const getUserPosts = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<FeedResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const response = await authFetch(`/feed/users/${userId}/posts?${queryParams.toString()}`);
  return response;
};

// ==================== COMMENT FUNCTIONS ====================

/**
 * Get comments for a post
 */
export const getComments = async (
  postId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<CommentsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const response = await authFetch(`/feed/posts/${postId}/comments?${queryParams.toString()}`);
  return response;
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const response = await authFetch(`/feed/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return response.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  await authFetch(`/feed/comments/${commentId}`, {
    method: "DELETE",
  });
};

// ==================== SOCIAL FUNCTIONS ====================

/**
 * Follow a user
 */
export const followUser = async (userId: string): Promise<{
  isFollowing: boolean;
  followersCount: number;
}> => {
  const response = await authFetch(`/social/follow/${userId}`, {
    method: "POST",
  });
  return response.data;
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string): Promise<{
  isFollowing: boolean;
  followersCount: number;
}> => {
  const response = await authFetch(`/social/follow/${userId}`, {
    method: "DELETE",
  });
  return response.data;
};

/**
 * Get followers
 */
export const getFollowers = async (params?: {
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: FollowUser[];
  pagination: Pagination;
}> => {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.set("userId", params.userId);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const response = await authFetch(`/social/followers?${queryParams.toString()}`);
  return response;
};

/**
 * Get following
 */
export const getFollowing = async (params?: {
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: FollowUser[];
  pagination: Pagination;
}> => {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.set("userId", params.userId);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const response = await authFetch(`/social/following?${queryParams.toString()}`);
  return response;
};

/**
 * Get follow suggestions
 */
export const getFollowSuggestions = async (limit?: number): Promise<FollowUser[]> => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.set("limit", limit.toString());

  const response = await authFetch(`/social/suggestions?${queryParams.toString()}`);
  return response.data;
};

// ==================== NOTIFICATION FUNCTIONS ====================

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.unreadOnly) queryParams.set("unreadOnly", "true");

  const response = await authFetch(`/social/notifications?${queryParams.toString()}`);
  return response;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await authFetch(`/social/notifications/${notificationId}/read`, {
    method: "PUT",
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<void> => {
  await authFetch("/social/notifications/read-all", {
    method: "PUT",
  });
};

// Post type display info
export const POST_TYPE_INFO: Record<
  PostType,
  {
    label: string;
    labelKh: string;
    icon: string;
    color: string;
  }
> = {
  STATUS: {
    label: "Status",
    labelKh: "ស្ថានភាព",
    icon: "MessageSquare",
    color: "from-gray-500 to-slate-600",
  },
  ACHIEVEMENT: {
    label: "Achievement",
    labelKh: "សមិទ្ធផល",
    icon: "Award",
    color: "from-yellow-500 to-orange-600",
  },
  LEARNING_GOAL: {
    label: "Learning Goal",
    labelKh: "គោលដៅសិក្សា",
    icon: "Target",
    color: "from-green-500 to-emerald-600",
  },
  RESOURCE_SHARE: {
    label: "Resource",
    labelKh: "ធនធាន",
    icon: "BookOpen",
    color: "from-blue-500 to-cyan-600",
  },
  QUESTION: {
    label: "Question",
    labelKh: "សំណួរ",
    icon: "HelpCircle",
    color: "from-purple-500 to-pink-600",
  },
  ANNOUNCEMENT: {
    label: "Announcement",
    labelKh: "សេចក្តីប្រកាស",
    icon: "Megaphone",
    color: "from-red-500 to-rose-600",
  },
};

// Profile API Client for social media features

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface ProfileData {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  headline?: string;
  interests?: string[];
  skills?: string[];
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  profileVisibility?: string;
  profileCompleteness?: number;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  student?: {
    id: string;
    studentId?: string;
    khmerName: string;
    englishName?: string;
    gender: string;
    dateOfBirth: string;
    class?: {
      id: string;
      name: string;
      grade: string;
    };
  };
  teacher?: {
    id: string;
    teacherId?: string;
    khmerName?: string;
    englishName?: string;
    position?: string;
  };
  parent?: {
    id: string;
    parentId?: string;
    khmerName: string;
    englishName?: string;
    relationship?: string;
  };
}

interface ProfileCompletenessData {
  completeness: number;
  suggestions: string[];
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

// Profile API functions

/**
 * Get my profile (extended details)
 */
export const getMyProfile = async (): Promise<ProfileData> => {
  const response = await authFetch("/profile/me");
  return response.data;
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<ProfileData> => {
  const response = await authFetch(`/profile/${userId}`);
  return response.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<{
  profilePictureUrl: string;
  profileCompleteness: number;
}> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await fetch(`${API_BASE_URL}/profile/picture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || "Failed to upload profile picture");
  }

  const result = await response.json();
  return result.data;
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (): Promise<{
  profileCompleteness: number;
}> => {
  const response = await authFetch("/profile/picture", {
    method: "DELETE",
  });
  return response.data;
};

/**
 * Upload cover photo
 */
export const uploadCoverPhoto = async (file: File): Promise<{
  coverPhotoUrl: string;
  profileCompleteness: number;
}> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("coverPhoto", file);

  const response = await fetch(`${API_BASE_URL}/profile/cover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || "Failed to upload cover photo");
  }

  const result = await response.json();
  return result.data;
};

/**
 * Delete cover photo
 */
export const deleteCoverPhoto = async (): Promise<{
  profileCompleteness: number;
}> => {
  const response = await authFetch("/profile/cover", {
    method: "DELETE",
  });
  return response.data;
};

/**
 * Update bio and profile details
 */
export const updateBio = async (data: {
  bio?: string;
  headline?: string;
  interests?: string[];
  skills?: string[];
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  profileVisibility?: string;
}): Promise<{
  bio?: string;
  headline?: string;
  interests?: string[];
  skills?: string[];
  socialLinks?: any;
  profileVisibility?: string;
  profileCompleteness: number;
}> => {
  const response = await authFetch("/profile/bio", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Get profile completeness score
 */
export const getProfileCompleteness = async (): Promise<ProfileCompletenessData> => {
  const response = await authFetch("/profile/completeness");
  return response.data;
};

export type { ProfileData, ProfileCompletenessData };

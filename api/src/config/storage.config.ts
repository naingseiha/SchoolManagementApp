import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 Configuration (S3-compatible)
export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || "",
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  bucketName: process.env.R2_BUCKET_NAME || "school-app-media",
  publicUrl: process.env.R2_PUBLIC_URL || "",
};

// Validate R2 configuration
export const isR2Configured = (): boolean => {
  return !!(
    r2Config.accountId &&
    r2Config.accessKeyId &&
    r2Config.secretAccessKey &&
    r2Config.bucketName
  );
};

// Create S3 client for Cloudflare R2
export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

// File upload constraints
export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  profilePicture: {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
  },
  coverPhoto: {
    maxWidth: 1200,
    maxHeight: 400,
    quality: 85,
  },
  postMedia: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
  },
};

// Generate storage key paths
export const generateStorageKey = (
  type: "profile" | "cover" | "post",
  userId: string,
  filename: string
): string => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, "_");

  switch (type) {
    case "profile":
      return `profiles/${userId}/${timestamp}_${sanitizedFilename}`;
    case "cover":
      return `covers/${userId}/${timestamp}_${sanitizedFilename}`;
    case "post":
      return `posts/${userId}/${timestamp}_${sanitizedFilename}`;
    default:
      return `uploads/${userId}/${timestamp}_${sanitizedFilename}`;
  }
};

// Get public URL for a stored file
export const getPublicUrl = (key: string): string => {
  if (r2Config.publicUrl) {
    return `${r2Config.publicUrl}/${key}`;
  }
  // Fallback to direct R2 URL if public URL not configured
  return `https://${r2Config.bucketName}.${r2Config.accountId}.r2.cloudflarestorage.com/${key}`;
};

export default s3Client;

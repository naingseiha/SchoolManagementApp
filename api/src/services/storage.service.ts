import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import {
  s3Client,
  r2Config,
  uploadConfig,
  generateStorageKey,
  getPublicUrl,
  isR2Configured,
} from "../config/storage.config";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format?: "jpeg" | "png" | "webp";
}

class StorageService {
  /**
   * Process and compress image before upload
   */
  async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions
  ): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // Only resize if image is larger than max dimensions
      if (
        (metadata.width && metadata.width > options.maxWidth) ||
        (metadata.height && metadata.height > options.maxHeight)
      ) {
        sharpInstance = sharpInstance.resize(options.maxWidth, options.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Convert to specified format with quality
      const format = options.format || "jpeg";
      switch (format) {
        case "jpeg":
          return sharpInstance.jpeg({ quality: options.quality }).toBuffer();
        case "png":
          return sharpInstance.png({ quality: options.quality }).toBuffer();
        case "webp":
          return sharpInstance.webp({ quality: options.quality }).toBuffer();
        default:
          return sharpInstance.jpeg({ quality: options.quality }).toBuffer();
      }
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error("Failed to process image");
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    buffer: Buffer,
    userId: string,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    if (!isR2Configured()) {
      return {
        success: false,
        error: "R2 storage is not configured. Please add R2 credentials to .env",
      };
    }

    try {
      // Process image
      const processedBuffer = await this.processImage(buffer, {
        ...uploadConfig.profilePicture,
        format: "jpeg",
      });

      // Generate unique key
      const extension = ".jpg"; // Always save as JPEG after processing
      const key = generateStorageKey("profile", userId, `avatar${extension}`);

      // Upload to R2
      await s3Client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
          Body: processedBuffer,
          ContentType: "image/jpeg",
          CacheControl: "public, max-age=31536000", // Cache for 1 year
        })
      );

      const url = getPublicUrl(key);
      console.log(`✅ Profile picture uploaded: ${url}`);

      return {
        success: true,
        url,
        key,
      };
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload profile picture",
      };
    }
  }

  /**
   * Upload cover photo
   */
  async uploadCoverPhoto(
    buffer: Buffer,
    userId: string,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    if (!isR2Configured()) {
      return {
        success: false,
        error: "R2 storage is not configured",
      };
    }

    try {
      // Process image
      const processedBuffer = await this.processImage(buffer, {
        ...uploadConfig.coverPhoto,
        format: "jpeg",
      });

      const extension = ".jpg";
      const key = generateStorageKey("cover", userId, `cover${extension}`);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
          Body: processedBuffer,
          ContentType: "image/jpeg",
          CacheControl: "public, max-age=31536000",
        })
      );

      const url = getPublicUrl(key);
      console.log(`✅ Cover photo uploaded: ${url}`);

      return {
        success: true,
        url,
        key,
      };
    } catch (error: any) {
      console.error("Cover photo upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload cover photo",
      };
    }
  }

  /**
   * Upload post media (images)
   */
  async uploadPostMedia(
    buffer: Buffer,
    userId: string,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    if (!isR2Configured()) {
      return {
        success: false,
        error: "R2 storage is not configured",
      };
    }

    try {
      // Process image
      const processedBuffer = await this.processImage(buffer, {
        ...uploadConfig.postMedia,
        format: "jpeg",
      });

      const extension = ".jpg";
      const key = generateStorageKey("post", userId, `media${extension}`);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
          Body: processedBuffer,
          ContentType: "image/jpeg",
          CacheControl: "public, max-age=31536000",
        })
      );

      const url = getPublicUrl(key);

      return {
        success: true,
        url,
        key,
      };
    } catch (error: any) {
      console.error("Post media upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload media",
      };
    }
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<boolean> {
    if (!isR2Configured() || !key) {
      return false;
    }

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
        })
      );
      console.log(`✅ File deleted: ${key}`);
      return true;
    } catch (error: any) {
      console.error("File deletion error:", error);
      return false;
    }
  }

  /**
   * Check if a file exists in R2
   */
  async fileExists(key: string): Promise<boolean> {
    if (!isR2Configured() || !key) {
      return false;
    }

    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a presigned URL for direct upload (optional feature)
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 600 // 10 minutes
  ): Promise<string | null> {
    if (!isR2Configured()) {
      return null;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error("Presigned URL generation error:", error);
      return null;
    }
  }

  /**
   * Validate file type using magic bytes
   */
  validateFileType(buffer: Buffer): { valid: boolean; mimeType?: string } {
    // Check magic bytes for common image types
    const jpegMagic = buffer.slice(0, 3);
    const pngMagic = buffer.slice(0, 8);
    const webpMagic = buffer.slice(0, 12);
    const gifMagic = buffer.slice(0, 6);

    // JPEG: FF D8 FF
    if (jpegMagic[0] === 0xff && jpegMagic[1] === 0xd8 && jpegMagic[2] === 0xff) {
      return { valid: true, mimeType: "image/jpeg" };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      pngMagic[0] === 0x89 &&
      pngMagic[1] === 0x50 &&
      pngMagic[2] === 0x4e &&
      pngMagic[3] === 0x47 &&
      pngMagic[4] === 0x0d &&
      pngMagic[5] === 0x0a &&
      pngMagic[6] === 0x1a &&
      pngMagic[7] === 0x0a
    ) {
      return { valid: true, mimeType: "image/png" };
    }

    // WebP: RIFF....WEBP
    if (
      webpMagic[0] === 0x52 && // R
      webpMagic[1] === 0x49 && // I
      webpMagic[2] === 0x46 && // F
      webpMagic[3] === 0x46 && // F
      webpMagic[8] === 0x57 && // W
      webpMagic[9] === 0x45 && // E
      webpMagic[10] === 0x42 && // B
      webpMagic[11] === 0x50 // P
    ) {
      return { valid: true, mimeType: "image/webp" };
    }

    // GIF: GIF87a or GIF89a
    if (
      gifMagic[0] === 0x47 && // G
      gifMagic[1] === 0x49 && // I
      gifMagic[2] === 0x46 && // F
      gifMagic[3] === 0x38 && // 8
      (gifMagic[4] === 0x37 || gifMagic[4] === 0x39) && // 7 or 9
      gifMagic[5] === 0x61 // a
    ) {
      return { valid: true, mimeType: "image/gif" };
    }

    return { valid: false };
  }
}

export const storageService = new StorageService();
export default storageService;

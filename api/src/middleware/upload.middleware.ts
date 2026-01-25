import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { uploadConfig } from "../config/storage.config";
import { storageService } from "../services/storage.service";

// Configure multer for memory storage (we'll process and upload to R2)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    callback(
      new Error(
        `Invalid file type. Allowed types: ${uploadConfig.allowedMimeTypes.join(", ")}`
      )
    );
    return;
  }

  // Check file extension
  const ext = "." + file.originalname.split(".").pop()?.toLowerCase();
  if (!uploadConfig.allowedExtensions.includes(ext)) {
    callback(
      new Error(
        `Invalid file extension. Allowed extensions: ${uploadConfig.allowedExtensions.join(", ")}`
      )
    );
    return;
  }

  callback(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 10, // Max files per request
  },
});

// Middleware for single profile picture upload
export const uploadProfilePicture = upload.single("profilePicture");

// Middleware for single cover photo upload
export const uploadCoverPhoto = upload.single("coverPhoto");

// Middleware for multiple post media uploads (max 4)
export const uploadPostMedia = upload.array("media", 4);

// Validation middleware - validates file magic bytes after multer processing
export const validateFileContent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle single file
  if (req.file) {
    const validation = storageService.validateFileType(req.file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid file content. File does not match declared type.",
      });
    }
    // Update mimetype if validated
    req.file.mimetype = validation.mimeType!;
  }

  // Handle multiple files
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      const validation = storageService.validateFileType(file.buffer);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid file content for ${file.originalname}. File does not match declared type.`,
        });
      }
      file.mimetype = validation.mimeType!;
    }
  }

  next();
};

// Error handler middleware for multer errors
export const handleUploadError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    let message = "File upload error";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = `File too large. Maximum size is ${uploadConfig.maxFileSize / (1024 * 1024)}MB`;
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Maximum is 10 files per upload";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected field name in upload";
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error.message.includes("Invalid file")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

// Combined middleware for profile picture upload with validation
export const profilePictureUpload = [
  uploadProfilePicture,
  handleUploadError,
  validateFileContent,
];

// Combined middleware for cover photo upload with validation
export const coverPhotoUpload = [
  uploadCoverPhoto,
  handleUploadError,
  validateFileContent,
];

// Combined middleware for post media upload with validation
export const postMediaUpload = [
  uploadPostMedia,
  handleUploadError,
  validateFileContent,
];

export default upload;

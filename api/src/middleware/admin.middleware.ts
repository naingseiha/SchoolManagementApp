import { Request, Response, NextFunction } from "express";

export interface AdminRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * ✅ ADMIN MIDDLEWARE - Restrict access to admin-only operations
 */
export const adminMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🔐 Admin Middleware Check:");
    console.log("  - User Role:", req.userRole);

    if (!req.userRole || req.userRole !== "ADMIN") {
      console.log("❌ Access denied - User is not an admin");
      return res.status(403).json({
        success: false,
        message: "សូមអភ័យទោស អ្នកមិនមានសិទ្ធិចូលប្រើមុខងារនេះ\nAccess denied. Admin privileges required.",
      });
    }

    console.log("✅ Admin access granted");
    next();
  } catch (error) {
    console.error("❌ Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

/**
 * ✅ TEACHER_OR_ADMIN MIDDLEWARE - Allow both teachers and admins
 */
export const teacherOrAdminMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🔐 Teacher/Admin Middleware Check:");
    console.log("  - User Role:", req.userRole);

    if (!req.userRole || (req.userRole !== "ADMIN" && req.userRole !== "TEACHER")) {
      console.log("❌ Access denied - User is not a teacher or admin");
      return res.status(403).json({
        success: false,
        message: "Access denied. Teacher or admin privileges required.",
      });
    }

    console.log("✅ Teacher/Admin access granted");
    next();
  } catch (error) {
    console.error("❌ Teacher/Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

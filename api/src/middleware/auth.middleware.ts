import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 Auth Middleware Check:");
    console.log("  - Path:", req.path);
    console.log("  - Method:", req.method);

    const authHeader = req.headers.authorization;
    console.log("  - Auth Header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid auth header");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const token = authHeader.substring(7);
    console.log("  - Token length:", token.length);
    console.log("  - Token prefix:", token.substring(0, 20) + "...");

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
      };

      console.log("✅ Token verified successfully:");
      console.log("  - User:", decoded.email);
      console.log("  - Role:", decoded.role);
      console.log("  - Issued:", new Date(decoded.iat * 1000).toISOString());
      console.log("  - Expires:", new Date(decoded.exp * 1000).toISOString());

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      console.log(
        "  - Time until expiry:",
        Math.floor(timeUntilExpiry / 3600),
        "hours"
      );

      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      next();
    } catch (error: any) {
      console.log("❌ Token verification failed:");
      console.log("  - Error:", error.name);
      console.log("  - Message:", error.message);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
          code: "TOKEN_EXPIRED",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
          code: "INVALID_TOKEN",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

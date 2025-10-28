import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// ✅ Token expiration times
const TOKEN_EXPIRY = {
  SHORT: "1d", // 1 day - default
  MEDIUM: "7d", // 7 days - remember me
  LONG: "30d", // 30 days - long session
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 Login attempt:", { email, rememberMe: !!rememberMe });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Choose token expiry based on rememberMe option
    const expiresIn = rememberMe ? TOKEN_EXPIRY.MEDIUM : TOKEN_EXPIRY.SHORT;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn }
    );

    console.log("✅ Login successful:", email);
    console.log(`📅 Token expires in: ${expiresIn}`);
    console.log(
      `⏰ Remember me: ${rememberMe ? "YES (7 days)" : "NO (1 day)"}`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ✅ Token refresh endpoint
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const oldToken = authHeader.substring(7);

    try {
      // Verify old token (even if expired)
      const decoded = jwt.verify(oldToken, JWT_SECRET, {
        ignoreExpiration: true,
      }) as {
        userId: string;
        email: string;
        role: string;
      };

      // Check if token is too old (more than 30 days)
      const decodedComplete = jwt.decode(oldToken) as any;
      const tokenAge = Date.now() / 1000 - decodedComplete.iat;

      if (tokenAge > 30 * 24 * 60 * 60) {
        // 30 days
        return res.status(401).json({
          success: false,
          message: "Token too old. Please login again.",
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY.MEDIUM }
      );

      console.log("🔄 Token refreshed for:", decoded.email);

      res.json({
        success: true,
        message: "Token refreshed",
        data: {
          token: newToken,
          expiresIn: TOKEN_EXPIRY.MEDIUM,
        },
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error: any) {
    console.error("❌ Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("❌ Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

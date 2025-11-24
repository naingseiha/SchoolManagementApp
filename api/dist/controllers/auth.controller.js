"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.refreshToken = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// ✅ Define JWT options separately
const JWT_OPTIONS = {
    expiresIn: "7d",
};
// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔐 LOGIN attempt:", email);
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        // Find user
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
        // Check password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            console.log("❌ Invalid password for:", email);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // ✅ Generate token with separate options
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, JWT_SECRET, JWT_OPTIONS);
        console.log("✅ Login successful:", email);
        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};
exports.login = login;
// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required",
            });
        }
        // Verify old token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // ✅ Generate new token with separate options
        const newToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, JWT_SECRET, JWT_OPTIONS);
        res.json({
            success: true,
            data: {
                token: newToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error("❌ Refresh token error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.refreshToken = refreshToken;
// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
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
    }
    catch (error) {
        console.error("❌ Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user",
        });
    }
};
exports.getCurrentUser = getCurrentUser;

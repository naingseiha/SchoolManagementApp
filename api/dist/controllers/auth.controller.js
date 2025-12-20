"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.getCurrentUser = exports.changePassword = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// ✅ Token expiration times
const TOKEN_EXPIRY = {
    SHORT: "1d", // 1 day - default
    MEDIUM: "7d", // 7 days - remember me
    LONG: "30d", // 30 days - long session
};
/**
 * ✅ LOGIN - Support both phone and email
 */
const login = async (req, res) => {
    try {
        const { identifier, password, rememberMe } = req.body; // ✅ Changed from "email" to "identifier"
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔐 Login attempt:", { identifier, rememberMe: !!rememberMe });
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "លេខទូរស័ព្ទ/អ៊ីមែល និងពាក្យសម្ងាត់ត្រូវតែមាន\nPhone/Email and password are required",
            });
        }
        // ✅ Find user by phone OR email
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ phone: identifier.trim() }, { email: identifier.trim() }],
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        role: true,
                        homeroomClassId: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        classId: true,
                    },
                },
            },
        });
        if (!user) {
            console.log("❌ User not found:", identifier);
            return res.status(401).json({
                success: false,
                message: "លេខទូរស័ព្ទ/អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ\nInvalid credentials",
            });
        }
        // ✅ Check if account is active
        if (!user.isActive) {
            console.log("❌ Account deactivated:", identifier);
            return res.status(401).json({
                success: false,
                message: "គណនីត្រូវបានផ្អាក\nAccount is deactivated",
            });
        }
        // ✅ Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
            console.log("❌ Account locked:", identifier);
            return res.status(401).json({
                success: false,
                message: `គណនីត្រូវបានចាក់សោរ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេល ${minutesLeft} នាទី\nAccount locked.  Try again in ${minutesLeft} minutes`,
            });
        }
        // ✅ Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Invalid password for user:", identifier);
            // ✅ Increment failed attempts
            const newFailedAttempts = user.failedAttempts + 1;
            const shouldLock = newFailedAttempts >= 5;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: newFailedAttempts,
                    lockedUntil: shouldLock
                        ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
                        : null,
                },
            });
            return res.status(401).json({
                success: false,
                message: shouldLock
                    ? "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ គណនីត្រូវបានចាក់សោរ 15 នាទី\nToo many failed attempts. Account locked for 15 minutes"
                    : `ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (${newFailedAttempts}/5)\nInvalid password (${newFailedAttempts}/5 attempts)`,
            });
        }
        // ✅ Reset failed attempts and update login stats
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastLogin: new Date(),
                loginCount: user.loginCount + 1,
            },
        });
        // ✅ Choose token expiry based on rememberMe option
        const expiresIn = rememberMe ? TOKEN_EXPIRY.MEDIUM : TOKEN_EXPIRY.SHORT;
        // ✅ Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
            teacherId: user.teacherId,
            studentId: user.studentId,
        }, JWT_SECRET, { expiresIn });
        console.log("✅ Login successful:", identifier);
        console.log(`📅 Token expires in: ${expiresIn}`);
        console.log(`⏰ Remember me: ${rememberMe ? "YES (7 days)" : "NO (1 day)"}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        res.json({
            success: true,
            message: "ចូលប្រើប្រាស់បានជោគជ័យ\nLogin successful",
            data: {
                token,
                expiresIn,
                user: {
                    id: user.id,
                    phone: user.phone,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    teacher: user.teacher,
                    student: user.student,
                    permissions: user.permissions,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount + 1,
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
/**
 * ✅ CHANGE PASSWORD
 */
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "ពាក្យសម្ងាត់ចាស់ និងពាក្យសម្ងាត់ថ្មីត្រូវតែមាន\nOld and new passwords are required",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ\nPassword must be at least 6 characters",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Verify old password
        const isValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "ពាក្យសម្ងាត់ចាស់មិនត្រឹមត្រូវ\nInvalid current password",
            });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        console.log("✅ Password changed for user:", user.phone || user.email);
        res.json({
            success: true,
            message: "ប្តូរពាក្យសម្ងាត់បានជោគជ័យ\nPassword changed successfully",
        });
    }
    catch (error) {
        console.error("❌ Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message,
        });
    }
};
exports.changePassword = changePassword;
/**
 * ✅ GET CURRENT USER (with teacher/student data)
 */
const getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                phone: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                permissions: true,
                lastLogin: true,
                loginCount: true,
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        role: true,
                        position: true,
                        homeroomClassId: true,
                        homeroomClass: {
                            select: {
                                id: true,
                                name: true,
                                grade: true,
                                section: true,
                                track: true,
                            },
                        },
                        teachingClasses: {
                            include: {
                                class: {
                                    select: {
                                        id: true,
                                        name: true,
                                        grade: true,
                                        section: true,
                                        track: true,
                                    },
                                },
                            },
                        },
                        subjectAssignments: {
                            include: {
                                subject: {
                                    select: {
                                        id: true,
                                        name: true,
                                        nameKh: true,
                                        code: true,
                                        grade: true,
                                    },
                                },
                            },
                        },
                    },
                },
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        classId: true,
                        class: {
                            select: {
                                id: true,
                                name: true,
                                grade: true,
                                section: true,
                                track: true,
                            },
                        },
                    },
                },
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
exports.getCurrentUser = getCurrentUser;
/**
 * ✅ TOKEN REFRESH
 */
const refreshToken = async (req, res) => {
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
            const decoded = jsonwebtoken_1.default.verify(oldToken, JWT_SECRET, {
                ignoreExpiration: true,
            });
            // Check if token is too old (more than 30 days)
            const decodedComplete = jsonwebtoken_1.default.decode(oldToken);
            const tokenAge = Date.now() / 1000 - decodedComplete.iat;
            if (tokenAge > 30 * 24 * 60 * 60) {
                return res.status(401).json({
                    success: false,
                    message: "Token too old.  Please login again.",
                });
            }
            // Generate new token
            const newToken = jsonwebtoken_1.default.sign({
                userId: decoded.userId,
                phone: decoded.phone,
                email: decoded.email,
                role: decoded.role,
                teacherId: decoded.teacherId,
                studentId: decoded.studentId,
            }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY.MEDIUM });
            console.log("🔄 Token refreshed for:", decoded.phone || decoded.email);
            res.json({
                success: true,
                message: "Token refreshed",
                data: {
                    token: newToken,
                    expiresIn: TOKEN_EXPIRY.MEDIUM,
                },
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
    }
    catch (error) {
        console.error("❌ Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Token refresh failed",
            error: error.message,
        });
    }
};
exports.refreshToken = refreshToken;
/**
 * ✅ LOGOUT (optional - just for logging)
 */
const logout = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (userId) {
            console.log("👋 User logged out:", userId);
        }
        res.json({
            success: true,
            message: "ចាកចេញបានជោគជ័យ\nLogout successful",
        });
    }
    catch (error) {
        console.error("❌ Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: error.message,
        });
    }
};
exports.logout = logout;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = exports.refreshToken = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
/**
 * ✅ REGISTER - បង្កើតគណនីថ្មី
 */
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, phone } = req.body;
        console.log("📝 REGISTER REQUEST:", { email, role, firstName, lastName });
        if (!password || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                message: "សូមបំពេញព័ត៌មានទាំងអស់\nAll fields are required",
            });
        }
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ\nEmail already exists",
                });
            }
        }
        if (phone) {
            const existingPhone = await prisma.user.findUnique({
                where: { phone },
            });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "លេខទូរសព្ទនេះត្រូវបានប្រើរួចហើយ\nPhone number already exists",
                });
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: email || undefined,
                phone: phone || undefined,
                password: hashedPassword,
                firstName,
                lastName,
                role,
            },
        });
        // ✅ FIXED: Proper JWT signing
        const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email || user.phone || "",
            role: user.role,
        }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        console.log("✅ User registered successfully:", user.id);
        res.status(201).json({
            success: true,
            message: "បង្កើតគណនីបានជោគជ័យ\nRegistration successful",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error("❌ Register error:", error);
        res.status(500).json({
            success: false,
            message: "មានបញ្ហាក្នុងការបង្កើតគណនី\nRegistration failed",
            error: error.message,
        });
    }
};
exports.register = register;
/**
 * ✅ LOGIN - ចូលប្រើប្រាស់
 */
const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        console.log("🔐 LOGIN REQUEST:", { email, phone });
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "សូមបញ្ចូលពាក្យសម្ងាត់\nPassword is required",
            });
        }
        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: "សូមបញ្ចូលអ៊ីមែល ឬលេខទូរសព្ទ\nEmail or phone is required",
            });
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: email || undefined }, { phone: phone || undefined }],
            },
            include: {
                student: true,
                teacher: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ\nInvalid credentials",
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: user.failedAttempts + 1,
                },
            });
            return res.status(401).json({
                success: false,
                message: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ\nInvalid credentials",
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "គណនីត្រូវបានបិទ\nAccount is disabled",
            });
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLogin: new Date(),
                loginCount: user.loginCount + 1,
                failedAttempts: 0,
            },
        });
        // ✅ FIXED:  Proper JWT signing
        const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email || user.phone || "",
            role: user.role,
        }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        console.log("✅ Login successful:", user.id);
        res.json({
            success: true,
            message: "ចូលប្រើប្រាស់បានជោគជ័យ\nLogin successful",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    student: user.student,
                    teacher: user.teacher,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "មានបញ្ហាក្នុងការចូលប្រើប្រាស់\nLogin failed",
            error: error.message,
        });
    }
};
exports.login = login;
/**
 * ✅ REFRESH TOKEN - ផ្តល់ token ថ្មី
 */
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required",
            });
        }
        // ✅ FIXED:  Proper JWT verify
        const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const newToken = jsonwebtoken_1.default.sign({
            userId: decoded.userId,
            email: decoded.email || "",
            role: decoded.role,
        }, jwtSecret, { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") });
        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: newToken,
            },
        });
    }
    catch (error) {
        console.error("❌ Refresh token error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message,
        });
    }
};
exports.refreshToken = refreshToken;
/**
 * ✅ GET CURRENT USER
 */
const getCurrentUser = async (req, res) => {
    try {
        // ✅ FIX: Middleware sets req.userId, not req.user.userId
        const userId = req.userId;
        console.log("📍 Getting current user for ID:", userId);
        if (!userId) {
            console.log("❌ No userId found in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                lastLogin: true,
                loginCount: true,
                createdAt: true,
                updatedAt: true,
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        khmerName: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        classId: true,
                        class: {
                            select: {
                                id: true,
                                name: true,
                                grade: true,
                            },
                        },
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        teacherId: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        position: true,
                        homeroomClassId: true,
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
 * ✅ LOGOUT
 */
const logout = async (req, res) => {
    try {
        // ✅ FIX: Middleware sets req.userId, not req.user.userId
        const userId = req.userId;
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

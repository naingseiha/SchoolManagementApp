"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression")); // ✅ OPTIMIZED: Add gzip compression
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const password_expiration_job_1 = require("./jobs/password-expiration.job");
const notification_job_1 = require("./jobs/notification.job");
const email_service_1 = require("./services/email.service");
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const admin_security_routes_1 = __importDefault(require("./routes/admin-security.routes"));
const admin_parents_routes_1 = __importDefault(require("./routes/admin.parents.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const student_portal_routes_1 = __importDefault(require("./routes/student-portal.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const teacher_portal_routes_1 = __importDefault(require("./routes/teacher-portal.routes"));
const parent_portal_routes_1 = __importDefault(require("./routes/parent-portal.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const grade_routes_1 = __importDefault(require("./routes/grade.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// CORS Configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    "https://schoolmanagementapp-3irq.onrender.com",
].filter((origin) => Boolean(origin) && origin !== "undefined");
console.log("🔒 CORS allowed origins:", allowedOrigins);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // ✅ Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        // ✅ SECURITY FIX: Only allow whitelisted origins
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `CORS policy: Origin ${origin} is not allowed`;
            console.log("❌ CORS BLOCKED:", origin);
            return callback(new Error(msg), false);
        }
        // ✅ Origin is allowed
        console.log("✅ CORS ALLOWED:", origin);
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.options("*", (0, cors_1.default)());
// ✅ OPTIMIZED: Enable gzip/brotli compression for all responses
// This reduces JSON response size by 60-80% (500KB → 100KB)
app.use((0, compression_1.default)({
    level: 6, // Compression level (0-9, 6 is default, good balance)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        // Don't compress responses if the client doesn't accept encoding
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Compress all responses by default
        return compression_1.default.filter(req, res);
    },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
// Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "School Management System API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/admin/security", admin_security_routes_1.default);
app.use("/api/admin/parents", admin_parents_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/students", student_routes_1.default);
app.use("/api/student-portal", student_portal_routes_1.default);
app.use("/api/teachers", teacher_routes_1.default);
app.use("/api/teacher-portal", teacher_portal_routes_1.default);
app.use("/api/parent-portal", parent_portal_routes_1.default);
app.use("/api/classes", class_routes_1.default);
app.use("/api/subjects", subject_routes_1.default);
app.use("/api/grades", grade_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/export", export_routes_1.default);
app.use("/api/reports", report_routes_1.default);
// API Documentation Route
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "School Management System API Endpoints",
        endpoints: {
            health: "GET /api/health",
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
            },
            students: {
                getAll: "GET /api/students",
                getById: "GET /api/students/:id",
                create: "POST /api/students",
                update: "PUT /api/students/:id",
                delete: "DELETE /api/students/:id",
            },
            teachers: {
                getAll: "GET /api/teachers",
                getById: "GET /api/teachers/:id",
                create: "POST /api/teachers",
                update: "PUT /api/teachers/:id",
                delete: "DELETE /api/teachers/:id",
            },
            classes: {
                getAll: "GET /api/classes",
                getById: "GET /api/classes/:id",
                create: "POST /api/classes",
                update: "PUT /api/classes/:id",
                delete: "DELETE /api/classes/:id",
            },
            subjects: {
                getAll: "GET /api/subjects",
                getById: "GET /api/subjects/:id",
                create: "POST /api/subjects",
                update: "PUT /api/subjects/:id",
                delete: "DELETE /api/subjects/:id",
            },
            grades: {
                getAll: "GET /api/grades",
                getById: "GET /api/grades/:id",
                getByStudent: "GET /api/grades/student/:studentId",
                getByClass: "GET /api/grades/class/:classId",
                getBySubject: "GET /api/grades/subject/:subjectId",
                create: "POST /api/grades",
                update: "PUT /api/grades/:id",
                delete: "DELETE /api/grades/:id",
            },
            attendance: {
                getAll: "GET /api/attendance",
                getById: "GET /api/attendance/:id",
                getByStudent: "GET /api/attendance/student/:studentId",
                getByClass: "GET /api/attendance/class/:classId",
                getByDate: "GET /api/attendance/date/:date",
                create: "POST /api/attendance",
                update: "PUT /api/attendance/:id",
                delete: "DELETE /api/attendance/:id",
            },
        },
    });
});
// Error Handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start Server
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        console.log("✅ Database connected successfully");
        (0, database_1.startKeepAlive)();
        // Start background jobs
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 Starting background jobs...");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        // Test email service connection
        if (email_service_1.emailService.isReady()) {
            await email_service_1.emailService.testConnection();
        }
        // Start cron jobs
        (0, password_expiration_job_1.startPasswordExpirationJob)();
        (0, notification_job_1.startNotificationJob)();
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const server = app.listen(PORT, () => {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api`);
            console.log(`💓 Database keep-alive: Active (ping every 4 min)`);
            console.log(`🔌 Connection pool: 20 connections available`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });
        // Handle port conflict
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.error(`❌ Port ${PORT} is already in use!`);
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.error("💡 Solutions:");
                console.error(`   1. Kill existing process: lsof -ti:${PORT} | xargs kill -9`);
                console.error(`   2. Use a different port in your .env file`);
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                process.exit(1);
            }
            else {
                console.error("❌ Server error:", error);
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
// ✅ Enhanced Graceful Shutdown
const shutdown = async () => {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🛑 Shutting down gracefully...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // Stop keep-alive
    (0, database_1.stopKeepAlive)();
    console.log("⏹️  Keep-alive stopped");
    // Disconnect database
    try {
        await (0, database_1.disconnectDatabase)();
        console.log("✅ Database disconnected");
    }
    catch (error) {
        console.error("❌ Error disconnecting database:", error);
    }
    console.log("👋 Goodbye!");
    process.exit(0);
};
// Process signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
// ✅ Enhanced Error Handlers
process.on("unhandledRejection", (err) => {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Unhandled Promise Rejection");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // Give time for logging before exit
    setTimeout(() => {
        console.log("⚠️  Exiting process due to unhandled rejection...");
        process.exit(1);
    }, 1000);
});
process.on("uncaughtException", (err) => {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Uncaught Exception");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    setTimeout(() => {
        console.log("⚠️  Exiting process due to uncaught exception...");
        process.exit(1);
    }, 1000);
});
// Start the server
startServer();
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const grade_routes_1 = __importDefault(require("./routes/grade.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
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
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/students", student_routes_1.default);
app.use("/api/teachers", teacher_routes_1.default);
app.use("/api/classes", class_routes_1.default);
app.use("/api/subjects", subject_routes_1.default);
app.use("/api/grades", grade_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
// API Documentation Route
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "School Management System API Endpoints",
        endpoints: {
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
        // Connect to database
        await (0, database_1.connectDatabase)();
        console.log("✅ Database connected successfully");
        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message);
    process.exit(1);
});
// Start the server
startServer();
exports.default = app;

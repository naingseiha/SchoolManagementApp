import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import {
  connectDatabase,
  startKeepAlive,
  stopKeepAlive,
} from "./config/database";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Import Routes
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import classRoutes from "./routes/class.routes";
import subjectRoutes from "./routes/subject.routes";
import gradeRoutes from "./routes/grade.routes";
import attendanceRoutes from "./routes/attendance.routes";
import exportRoutes from "./routes/export.routes";
import reportRoutes from "./routes/report.routes";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5001; // Changed to 5001

// CORS Configuration - FIXED
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
  "https://schoolmanagementapp-3irq.onrender.com", // Your production frontend if deployed
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        console.log("❌ CORS blocked origin:", origin);
        return callback(null, true); // Still allow for development
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "School Management System API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health Check Route (for frontend)
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/reports", reportRoutes);

// API Documentation Route
app.get("/api", (req: Request, res: Response) => {
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
app.use(notFound);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    // Connect to database with retry logic
    await connectDatabase();
    console.log("✅ Database connected successfully");

    // Start keep-alive to prevent auto-suspend (Neon free tier)
    startKeepAlive();

    // Start listening
    app.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`💓 Database keep-alive: Active (ping every 4 min)`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  stopKeepAlive();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

// Start the server
startServer();

export default app;

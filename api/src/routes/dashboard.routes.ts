import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Get general dashboard statistics (Admin/Teacher)
router.get("/stats", DashboardController.getDashboardStats);

// Get teacher-specific dashboard
router.get("/teacher/:teacherId", DashboardController.getTeacherDashboard);

// Get student-specific dashboard
router.get("/student/:studentId", DashboardController.getStudentDashboard);

export default router;

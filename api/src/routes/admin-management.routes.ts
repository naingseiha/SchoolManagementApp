import { Router } from "express";
import {
  getAdminAccounts,
  getAdminStatistics,
  updateAdminPassword,
  createAdminAccount,
  toggleAdminStatus,
  deleteAdminAccount,
} from "../controllers/admin-management.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔧 Registering ADMIN MANAGEMENT routes...");

// All routes require authentication + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Account Management
router.get("/admins", getAdminAccounts);
router.get("/admins/statistics", getAdminStatistics);
router.post("/admins", createAdminAccount);
router.put("/admins/:adminId/password", updateAdminPassword);
router.put("/admins/:adminId/status", toggleAdminStatus);
router.delete("/admins/:adminId", deleteAdminAccount);

console.log("✅ Admin management routes registered:");
console.log("  - GET    /api/admin/admins");
console.log("  - GET    /api/admin/admins/statistics");
console.log("  - POST   /api/admin/admins");
console.log("  - PUT    /api/admin/admins/:adminId/password");
console.log("  - PUT    /api/admin/admins/:adminId/status");
console.log("  - DELETE /api/admin/admins/:adminId");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

export default router;

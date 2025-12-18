import { Router } from "express";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ✅ Apply authentication middleware to all routes
router.use(authMiddleware);

// ✅ Teacher routes
router.get("/", getAllTeachers); // GET all teachers
router.get("/:id", getTeacherById); // GET single teacher
router.post("/", createTeacher); // CREATE teacher
router.put("/:id", updateTeacher); // UPDATE teacher
router.delete("/:id", deleteTeacher); // DELETE teacher

export default router;

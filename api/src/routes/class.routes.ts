import { Router } from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
  removeStudent,
} from "../controllers/class.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getAllClasses);
router.get("/:id", authenticate, getClassById);
router.post("/", authenticate, authorize("ADMIN"), createClass);
router.put("/:id", authenticate, authorize("ADMIN"), updateClass);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteClass);
router.post("/:id/assign-students", assignStudents);
router.delete("/:id/students/:studentId", removeStudent);

export default router;

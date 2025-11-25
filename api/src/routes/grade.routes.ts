import { Router } from "express";
import { GradeController } from "../controllers/grade.controller";
import {
  getAllGrades,
  getGradeById,
  getGradesByStudent,
  getGradesByClass,
  getGradesBySubject,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grade.controller";

const router = Router();

// ==================== NEW: IMPORT/EXPORT ROUTES ====================

/**
 * @route   POST /api/grades/import/:classId
 * @desc    Import grades from Excel
 * @access  Private
 */
router.post(
  "/import/:classId",
  GradeController.uploadMiddleware,
  GradeController.importGrades
);

/**
 * @route   GET /api/grades/month/:classId
 * @desc    Get grades by month
 * @access  Private
 */
router.get("/month/:classId", GradeController.getGradesByMonth);

/**
 * @route   GET /api/grades/summary/:classId
 * @desc    Get monthly summary
 * @access  Private
 */
router.get("/summary/:classId", GradeController.getMonthlySummary);

// ==================== EXISTING ROUTES ====================

/**
 * @route   GET /api/grades
 * @desc    Get all grades
 * @access  Private
 */
router.get("/", getAllGrades);

/**
 * @route   GET /api/grades/:id
 * @desc    Get grade by ID
 * @access  Private
 */
router.get("/:id", getGradeById);

/**
 * @route   GET /api/grades/student/:studentId
 * @desc    Get grades by student
 * @access  Private
 */
router.get("/student/:studentId", getGradesByStudent);

/**
 * @route   GET /api/grades/class/:classId
 * @desc    Get grades by class
 * @access  Private
 */
router.get("/class/:classId", getGradesByClass);

/**
 * @route   GET /api/grades/subject/:subjectId
 * @desc    Get grades by subject
 * @access  Private
 */
router.get("/subject/:subjectId", getGradesBySubject);

/**
 * @route   POST /api/grades
 * @desc    Create new grade
 * @access  Private
 */
router.post("/", createGrade);

/**
 * @route   PUT /api/grades/:id
 * @desc    Update grade
 * @access  Private
 */
router.put("/:id", updateGrade);

/**
 * @route   DELETE /api/grades/:id
 * @desc    Delete grade
 * @access  Private
 */
router.delete("/:id", deleteGrade);

export default router;

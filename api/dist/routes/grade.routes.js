"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grade_controller_1 = require("../controllers/grade.controller");
const grade_controller_2 = require("../controllers/grade.controller");
const router = (0, express_1.Router)();
// ==================== FILE UPLOAD & IMPORT ====================
/**
 * @route   POST /api/grades/import/:classId
 * @desc    Import grades from Excel
 * @access  Private
 */
router.post("/import/:classId", grade_controller_2.GradeController.uploadMiddleware, grade_controller_2.GradeController.importGrades);
/**
 * @route   GET /api/grades/month/:classId
 * @desc    Get grades by month
 * @access  Private
 */
router.get("/month/:classId", grade_controller_2.GradeController.getGradesByMonth);
/**
 * @route   GET /api/grades/summary/:classId
 * @desc    Get monthly summary
 * @access  Private
 */
router.get("/summary/:classId", grade_controller_2.GradeController.getMonthlySummary);
// ==================== NEW: BULK SAVE ====================
/**
 * @route   POST /api/grades/bulk-save
 * @desc    Bulk save/update grades
 * @access  Private
 */
router.post("/bulk-save", grade_controller_2.GradeController.bulkSaveGrades);
/**
 * @route   GET /api/grades/grid/:classId
 * @desc    Get grades in grid format for editing
 * @access  Private
 */
router.get("/grid/:classId", grade_controller_2.GradeController.getGradesGrid);
// ==================== GRADE CONFIRMATION ROUTES ====================
/**
 * @route   POST /api/grades/confirm
 * @desc    Confirm grades for a class/subject/month/year
 * @access  Private
 */
router.post("/confirm", grade_controller_2.GradeController.confirmGrades);
/**
 * @route   GET /api/grades/confirmations/:classId
 * @desc    Get all confirmations for a class
 * @access  Private
 */
router.get("/confirmations/:classId", grade_controller_2.GradeController.getConfirmations);
/**
 * @route   DELETE /api/grades/confirm/:id
 * @desc    Remove grade confirmation
 * @access  Private
 */
router.delete("/confirm/:id", grade_controller_2.GradeController.removeConfirmation);
// ==================== EXISTING ROUTES ====================
/**
 * @route   GET /api/grades
 * @desc    Get all grades
 * @access  Private
 */
router.get("/", grade_controller_1.getAllGrades);
/**
 * @route   GET /api/grades/:id
 * @desc    Get grade by ID
 * @access  Private
 */
router.get("/:id", grade_controller_1.getGradeById);
/**
 * @route   GET /api/grades/student/:studentId
 * @desc    Get grades by student
 * @access  Private
 */
router.get("/student/:studentId", grade_controller_1.getGradesByStudent);
/**
 * @route   GET /api/grades/class/:classId
 * @desc    Get grades by class
 * @access  Private
 */
router.get("/class/:classId", grade_controller_1.getGradesByClass);
/**
 * @route   GET /api/grades/subject/:subjectId
 * @desc    Get grades by subject
 * @access  Private
 */
router.get("/subject/:subjectId", grade_controller_1.getGradesBySubject);
/**
 * @route   POST /api/grades
 * @desc    Create new grade
 * @access  Private
 */
router.post("/", grade_controller_1.createGrade);
/**
 * @route   PUT /api/grades/:id
 * @desc    Update grade
 * @access  Private
 */
router.put("/:id", grade_controller_1.updateGrade);
/**
 * @route   DELETE /api/grades/:id
 * @desc    Delete grade
 * @access  Private
 */
router.delete("/:id", grade_controller_1.deleteGrade);
exports.default = router;

import { Router } from "express";
import { ReportController } from "../controllers/report.controller";

const router = Router();

/**
 * @route   GET /api/reports/monthly/:classId
 * @desc    Get monthly report for a specific class
 */
router.get("/monthly/:classId", ReportController.getMonthlyReport);

/**
 * @route   GET /api/reports/grade-wide/:grade
 * @desc    Get grade-wide report (all classes combined)
 */
router.get("/grade-wide/:grade", ReportController.getGradeWideReport);

/**
 * @route   GET /api/reports/tracking-book/:classId
 * @desc    Get student tracking book (all months)
 */
router.get("/tracking-book/:classId", ReportController.getStudentTrackingBook);

/**
 * @route   GET /api/reports/monthly-statistics/:classId
 * @desc    Get monthly statistics for a specific class
 */
router.get(
  "/monthly-statistics/:classId",
  ReportController.getMonthlyStatistics
);

/**
 * @route   GET /api/reports/monthly-multiple/:classId
 * @desc    Get multiple monthly reports in one call for a specific class
 */
router.get("/monthly-multiple/:classId", ReportController.getMultipleMonthlyReports);

/**
 * @route   GET /api/reports/grade-wide-multiple/:grade
 * @desc    Get multiple monthly reports in one call for a grade
 */
router.get("/grade-wide-multiple/:grade", ReportController.getMultipleGradeWideReports);

export default router;

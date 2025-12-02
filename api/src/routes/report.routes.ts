import { Router } from "express";
import { ReportController } from "../controllers/report.controller";

const router = Router();

/**
 * @route   GET /api/reports/monthly/:classId
 * @desc    Get monthly report for a class
 */
router.get("/monthly/:classId", ReportController.getMonthlyReport);

export default router;

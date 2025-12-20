"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/attendance/grid/:classId
 * @desc    Get attendance grid for a month
 */
router.get("/grid/:classId", attendance_controller_1.AttendanceController.getAttendanceGrid);
/**
 * @route   POST /api/attendance/bulk-save
 * @desc    Bulk save attendance
 */
router.post("/bulk-save", attendance_controller_1.AttendanceController.bulkSaveAttendance);
/**
 * @route   GET /api/attendance/summary/:classId
 * @desc    Get monthly attendance summary (for grade entry)
 */
router.get("/summary/:classId", attendance_controller_1.AttendanceController.getMonthlySummary);
exports.default = router;

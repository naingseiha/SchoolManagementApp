"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ✅ Apply authentication middleware to all routes
router.use(auth_middleware_1.authMiddleware);
// ✅ Teacher routes
router.get("/lightweight", teacher_controller_1.getTeachersLightweight); // GET teachers (lightweight - fast)
router.get("/", teacher_controller_1.getAllTeachers); // GET all teachers (full data)
router.get("/:id", teacher_controller_1.getTeacherById); // GET single teacher
router.post("/", teacher_controller_1.createTeacher); // CREATE teacher
router.post("/bulk", teacher_controller_1.bulkCreateTeachers); // BULK CREATE teachers
router.put("/bulk", teacher_controller_1.bulkUpdateTeachers); // BULK UPDATE teachers (optimized)
router.put("/:id", teacher_controller_1.updateTeacher); // UPDATE teacher
router.delete("/:id", teacher_controller_1.deleteTeacher); // DELETE teacher
exports.default = router;

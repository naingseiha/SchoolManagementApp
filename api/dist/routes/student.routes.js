"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authMiddleware);
router.get("/lightweight", student_controller_1.getStudentsLightweight); // GET students (lightweight - fast)
router.get("/", student_controller_1.getAllStudents);
router.get("/:id", student_controller_1.getStudentById);
router.post("/", student_controller_1.createStudent);
router.post("/bulk", student_controller_1.bulkCreateStudents);
router.put("/:id", student_controller_1.updateStudent);
router.delete("/:id", student_controller_1.deleteStudent);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authMiddleware);
// Subject CRUD routes
router.get("/lightweight", subject_controller_1.getSubjectsLightweight); // GET subjects (lightweight - fast)
router.get("/", subject_controller_1.getAllSubjects);
router.get("/grade/:grade", subject_controller_1.getSubjectsByGrade);
router.get("/:id", subject_controller_1.getSubjectById);
router.post("/", subject_controller_1.createSubject);
router.put("/:id", subject_controller_1.updateSubject);
router.delete("/:id", subject_controller_1.deleteSubject);
// Teacher assignment routes
router.post("/:id/assign-teachers", subject_controller_1.assignTeachersToSubject);
router.delete("/:id/teachers/:teacherId", subject_controller_1.removeTeacherFromSubject);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("../controllers/class.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/lightweight", auth_1.authenticate, class_controller_1.getClassesLightweight); // GET classes (lightweight - fast)
router.get("/", auth_1.authenticate, class_controller_1.getAllClasses);
router.get("/grade/:grade", auth_1.authenticate, class_controller_1.getClassesByGrade);
router.get("/:id", auth_1.authenticate, class_controller_1.getClassById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), class_controller_1.createClass);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), class_controller_1.updateClass);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), class_controller_1.deleteClass);
router.post("/:id/assign-students", class_controller_1.assignStudentsToClass);
router.delete("/:id/students/:studentId", class_controller_1.removeStudentFromClass);
exports.default = router;

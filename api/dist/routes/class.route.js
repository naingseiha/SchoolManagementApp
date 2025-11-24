"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("../controllers/class.controller");
const router = (0, express_1.Router)();
// Class CRUD routes
router.get("/", class_controller_1.getAllClasses);
router.get("/:id", class_controller_1.getClassById);
router.post("/", class_controller_1.createClass);
router.put("/:id", class_controller_1.updateClass);
router.delete("/:id", class_controller_1.deleteClass);
// Student assignment routes
router.post("/:id/assign-students", class_controller_1.assignStudentsToClass);
router.delete("/:id/students/:studentId", class_controller_1.removeStudentFromClass);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTeacherFromSubject = exports.assignTeachersToSubject = exports.deleteSubject = exports.getSubjectById = exports.updateSubject = exports.createSubject = exports.getAllSubjects = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all subjects - RETURN ARRAY DIRECTLY
const getAllSubjects = async (req, res) => {
    try {
        console.log("📚 GET ALL SUBJECTS");
        const subjects = await prisma.subject.findMany({
            include: {
                teacherAssignments: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                khmerName: true,
                                englishName: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        grades: true,
                    },
                },
            },
            orderBy: [{ grade: "asc" }, { name: "asc" }],
        });
        console.log(`✅ Found ${subjects.length} subjects`);
        // ✅ FIX: Return array directly (not wrapped in {data: ...})
        res.json(subjects);
    }
    catch (error) {
        console.error("❌ Error getting subjects:", error);
        res.status(500).json({
            success: false,
            message: "Error getting subjects",
            error: error.message,
        });
    }
};
exports.getAllSubjects = getAllSubjects;
// Create subject - RETURN OBJECT DIRECTLY
const createSubject = async (req, res) => {
    try {
        const { name, nameKh, nameEn, code, description, grade, track, category, weeklyHours, annualHours, maxScore, isActive, } = req.body;
        console.log("➕ CREATE SUBJECT:", { name, code, grade });
        if (!name || !code || !grade) {
            return res.status(400).json({
                success: false,
                message: "Name, code, and grade are required",
            });
        }
        const existingSubject = await prisma.subject.findUnique({
            where: { code },
        });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: `Subject with code "${code}" already exists`,
            });
        }
        const subject = await prisma.subject.create({
            data: {
                name,
                nameKh: nameKh || name,
                nameEn,
                code,
                description,
                grade,
                track: track || null,
                category: category || "core",
                weeklyHours: parseFloat(weeklyHours) || 0,
                annualHours: parseInt(annualHours) || 0,
                maxScore: parseInt(maxScore) || 100,
                isActive: isActive !== false,
            },
            include: {
                teacherAssignments: {
                    include: {
                        teacher: true,
                    },
                },
                _count: {
                    select: {
                        grades: true,
                    },
                },
            },
        });
        console.log("✅ Subject created successfully:", subject.id);
        // ✅ FIX: Return object directly
        res.status(201).json(subject);
    }
    catch (error) {
        console.error("❌ Error creating subject:", error);
        res.status(500).json({
            success: false,
            message: "Error creating subject",
            error: error.message,
        });
    }
};
exports.createSubject = createSubject;
// Update subject - RETURN OBJECT DIRECTLY
const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log("✏️ UPDATE SUBJECT:", id);
        const existingSubject = await prisma.subject.findUnique({
            where: { id },
        });
        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        if (updateData.code && updateData.code !== existingSubject.code) {
            const duplicateCode = await prisma.subject.findUnique({
                where: { code: updateData.code },
            });
            if (duplicateCode) {
                return res.status(400).json({
                    success: false,
                    message: `Subject with code "${updateData.code}" already exists`,
                });
            }
        }
        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...updateData,
                weeklyHours: updateData.weeklyHours !== undefined
                    ? parseFloat(updateData.weeklyHours)
                    : existingSubject.weeklyHours,
                annualHours: updateData.annualHours !== undefined
                    ? parseInt(updateData.annualHours)
                    : existingSubject.annualHours,
                maxScore: updateData.maxScore !== undefined
                    ? parseInt(updateData.maxScore)
                    : existingSubject.maxScore,
            },
            include: {
                teacherAssignments: {
                    include: {
                        teacher: true,
                    },
                },
                _count: {
                    select: {
                        grades: true,
                    },
                },
            },
        });
        console.log("✅ Subject updated successfully");
        // ✅ FIX: Return object directly
        res.json(subject);
    }
    catch (error) {
        console.error("❌ Error updating subject:", error);
        res.status(500).json({
            success: false,
            message: "Error updating subject",
            error: error.message,
        });
    }
};
exports.updateSubject = updateSubject;
// Keep other functions same...
const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                teacherAssignments: { include: { teacher: true } },
                _count: { select: { grades: true } },
            },
        });
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        res.json(subject);
    }
    catch (error) {
        console.error("❌ Error getting subject:", error);
        res.status(500).json({
            success: false,
            message: "Error getting subject",
            error: error.message,
        });
    }
};
exports.getSubjectById = getSubjectById;
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subjectWithGrades = await prisma.subject.findUnique({
            where: { id },
            include: { grades: true },
        });
        if (!subjectWithGrades) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        if (subjectWithGrades.grades.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subject with ${subjectWithGrades.grades.length} grade(s).`,
            });
        }
        await prisma.subject.delete({ where: { id } });
        res.json({
            success: true,
            message: "Subject deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Error deleting subject:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting subject",
            error: error.message,
        });
    }
};
exports.deleteSubject = deleteSubject;
const assignTeachersToSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherIds } = req.body;
        if (!Array.isArray(teacherIds)) {
            return res.status(400).json({
                success: false,
                message: "teacherIds must be an array",
            });
        }
        const subject = await prisma.subject.findUnique({ where: { id } });
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        await prisma.subjectTeacher.deleteMany({ where: { subjectId: id } });
        const assignments = await Promise.all(teacherIds.map((teacherId) => prisma.subjectTeacher.create({
            data: { subjectId: id, teacherId },
            include: { teacher: true },
        })));
        res.json({
            success: true,
            message: "Teachers assigned successfully",
            data: assignments,
        });
    }
    catch (error) {
        console.error("❌ Error assigning teachers:", error);
        res.status(500).json({
            success: false,
            message: "Error assigning teachers",
            error: error.message,
        });
    }
};
exports.assignTeachersToSubject = assignTeachersToSubject;
const removeTeacherFromSubject = async (req, res) => {
    try {
        const { id, teacherId } = req.params;
        await prisma.subjectTeacher.deleteMany({
            where: { subjectId: id, teacherId },
        });
        res.json({
            success: true,
            message: "Teacher removed successfully",
        });
    }
    catch (error) {
        console.error("❌ Error removing teacher:", error);
        res.status(500).json({
            success: false,
            message: "Error removing teacher",
            error: error.message,
        });
    }
};
exports.removeTeacherFromSubject = removeTeacherFromSubject;

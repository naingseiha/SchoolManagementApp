"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGrade = exports.updateGrade = exports.createGrade = exports.getGradesBySubject = exports.getGradesByClass = exports.getGradesByStudent = exports.getGradeById = exports.getAllGrades = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all grades
const getAllGrades = async (req, res) => {
    try {
        const grades = await prisma.grade.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        class: {
                            select: {
                                name: true,
                                grade: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching grades',
            error: error.message,
        });
    }
};
exports.getAllGrades = getAllGrades;
// Get grade by ID
const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;
        const grade = await prisma.grade.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        class: {
                            select: {
                                name: true,
                                grade: true,
                                section: true,
                            },
                        },
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        description: true,
                    },
                },
            },
        });
        if (!grade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found',
            });
        }
        res.json({
            success: true,
            data: grade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching grade',
            error: error.message,
        });
    }
};
exports.getGradeById = getGradeById;
// Get grades by student
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }
        const grades = await prisma.grade.findMany({
            where: { studentId },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        class: {
                            select: {
                                name: true,
                                grade: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student grades',
            error: error.message,
        });
    }
};
exports.getGradesByStudent = getGradesByStudent;
// Get grades by class
const getGradesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        // Check if class exists
        const classExists = await prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: 'Class not found',
            });
        }
        const grades = await prisma.grade.findMany({
            where: {
                student: {
                    classId,
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching class grades',
            error: error.message,
        });
    }
};
exports.getGradesByClass = getGradesByClass;
// Get grades by subject
const getGradesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        // Check if subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }
        const grades = await prisma.grade.findMany({
            where: { subjectId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        class: {
                            select: {
                                name: true,
                                grade: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subject grades',
            error: error.message,
        });
    }
};
exports.getGradesBySubject = getGradesBySubject;
// Create new grade
const createGrade = async (req, res) => {
    try {
        const { studentId, subjectId, score, maxScore, remarks } = req.body;
        // Validate required fields
        if (!studentId || !subjectId || score === undefined || !maxScore) {
            return res.status(400).json({
                success: false,
                message: 'StudentId, subjectId, score, and maxScore are required',
            });
        }
        // Validate score range
        if (score < 0 || score > maxScore) {
            return res.status(400).json({
                success: false,
                message: `Score must be between 0 and ${maxScore}`,
            });
        }
        // Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }
        // Check if subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }
        const newGrade = await prisma.grade.create({
            data: {
                studentId,
                subjectId,
                score,
                maxScore,
                remarks,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: 'Grade created successfully',
            data: newGrade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating grade',
            error: error.message,
        });
    }
};
exports.createGrade = createGrade;
// Update grade
const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, maxScore, remarks } = req.body;
        // Check if grade exists
        const existingGrade = await prisma.grade.findUnique({
            where: { id },
        });
        if (!existingGrade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found',
            });
        }
        // Validate score range if provided
        const finalMaxScore = maxScore || existingGrade.maxScore;
        if (score !== undefined && (score < 0 || score > finalMaxScore)) {
            return res.status(400).json({
                success: false,
                message: `Score must be between 0 and ${finalMaxScore}`,
            });
        }
        const updatedGrade = await prisma.grade.update({
            where: { id },
            data: {
                score,
                maxScore,
                remarks,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: 'Grade updated successfully',
            data: updatedGrade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating grade',
            error: error.message,
        });
    }
};
exports.updateGrade = updateGrade;
// Delete grade
const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if grade exists
        const existingGrade = await prisma.grade.findUnique({
            where: { id },
        });
        if (!existingGrade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found',
            });
        }
        await prisma.grade.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Grade deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting grade',
            error: error.message,
        });
    }
};
exports.deleteGrade = deleteGrade;

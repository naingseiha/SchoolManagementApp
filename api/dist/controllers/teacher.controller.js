"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeacher = exports.updateTeacher = exports.createTeacher = exports.getTeacherById = exports.getAllTeachers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTeachers = async (req, res, next) => {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                classes: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        section: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: teachers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTeachers = getAllTeachers;
const getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: {
                classes: {
                    include: {
                        students: true,
                        subjects: true,
                    },
                },
            },
        });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found',
            });
        }
        res.json({
            success: true,
            data: teacher,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTeacherById = getTeacherById;
const createTeacher = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, subject, employeeId } = req.body;
        const existingTeacher = await prisma.teacher.findUnique({
            where: { email },
        });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }
        const teacher = await prisma.teacher.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                subject,
                employeeId,
            },
            include: {
                classes: true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: teacher,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTeacher = createTeacher;
const updateTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, subject, employeeId } = req.body;
        const teacher = await prisma.teacher.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email,
                phone,
                subject,
                employeeId,
            },
            include: {
                classes: true,
            },
        });
        res.json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTeacher = updateTeacher;
const deleteTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.teacher.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Teacher deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTeacher = deleteTeacher;

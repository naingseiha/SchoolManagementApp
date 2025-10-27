"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                class: {
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
            data: students,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message,
        });
    }
};
exports.getAllStudents = getAllStudents;
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                class: true,
                grades: {
                    include: {
                        subject: true,
                    },
                },
                attendance: true,
            },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }
        res.json({
            success: true,
            data: student,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message,
        });
    }
};
exports.getStudentById = getStudentById;
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, dateOfBirth, gender, address, phone, classId } = req.body;
        const existingStudent = await prisma.student.findUnique({
            where: { email },
        });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }
        const student = await prisma.student.create({
            data: {
                firstName,
                lastName,
                email,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                address,
                phone,
                classId,
            },
            include: {
                class: true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: student,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message,
        });
    }
};
exports.createStudent = createStudent;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, dateOfBirth, gender, address, phone, classId } = req.body;
        const student = await prisma.student.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                address,
                phone,
                classId,
            },
            include: {
                class: true,
            },
        });
        res.json({
            success: true,
            message: 'Student updated successfully',
            data: student,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message,
        });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.student.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Student deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message,
        });
    }
};
exports.deleteStudent = deleteStudent;

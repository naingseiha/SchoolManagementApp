"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendance = exports.updateAttendance = exports.createAttendance = exports.getAttendanceByDate = exports.getAttendanceByClass = exports.getAttendanceByStudent = exports.getAttendanceById = exports.getAllAttendance = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all attendance records
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await prisma.attendance.findMany({
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
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
        res.json({
            success: true,
            data: attendance,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: error.message,
        });
    }
};
exports.getAllAttendance = getAllAttendance;
// Get attendance by ID
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await prisma.attendance.findUnique({
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
            },
        });
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }
        res.json({
            success: true,
            data: attendance,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance record',
            error: error.message,
        });
    }
};
exports.getAttendanceById = getAttendanceById;
// Get attendance by student
const getAttendanceByStudent = async (req, res) => {
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
        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: {
                date: 'desc',
            },
        });
        // Calculate statistics
        const stats = {
            total: attendance.length,
            present: attendance.filter((a) => a.status === 'PRESENT').length,
            absent: attendance.filter((a) => a.status === 'ABSENT').length,
            late: attendance.filter((a) => a.status === 'LATE').length,
            excused: attendance.filter((a) => a.status === 'EXCUSED').length,
        };
        res.json({
            success: true,
            data: attendance,
            stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student attendance',
            error: error.message,
        });
    }
};
exports.getAttendanceByStudent = getAttendanceByStudent;
// Get attendance by class
const getAttendanceByClass = async (req, res) => {
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
        const attendance = await prisma.attendance.findMany({
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
            },
            orderBy: {
                date: 'desc',
            },
        });
        res.json({
            success: true,
            data: attendance,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching class attendance',
            error: error.message,
        });
    }
};
exports.getAttendanceByClass = getAttendanceByClass;
// Get attendance by date
const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        // Parse date
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD',
            });
        }
        // Set to start and end of day
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const attendance = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
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
        // Calculate statistics
        const stats = {
            total: attendance.length,
            present: attendance.filter((a) => a.status === 'PRESENT').length,
            absent: attendance.filter((a) => a.status === 'ABSENT').length,
            late: attendance.filter((a) => a.status === 'LATE').length,
            excused: attendance.filter((a) => a.status === 'EXCUSED').length,
        };
        res.json({
            success: true,
            data: attendance,
            stats,
            date: startOfDay.toISOString().split('T')[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance by date',
            error: error.message,
        });
    }
};
exports.getAttendanceByDate = getAttendanceByDate;
// Create attendance record
const createAttendance = async (req, res) => {
    try {
        const { studentId, date, status, remarks } = req.body;
        // Validate required fields
        if (!studentId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: 'StudentId, date, and status are required',
            });
        }
        // Validate status
        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED',
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
        // Check if attendance already exists for this student and date
        const attendanceDate = new Date(date);
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                studentId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already recorded for this student on this date',
            });
        }
        const newAttendance = await prisma.attendance.create({
            data: {
                studentId,
                date: new Date(date),
                status,
                remarks,
            },
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
        });
        res.status(201).json({
            success: true,
            message: 'Attendance recorded successfully',
            data: newAttendance,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating attendance record',
            error: error.message,
        });
    }
};
exports.createAttendance = createAttendance;
// Update attendance record
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        // Check if attendance exists
        const existingAttendance = await prisma.attendance.findUnique({
            where: { id },
        });
        if (!existingAttendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }
        // Validate status if provided
        if (status) {
            const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED',
                });
            }
        }
        const updatedAttendance = await prisma.attendance.update({
            where: { id },
            data: {
                status,
                remarks,
            },
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
        });
        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: updatedAttendance,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating attendance record',
            error: error.message,
        });
    }
};
exports.updateAttendance = updateAttendance;
// Delete attendance record
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if attendance exists
        const existingAttendance = await prisma.attendance.findUnique({
            where: { id },
        });
        if (!existingAttendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }
        await prisma.attendance.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Attendance record deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting attendance record',
            error: error.message,
        });
    }
};
exports.deleteAttendance = deleteAttendance;

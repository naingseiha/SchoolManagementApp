"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeacher = exports.updateTeacher = exports.createTeacher = exports.getTeacherById = exports.getAllTeachers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                classes: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        section: true,
                        _count: {
                            select: {
                                students: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            data: teachers,
        });
    }
    catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching teachers",
            error: error.message,
        });
    }
};
exports.getAllTeachers = getAllTeachers;
const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: {
                classes: {
                    include: {
                        students: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                students: true,
                            },
                        },
                    },
                },
            },
        });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }
        res.json({
            success: true,
            data: teacher,
        });
    }
    catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching teacher",
            error: error.message,
        });
    }
};
exports.getTeacherById = getTeacherById;
const createTeacher = async (req, res) => {
    try {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📥 CREATE TEACHER - Request body:", JSON.stringify(req.body, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const { firstName, lastName, email, phone, subject, employeeId } = req.body;
        // Validate required fields
        if (!firstName || firstName.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "First name is required",
            });
        }
        if (!lastName || lastName.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Last name is required",
            });
        }
        if (!email || email.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        // Check email uniqueness
        const existingTeacher = await prisma.teacher.findUnique({
            where: { email: email.trim() },
        });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "Email already exists. Please use a different email.",
            });
        }
        // Check employee ID uniqueness if provided
        if (employeeId && employeeId.trim() !== "") {
            const existingEmployeeId = await prisma.teacher.findUnique({
                where: { employeeId: employeeId.trim() },
            });
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID already exists. Please use a different ID.",
                });
            }
        }
        // Create teacher
        const teacher = await prisma.teacher.create({
            data: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone?.trim() || null,
                subject: subject?.trim() || null,
                employeeId: employeeId?.trim() || null,
            },
            include: {
                classes: true,
            },
        });
        console.log("✅ Teacher created successfully:", teacher.id);
        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            data: teacher,
        });
    }
    catch (error) {
        console.error("❌ Error creating teacher:", error);
        res.status(500).json({
            success: false,
            message: "Error creating teacher",
            error: error.message,
        });
    }
};
exports.createTeacher = createTeacher;
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, subject, employeeId } = req.body;
        console.log("📝 UPDATE TEACHER:", id);
        console.log("📥 Request body:", req.body);
        // Check if teacher exists
        const existingTeacher = await prisma.teacher.findUnique({
            where: { id },
        });
        if (!existingTeacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }
        // Check email uniqueness (exclude current teacher)
        if (email && email.trim() !== "") {
            const emailExists = await prisma.teacher.findFirst({
                where: {
                    email: email.trim(),
                    NOT: { id },
                },
            });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists. Please use a different email.",
                });
            }
        }
        // Check employee ID uniqueness (exclude current teacher)
        if (employeeId && employeeId.trim() !== "") {
            const employeeIdExists = await prisma.teacher.findFirst({
                where: {
                    employeeId: employeeId.trim(),
                    NOT: { id },
                },
            });
            if (employeeIdExists) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID already exists. Please use a different ID.",
                });
            }
        }
        const updateData = {};
        if (firstName !== undefined)
            updateData.firstName = firstName.trim();
        if (lastName !== undefined)
            updateData.lastName = lastName.trim();
        if (email !== undefined)
            updateData.email = email.trim();
        if (phone !== undefined)
            updateData.phone = phone?.trim() || null;
        if (subject !== undefined)
            updateData.subject = subject?.trim() || null;
        if (employeeId !== undefined)
            updateData.employeeId = employeeId?.trim() || null;
        console.log("💾 Updating with data:", updateData);
        const teacher = await prisma.teacher.update({
            where: { id },
            data: updateData,
            include: {
                classes: true,
            },
        });
        console.log("✅ Teacher updated successfully");
        res.json({
            success: true,
            message: "Teacher updated successfully",
            data: teacher,
        });
    }
    catch (error) {
        console.error("❌ Error updating teacher:", error);
        res.status(500).json({
            success: false,
            message: "Error updating teacher",
            error: error.message,
        });
    }
};
exports.updateTeacher = updateTeacher;
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if teacher has assigned classes
        const teacherWithClasses = await prisma.teacher.findUnique({
            where: { id },
            include: {
                classes: true,
            },
        });
        if (!teacherWithClasses) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }
        if (teacherWithClasses.classes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete teacher with ${teacherWithClasses.classes.length} assigned class(es). Please reassign classes first.`,
            });
        }
        await prisma.teacher.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: "Teacher deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Error deleting teacher:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting teacher",
            error: error.message,
        });
    }
};
exports.deleteTeacher = deleteTeacher;

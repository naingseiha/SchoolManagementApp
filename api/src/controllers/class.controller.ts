import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: {
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
    });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching classes",
      error: error.message,
    });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            dateOfBirth: true,
            phone: true,
          },
        },
        subjects: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching class",
      error: error.message,
    });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, grade, section, teacherId } = req.body;

    // Validate teacher if provided
    if (teacherId) {
      const teacherExists = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        section,
        teacherId,
      },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade, section, teacherId } = req.body;

    // Validate teacher if provided
    if (teacherId) {
      const teacherExists = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        grade,
        section,
        teacherId,
      },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating class",
      error: error.message,
    });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if class has students
    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (classWithStudents && classWithStudents._count.students > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class with ${classWithStudents._count.students} students. Please reassign students first.`,
      });
    }

    await prisma.class.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting class",
      error: error.message,
    });
  }
};

export const assignStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required",
      });
    }

    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
      },
      data: {
        classId: id,
      },
    });

    const updatedClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        teacher: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `${studentIds.length} student(s) assigned successfully`,
      data: updatedClass,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error assigning students",
      error: error.message,
    });
  }
};

export const removeStudent = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;

    await prisma.student.update({
      where: { id: studentId },
      data: {
        classId: null,
      },
    });

    res.json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error removing student",
      error: error.message,
    });
  }
};

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all classes
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
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        subjects: {
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
      data: classes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message,
    });
  }
};

// Get class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message,
    });
  }
};

// Create new class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, grade, section, teacherId } = req.body;

    // Validate required fields
    if (!name || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Name and grade are required',
      });
    }

    // Check if teacher exists (if provided)
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message,
    });
  }
};

// Update class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade, section, teacherId } = req.body;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Check if teacher exists (if provided)
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message,
    });
  }
};

// Delete class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
      },
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Check if class has students
    if (existingClass.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with enrolled students',
      });
    }

    await prisma.class.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message,
    });
  }
};
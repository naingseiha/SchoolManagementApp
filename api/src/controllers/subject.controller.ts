import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all subjects
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
          },
        },
        grades: {
          select: {
            id: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message,
    });
  }
};

// Get subject by ID
export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message,
    });
  }
};

// Create new subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, description, classId } = req.body;

    // Validate required fields
    if (!name || !code || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and classId are required',
      });
    }

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

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists',
      });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        description,
        classId,
      },
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

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: newSubject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message,
    });
  }
};

// Update subject
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, classId } = req.body;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if class exists (if provided)
    if (classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found',
        });
      }
    }

    // Check if new code conflicts with another subject
    if (code && code !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: { code },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists',
        });
      }
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        description,
        classId,
      },
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
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message,
    });
  }
};

// Delete subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        grades: true,
      },
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if subject has grades
    if (existingSubject.grades.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject with existing grades',
      });
    }

    await prisma.subject.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message,
    });
  }
};
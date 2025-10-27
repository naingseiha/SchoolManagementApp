import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all grades
export const getAllGrades = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message,
    });
  }
};

// Get grade by ID
export const getGradeById = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message,
    });
  }
};

// Get grades by student
export const getGradesByStudent = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student grades',
      error: error.message,
    });
  }
};

// Get grades by class
export const getGradesByClass = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class grades',
      error: error.message,
    });
  }
};

// Get grades by subject
export const getGradesBySubject = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject grades',
      error: error.message,
    });
  }
};

// Create new grade
export const createGrade = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating grade',
      error: error.message,
    });
  }
};

// Update grade
export const updateGrade = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message,
    });
  }
};

// Delete grade
export const deleteGrade = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting grade',
      error: error.message,
    });
  }
};
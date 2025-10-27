import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getAllTeachers = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

export const createTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.teacher.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error: any) {
    next(error);
  }
};

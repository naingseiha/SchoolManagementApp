import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

export const getAllTeachers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        classes: true,
        subjects: true,
      },
    });

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        classes: true,
        subjects: true,
        grades: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      teacherId,
      khmerName,
      englishName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      position,
      userId,
    } = req.body;

    const teacher = await prisma.teacher.create({
      data: {
        teacherId,
        khmerName,
        englishName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        email,
        position,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.teacher.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
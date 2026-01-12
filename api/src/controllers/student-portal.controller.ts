import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Get student's own profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
                track: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        student: user.student,
      },
    });
  } catch (error: any) {
    console.error("Error getting student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// Get student's own grades
export const getMyGrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { year, month } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const studentId = user.student.id;

    // Build filter
    const filter: any = {
      studentId,
    };

    if (year) {
      filter.year = parseInt(year as string);
    }
    if (month) {
      filter.month = month as string;
    }

    // Get grades
    const grades = await prisma.grade.findMany({
      where: filter,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            nameKh: true,
            code: true,
            coefficient: true,
            maxScore: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { monthNumber: "desc" }],
    });

    // Get monthly summaries
    const summaries = await prisma.studentMonthlySummary.findMany({
      where: {
        studentId,
        ...(year && { year: parseInt(year as string) }),
        ...(month && { month: month as string }),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { monthNumber: "desc" }],
    });

    // Calculate statistics
    const totalGrades = grades.length;
    const averageScore =
      totalGrades > 0
        ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / totalGrades
        : 0;

    res.json({
      success: true,
      data: {
        grades,
        summaries,
        statistics: {
          totalGrades,
          averageScore: parseFloat(averageScore.toFixed(2)),
        },
      },
    });
  } catch (error: any) {
    console.error("Error getting student grades:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get grades",
      error: error.message,
    });
  }
};

// Get student's own attendance
export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, month, year } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const studentId = user.student.id;

    // Build date filter
    const filter: any = {
      studentId,
    };

    if (startDate && endDate) {
      filter.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    } else if (month && year) {
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0);
      filter.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: filter,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate statistics
    const totalDays = attendance.length;
    const presentCount = attendance.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
    const permissionCount = attendance.filter(
      (a) => a.status === "PERMISSION"
    ).length;
    const lateCount = attendance.filter((a) => a.status === "LATE").length;

    const attendanceRate =
      totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          totalDays,
          presentCount,
          absentCount,
          permissionCount,
          lateCount,
          attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        },
      },
    });
  } catch (error: any) {
    console.error("Error getting student attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance",
      error: error.message,
    });
  }
};

// Change student password
export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// Update student profile
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      firstName,
      lastName,
      email,
      phone,
      phoneNumber,
      currentAddress,
      placeOfBirth,
      parentPhone,
      parentOccupation,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || user.role !== "STUDENT" || !user.student) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update user data
    const userUpdateData: any = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (email !== undefined) userUpdateData.email = email;
    if (phone !== undefined) userUpdateData.phone = phone;

    // Update student data
    const studentUpdateData: any = {};
    if (firstName !== undefined) studentUpdateData.firstName = firstName;
    if (lastName !== undefined) studentUpdateData.lastName = lastName;
    if (email !== undefined) studentUpdateData.email = email;
    if (phoneNumber !== undefined) studentUpdateData.phoneNumber = phoneNumber;
    if (currentAddress !== undefined)
      studentUpdateData.currentAddress = currentAddress;
    if (placeOfBirth !== undefined)
      studentUpdateData.placeOfBirth = placeOfBirth;
    if (parentPhone !== undefined) studentUpdateData.parentPhone = parentPhone;
    if (parentOccupation !== undefined)
      studentUpdateData.parentOccupation = parentOccupation;

    // Update both user and student records
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      }),
      prisma.student.update({
        where: { id: user.student.id },
        data: studentUpdateData,
      }),
    ]);

    // Get updated data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
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
        },
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

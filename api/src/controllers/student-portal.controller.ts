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

    // ✅ NO LONGER USING StudentMonthlySummary - calculating everything dynamically!

    // Calculate statistics
    // ✅ FIXED: Calculate average properly using ALL subjects for the class
    const totalGrades = grades.length;

    // Get ALL subjects for the student's class/grade (like report page does)
    let allSubjects: any[] = [];
    if (user.student.classId) {
      const studentClass = await prisma.class.findUnique({
        where: { id: user.student.classId },
      });

      if (studentClass) {
        const whereClause: any = {
          grade: studentClass.grade,
          isActive: true,
        };

        // For Grade 11 & 12, filter by track
        const gradeNum = parseInt(studentClass.grade);
        if ((gradeNum === 11 || gradeNum === 12) && studentClass.track) {
          whereClause.OR = [
            { track: studentClass.track },
            { track: null },
            { track: "common" },
          ];
        }

        allSubjects = await prisma.subject.findMany({
          where: whereClause,
        });
      }
    }

    // Calculate total score from grades that exist
    const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);

    // Calculate total coefficient from ALL subjects (not just graded ones)
    const totalCoefficient = allSubjects.length > 0
      ? allSubjects.reduce((sum, s) => sum + (s.coefficient || 1), 0)
      : grades.reduce((sum, g) => sum + (g.subject.coefficient || 1), 0);

    // ✅ Average = totalScore / totalCoefficient (same as report page)
    const averageScore =
      totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

    // ✅ Calculate class rank dynamically (like report page does)
    let classRank = null;
    if (user.student.classId && year && month) {
      // Get all students in the same class
      const classStudents = await prisma.student.findMany({
        where: { classId: user.student.classId },
        select: { id: true },
      });

      // Calculate average for each student
      const studentAverages = await Promise.all(
        classStudents.map(async (student) => {
          const studentGrades = await prisma.grade.findMany({
            where: {
              studentId: student.id,
              classId: user.student.classId,
              month: month as string,
              year: parseInt(year as string),
            },
            include: { subject: true },
          });

          const studentScore = studentGrades.reduce(
            (sum, g) => sum + (g.score || 0),
            0
          );
          const studentAvg =
            totalCoefficient > 0 ? studentScore / totalCoefficient : 0;

          return {
            studentId: student.id,
            average: studentAvg,
          };
        })
      );

      // Sort by average descending and find rank
      const sorted = studentAverages
        .sort((a, b) => b.average - a.average)
        .map((s, index) => ({ ...s, rank: index + 1 }));

      const currentStudent = sorted.find((s) => s.studentId === studentId);
      classRank = currentStudent?.rank || null;
    }

    // ✅ Calculate grade level (same as report page)
    let gradeLevel = "F";
    if (averageScore >= 45) gradeLevel = "A";
    else if (averageScore >= 40) gradeLevel = "B";
    else if (averageScore >= 35) gradeLevel = "C";
    else if (averageScore >= 30) gradeLevel = "D";
    else if (averageScore >= 25) gradeLevel = "E";

    res.json({
      success: true,
      data: {
        grades,
        statistics: {
          totalGrades,
          totalScore: parseFloat(totalScore.toFixed(2)),
          averageScore: parseFloat(averageScore.toFixed(2)),
          classRank,
          gradeLevel,
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
    const recordedDays = attendance.length;
    const presentCount = attendance.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
    const permissionCount = attendance.filter(
      (a) => a.status === "PERMISSION"
    ).length;
    const lateCount = attendance.filter((a) => a.status === "LATE").length;

    // ✅ FIXED: Attendance rate calculation based on total days in the month
    // Get number of days in the specified month
    let totalDaysInMonth = 30; // default
    if (month && year) {
      const monthNumber = parseInt(month as string);
      const yearNumber = parseInt(year as string);
      // Get actual number of days in the month
      totalDaysInMonth = new Date(yearNumber, monthNumber, 0).getDate();
    } else if (startDate && endDate) {
      // If date range is specified, calculate days between
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      totalDaysInMonth = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate attendance rate:
    // - Total days NOT attended = Absent + Permission
    // - Days attended = Total days in month - (Absent + Permission)
    // - Rate = (Days attended / Total days in month) * 100
    const daysNotAttended = absentCount + permissionCount;
    const daysAttended = totalDaysInMonth - daysNotAttended;
    const attendanceRate = (daysAttended / totalDaysInMonth) * 100;

    // Ensure rate doesn't go below 0 or above 100
    const finalAttendanceRate = Math.max(0, Math.min(100, attendanceRate));

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          totalDays: totalDaysInMonth, // Total days in the month
          recordedDays, // Number of attendance records
          presentCount,
          absentCount,
          permissionCount,
          lateCount,
          attendanceRate: parseFloat(finalAttendanceRate.toFixed(2)),
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
      khmerName,
      englishName,
      dateOfBirth,
      gender,
      phoneNumber,
      currentAddress,
      placeOfBirth,
      fatherName,
      motherName,
      parentPhone,
      parentOccupation,
      previousGrade,
      previousSchool,
      repeatingGrade,
      transferredFrom,
      grade9ExamSession,
      grade9ExamCenter,
      grade9ExamRoom,
      grade9ExamDesk,
      grade9PassStatus,
      grade12ExamSession,
      grade12ExamCenter,
      grade12ExamRoom,
      grade12ExamDesk,
      grade12Track,
      grade12PassStatus,
      remarks,
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

    // Update student data - all fields
    const studentUpdateData: any = {};
    if (firstName !== undefined) studentUpdateData.firstName = firstName;
    if (lastName !== undefined) studentUpdateData.lastName = lastName;
    if (khmerName !== undefined) studentUpdateData.khmerName = khmerName;
    if (englishName !== undefined) studentUpdateData.englishName = englishName;
    if (dateOfBirth !== undefined) studentUpdateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) studentUpdateData.gender = gender;
    if (email !== undefined) studentUpdateData.email = email;
    if (phoneNumber !== undefined) studentUpdateData.phoneNumber = phoneNumber;
    if (currentAddress !== undefined) studentUpdateData.currentAddress = currentAddress;
    if (placeOfBirth !== undefined) studentUpdateData.placeOfBirth = placeOfBirth;
    if (fatherName !== undefined) studentUpdateData.fatherName = fatherName;
    if (motherName !== undefined) studentUpdateData.motherName = motherName;
    if (parentPhone !== undefined) studentUpdateData.parentPhone = parentPhone;
    if (parentOccupation !== undefined) studentUpdateData.parentOccupation = parentOccupation;
    if (previousGrade !== undefined) studentUpdateData.previousGrade = previousGrade;
    if (previousSchool !== undefined) studentUpdateData.previousSchool = previousSchool;
    if (repeatingGrade !== undefined) studentUpdateData.repeatingGrade = repeatingGrade;
    if (transferredFrom !== undefined) studentUpdateData.transferredFrom = transferredFrom;
    if (grade9ExamSession !== undefined) studentUpdateData.grade9ExamSession = grade9ExamSession;
    if (grade9ExamCenter !== undefined) studentUpdateData.grade9ExamCenter = grade9ExamCenter;
    if (grade9ExamRoom !== undefined) studentUpdateData.grade9ExamRoom = grade9ExamRoom;
    if (grade9ExamDesk !== undefined) studentUpdateData.grade9ExamDesk = grade9ExamDesk;
    if (grade9PassStatus !== undefined) studentUpdateData.grade9PassStatus = grade9PassStatus;
    if (grade12ExamSession !== undefined) studentUpdateData.grade12ExamSession = grade12ExamSession;
    if (grade12ExamCenter !== undefined) studentUpdateData.grade12ExamCenter = grade12ExamCenter;
    if (grade12ExamRoom !== undefined) studentUpdateData.grade12ExamRoom = grade12ExamRoom;
    if (grade12ExamDesk !== undefined) studentUpdateData.grade12ExamDesk = grade12ExamDesk;
    if (grade12Track !== undefined) studentUpdateData.grade12Track = grade12Track;
    if (grade12PassStatus !== undefined) studentUpdateData.grade12PassStatus = grade12PassStatus;
    if (remarks !== undefined) studentUpdateData.remarks = remarks;

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
                track: true,
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

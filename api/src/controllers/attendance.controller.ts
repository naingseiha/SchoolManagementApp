import { Request, Response } from "express";
import { PrismaClient, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class AttendanceController {
  /**
   * Get attendance grid for Excel-like editing
   */
  static async getAttendanceGrid(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      // ✅ Log incoming params
      console.log("📥 Get attendance grid params:", { classId, month, year });

      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            orderBy: { khmerName: "asc" },
          },
        },
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      const monthNames = [
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];

      // ✅ Fix: indexOf returns -1 if not found, add 1 to get 1-12
      const monthIndex = monthNames.indexOf(month as string);
      const monthNumber = monthIndex + 1; // 1-12 (not 0-11)

      console.log("📅 Month parsing:", {
        monthName: month,
        monthIndex,
        monthNumber,
      });

      // ✅ Validate month number
      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid month name: ${month}.  Must be one of: ${monthNames.join(
            ", "
          )}`,
        });
      }

      // ✅ Use monthNumber (1-12) for Date constructor
      // JavaScript Date months are 0-indexed, so subtract 1
      const daysInMonth = new Date(
        parseInt(year as string),
        monthNumber, // This gives us the last day of the month
        0
      ).getDate();

      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      // ✅ Create proper date range
      const startDate = new Date(
        parseInt(year as string),
        monthNumber - 1,
        1,
        0,
        0,
        0
      );
      const endDate = new Date(
        parseInt(year as string),
        monthNumber - 1,
        daysInMonth,
        23,
        59,
        59
      );

      console.log("📅 Date range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysInMonth,
      });

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          classId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      console.log(`✅ Found ${attendanceRecords.length} attendance records`);

      // Build grid data
      const gridData = classData.students.map((student) => {
        const studentAttendance: { [day: number]: any } = {};
        let totalAbsent = 0;
        let totalPermission = 0;

        days.forEach((day) => {
          const record = attendanceRecords.find(
            (a) =>
              a.studentId === student.id &&
              a.date.getDate() === day &&
              a.date.getMonth() === monthNumber - 1 // JavaScript month is 0-indexed
          );

          let displayValue = "";
          if (record) {
            if (record.status === AttendanceStatus.ABSENT) {
              displayValue = "A";
              totalAbsent++;
            } else if (record.status === AttendanceStatus.PERMISSION) {
              displayValue = "P";
              totalPermission++;
            }
          }

          studentAttendance[day] = {
            id: record?.id || null,
            status: record?.status || null,
            displayValue,
            isSaved: !!record,
          };
        });

        return {
          studentId: student.id,
          studentName:
            student.khmerName || `${student.lastName} ${student.firstName}`,
          gender: student.gender,
          attendance: studentAttendance,
          totalAbsent,
          totalPermission,
        };
      });

      return res.json({
        success: true,
        data: {
          classId: classData.id,
          className: classData.name,
          month: month as string,
          year: parseInt(year as string),
          monthNumber, // ✅ Now returns correct value (1-12)
          daysInMonth,
          days,
          students: gridData,
        },
      });
    } catch (error: any) {
      console.error("❌ Get attendance grid error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get attendance grid",
      });
    }
  }

  /**
   * Bulk save attendance
   */
  static async bulkSaveAttendance(req: Request, res: Response) {
    try {
      const { classId, month, year, monthNumber, attendance } = req.body;

      console.log("💾 Bulk save attendance:", {
        classId,
        month,
        year,
        monthNumber,
        recordCount: attendance?.length,
      });

      if (
        !classId ||
        !month ||
        !year ||
        !attendance ||
        !Array.isArray(attendance)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
        });
      }

      const savedRecords: any[] = [];
      const errors: any[] = [];

      for (const record of attendance) {
        const { studentId, day, value } = record;

        try {
          let status: AttendanceStatus | null = null;
          if (value === "A" || value === "a") {
            status = AttendanceStatus.ABSENT;
          } else if (value === "P" || value === "p") {
            status = AttendanceStatus.PERMISSION;
          }

          // ✅ Create date at noon to avoid timezone issues
          const dateKey = new Date(year, monthNumber - 1, day, 12, 0, 0, 0);

          console.log(
            `📝 Processing: Student ${studentId}, Day ${day}, Value: "${value}", Status: ${status}, Date: ${dateKey.toISOString()}`
          );

          if (status) {
            // ✅ FIX: Find existing record first
            const existingRecord = await prisma.attendance.findFirst({
              where: {
                studentId,
                classId,
                date: {
                  gte: new Date(year, monthNumber - 1, day, 0, 0, 0),
                  lt: new Date(year, monthNumber - 1, day + 1, 0, 0, 0),
                },
              },
            });

            if (existingRecord) {
              // Update existing
              const updated = await prisma.attendance.update({
                where: { id: existingRecord.id },
                data: { status },
              });
              savedRecords.push(updated);
              console.log(`✅ Updated: ${updated.id}`);
            } else {
              // Create new
              const created = await prisma.attendance.create({
                data: {
                  studentId,
                  classId,
                  date: dateKey,
                  status,
                },
              });
              savedRecords.push(created);
              console.log(`✅ Created: ${created.id}`);
            }
          } else {
            // Delete if exists (marked as PRESENT or empty)
            const deleted = await prisma.attendance.deleteMany({
              where: {
                studentId,
                classId,
                date: {
                  gte: new Date(year, monthNumber - 1, day, 0, 0, 0),
                  lt: new Date(year, monthNumber - 1, day + 1, 0, 0, 0),
                },
              },
            });
            if (deleted.count > 0) {
              console.log(`🗑️ Deleted ${deleted.count} record(s)`);
            }
          }
        } catch (error: any) {
          console.error(
            `❌ Error processing student ${studentId}, day ${day}:`,
            error
          );
          errors.push({
            studentId,
            day,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ Bulk save complete: ${savedRecords.length} saved, ${errors.length} errors`
      );

      return res.json({
        success: errors.length === 0,
        message: `Saved ${savedRecords.length} records${
          errors.length > 0 ? `, ${errors.length} errors` : ""
        }`,
        data: {
          savedCount: savedRecords.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (error: any) {
      console.error("❌ Bulk save attendance error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save attendance",
      });
    }
  }

  /**
   * Get monthly attendance summary for grade entry
   */
  static async getMonthlySummary(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      console.log(
        `📊 Getting attendance summary for class: ${classId}, month: ${month}, year: ${year}`
      );

      const monthNames = [
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];
      const monthNumber = monthNames.indexOf(month as string) + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }

      const startDate = new Date(parseInt(year as string), monthNumber - 1, 1);
      const endDate = new Date(
        parseInt(year as string),
        monthNumber,
        0,
        23,
        59,
        59
      );

      console.log(
        `📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          classId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      console.log(`✅ Found ${attendanceRecords.length} attendance records`);

      const summary: {
        [studentId: string]: { absent: number; permission: number };
      } = {};

      attendanceRecords.forEach((record) => {
        if (!summary[record.studentId]) {
          summary[record.studentId] = { absent: 0, permission: 0 };
        }

        if (record.status === "ABSENT") {
          summary[record.studentId].absent++;
        } else if (record.status === "PERMISSION") {
          summary[record.studentId].permission++;
        }
      });

      console.log(
        `📊 Summary for ${Object.keys(summary).length} students:`,
        summary
      );

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("❌ Get attendance summary error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get attendance summary",
      });
    }
  }
}

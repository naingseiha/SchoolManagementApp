import { Request, Response } from "express";
import { PrismaClient, AttendanceStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// api/src/controllers/attendance.controller.ts

export class AttendanceController {
  /**
   * ✅ UPDATED: Get attendance grid with session support
   */
  static async getAttendanceGrid(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: { orderBy: { khmerName: "asc" } },
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

      const monthIndex = monthNames.indexOf(month as string);
      const monthNumber = monthIndex + 1;

      if (monthNumber === 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid month name: ${month}`,
        });
      }

      const daysInMonth = new Date(
        parseInt(year as string),
        monthNumber,
        0
      ).getDate();

      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

      // ✅ Fetch all attendance records (both sessions)
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

      // ✅ Build grid data with session support
      const gridData = classData.students.map((student) => {
        const studentAttendance: {
          [key: string]: {
            id: string | null;
            status: string | null;
            displayValue: string;
            isSaved: boolean;
            session: "MORNING" | "AFTERNOON";
          };
        } = {};

        let totalAbsent = 0;
        let totalPermission = 0;

        days.forEach((day) => {
          // ⭐ Morning session
          const morningRecord = attendanceRecords.find(
            (a) =>
              a.studentId === student.id &&
              a.date.getDate() === day &&
              a.date.getMonth() === monthNumber - 1 &&
              a.session === "MORNING"
          );

          // ⭐ Afternoon session
          const afternoonRecord = attendanceRecords.find(
            (a) =>
              a.studentId === student.id &&
              a.date.getDate() === day &&
              a.date.getMonth() === monthNumber - 1 &&
              a.session === "AFTERNOON"
          );

          // ✅ Morning cell key:  "day_M"
          let morningValue = "";
          if (morningRecord) {
            if (morningRecord.status === "ABSENT") {
              morningValue = "A";
              totalAbsent++;
            } else if (morningRecord.status === "PERMISSION") {
              morningValue = "P";
              totalPermission++;
            }
          }

          studentAttendance[`${day}_M`] = {
            id: morningRecord?.id || null,
            status: morningRecord?.status || null,
            displayValue: morningValue,
            isSaved: !!morningRecord,
            session: "MORNING",
          };

          // ✅ Afternoon cell key: "day_A"
          let afternoonValue = "";
          if (afternoonRecord) {
            if (afternoonRecord.status === "ABSENT") {
              afternoonValue = "A";
              totalAbsent++;
            } else if (afternoonRecord.status === "PERMISSION") {
              afternoonValue = "P";
              totalPermission++;
            }
          }

          studentAttendance[`${day}_A`] = {
            id: afternoonRecord?.id || null,
            status: afternoonRecord?.status || null,
            displayValue: afternoonValue,
            isSaved: !!afternoonRecord,
            session: "AFTERNOON",
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
          monthNumber,
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
   * ✅ UPDATED:  Bulk save with session support
   */
  static async bulkSaveAttendance(req: Request, res: Response) {
    try {
      const { classId, month, year, monthNumber, attendance } = req.body;

      console.log("\n=== BULK SAVE ATTENDANCE ===");
      console.log("Class:", classId);
      console.log("Month:", month, monthNumber);
      console.log("Year:", year);
      console.log("Records:", attendance.length);

      if (!Array.isArray(attendance) || attendance.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No attendance data provided",
        });
      }

      let savedCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      for (const item of attendance) {
        try {
          const { studentId, day, session, value } = item;

          if (!studentId || !day || !session) {
            errorCount++;
            errors.push({ item, reason: "Missing required fields" });
            continue;
          }

          // ✅ Parse session
          const sessionEnum = session === "M" ? "MORNING" : "AFTERNOON";

          // ✅ Create date
          const date = new Date(year, monthNumber - 1, day, 12, 0, 0);

          // ✅ Determine status
          let status: "PRESENT" | "ABSENT" | "PERMISSION" | null = null;
          if (value === "A") {
            status = "ABSENT";
          } else if (value === "P") {
            status = "PERMISSION";
          }

          // ✅ If empty, delete existing record
          if (!status) {
            await prisma.attendance.deleteMany({
              where: {
                studentId,
                classId,
                date: {
                  gte: new Date(year, monthNumber - 1, day, 0, 0, 0),
                  lt: new Date(year, monthNumber - 1, day + 1, 0, 0, 0),
                },
                session: sessionEnum,
              },
            });
            savedCount++; // Count deletions as successful
          } else {
            // ✅ FIXED: Check if record exists first
            const existingRecord = await prisma.attendance.findFirst({
              where: {
                studentId,
                classId,
                date: {
                  gte: new Date(year, monthNumber - 1, day, 0, 0, 0),
                  lt: new Date(year, monthNumber - 1, day + 1, 0, 0, 0),
                },
                session: sessionEnum,
              },
            });

            if (existingRecord) {
              // ✅ UPDATE existing record
              await prisma.attendance.update({
                where: {
                  id: existingRecord.id,
                },
                data: {
                  status,
                  updatedAt: new Date(),
                },
              });
              console.log(`✅ Updated existing record: ${existingRecord.id}`);
            } else {
              // ✅ CREATE new record with generated ID
              const newId = uuidv4();
              await prisma.attendance.create({
                data: {
                  id: newId, // ✅ CRITICAL: Generate UUID
                  studentId,
                  classId,
                  date,
                  session: sessionEnum,
                  status,
                  updatedAt: new Date(),
                },
              });
              console.log(`✅ Created new record: ${newId}`);
            }

            savedCount++;
          }
        } catch (err: any) {
          console.error("❌ Error saving attendance:", err);
          errorCount++;
          errors.push({ item, error: err.message });
        }
      }

      console.log(`✅ Saved:  ${savedCount}, Errors: ${errorCount}`);
      console.log("===========================\n");

      return res.json({
        success: true,
        data: {
          savedCount,
          errorCount,
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
   * ✅ UPDATED:  Monthly summary with session support
   */
  static async getMonthlySummary(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

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
      const startDate = new Date(parseInt(year as string), monthNumber - 1, 1);
      const endDate = new Date(
        parseInt(year as string),
        monthNumber - 1,
        new Date(parseInt(year as string), monthNumber, 0).getDate(),
        23,
        59,
        59
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

      // ✅ Count both sessions
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
      console.error("❌ Get monthly summary error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get monthly summary",
      });
    }
  }
}

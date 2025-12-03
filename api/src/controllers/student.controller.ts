import { Request, Response } from "express";
import { PrismaClient, Gender } from "@prisma/client";
import { generateStudentId } from "../utils/studentIdGenerator";
import { parseDate } from "../utils/dateParser"; // ✅ MUST HAVE THIS

const prisma = new PrismaClient();

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        grades: {
          include: {
            subject: true,
          },
        },
        attendance: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 CREATE STUDENT REQUEST");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const {
      firstName,
      lastName,
      khmerName,
      englishName,
      email,
      dateOfBirth,
      gender,
      placeOfBirth,
      currentAddress,
      phoneNumber,
      classId,
      fatherName,
      motherName,
      parentPhone,
      parentOccupation,
      remarks,
    } = req.body;

    if (!firstName || firstName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "គោត្តនាម (First name) ជាទិន្នន័យចាំបាច់",
      });
    }

    if (!lastName || lastName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "នាម (Last name) ជាទិន្នន័យចាំបាច់",
      });
    }

    if (!khmerName || khmerName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "ឈ្មោះជាអក្សរខ្មែរ (Khmer name) ជាទិន្នន័យចាំបាច់",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "ថ្ងៃខែឆ្នាំកំណើត (Date of birth) ជាទិន្នន័យចាំបាច់",
      });
    }

    if (!gender || (gender !== "MALE" && gender !== "FEMALE")) {
      return res.status(400).json({
        success: false,
        message: "ភេទត្រូវតែជា MALE ឬ FEMALE",
      });
    }

    const studentId = await generateStudentId(classId);
    console.log(`🎯 Generated Student ID: ${studentId}`);

    const studentEmail =
      email && email.trim() !== ""
        ? email.trim()
        : `${studentId}@student.edu. kh`;

    console.log(`📧 Email: ${studentEmail}`);

    if (classId && classId.trim() !== "") {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: "រកមិនឃើញថ្នាក់នេះទេ (Class not found)",
        });
      }
    }

    const studentData: any = {
      studentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      khmerName: khmerName.trim(),
      englishName: englishName?.trim() || null,
      email: studentEmail,
      dateOfBirth,
      gender: gender as Gender,
      placeOfBirth: placeOfBirth?.trim() || "ភ្នំពេញ",
      currentAddress: currentAddress?.trim() || "ភ្នំពេញ",
      phoneNumber: phoneNumber?.trim() || null,
      fatherName: fatherName?.trim() || "ឪពុក",
      motherName: motherName?.trim() || "ម្តាយ",
      parentPhone: parentPhone?.trim() || null,
      parentOccupation: parentOccupation?.trim() || "កសិករ",
      remarks: remarks?.trim() || null,
    };

    if (classId && classId.trim() !== "") {
      studentData.classId = classId;
    }

    console.log("💾 Creating student in database...");

    const student = await prisma.student.create({
      data: studentData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    console.log("✅ Student created successfully!");
    console.log(`   ID: ${student.id}`);
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Name: ${student.khmerName}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    res.status(201).json({
      success: true,
      message: "បង្កើតសិស្សបានជោគជ័យ (Student created successfully)",
      data: student,
    });
  } catch (error: any) {
    console.error("❌ Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាក្នុងការបង្កើតសិស្ស (Error creating student)",
      error: error.message,
    });
  }
};

// ✅ BULK CREATE WITH DATE PARSING
export const bulkCreateStudents = async (req: Request, res: Response) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 BULK CREATE STUDENTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const { classId, students } = req.body;

    if (!classId || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "classId and students array are required",
      });
    }

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, grade: true },
    });

    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "Class not found",
      });
    }

    console.log(`📊 Class: ${classExists.name} (Grade ${classExists.grade})`);
    console.log(`👥 Students to create: ${students.length}`);

    const results = { success: [], failed: [] };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      const rowNumber = i + 1;

      try {
        // Parse name
        const fullName = studentData.name?.trim();
        if (!fullName) throw new Error("Name is required");

        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts.pop() || "";
        const lastName = nameParts.join(" ") || firstName;

        // Parse gender
        let gender: "MALE" | "FEMALE" = "MALE";
        if (studentData.gender) {
          const g = studentData.gender.toString().trim().toUpperCase();
          if (["ប", "ប្រុស", "M", "MALE", "BOY"].includes(g)) {
            gender = "MALE";
          } else if (["ស", "ស្រី", "F", "FEMALE", "GIRL"].includes(g)) {
            gender = "FEMALE";
          }
        }

        // ✅ PARSE DATE using imported parseDate function
        let dateOfBirth: string;
        try {
          if (!studentData.dateOfBirth) {
            throw new Error("Date of birth is required");
          }

          // ✅ USE parseDate function
          dateOfBirth = parseDate(studentData.dateOfBirth);
          console.log(
            `  📅 Row ${rowNumber}: ${studentData.dateOfBirth} → ${dateOfBirth}`
          );
        } catch (dateError: any) {
          throw new Error(`Invalid date: ${dateError.message}`);
        }

        // Generate student ID
        const studentId = await generateStudentId(classId);

        // Create student
        const newStudent = await prisma.student.create({
          data: {
            studentId,
            firstName,
            lastName,
            khmerName: fullName,
            dateOfBirth,
            gender,
            classId,
            email: `${studentId}@student.edu.kh`,

            // Academic history
            previousGrade: studentData.previousGrade?.trim() || null,
            previousSchool: studentData.previousSchool?.trim() || null,
            repeatingGrade: studentData.repeatingGrade?.trim() || null,
            transferredFrom: studentData.transferredFrom?.trim() || null,

            // Grade 9 Exam
            grade9ExamSession: studentData.grade9ExamSession?.trim() || null,
            grade9ExamCenter: studentData.grade9ExamCenter?.trim() || null,
            grade9ExamRoom: studentData.grade9ExamRoom?.trim() || null,
            grade9ExamDesk: studentData.grade9ExamDesk?.trim() || null,
            grade9PassStatus: studentData.grade9PassStatus?.trim() || null,

            // Grade 12 Exam
            grade12ExamSession: studentData.grade12ExamSession?.trim() || null,
            grade12ExamCenter: studentData.grade12ExamCenter?.trim() || null,
            grade12ExamRoom: studentData.grade12ExamRoom?.trim() || null,
            grade12ExamDesk: studentData.grade12ExamDesk?.trim() || null,
            grade12PassStatus: studentData.grade12PassStatus?.trim() || null,
            grade12Track: studentData.grade12Track?.trim() || null,

            // Other
            remarks: studentData.remarks?.trim() || null,

            // Defaults
            placeOfBirth: "ភ្នំពេញ",
            currentAddress: "ភ្នំពេញ",
            fatherName: "ឪពុក",
            motherName: "ម្តាយ",
            parentOccupation: "កសិករ",
          },
          include: {
            class: {
              select: { id: true, name: true, grade: true },
            },
          },
        });

        results.success.push({
          row: rowNumber,
          studentId: newStudent.studentId,
          name: newStudent.khmerName,
        });

        console.log(
          `  ✅ Row ${rowNumber}: ${newStudent.khmerName} (${newStudent.studentId})`
        );
      } catch (error: any) {
        results.failed.push({
          row: rowNumber,
          name: studentData.name || "Unknown",
          error: error.message,
        });
        console.error(`  ❌ Row ${rowNumber}: ${error.message}`);
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Success: ${results.success.length}/${students.length}`);
    console.log(`❌ Failed: ${results.failed.length}/${students.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    res.status(201).json({
      success: true,
      message: `Created ${results.success.length} students successfully`,
      data: {
        total: students.length,
        success: results.success.length,
        failed: results.failed.length,
        results,
      },
    });
  } catch (error: any) {
    console.error("❌ Bulk create error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create students",
      error: error.message,
    });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      khmerName,
      englishName,
      email,
      dateOfBirth,
      gender,
      placeOfBirth,
      currentAddress,
      phoneNumber,
      classId,
      fatherName,
      motherName,
      parentPhone,
      parentOccupation,
      remarks,
    } = req.body;

    console.log("📝 UPDATE STUDENT:", id);

    if (classId && classId.trim() !== "") {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: "រកមិនឃើញថ្នាក់នេះទេ (Class not found)",
        });
      }
    }

    if (gender && gender !== "MALE" && gender !== "FEMALE") {
      return res.status(400).json({
        success: false,
        message: "ភេទត្រូវតែជា MALE ឬ FEMALE",
      });
    }

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (khmerName !== undefined) updateData.khmerName = khmerName.trim();
    if (englishName !== undefined)
      updateData.englishName = englishName?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender as Gender;
    if (placeOfBirth !== undefined)
      updateData.placeOfBirth = placeOfBirth?.trim() || null;
    if (currentAddress !== undefined)
      updateData.currentAddress = currentAddress?.trim() || null;
    if (phoneNumber !== undefined)
      updateData.phoneNumber = phoneNumber?.trim() || null;
    if (fatherName !== undefined)
      updateData.fatherName = fatherName?.trim() || null;
    if (motherName !== undefined)
      updateData.motherName = motherName?.trim() || null;
    if (parentPhone !== undefined)
      updateData.parentPhone = parentPhone?.trim() || null;
    if (parentOccupation !== undefined)
      updateData.parentOccupation = parentOccupation?.trim() || null;
    if (remarks !== undefined) updateData.remarks = remarks?.trim() || null;
    if (classId !== undefined) {
      updateData.classId = classId && classId.trim() !== "" ? classId : null;
    }

    console.log("💾 Updating student.. .");

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
      },
    });

    console.log("✅ Student updated successfully");

    res.json({
      success: true,
      message: "កែប្រែសិស្សបានជោគជ័យ (Student updated successfully)",
      data: student,
    });
  } catch (error: any) {
    console.error("❌ Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាក្នុងការកែប្រែសិស្ស (Error updating student)",
      error: error.message,
    });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "លុបសិស្សបានជោគជ័យ (Student deleted successfully)",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាក្នុងការលុបសិស្ស (Error deleting student)",
      error: error.message,
    });
  }
};

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
    console.log(
      "📥 CREATE STUDENT - Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      address,
      phone,
      classId,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      typeof firstName !== "string" ||
      firstName.trim() === ""
    ) {
      console.log("❌ Validation failed: firstName missing or invalid");
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
      console.log("❌ Validation failed: lastName missing or invalid");
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (!dateOfBirth) {
      console.log("❌ Validation failed: dateOfBirth missing");
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
      });
    }

    if (!gender) {
      console.log("❌ Validation failed: gender missing");
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }

    // ✅ FIX: Generate email if not provided (Optional)
    const studentEmail =
      email && email.trim() !== ""
        ? email.trim()
        : `${firstName.toLowerCase().replace(/\s+/g, "")}.${lastName
            .toLowerCase()
            .replace(/\s+/g, "")}@student.com`;

    console.log("📧 Email:", studentEmail);

    // ✅ FIX: Validate email uniqueness ONLY if email is provided by user
    if (email && email.trim() !== "") {
      const existingStudent = await prisma.student.findUnique({
        where: { email: studentEmail },
      });

      if (existingStudent) {
        console.log("❌ Email already exists:", studentEmail);
        return res.status(400).json({
          success: false,
          message: "Email already exists. Please use a different email.",
        });
      }
    }

    // Validate classId if provided
    if (classId && classId.trim() !== "") {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        console.log("❌ Class not found:", classId);
        return res.status(400).json({
          success: false,
          message: "Class not found. Please select a valid class.",
        });
      }
    }

    // Prepare data for creation
    const studentData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: studentEmail,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address: address?.trim() || null,
      phone: phone?.trim() || null,
    };

    // Only add classId if provided and not empty
    if (classId && classId.trim() !== "") {
      studentData.classId = classId;
    }

    console.log("💾 Creating student with data:", studentData);

    // Create student
    const student = await prisma.student.create({
      data: studentData,
      include: {
        class: true,
      },
    });

    console.log("✅ Student created successfully:", student.id);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error: any) {
    console.error("❌ Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Error creating student",
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
      email,
      dateOfBirth,
      gender,
      address,
      phone,
      classId,
    } = req.body;

    console.log("📝 UPDATE STUDENT:", id);
    console.log("📥 Request body:", req.body);

    // Validate classId if provided
    if (classId && classId.trim() !== "") {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: "Class not found. Please select a valid class.",
        });
      }
    }

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (email !== undefined) updateData.email = email;
    if (dateOfBirth !== undefined)
      updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (classId !== undefined) {
      updateData.classId = classId && classId.trim() !== "" ? classId : null;
    }

    console.log("💾 Updating with data:", updateData);

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
      message: "Student updated successfully",
      data: student,
    });
  } catch (error: any) {
    console.error("❌ Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student",
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
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

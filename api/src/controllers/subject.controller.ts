import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all subjects
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { grade, track, category, isActive } = req.query;

    const where: any = {};

    if (grade) where.grade = grade as string;
    if (track) where.track = track as string;
    if (category) where.category = category as string;
    if (isActive !== undefined) where.isActive = isActive === "true";

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        teacherAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                subject: true,
              },
            },
          },
        },
        _count: {
          select: {
            grades: true,
          },
        },
      },
      orderBy: [{ grade: "asc" }, { code: "asc" }],
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects",
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
        teacherAssignments: {
          include: {
            teacher: true,
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
        _count: {
          select: {
            grades: true,
            teacherAssignments: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    console.error("Error fetching subject:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subject",
      error: error.message,
    });
  }
};

// Create subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "📥 CREATE SUBJECT - Request body:",
      JSON.stringify(req.body, null, 2)
    );

    const {
      name,
      nameKh,
      nameEn,
      code,
      description,
      grade,
      track,
      category,
      weeklyHours,
      annualHours,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    if (!code || code.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Subject code is required",
      });
    }

    if (!grade || grade.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Grade is required",
      });
    }

    // Check code uniqueness
    const existingSubject = await prisma.subject.findUnique({
      where: { code: code.trim() },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject code already exists. Please use a different code.",
      });
    }

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        nameKh: nameKh?.trim() || null,
        nameEn: nameEn?.trim() || null,
        code: code.trim(),
        description: description?.trim() || null,
        grade: grade.trim(),
        track: track?.trim() || null,
        category: category || "core",
        weeklyHours: parseFloat(weeklyHours) || 0,
        annualHours: parseInt(annualHours) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        teacherAssignments: {
          include: {
            teacher: true,
          },
        },
      },
    });

    console.log("✅ Subject created successfully:", subject.id);

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error: any) {
    console.error("❌ Error creating subject:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subject",
      error: error.message,
    });
  }
};

// Update subject
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      nameKh,
      nameEn,
      code,
      description,
      grade,
      track,
      category,
      weeklyHours,
      annualHours,
      isActive,
    } = req.body;

    console.log("📝 UPDATE SUBJECT:", id);
    console.log("📥 Request body:", req.body);

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check code uniqueness (exclude current subject)
    if (code && code.trim() !== "") {
      const codeExists = await prisma.subject.findFirst({
        where: {
          code: code.trim(),
          NOT: { id },
        },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "Subject code already exists. Please use a different code.",
        });
      }
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (nameKh !== undefined) updateData.nameKh = nameKh?.trim() || null;
    if (nameEn !== undefined) updateData.nameEn = nameEn?.trim() || null;
    if (code !== undefined) updateData.code = code.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (grade !== undefined) updateData.grade = grade.trim();
    if (track !== undefined) updateData.track = track?.trim() || null;
    if (category !== undefined) updateData.category = category;
    if (weeklyHours !== undefined)
      updateData.weeklyHours = parseFloat(weeklyHours);
    if (annualHours !== undefined)
      updateData.annualHours = parseInt(annualHours);
    if (isActive !== undefined) updateData.isActive = isActive;

    console.log("💾 Updating with data:", updateData);

    const subject = await prisma.subject.update({
      where: { id },
      data: updateData,
      include: {
        teacherAssignments: {
          include: {
            teacher: true,
          },
        },
      },
    });

    console.log("✅ Subject updated successfully");

    res.json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error: any) {
    console.error("❌ Error updating subject:", error);
    res.status(500).json({
      success: false,
      message: "Error updating subject",
      error: error.message,
    });
  }
};

// Delete subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if subject has grades
    const subjectWithGrades = await prisma.subject.findUnique({
      where: { id },
      include: {
        grades: true,
      },
    });

    if (!subjectWithGrades) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (subjectWithGrades.grades.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject with ${subjectWithGrades.grades.length} grade(s). Please remove grades first.`,
      });
    }

    // Delete subject (will cascade delete teacher assignments)
    await prisma.subject.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting subject:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting subject",
      error: error.message,
    });
  }
};

// Assign teachers to subject
export const assignTeachersToSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherIds } = req.body;

    console.log("🔗 ASSIGN TEACHERS TO SUBJECT:", id);
    console.log("📥 Teacher IDs:", teacherIds);

    if (!Array.isArray(teacherIds)) {
      return res.status(400).json({
        success: false,
        message: "teacherIds must be an array",
      });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Delete existing assignments
    await prisma.subjectTeacher.deleteMany({
      where: { subjectId: id },
    });

    // Create new assignments
    const assignments = await Promise.all(
      teacherIds.map((teacherId) =>
        prisma.subjectTeacher.create({
          data: {
            subjectId: id,
            teacherId,
          },
          include: {
            teacher: true,
          },
        })
      )
    );

    console.log("✅ Teachers assigned successfully");

    res.json({
      success: true,
      message: "Teachers assigned successfully",
      data: assignments,
    });
  } catch (error: any) {
    console.error("❌ Error assigning teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning teachers",
      error: error.message,
    });
  }
};

// Remove teacher from subject
export const removeTeacherFromSubject = async (req: Request, res: Response) => {
  try {
    const { id, teacherId } = req.params;

    await prisma.subjectTeacher.deleteMany({
      where: {
        subjectId: id,
        teacherId,
      },
    });

    res.json({
      success: true,
      message: "Teacher removed from subject successfully",
    });
  } catch (error: any) {
    console.error("❌ Error removing teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error removing teacher",
      error: error.message,
    });
  }
};

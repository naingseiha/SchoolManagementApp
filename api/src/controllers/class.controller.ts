import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    console.log("📚 GET ALL CLASSES");

    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            khmerName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        students: {
          select: {
            id: true,
            khmerName: true,
            firstName: true,
            lastName: true,
            gender: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [{ grade: "asc" }, { section: "asc" }],
    });

    console.log(`✅ Found ${classes.length} classes`);
    res.json(classes);
  } catch (error: any) {
    console.error("❌ Error getting classes:", error);
    res.status(500).json({
      success: false,
      message: "Error getting classes",
      error: error.message,
    });
  }
};

// Get class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("📖 GET CLASS BY ID:", id);

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: {
          orderBy: {
            khmerName: "asc",
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    console.log("✅ Class found:", classData.name);
    res.json(classData);
  } catch (error: any) {
    console.error("❌ Error getting class:", error);
    res.status(500).json({
      success: false,
      message: "Error getting class",
      error: error.message,
    });
  }
};

// Create class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { classId, name, grade, section, academicYear, capacity, teacherId } =
      req.body;

    console.log("➕ CREATE CLASS:", { classId, name, grade });

    if (!name || !grade || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Name, grade, and academicYear are required",
      });
    }

    // Check if classId already exists
    if (classId) {
      const existing = await prisma.class.findUnique({
        where: { classId },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Class with ID "${classId}" already exists`,
        });
      }
    }

    const classData = await prisma.class.create({
      data: {
        classId: classId || `G${grade}-${section || "A"}`,
        name,
        grade,
        section: section || null,
        academicYear,
        capacity: capacity ? parseInt(capacity) : null,
        teacherId: teacherId || null,
      },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    console.log("✅ Class created:", classData.id);
    res.status(201).json(classData);
  } catch (error: any) {
    console.error("❌ Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
};

// Update class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("✏️ UPDATE CLASS:", id);

    const existing = await prisma.class.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const classData = await prisma.class.update({
      where: { id },
      data: {
        ...updateData,
        capacity: updateData.capacity
          ? parseInt(updateData.capacity)
          : existing.capacity,
      },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    console.log("✅ Class updated");
    res.json(classData);
  } catch (error: any) {
    console.error("❌ Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Error updating class",
      error: error.message,
    });
  }
};

// Delete class
// Delete class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("🗑️ DELETE CLASS REQUEST:", id);

    // ✅ Check if class exists and get student count
    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            khmerName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!classWithStudents) {
      console.log("❌ Class not found:", id);
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // ✅ Prevent deletion if class has students
    if (classWithStudents.students.length > 0) {
      console.log(
        `❌ Cannot delete class with ${classWithStudents.students.length} students`
      );
      return res.status(400).json({
        success: false,
        message: `Cannot delete class with ${classWithStudents.students.length} student(s). Please remove students first.`,
        studentCount: classWithStudents.students.length,
      });
    }

    // ✅ Delete the class
    await prisma.class.delete({
      where: { id },
    });

    console.log("✅ Class deleted successfully:", classWithStudents.name);
    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting class",
      error: error.message,
    });
  }
};

// Assign students to class
export const assignStudentsToClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    console.log("🔗 ASSIGN STUDENTS TO CLASS:", id);

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be an array",
      });
    }

    const classData = await prisma.class.findUnique({
      where: { id },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Update students
    await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      data: {
        classId: id,
      },
    });

    const updatedClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    console.log("✅ Students assigned");
    res.json(updatedClass);
  } catch (error: any) {
    console.error("❌ Error assigning students:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning students",
      error: error.message,
    });
  }
};

// Remove student from class
export const removeStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;

    console.log("🔓 REMOVE STUDENT FROM CLASS:", { id, studentId });

    await prisma.student.update({
      where: { id: studentId },
      data: {
        classId: null,
      },
    });

    console.log("✅ Student removed");
    res.json({
      success: true,
      message: "Student removed from class",
    });
  } catch (error: any) {
    console.error("❌ Error removing student:", error);
    res.status(500).json({
      success: false,
      message: "Error removing student",
      error: error.message,
    });
  }
};

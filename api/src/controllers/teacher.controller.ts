import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET all teachers with relations
 */
export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    console.log("📋 Fetching all teachers...");

    const teachers = await prisma.teacher.findMany({
      include: {
        // ✅ Homeroom class (one-to-one)
        homeroomClass: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            track: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        // ✅ Teaching classes (many-to-many)
        teachingClasses: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
                track: true,
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
          },
        },
        // ✅ Subject assignments (many-to-many)
        subjectAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                nameKh: true, // ✅ Keep nameKh
                nameEn: true, // ✅ Keep nameEn
                code: true,
                grade: true,
                track: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Transform data for frontend
    const transformedTeachers = teachers.map((teacher) => ({
      ...teacher,
      // Extract IDs for easy access
      subjectIds: teacher.subjectAssignments.map((sa) => sa.subjectId),
      teachingClassIds: teacher.teachingClasses.map((tc) => tc.classId),

      // Flatten nested data
      subjects: teacher.subjectAssignments.map((sa) => sa.subject),
      teachingClasses: teacher.teachingClasses.map((tc) => tc.class),

      // Create subject string for display (keep for backward compatibility)
      subject: teacher.subjectAssignments
        .map((sa) => sa.subject.nameKh || sa.subject.name)
        .join(", "),
    }));

    console.log(`✅ Found ${transformedTeachers.length} teachers`);

    res.json({
      success: true,
      data: transformedTeachers,
    });
  } catch (error: any) {
    console.error("❌ Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};

/**
 * ✅ GET single teacher by ID with full details
 */
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching teacher:  ${id}`);

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        // ✅ Homeroom class with students
        homeroomClass: {
          include: {
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                khmerName: true,
                email: true,
                studentId: true,
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        // ✅ Teaching classes with students
        teachingClasses: {
          include: {
            class: {
              include: {
                students: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    khmerName: true,
                    email: true,
                    studentId: true,
                  },
                },
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
          },
        },
        // ✅ Subject assignments
        subjectAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                nameKh: true, // ✅ Keep nameKh
                nameEn: true, // ✅ Keep nameEn
                code: true,
                grade: true,
                track: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // ✅ Transform data for frontend
    const transformedTeacher = {
      ...teacher,
      subjectIds: teacher.subjectAssignments.map((sa) => sa.subjectId),
      teachingClassIds: teacher.teachingClasses.map((tc) => tc.classId),
      subjects: teacher.subjectAssignments.map((sa) => sa.subject),
      teachingClasses: teacher.teachingClasses.map((tc) => tc.class),
      subject: teacher.subjectAssignments
        .map((sa) => sa.subject.nameKh || sa.subject.name)
        .join(", "),
    };

    console.log("✅ Teacher found");

    res.json({
      success: true,
      data: transformedTeacher,
    });
  } catch (error: any) {
    console.error("❌ Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher",
      error: error.message,
    });
  }
};

/**
 * ✅ CREATE new teacher with all relations
 */
export const createTeacher = async (req: Request, res: Response) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 CREATE TEACHER - Request body:");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const {
      firstName,
      lastName,
      khmerName,
      email,
      phone,
      gender,
      role,
      employeeId,
      position,
      address,
      dateOfBirth,
      hireDate,
      homeroomClassId,
      subjectIds,
      teachingClassIds,
    } = req.body;

    // ✅ Validate required fields
    if (!firstName || firstName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!lastName || lastName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ Validate INSTRUCTOR must have homeroom class
    if (role === "INSTRUCTOR" && !homeroomClassId) {
      return res.status(400).json({
        success: false,
        message: "Instructor must have a homeroom class assigned",
      });
    }

    // ✅ Check email uniqueness
    const existingEmail = await prisma.teacher.findUnique({
      where: { email: email.trim() },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.  Please use a different email.",
      });
    }

    // ✅ Check employee ID uniqueness if provided
    if (employeeId && employeeId.trim() !== "") {
      const existingEmployeeId = await prisma.teacher.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists. Please use a different ID.",
        });
      }
    }

    // ✅ Check homeroom class availability
    if (homeroomClassId) {
      const classWithTeacher = await prisma.class.findUnique({
        where: { id: homeroomClassId },
        include: { homeroomTeacher: true },
      });

      if (!classWithTeacher) {
        return res.status(404).json({
          success: false,
          message: "Homeroom class not found",
        });
      }

      if (classWithTeacher.homeroomTeacher) {
        return res.status(400).json({
          success: false,
          message: `Class ${classWithTeacher.name} already has a homeroom teacher (${classWithTeacher.homeroomTeacher.firstName} ${classWithTeacher.homeroomTeacher.lastName})`,
        });
      }
    }

    // ✅ Validate subject IDs if provided
    if (subjectIds && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const validSubjects = await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
      });

      if (validSubjects.length !== subjectIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some subject IDs are invalid",
        });
      }
    }

    // ✅ Validate teaching class IDs if provided
    if (
      teachingClassIds &&
      Array.isArray(teachingClassIds) &&
      teachingClassIds.length > 0
    ) {
      const validClasses = await prisma.class.findMany({
        where: { id: { in: teachingClassIds } },
      });

      if (validClasses.length !== teachingClassIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some class IDs are invalid",
        });
      }
    }

    // ✅ Create teacher with all relations
    const teacher = await prisma.teacher.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        khmerName: khmerName?.trim() || null,
        email: email.trim(),
        phone: phone?.trim() || null,
        gender: gender || null,
        role: role || "TEACHER",
        employeeId: employeeId?.trim() || null,
        position: position?.trim() || null,
        address: address?.trim() || null,
        dateOfBirth: dateOfBirth || null,
        hireDate: hireDate || null,
        homeroomClassId: homeroomClassId || null,

        // ✅ Create subject assignments
        subjectAssignments: {
          create: (subjectIds || []).map((subjectId: string) => ({
            subjectId,
          })),
        },

        // ✅ Create teaching class assignments
        teachingClasses: {
          create: (teachingClassIds || []).map((classId: string) => ({
            classId,
          })),
        },
      },
      include: {
        homeroomClass: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            track: true,
          },
        },
        teachingClasses: {
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
        subjectAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                nameKh: true, // ✅ Keep nameKh
                nameEn: true, // ✅ Keep nameEn
                code: true,
                grade: true,
                track: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Teacher created successfully:  ${teacher.id}`);

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error: any) {
    console.error("❌ Error creating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error creating teacher",
      error: error.message,
    });
  }
};

/**
 * ✅ UPDATE teacher with all relations
 */
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 UPDATE TEACHER: ${id}`);
    console.log("📥 Request body:");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const {
      firstName,
      lastName,
      khmerName,
      email,
      phone,
      gender,
      role,
      employeeId,
      position,
      address,
      dateOfBirth,
      hireDate,
      homeroomClassId,
      subjectIds,
      teachingClassIds,
    } = req.body;

    // ✅ Check if teacher exists FIRST (outside transaction)
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        homeroomClass: true,
        teachingClasses: true,
        subjectAssignments: true,
      },
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // ✅ Validate required fields
    if (firstName !== undefined && firstName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "First name cannot be empty",
      });
    }

    if (lastName !== undefined && lastName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Last name cannot be empty",
      });
    }

    if (email !== undefined && email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email cannot be empty",
      });
    }

    // ✅ Validate INSTRUCTOR must have homeroom
    if (role === "INSTRUCTOR" && !homeroomClassId) {
      return res.status(400).json({
        success: false,
        message: "Instructor must have a homeroom class assigned",
      });
    }

    // ✅ Check email uniqueness (outside transaction)
    if (email && email !== existingTeacher.email) {
      const emailExists = await prisma.teacher.findUnique({
        where: { email: email.trim() },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.  Please use a different email.",
        });
      }
    }

    // ✅ Check employee ID uniqueness (outside transaction)
    if (employeeId && employeeId !== existingTeacher.employeeId) {
      const employeeIdExists = await prisma.teacher.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (employeeIdExists) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists. Please use a different ID.",
        });
      }
    }

    // ✅ Check homeroom class availability (outside transaction)
    if (
      homeroomClassId &&
      homeroomClassId !== existingTeacher.homeroomClassId
    ) {
      const classWithTeacher = await prisma.class.findUnique({
        where: { id: homeroomClassId },
        include: { homeroomTeacher: true },
      });

      if (!classWithTeacher) {
        return res.status(404).json({
          success: false,
          message: "Homeroom class not found",
        });
      }

      if (
        classWithTeacher.homeroomTeacher &&
        classWithTeacher.homeroomTeacher.id !== id
      ) {
        return res.status(400).json({
          success: false,
          message: `Class ${classWithTeacher.name} already has a homeroom teacher (${classWithTeacher.homeroomTeacher.firstName} ${classWithTeacher.homeroomTeacher.lastName})`,
        });
      }
    }

    // ✅ Update teacher with FAST transaction (increased timeout)
    const teacher = await prisma.$transaction(
      async (tx) => {
        // Delete old assignments (fast bulk deletes)
        await Promise.all([
          tx.subjectTeacher.deleteMany({
            where: { teacherId: id },
          }),
          tx.teacherClass.deleteMany({
            where: { teacherId: id },
          }),
        ]);

        // Update teacher with new assignments
        return await tx.teacher.update({
          where: { id },
          data: {
            firstName: firstName !== undefined ? firstName.trim() : undefined,
            lastName: lastName !== undefined ? lastName.trim() : undefined,
            khmerName:
              khmerName !== undefined ? khmerName?.trim() || null : undefined,
            email: email !== undefined ? email.trim() : undefined,
            phone: phone !== undefined ? phone?.trim() || null : undefined,
            gender: gender !== undefined ? gender : undefined,
            role: role !== undefined ? role : undefined,
            employeeId:
              employeeId !== undefined ? employeeId?.trim() || null : undefined,
            position:
              position !== undefined ? position?.trim() || null : undefined,
            address:
              address !== undefined ? address?.trim() || null : undefined,
            dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
            hireDate: hireDate !== undefined ? hireDate : undefined,

            // Set homeroom
            homeroomClassId:
              role === "INSTRUCTOR"
                ? homeroomClassId || null
                : role === "TEACHER"
                ? null
                : undefined,

            // Create new assignments
            subjectAssignments: {
              create: (subjectIds || []).map((subjectId: string) => ({
                subjectId,
              })),
            },
            teachingClasses: {
              create: (teachingClassIds || []).map((classId: string) => ({
                classId,
              })),
            },
          },
          include: {
            homeroomClass: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
                track: true,
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
            teachingClasses: {
              include: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    grade: true,
                    section: true,
                    track: true,
                    _count: {
                      select: {
                        students: true,
                      },
                    },
                  },
                },
              },
            },
            subjectAssignments: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    nameKh: true,
                    nameEn: true,
                    code: true,
                    grade: true,
                    track: true,
                  },
                },
              },
            },
          },
        });
      },
      {
        maxWait: 10000, // ✅ Wait up to 10 seconds to start transaction
        timeout: 15000, // ✅ Transaction can run up to 15 seconds
      }
    );

    console.log("✅ Teacher updated successfully");

    res.json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error: any) {
    console.error("❌ Error updating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher",
      error: error.message,
    });
  }
};

/**
 * ✅ DELETE teacher (with validation)
 */
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE TEACHER:  ${id}`);

    // ✅ Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        homeroomClass: true,
        teachingClasses: true,
        subjectAssignments: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // ✅ Check if has homeroom class
    if (teacher.homeroomClass) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete teacher with assigned homeroom class (${teacher.homeroomClass.name}). Please reassign the homeroom class first.`,
      });
    }

    // ✅ Check if has teaching classes
    if (teacher.teachingClasses.length > 0) {
      const classNames = teacher.teachingClasses
        .map((tc) => tc.class)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: `Cannot delete teacher with ${teacher.teachingClasses.length} teaching class(es). Please unassign classes first.`,
      });
    }

    // ✅ Delete teacher (cascade will handle subject assignments)
    await prisma.teacher.delete({
      where: { id },
    });

    console.log("✅ Teacher deleted successfully");

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting teacher",
      error: error.message,
    });
  }
};

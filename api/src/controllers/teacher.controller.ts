import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
                nameKh: true,
                nameEn: true,
                code: true,
                grade: true,
                track: true,
              },
            },
          },
        },
        // ✅ User account (for login status)
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            isActive: true,
            lastLogin: true,
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

      // Create subject string for display
      subject: teacher.subjectAssignments
        .map((sa) => sa.subject.nameKh || sa.subject.name)
        .join(", "),

      // ✅ Login status
      hasLoginAccount: !!teacher.user,
      canLogin: teacher.user?.isActive || false,
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
                category: true,
              },
            },
          },
        },
        // ✅ User account
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            isActive: true,
            lastLogin: true,
            loginCount: true,
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

    // ✅ Transform data
    const transformedTeacher = {
      ...teacher,
      subjectIds: teacher.subjectAssignments.map((sa) => sa.subjectId),
      teachingClassIds: teacher.teachingClasses.map((tc) => tc.classId),
      subjects: teacher.subjectAssignments.map((sa) => sa.subject),
      teachingClasses: teacher.teachingClasses.map((tc) => tc.class),
      subject: teacher.subjectAssignments
        .map((sa) => sa.subject.nameKh || sa.subject.name)
        .join(", "),
      hasLoginAccount: !!teacher.user,
      canLogin: teacher.user?.isActive || false,
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
 * ✅ CREATE new teacher with User account
 */
/**
 * ✅ CREATE new teacher with User account
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
      englishName,
      email,
      phone,
      gender,
      role,
      employeeId, // Can be null - will auto-generate
      position,
      address,
      dateOfBirth,
      hireDate,
      homeroomClassId,
      subjectIds,
      teachingClassIds,
      // Additional fields
      workingLevel,
      salaryRange,
      major1,
      major2,
      degree,
      nationality,
      idCard,
      passport,
      emergencyContact,
      emergencyPhone,
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

    // ✅ Phone is REQUIRED for login
    if (!phone || phone.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Phone number is required (used for login)",
      });
    }

    // ✅ Validate phone format
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // ✅ Email format validation (if provided)
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    // ✅ Validate INSTRUCTOR must have homeroom class
    if (role === "INSTRUCTOR" && !homeroomClassId) {
      return res.status(400).json({
        success: false,
        message: "Instructor must have a homeroom class assigned",
      });
    }

    // ✅ Check phone uniqueness (Teacher table)
    const existingPhone = await prisma.teacher.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // ✅ Check phone uniqueness (User table)
    const existingUserPhone = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingUserPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // ✅ Check email uniqueness (if provided)
    if (email && email.trim() !== "") {
      const existingEmail = await prisma.teacher.findUnique({
        where: { email: email.trim() },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // ✅ Check employee ID uniqueness (if provided)
    if (employeeId && employeeId.trim() !== "") {
      const existingEmployeeId = await prisma.teacher.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
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
          message: `Class ${classWithTeacher.name} already has a homeroom teacher`,
        });
      }
    }

    // ✅ AUTO-GENERATE Employee ID if not provided
    let finalEmployeeId = employeeId?.trim() || null;

    if (!finalEmployeeId) {
      // Get current year
      const year = new Date().getFullYear().toString().slice(-2); // "25" for 2025

      // Get count of teachers created this year
      const teacherCount = await prisma.teacher.count({
        where: {
          createdAt: {
            gte: new Date(`${new Date().getFullYear()}-01-01`),
          },
        },
      });

      // Generate:  T + YY + 4-digit sequence
      // Example: T2500001, T2500002, etc.
      const sequence = (teacherCount + 1).toString().padStart(5, "0");
      finalEmployeeId = `T${year}${sequence}`;

      console.log(`🆔 Auto-generated Employee ID: ${finalEmployeeId}`);
    }

    // ✅ Create teacher + User account in transaction with LONGER timeout
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create Teacher
        const teacher = await tx.teacher.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            khmerName: khmerName?.trim() || null,
            englishName: englishName?.trim() || null,
            email: email?.trim() || null,
            phone: phone.trim(),
            gender: gender || null,
            role: role || "TEACHER",
            employeeId: finalEmployeeId, // ✅ Auto-generated or provided
            position: position?.trim() || null,
            address: address?.trim() || null,
            dateOfBirth: dateOfBirth || null,
            hireDate: hireDate || null,

            // New fields
            workingLevel: workingLevel || null,
            salaryRange: salaryRange?.trim() || null,
            major1: major1?.trim() || null,
            major2: major2?.trim() || null,
            degree: degree || null,
            nationality: nationality?.trim() || null,
            idCard: idCard?.trim() || null,
            passport: passport?.trim() || null,
            emergencyContact: emergencyContact?.trim() || null,
            emergencyPhone: emergencyPhone?.trim() || null,

            homeroomClassId: homeroomClassId || null,

            // Subject assignments
            subjectAssignments: {
              create: (subjectIds || []).map((subjectId: string) => ({
                subjectId,
              })),
            },

            // Teaching class assignments
            teachingClasses: {
              create: (teachingClassIds || []).map((classId: string) => ({
                classId,
              })),
            },
          },
          include: {
            homeroomClass: true,
            teachingClasses: {
              include: { class: true },
            },
            subjectAssignments: {
              include: { subject: true },
            },
          },
        });

        // 2. Create User account (phone login)
        // ✅ Default password = phone number
        const hashedPassword = await bcrypt.hash(phone.trim(), 10);

        const user = await tx.user.create({
          data: {
            phone: phone.trim(),
            email: email?.trim() || null,
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role: "TEACHER",
            teacherId: teacher.id,
            permissions: {
              canEnterGrades: true,
              canMarkAttendance: true,
              canViewReports: true,
              canUpdateStudents: false,
              canManageClasses: false,
            },
          },
        });

        return { teacher, user, defaultPassword: phone.trim() };
      },
      {
        maxWait: 15000, // ✅ Wait up to 15 seconds to acquire transaction
        timeout: 20000, // ✅ Transaction can run up to 20 seconds
      }
    );

    console.log("✅ Teacher created successfully:", result.teacher.id);
    console.log("✅ Employee ID:", result.teacher.employeeId);
    console.log("✅ User account created");
    console.log("📱 Phone (Username):", result.user.phone);
    console.log("🔑 Default Password:", result.defaultPassword);

    res.status(201).json({
      success: true,
      message: "Teacher created successfully with login account",
      data: result.teacher,
      loginInfo: {
        phone: result.user.phone,
        email: result.user.email,
        employeeId: result.teacher.employeeId, // ✅ Include in response
        defaultPassword: result.defaultPassword,
        message:
          "លេខទូរស័ព្ទ = ឈ្មោះប្រើប្រាស់\nពាក្យសម្ងាត់លើកដំបូគឺដូចគ្នានឹងលេខទូរស័ព្ទ\nអាចប្តូរពាក្យសម្ងាត់នៅពេលក្រោយ",
      },
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
 * ✅ UPDATE teacher (preserves User account)
 */
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 UPDATE TEACHER:  ${id}`);
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

    // ✅ Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
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

    // ✅ Validate fields
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

    if (phone !== undefined && phone.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Phone cannot be empty",
      });
    }

    // ✅ Validate INSTRUCTOR must have homeroom
    if (role === "INSTRUCTOR" && !homeroomClassId) {
      return res.status(400).json({
        success: false,
        message: "Instructor must have a homeroom class assigned",
      });
    }

    // ✅ Check phone uniqueness (if changed)
    if (phone && phone !== existingTeacher.phone) {
      const phoneExists = await prisma.teacher.findUnique({
        where: { phone: phone.trim() },
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    // ✅ Check email uniqueness (if changed)
    if (email && email !== existingTeacher.email) {
      const emailExists = await prisma.teacher.findUnique({
        where: { email: email.trim() },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // ✅ Check employee ID uniqueness
    if (employeeId && employeeId !== existingTeacher.employeeId) {
      const employeeIdExists = await prisma.teacher.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (employeeIdExists) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
    }

    // ✅ Check homeroom class availability
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
          message: `Class ${classWithTeacher.name} already has a homeroom teacher`,
        });
      }
    }

    // ✅ Update teacher + sync User account
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Delete old assignments
        await Promise.all([
          tx.subjectTeacher.deleteMany({
            where: { teacherId: id },
          }),
          tx.teacherClass.deleteMany({
            where: { teacherId: id },
          }),
        ]);

        // 2. Update teacher
        const teacher = await tx.teacher.update({
          where: { id },
          data: {
            firstName: firstName !== undefined ? firstName.trim() : undefined,
            lastName: lastName !== undefined ? lastName.trim() : undefined,
            khmerName:
              khmerName !== undefined ? khmerName?.trim() || null : undefined,
            email: email !== undefined ? email?.trim() || null : undefined,
            phone: phone !== undefined ? phone.trim() : undefined,
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

            homeroomClassId:
              role === "INSTRUCTOR"
                ? homeroomClassId || null
                : role === "TEACHER"
                ? null
                : undefined,

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
            homeroomClass: true,
            teachingClasses: {
              include: { class: true },
            },
            subjectAssignments: {
              include: { subject: true },
            },
            user: true,
          },
        });

        // 3. Update User account (if exists and phone/email changed)
        if (existingTeacher.user) {
          await tx.user.update({
            where: { id: existingTeacher.user.id },
            data: {
              phone: phone !== undefined ? phone.trim() : undefined,
              email: email !== undefined ? email?.trim() || null : undefined,
              firstName: firstName !== undefined ? firstName.trim() : undefined,
              lastName: lastName !== undefined ? lastName.trim() : undefined,
            },
          });
        }

        return teacher;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    console.log("✅ Teacher updated successfully");

    res.json({
      success: true,
      message: "Teacher updated successfully",
      data: result,
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
 * ✅ DELETE teacher (with User account)
 */
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE TEACHER: ${id}`);

    // ✅ Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
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
        message: `Cannot delete teacher with assigned homeroom class (${teacher.homeroomClass.name})`,
      });
    }

    // ✅ Check if has teaching classes
    if (teacher.teachingClasses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete teacher with ${teacher.teachingClasses.length} teaching class(es)`,
      });
    }

    // ✅ Delete teacher (cascade will delete User account + assignments)
    await prisma.teacher.delete({
      where: { id },
    });

    console.log("✅ Teacher deleted successfully");
    if (teacher.user) {
      console.log("✅ User account also deleted");
    }

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

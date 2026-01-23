import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * GET ADMIN ACCOUNTS LIST
 * Retrieve all admin accounts with security information
 */
export const getAdminAccounts = async (req: Request, res: Response) => {
  try {
    console.log("📋 Fetching admin accounts...");

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isDefaultPassword: true,
        passwordChangedAt: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        accountSuspendedAt: true,
        suspensionReason: true,
        loginCount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ Found ${admins.length} admin accounts`);
    res.json(admins);
  } catch (error: any) {
    console.error("❌ Error fetching admin accounts:", error);
    res.status(500).json({
      error: "Failed to fetch admin accounts",
      details: error.message,
    });
  }
};

/**
 * GET ADMIN STATISTICS
 * Get overview statistics for admin accounts
 */
export const getAdminStatistics = async (req: Request, res: Response) => {
  try {
    console.log("📊 Fetching admin statistics...");

    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const activeAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
        accountSuspendedAt: null,
      },
    });

    const suspendedAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        accountSuspendedAt: { not: null },
      },
    });

    const defaultPasswordCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        isDefaultPassword: true,
      },
    });

    const stats = {
      totalAdmins,
      activeAdmins,
      suspendedAdmins,
      defaultPasswordCount,
      inactiveAdmins: totalAdmins - activeAdmins,
    };

    console.log("✅ Admin statistics:", stats);
    res.json(stats);
  } catch (error: any) {
    console.error("❌ Error fetching admin statistics:", error);
    res.status(500).json({
      error: "Failed to fetch admin statistics",
      details: error.message,
    });
  }
};

/**
 * UPDATE ADMIN PASSWORD
 * Admin can change their own password or another admin's password
 */
export const updateAdminPassword = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { newPassword, currentPassword } = req.body;
    const currentUserId = (req as any).user?.userId;

    console.log(`🔐 Updating password for admin: ${adminId}`);

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    // Find the admin to update
    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // If updating own password, verify current password
    if (adminId === currentUserId && currentPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        admin.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        isDefaultPassword: false,
        passwordChangedAt: new Date(),
        lastPasswordHashes: {
          push: admin.password, // Store old hash
        },
      },
    });

    console.log("✅ Admin password updated successfully");
    res.json({
      message: "Password updated successfully",
      adminId,
      passwordChangedAt: new Date(),
    });
  } catch (error: any) {
    console.error("❌ Error updating admin password:", error);
    res.status(500).json({
      error: "Failed to update password",
      details: error.message,
    });
  }
};

/**
 * CREATE NEW ADMIN ACCOUNT
 * Create a new admin user
 */
export const createAdminAccount = async (req: Request, res: Response) => {
  try {
    const { email, phone, firstName, lastName, password } = req.body;

    console.log("📝 Creating new admin account...");

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "First name and last name are required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        error: "Either email or phone is required",
      });
    }

    // Check if email/phone already exists
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
    }

    // Generate default password if not provided
    const defaultPassword = password || `Admin${Math.floor(Math.random() * 10000)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        password: hashedPassword,
        role: "ADMIN",
        isDefaultPassword: !password, // Mark as default if auto-generated
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log("✅ Admin account created:", newAdmin.id);
    res.status(201).json({
      admin: newAdmin,
      defaultPassword: !password ? defaultPassword : undefined,
    });
  } catch (error: any) {
    console.error("❌ Error creating admin account:", error);
    res.status(500).json({
      error: "Failed to create admin account",
      details: error.message,
    });
  }
};

/**
 * TOGGLE ADMIN STATUS
 * Activate or deactivate an admin account
 */
export const toggleAdminStatus = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { isActive, reason } = req.body;
    const currentUserId = (req as any).user?.userId;

    console.log(`🔄 Toggling admin status: ${adminId}`);

    // Prevent self-deactivation
    if (adminId === currentUserId && !isActive) {
      return res.status(400).json({
        error: "You cannot deactivate your own account",
      });
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update status
    await prisma.user.update({
      where: { id: adminId },
      data: {
        isActive,
        accountSuspendedAt: !isActive ? new Date() : null,
        suspensionReason: !isActive ? reason : null,
      },
    });

    console.log(`✅ Admin ${isActive ? "activated" : "deactivated"}`);
    res.json({
      message: `Admin account ${isActive ? "activated" : "deactivated"} successfully`,
      adminId,
      isActive,
    });
  } catch (error: any) {
    console.error("❌ Error toggling admin status:", error);
    res.status(500).json({
      error: "Failed to toggle admin status",
      details: error.message,
    });
  }
};

/**
 * DELETE ADMIN ACCOUNT
 * Permanently delete an admin account
 */
export const deleteAdminAccount = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const currentUserId = (req as any).user?.userId;

    console.log(`🗑️ Deleting admin account: ${adminId}`);

    // Prevent self-deletion
    if (adminId === currentUserId) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Check if this is the last admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        error: "Cannot delete the last active admin account",
      });
    }

    // Delete admin
    await prisma.user.delete({
      where: { id: adminId },
    });

    console.log("✅ Admin account deleted");
    res.json({
      message: "Admin account deleted successfully",
      adminId,
    });
  } catch (error: any) {
    console.error("❌ Error deleting admin account:", error);
    res.status(500).json({
      error: "Failed to delete admin account",
      details: error.message,
    });
  }
};

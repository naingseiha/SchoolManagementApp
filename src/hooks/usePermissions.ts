import { useAuth } from "@/context/AuthContext";
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions";

/**
 * Custom hook for permission checks
 * Provides utilities to check user permissions in components
 */
export function usePermissions() {
  const { currentUser } = useAuth();

  // Extract permissions from user
  const userPermissions = currentUser?.permissions?.adminPermissions || [];
  const isSuperAdmin = currentUser?.isSuperAdmin || false;
  const isAdmin = currentUser?.role === "ADMIN";

  console.log("🔍 [usePermissions] Hook called:", {
    currentUser: currentUser?.email,
    role: currentUser?.role,
    isSuperAdmin,
    permissionsObject: currentUser?.permissions,
    adminPermissions: userPermissions,
    permissionCount: userPermissions.length
  });

  /**
   * Check if user has a specific permission
   * Super Admins always return true
   */
  const checkPermission = (permission: Permission): boolean => {
    console.log(`🔍 [PERMISSIONS] Checking ${permission}:`, {
      isSuperAdmin,
      userPermissions,
      hasIt: hasPermission(userPermissions, permission)
    });
    
    if (isSuperAdmin) return true;
    
    return hasPermission(userPermissions, permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   * Super Admins always return true
   */
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (isSuperAdmin) return true;
    return hasAnyPermission(userPermissions, permissions);
  };

  /**
   * Check if user has ALL of the specified permissions
   * Super Admins always return true
   */
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (isSuperAdmin) return true;
    return hasAllPermissions(userPermissions, permissions);
  };

  return {
    permissions: userPermissions,
    isSuperAdmin,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
  };
}

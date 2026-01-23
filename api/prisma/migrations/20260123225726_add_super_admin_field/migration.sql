-- AlterTable: Add isSuperAdmin field to users table
-- This field identifies Super Admin accounts that have all permissions by default
-- Default value is false to ensure backwards compatibility with existing accounts

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN "users"."isSuperAdmin" IS 'Identifies Super Admin accounts with full system permissions';

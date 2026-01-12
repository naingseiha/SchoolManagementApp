-- AlignedReason: Optimize login query performance
-- This migration adds indexes to improve login speed for email, phone, and studentId lookups
-- These are NON-BREAKING changes - only adding indexes, no schema changes
-- Safe to run in production - indexes are created with IF NOT EXISTS

-- Add indexes for faster login queries (combined with isActive for better performance)
CREATE INDEX IF NOT EXISTS "users_email_isActive_idx" ON "users"("email", "isActive");
CREATE INDEX IF NOT EXISTS "users_phone_isActive_idx" ON "users"("phone", "isActive");
CREATE INDEX IF NOT EXISTS "users_studentId_isActive_idx" ON "users"("studentId", "isActive");

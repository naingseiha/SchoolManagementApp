/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classId,date,session]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceSession" AS ENUM ('MORNING', 'AFTERNOON');

-- DropIndex
DROP INDEX "attendance_studentId_classId_date_key";

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "session" "AttendanceSession" NOT NULL DEFAULT 'MORNING';

-- CreateIndex
CREATE UNIQUE INDEX "attendance_studentId_classId_date_session_key" ON "attendance"("studentId", "classId", "date", "session");

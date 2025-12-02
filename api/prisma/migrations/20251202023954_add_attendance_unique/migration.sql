/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classId,date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'PERMISSION';

-- CreateIndex
CREATE INDEX "attendance_classId_date_idx" ON "attendance"("classId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_studentId_classId_date_key" ON "attendance"("studentId", "classId", "date");

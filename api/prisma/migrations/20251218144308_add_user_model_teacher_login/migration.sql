/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[phone]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF');

-- CreateEnum
CREATE TYPE "WorkingLevel" AS ENUM ('FRAMEWORK_A', 'FRAMEWORK_B', 'FRAMEWORK_C', 'CONTRACT', 'PROBATION');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('CERTIFICATE', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER');

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "degree" "DegreeLevel",
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "idCard" TEXT,
ADD COLUMN     "major1" TEXT,
ADD COLUMN     "major2" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "passport" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "workingLevel" "WorkingLevel",
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permissions" JSONB DEFAULT '{"canEnterGrades":true,"canMarkAttendance":true,"canViewReports":true}',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "teacherId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'TEACHER';

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "teachers_phone_key" ON "teachers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_teacherId_key" ON "users"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentId_key" ON "users"("studentId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

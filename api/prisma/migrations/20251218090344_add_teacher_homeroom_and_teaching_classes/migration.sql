/*
  Warnings:

  - You are about to drop the column `teacherId` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `englishName` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `teachers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[homeroomTeacherId]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[homeroomClassId]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TeacherRole" AS ENUM ('TEACHER', 'INSTRUCTOR');

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_teacherId_fkey";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "teacherId",
ADD COLUMN     "homeroomTeacherId" TEXT;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "englishName",
DROP COLUMN "phoneNumber",
DROP COLUMN "subject",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "hireDate" TEXT,
ADD COLUMN     "homeroomClassId" TEXT,
ADD COLUMN     "role" "TeacherRole" NOT NULL DEFAULT 'TEACHER',
ALTER COLUMN "dateOfBirth" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "teacher_classes" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_classes_teacherId_classId_key" ON "teacher_classes"("teacherId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_homeroomTeacherId_key" ON "classes"("homeroomTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_homeroomClassId_key" ON "teachers"("homeroomClassId");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_homeroomClassId_fkey" FOREIGN KEY ("homeroomClassId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_classes" ADD CONSTRAINT "teacher_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_classes" ADD CONSTRAINT "teacher_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

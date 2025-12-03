/*
  Warnings:

  - You are about to drop the column `examCenter` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `examDesk` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `examRoom` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `examSession` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `passedStatus` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "examCenter",
DROP COLUMN "examDesk",
DROP COLUMN "examRoom",
DROP COLUMN "examSession",
DROP COLUMN "passedStatus",
ADD COLUMN     "grade12ExamCenter" TEXT,
ADD COLUMN     "grade12ExamDesk" TEXT,
ADD COLUMN     "grade12ExamRoom" TEXT,
ADD COLUMN     "grade12ExamSession" TEXT,
ADD COLUMN     "grade12PassStatus" TEXT,
ADD COLUMN     "grade12Track" TEXT,
ADD COLUMN     "grade9ExamCenter" TEXT,
ADD COLUMN     "grade9ExamDesk" TEXT,
ADD COLUMN     "grade9ExamRoom" TEXT,
ADD COLUMN     "grade9ExamSession" TEXT,
ADD COLUMN     "grade9PassStatus" TEXT,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "repeatingGrade" TEXT,
ADD COLUMN     "transferredFrom" TEXT;

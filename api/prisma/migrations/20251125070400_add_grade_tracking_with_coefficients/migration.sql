/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,classId,month,year]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "month" TEXT,
ADD COLUMN     "monthNumber" INTEGER,
ADD COLUMN     "percentage" DOUBLE PRECISION,
ADD COLUMN     "weightedScore" DOUBLE PRECISION,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "examCenter" TEXT,
ADD COLUMN     "examDesk" TEXT,
ADD COLUMN     "examRoom" TEXT,
ADD COLUMN     "examSession" TEXT,
ADD COLUMN     "passedStatus" TEXT,
ADD COLUMN     "previousGrade" TEXT,
ADD COLUMN     "remarks" TEXT,
ALTER COLUMN "dateOfBirth" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "student_monthly_summaries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "monthNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "totalMaxScore" DOUBLE PRECISION NOT NULL,
    "totalWeightedScore" DOUBLE PRECISION NOT NULL,
    "totalCoefficient" DOUBLE PRECISION NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "classRank" INTEGER,
    "gradeLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_monthly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_monthly_summaries_classId_month_year_idx" ON "student_monthly_summaries"("classId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "student_monthly_summaries_studentId_classId_month_year_key" ON "student_monthly_summaries"("studentId", "classId", "month", "year");

-- CreateIndex
CREATE INDEX "grades_classId_month_year_idx" ON "grades"("classId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "grades_studentId_subjectId_classId_month_year_key" ON "grades"("studentId", "subjectId", "classId", "month", "year");

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_monthly_summaries" ADD CONSTRAINT "student_monthly_summaries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_monthly_summaries" ADD CONSTRAINT "student_monthly_summaries_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

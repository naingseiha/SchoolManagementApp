-- CreateEnum
CREATE TYPE "StudentRole" AS ENUM ('GENERAL', 'CLASS_LEADER', 'VICE_LEADER_1', 'VICE_LEADER_2');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "accountDeactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivationReason" TEXT,
ADD COLUMN     "isAccountActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "studentRole" "StudentRole" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "students_isAccountActive_idx" ON "students"("isAccountActive");

-- CreateIndex
CREATE INDEX "students_classId_studentRole_idx" ON "students"("classId", "studentRole");

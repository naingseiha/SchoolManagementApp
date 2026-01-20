-- CreateEnum
CREATE TYPE "ParentRelationship" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'STEP_FATHER', 'STEP_MOTHER', 'GRANDPARENT', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "parentId" TEXT;

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "khmerName" TEXT NOT NULL,
    "englishName" TEXT,
    "gender" "Gender",
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "relationship" "ParentRelationship" NOT NULL,
    "occupation" TEXT DEFAULT 'កសិករ',
    "emergencyPhone" TEXT,
    "isAccountActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_parents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "relationship" "ParentRelationship" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_parentId_key" ON "parents"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parents_phone_key" ON "parents"("phone");

-- CreateIndex
CREATE INDEX "parents_phone_isAccountActive_idx" ON "parents"("phone", "isAccountActive");

-- CreateIndex
CREATE INDEX "parents_email_isAccountActive_idx" ON "parents"("email", "isAccountActive");

-- CreateIndex
CREATE UNIQUE INDEX "student_parents_studentId_parentId_key" ON "student_parents"("studentId", "parentId");

-- CreateIndex
CREATE INDEX "student_parents_studentId_idx" ON "student_parents"("studentId");

-- CreateIndex
CREATE INDEX "student_parents_parentId_idx" ON "student_parents"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "users_parentId_key" ON "users"("parentId");

-- CreateIndex
CREATE INDEX "users_parentId_isActive_idx" ON "users"("parentId", "isActive");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

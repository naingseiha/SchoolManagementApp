-- CreateTable
CREATE TABLE "grade_confirmations" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedBy" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grade_confirmations_classId_month_year_idx" ON "grade_confirmations"("classId", "month", "year");

-- CreateIndex
CREATE INDEX "grade_confirmations_confirmedBy_idx" ON "grade_confirmations"("confirmedBy");

-- CreateIndex
CREATE UNIQUE INDEX "grade_confirmations_classId_subjectId_month_year_key" ON "grade_confirmations"("classId", "subjectId", "month", "year");

-- AddForeignKey
ALTER TABLE "grade_confirmations" ADD CONSTRAINT "grade_confirmations_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

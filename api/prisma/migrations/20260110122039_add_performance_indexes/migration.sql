-- CreateIndex
CREATE INDEX "attendance_studentId_date_idx" ON "attendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "attendance_date_status_idx" ON "attendance"("date", "status");

-- CreateIndex
CREATE INDEX "grades_studentId_month_year_idx" ON "grades"("studentId", "month", "year");

-- CreateIndex
CREATE INDEX "grades_subjectId_classId_idx" ON "grades"("subjectId", "classId");

-- CreateIndex
CREATE INDEX "student_monthly_summaries_studentId_year_idx" ON "student_monthly_summaries"("studentId", "year");

-- CreateIndex
CREATE INDEX "student_monthly_summaries_month_year_average_idx" ON "student_monthly_summaries"("month", "year", "average");

-- CreateIndex
CREATE INDEX "students_classId_idx" ON "students"("classId");

-- CreateIndex
CREATE INDEX "students_grade12PassStatus_idx" ON "students"("grade12PassStatus");

-- CreateIndex
CREATE INDEX "students_gender_idx" ON "students"("gender");

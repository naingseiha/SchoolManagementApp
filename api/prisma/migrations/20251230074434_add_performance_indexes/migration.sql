-- CreateIndex
CREATE INDEX "classes_grade_idx" ON "classes"("grade");

-- CreateIndex
CREATE INDEX "subjects_grade_isActive_idx" ON "subjects"("grade", "isActive");

-- CreateIndex
CREATE INDEX "subjects_grade_track_isActive_idx" ON "subjects"("grade", "track", "isActive");

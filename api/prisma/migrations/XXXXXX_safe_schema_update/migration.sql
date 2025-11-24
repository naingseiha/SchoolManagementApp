-- Step 1: Add new columns with DEFAULT values (so existing data won't break)

-- Classes: Add academicYear
ALTER TABLE "classes" 
ADD COLUMN IF NOT EXISTS "academicYear" TEXT NOT NULL DEFAULT '2024-2025';

-- Students: Add khmerName and englishName (keep old fields)
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "khmerName" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS "englishName" TEXT;

-- Migrate existing student names to khmerName
UPDATE "students" 
SET "khmerName" = CASE 
  WHEN "firstName" IS NOT NULL AND "lastName" IS NOT NULL 
    THEN "firstName" || ' ' || "lastName"
  WHEN "firstName" IS NOT NULL 
    THEN "firstName"
  ELSE 'Unknown Student'
END
WHERE "khmerName" = 'N/A';

-- Teachers: Add khmerName, englishName, and gender (keep old fields)
ALTER TABLE "teachers" 
ADD COLUMN IF NOT EXISTS "khmerName" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS "englishName" TEXT,
ADD COLUMN IF NOT EXISTS "gender" "Gender" NOT NULL DEFAULT 'MALE';

-- Migrate existing teacher names to khmerName
UPDATE "teachers" 
SET "khmerName" = CASE 
  WHEN "firstName" IS NOT NULL AND "lastName" IS NOT NULL 
    THEN "firstName" || ' ' || "lastName"
  WHEN "firstName" IS NOT NULL 
    THEN "firstName"
  ELSE 'Unknown Teacher'
END
WHERE "khmerName" = 'N/A';

-- Subjects: Add maxScore
ALTER TABLE "subjects" 
ADD COLUMN IF NOT EXISTS "maxScore" INTEGER NOT NULL DEFAULT 100;

-- Optional: Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_subjects_grade" ON "subjects"("grade");
CREATE INDEX IF NOT EXISTS "idx_subjects_category" ON "subjects"("category");
CREATE INDEX IF NOT EXISTS "idx_students_class" ON "students"("classId");
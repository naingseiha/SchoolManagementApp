-- Add missing fields to Student
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "studentId" TEXT,
ADD COLUMN IF NOT EXISTS "khmerName" TEXT,
ADD COLUMN IF NOT EXISTS "englishName" TEXT,
ADD COLUMN IF NOT EXISTS "placeOfBirth" TEXT,
ADD COLUMN IF NOT EXISTS "currentAddress" TEXT,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "students_studentId_key" ON "students"("studentId");

-- Update existing student data
UPDATE "students" 
SET "khmerName" = "firstName" || ' ' || "lastName"
WHERE "khmerName" IS NULL;

-- Add missing fields to Teacher
ALTER TABLE "teachers" 
ADD COLUMN IF NOT EXISTS "teacherId" TEXT,
ADD COLUMN IF NOT EXISTS "khmerName" TEXT,
ADD COLUMN IF NOT EXISTS "englishName" TEXT,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
ADD COLUMN IF NOT EXISTS "gender" "Gender",
ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "position" TEXT;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "teachers_teacherId_key" ON "teachers"("teacherId");

-- Update existing teacher data
UPDATE "teachers" 
SET "khmerName" = "firstName" || ' ' || "lastName",
    "gender" = 'MALE'
WHERE "khmerName" IS NULL;

-- Add missing fields to Class
ALTER TABLE "classes" 
ADD COLUMN IF NOT EXISTS "classId" TEXT,
ADD COLUMN IF NOT EXISTS "academicYear" TEXT NOT NULL DEFAULT '2024-2025',
ADD COLUMN IF NOT EXISTS "capacity" INTEGER;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "classes_classId_key" ON "classes"("classId");

-- Add missing field to Attendance
ALTER TABLE "attendance" 
ADD COLUMN IF NOT EXISTS "classId" TEXT;

-- Add foreign key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'attendance_classId_fkey'
    ) THEN
        ALTER TABLE "attendance" 
        ADD CONSTRAINT "attendance_classId_fkey" 
        FOREIGN KEY ("classId") REFERENCES "classes"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Ensure nameKh is NOT NULL in Subject (if needed)
UPDATE "subjects" SET "nameKh" = "name" WHERE "nameKh" IS NULL;
ALTER TABLE "subjects" ALTER COLUMN "nameKh" SET NOT NULL;
-- AlterTable - Add all post type specific fields to posts table
ALTER TABLE "posts" ADD COLUMN "assignmentDueDate" TIMESTAMP(3),
ADD COLUMN "assignmentPoints" INTEGER,
ADD COLUMN "assignmentSubmissionType" TEXT,
ADD COLUMN "courseCode" TEXT,
ADD COLUMN "courseLevel" TEXT,
ADD COLUMN "courseDuration" TEXT,
ADD COLUMN "announcementUrgency" TEXT,
ADD COLUMN "announcementExpiryDate" TIMESTAMP(3),
ADD COLUMN "tutorialDifficulty" TEXT,
ADD COLUMN "tutorialEstimatedTime" TEXT,
ADD COLUMN "tutorialPrerequisites" TEXT,
ADD COLUMN "examDate" TIMESTAMP(3),
ADD COLUMN "examDuration" INTEGER,
ADD COLUMN "examTotalPoints" INTEGER,
ADD COLUMN "examPassingScore" INTEGER,
ADD COLUMN "resourceType" TEXT,
ADD COLUMN "resourceUrl" TEXT,
ADD COLUMN "researchField" TEXT,
ADD COLUMN "researchCollaborators" TEXT,
ADD COLUMN "projectStatus" TEXT,
ADD COLUMN "projectDeadline" TIMESTAMP(3),
ADD COLUMN "projectTeamSize" INTEGER;

-- CreateTable - Quiz questions for educational quizzes
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "position" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_questions_postId_idx" ON "quiz_questions"("postId");

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

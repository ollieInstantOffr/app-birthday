-- CreateTable
CREATE TABLE "Progress" (
    "taskId" INTEGER NOT NULL,
    "solvedAt" TIMESTAMP(3),
    "manualUnlock" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "hint1At" TIMESTAMP(3),
    "attemptsAtHint1" INTEGER,
    "hint2At" TIMESTAMP(3),

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "storage" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptLog" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttemptLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "welcomedAt" TIMESTAMP(3),
    "giftOpenedAt" TIMESTAMP(3),

    CONSTRAINT "AppState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_taskId_idx" ON "Submission"("taskId");

-- CreateIndex
CREATE INDEX "AttemptLog_taskId_idx" ON "AttemptLog"("taskId");

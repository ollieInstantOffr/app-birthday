-- CreateTable
CREATE TABLE "PushDevice" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSuccessAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushLog" (
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'scheduled',
    "title" TEXT,
    "body" TEXT,
    "devices" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushLog_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushDevice_endpoint_key" ON "PushDevice"("endpoint");

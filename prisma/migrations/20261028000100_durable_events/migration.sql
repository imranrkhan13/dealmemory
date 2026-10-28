-- AlterTable
ALTER TABLE "ActivationEvent" ADD COLUMN     "anonymousId" TEXT,
ADD COLUMN     "payloadHash" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectApiKey_keyPrefix_key" ON "ProjectApiKey"("keyPrefix");

-- CreateIndex
CREATE INDEX "ActivationEvent_projectId_occurredAt_idx" ON "ActivationEvent"("projectId", "occurredAt");

-- CreateIndex
CREATE INDEX "ActivationEvent_projectId_trialUserId_occurredAt_idx" ON "ActivationEvent"("projectId", "trialUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "ActivationEvent_projectId_name_idx" ON "ActivationEvent"("projectId", "name");


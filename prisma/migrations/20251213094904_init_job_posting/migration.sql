-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "remoteType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "descriptionRaw" TEXT NOT NULL,
    "postedAt" DATETIME,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "JobPosting_company_idx" ON "JobPosting"("company");

-- CreateIndex
CREATE INDEX "JobPosting_remoteType_idx" ON "JobPosting"("remoteType");

-- CreateIndex
CREATE INDEX "JobPosting_seniority_idx" ON "JobPosting"("seniority");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_source_sourceId_key" ON "JobPosting"("source", "sourceId");

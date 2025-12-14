-- CreateTable
CREATE TABLE "CanonicalJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "remoteType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobPosting" (
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
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canonicalJobId" TEXT,
    CONSTRAINT "JobPosting_canonicalJobId_fkey" FOREIGN KEY ("canonicalJobId") REFERENCES "CanonicalJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_JobPosting" ("company", "descriptionRaw", "employmentType", "id", "location", "postedAt", "remoteType", "scrapedAt", "seniority", "source", "sourceId", "sourceUrl", "title") SELECT "company", "descriptionRaw", "employmentType", "id", "location", "postedAt", "remoteType", "scrapedAt", "seniority", "source", "sourceId", "sourceUrl", "title" FROM "JobPosting";
DROP TABLE "JobPosting";
ALTER TABLE "new_JobPosting" RENAME TO "JobPosting";
CREATE INDEX "JobPosting_company_idx" ON "JobPosting"("company");
CREATE INDEX "JobPosting_remoteType_idx" ON "JobPosting"("remoteType");
CREATE INDEX "JobPosting_seniority_idx" ON "JobPosting"("seniority");
CREATE INDEX "JobPosting_canonicalJobId_idx" ON "JobPosting"("canonicalJobId");
CREATE UNIQUE INDEX "JobPosting_source_sourceId_key" ON "JobPosting"("source", "sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CanonicalJob_company_idx" ON "CanonicalJob"("company");

-- CreateIndex
CREATE INDEX "CanonicalJob_remoteType_idx" ON "CanonicalJob"("remoteType");

-- CreateIndex
CREATE INDEX "CanonicalJob_seniority_idx" ON "CanonicalJob"("seniority");

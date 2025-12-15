-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CanonicalJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "remoteType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CanonicalJob" ("company", "createdAt", "employmentType", "id", "location", "remoteType", "seniority", "title", "updatedAt") SELECT "company", "createdAt", "employmentType", "id", "location", "remoteType", "seniority", "title", "updatedAt" FROM "CanonicalJob";
DROP TABLE "CanonicalJob";
ALTER TABLE "new_CanonicalJob" RENAME TO "CanonicalJob";
CREATE INDEX "CanonicalJob_company_idx" ON "CanonicalJob"("company");
CREATE INDEX "CanonicalJob_remoteType_idx" ON "CanonicalJob"("remoteType");
CREATE INDEX "CanonicalJob_seniority_idx" ON "CanonicalJob"("seniority");
CREATE INDEX "CanonicalJob_score_idx" ON "CanonicalJob"("score");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

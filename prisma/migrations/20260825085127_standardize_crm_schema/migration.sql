/*
  Warnings:

  - You are about to drop the `CustomField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `churnRisk` on the `AIAnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `qualityGrade` on the `AIAnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `aiTags` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `dynamicData` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `lastContactAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `autoReleaseDays` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `autoReleaseEnabled` on the `SystemSetting` table. All the data in the column will be lost.
  - Added the required column `roadblocks` to the `AIAnalysisResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rawContent` to the `Interaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CustomField_apiName_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CustomField";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIAnalysisResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interactionId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "negotiationStrategy" TEXT NOT NULL,
    "roadblocks" TEXT NOT NULL,
    CONSTRAINT "AIAnalysisResult_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIAnalysisResult" ("id", "interactionId", "negotiationStrategy", "roadblocks", "summary")
SELECT
    "id",
    "interactionId",
    CASE
        WHEN trim("negotiationStrategy") = '' THEN '[]'
        ELSE json_array(json_object('point', "negotiationStrategy", 'sourceLineIndices', json('[]')))
    END,
    '[]',
    "summary"
FROM "AIAnalysisResult";
DROP TABLE "AIAnalysisResult";
ALTER TABLE "new_AIAnalysisResult" RENAME TO "AIAnalysisResult";
CREATE UNIQUE INDEX "AIAnalysisResult_interactionId_key" ON "AIAnalysisResult"("interactionId");
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "qualityGrade" TEXT NOT NULL DEFAULT 'C',
    "churnRisk" TEXT NOT NULL DEFAULT '无风险',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("company", "createdAt", "id", "name", "phone", "status", "updatedAt")
SELECT
    '',
    "createdAt",
    "id",
    "name",
    COALESCE(NULLIF(trim("phone"), ''), '待补充-' || "id"),
    CAST("status" AS TEXT),
    "createdAt"
FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE TABLE "new_Interaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "rawContent" TEXT NOT NULL,
    "transcript" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interaction" ("createdAt", "customerId", "id", "rawContent", "transcript")
SELECT "date", "customerId", "id", "content", CAST(COALESCE("transcript", '[]') AS TEXT)
FROM "Interaction";
DROP TABLE "Interaction";
ALTER TABLE "new_Interaction" RENAME TO "Interaction";
CREATE INDEX "Interaction_customerId_idx" ON "Interaction"("customerId");
CREATE TABLE "new_SystemSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "modelName" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSetting" ("apiKey", "baseUrl", "id", "modelName", "updatedAt") SELECT "apiKey", "baseUrl", "id", "modelName", "updatedAt" FROM "SystemSetting";
DROP TABLE "SystemSetting";
ALTER TABLE "new_SystemSetting" RENAME TO "SystemSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ownerId" TEXT,
    "lastContactAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'New',
    "dynamicData" JSONB NOT NULL DEFAULT '{}',
    "aiTags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("aiTags", "createdAt", "dynamicData", "email", "id", "lastContactAt", "name", "phone", "status")
SELECT
    "aiTags",
    "createdAt",
    "dynamicData",
    "email",
    "id",
    COALESCE(
        (SELECT MAX("Interaction"."date") FROM "Interaction" WHERE "Interaction"."customerId" = "Customer"."id"),
        "createdAt"
    ),
    "name",
    "phone",
    "status"
FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE INDEX "Customer_ownerId_idx" ON "Customer"("ownerId");
CREATE INDEX "Customer_lastContactAt_idx" ON "Customer"("lastContactAt");
CREATE TABLE "new_SystemSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "modelName" TEXT,
    "autoReleaseEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoReleaseDays" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSetting" ("apiKey", "baseUrl", "id", "modelName", "updatedAt") SELECT "apiKey", "baseUrl", "id", "modelName", "updatedAt" FROM "SystemSetting";
DROP TABLE "SystemSetting";
ALTER TABLE "new_SystemSetting" RENAME TO "SystemSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

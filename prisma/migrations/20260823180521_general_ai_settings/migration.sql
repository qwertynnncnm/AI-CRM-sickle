-- 将旧的 OpenAI 专用密钥迁移为通用大模型密钥，并新增接口地址与模型名称。
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "modelName" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSetting" ("apiKey", "id", "updatedAt") SELECT "openaiApiKey", "id", "updatedAt" FROM "SystemSetting";
DROP TABLE "SystemSetting";
ALTER TABLE "new_SystemSetting" RENAME TO "SystemSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

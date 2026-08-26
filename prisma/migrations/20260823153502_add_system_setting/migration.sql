-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "openaiApiKey" TEXT,
    "updatedAt" DATETIME NOT NULL
);

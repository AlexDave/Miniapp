-- CreateTable: категории навыков
CREATE TABLE "skill_categories" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key"         TEXT    NOT NULL,
    "title"       TEXT    NOT NULL,
    "description" TEXT,
    "icon"        TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "skill_categories_key_key" ON "skill_categories"("key");

-- CreateTable: атомарные навыки
CREATE TABLE "skills" (
    "id"           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key"          TEXT    NOT NULL,
    "category_key" TEXT    NOT NULL,
    "title"        TEXT    NOT NULL,
    "description"  TEXT,
    "unlock_rules" TEXT,
    "order_index"  INTEGER NOT NULL DEFAULT 0,
    "target_bones" INTEGER NOT NULL DEFAULT 5,
    CONSTRAINT "skills_category_key_fkey" FOREIGN KEY ("category_key") REFERENCES "skill_categories"("key") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "skills_key_key" ON "skills"("key");

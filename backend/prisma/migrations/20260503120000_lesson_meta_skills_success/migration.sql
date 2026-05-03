-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "coins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN "skills_json" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "meta" TEXT;

-- AlterTable
ALTER TABLE "daily_reports" ADD COLUMN "success" TEXT;

-- CreateTable: отслеживание состояния урока (state machine)
CREATE TABLE "lesson_progress" (
    "id"              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id"         INTEGER NOT NULL,
    "lesson_id"       INTEGER NOT NULL,
    "state"           TEXT    NOT NULL DEFAULT 'not_started',
    "theory_seen_at"  DATETIME,
    "task_started_at" DATETIME,
    "completed_at"    DATETIME,
    "last_repeat_at"  DATETIME,
    "repeats_count"   INTEGER NOT NULL DEFAULT 0,
    "created_at"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_progress_user_id_fkey"   FOREIGN KEY ("user_id")   REFERENCES "users"("id")   ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- AlterTable: bones-поля в профиле
ALTER TABLE "profiles" ADD COLUMN "bones_json"    TEXT;
ALTER TABLE "profiles" ADD COLUMN "total_bones"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN "special_bones" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN "stage"         TEXT    NOT NULL DEFAULT 'Знакомство';

-- AlterTable: bones_earned в отчёте
ALTER TABLE "daily_reports" ADD COLUMN "bones_earned" INTEGER NOT NULL DEFAULT 0;

-- Backfill: заполнить lesson_progress из daily_reports (state=completed)
INSERT OR IGNORE INTO "lesson_progress" ("user_id", "lesson_id", "state", "theory_seen_at", "task_started_at", "completed_at", "created_at", "updated_at")
SELECT
    dr.user_id,
    dr.lesson_id,
    'completed',
    dr.completed_at,
    dr.completed_at,
    dr.completed_at,
    dr.completed_at,
    dr.completed_at
FROM "daily_reports" dr;

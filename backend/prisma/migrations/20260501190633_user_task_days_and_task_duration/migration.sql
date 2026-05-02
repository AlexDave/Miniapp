-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required_per_day" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL DEFAULT 7,
    "available_until" DATETIME,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("available_until", "course_id", "created_at", "description", "id", "is_active", "order_index", "required_per_day", "title", "updated_at") SELECT "available_until", "course_id", "created_at", "description", "id", "is_active", "order_index", "required_per_day", "title", "updated_at" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE TABLE "new_user_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "days_remaining" INTEGER NOT NULL DEFAULT 7,
    "completed_today" INTEGER NOT NULL DEFAULT 0,
    "last_completed_at" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_tasks" ("completed_today", "created_at", "id", "is_completed", "last_completed_at", "progress", "task_id", "updated_at", "user_id") SELECT "completed_today", "created_at", "id", "is_completed", "last_completed_at", "progress", "task_id", "updated_at", "user_id" FROM "user_tasks";
DROP TABLE "user_tasks";
ALTER TABLE "new_user_tasks" RENAME TO "user_tasks";
CREATE UNIQUE INDEX "user_tasks_user_id_task_id_key" ON "user_tasks"("user_id", "task_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

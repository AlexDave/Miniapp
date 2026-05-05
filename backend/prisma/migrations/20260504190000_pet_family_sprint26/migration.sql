-- Спринт 26: Pet, члены семьи, pet_id на отчётах и прогрессе урока.

CREATE TABLE "pets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Ваш питомец',
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "skills_json" TEXT,
    "bones_json" TEXT,
    "total_bones" INTEGER NOT NULL DEFAULT 0,
    "special_bones" INTEGER NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'Знакомство',
    "total_courses" INTEGER NOT NULL DEFAULT 0,
    "completed_courses" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "pet_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pet_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pet_members_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pet_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "pet_invite_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "inviter_user_id" INTEGER NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pet_invite_tokens_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pet_invite_tokens_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "pets" ("name", "avatar", "level", "experience", "coins", "skills_json", "bones_json", "total_bones", "special_bones", "stage", "total_courses", "completed_courses", "streak", "created_at", "updated_at")
SELECT "pet_name", "avatar", "level", "experience", COALESCE("coins", 0), "skills_json", "bones_json", "total_bones", "special_bones", "stage", "total_courses", "completed_courses", "streak", "created_at", "updated_at"
FROM "profiles" ORDER BY "id";

CREATE TEMP TABLE "_pet_map" AS
SELECT p."id" AS "pet_id", pr."user_id" AS "user_id" FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "id") AS rn FROM "pets"
) p INNER JOIN (
  SELECT "user_id", ROW_NUMBER() OVER (ORDER BY "id") AS rn FROM "profiles"
) pr ON p.rn = pr.rn;

INSERT INTO "pet_members" ("pet_id", "user_id", "role") SELECT "pet_id", "user_id", 'owner' FROM "_pet_map";

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER,
    "pet_name" TEXT NOT NULL DEFAULT 'Ваш питомец',
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "skills_json" TEXT,
    "bones_json" TEXT,
    "total_bones" INTEGER NOT NULL DEFAULT 0,
    "special_bones" INTEGER NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'Знакомство',
    "total_courses" INTEGER NOT NULL DEFAULT 0,
    "completed_courses" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "preferences" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profiles_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_profiles" ("avatar", "bio", "bones_json", "coins", "completed_courses", "created_at", "experience", "id", "level", "pet_id", "pet_name", "preferences", "skills_json", "special_bones", "stage", "streak", "total_bones", "total_courses", "updated_at", "user_id")
SELECT pr."avatar", pr."bio", pr."bones_json", pr."coins", pr."completed_courses", pr."created_at", pr."experience", pr."id", pr."level", m."pet_id", pr."pet_name", pr."preferences", pr."skills_json", pr."special_bones", pr."stage", pr."streak", pr."total_bones", pr."total_courses", pr."updated_at", pr."user_id"
FROM "profiles" pr INNER JOIN "_pet_map" m ON m."user_id" = pr."user_id";
DROP TABLE "profiles";
ALTER TABLE "new_profiles" RENAME TO "profiles";
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE INDEX "profiles_pet_id_idx" ON "profiles"("pet_id");

CREATE TABLE "new_daily_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "steps_data" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 2,
    "success" TEXT,
    "note" TEXT,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "bones_earned" INTEGER NOT NULL DEFAULT 0,
    "completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_reports_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_reports_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_reports" ("bones_earned", "completed_at", "id", "lesson_id", "note", "pet_id", "rating", "steps_data", "success", "user_id", "xp_earned")
SELECT dr."bones_earned", dr."completed_at", dr."id", dr."lesson_id", dr."note", m."pet_id", dr."rating", dr."steps_data", dr."success", dr."user_id", dr."xp_earned"
FROM "daily_reports" dr INNER JOIN "_pet_map" m ON m."user_id" = dr."user_id";
DROP TABLE "daily_reports";
ALTER TABLE "new_daily_reports" RENAME TO "daily_reports";
CREATE INDEX "daily_reports_user_id_completed_at_idx" ON "daily_reports"("user_id", "completed_at");
CREATE UNIQUE INDEX "daily_reports_pet_id_lesson_id_key" ON "daily_reports"("pet_id", "lesson_id");

CREATE TABLE "new_lesson_progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'not_started',
    "theory_seen_at" DATETIME,
    "task_started_at" DATETIME,
    "completed_at" DATETIME,
    "last_repeat_at" DATETIME,
    "repeats_count" INTEGER NOT NULL DEFAULT 0,
    "attempts_at_level" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lesson_progress_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lesson_progress" ("attempts_at_level", "completed_at", "created_at", "id", "last_repeat_at", "lesson_id", "pet_id", "repeats_count", "state", "task_started_at", "theory_seen_at", "updated_at", "user_id")
SELECT NULL, lp."completed_at", lp."created_at", lp."id", lp."last_repeat_at", lp."lesson_id", m."pet_id", lp."repeats_count", lp."state", lp."task_started_at", lp."theory_seen_at", lp."updated_at", lp."user_id"
FROM "lesson_progress" lp INNER JOIN "_pet_map" m ON m."user_id" = lp."user_id";
DROP TABLE "lesson_progress";
ALTER TABLE "new_lesson_progress" RENAME TO "lesson_progress";
CREATE INDEX "lesson_progress_user_id_idx" ON "lesson_progress"("user_id");
CREATE UNIQUE INDEX "lesson_progress_pet_id_lesson_id_key" ON "lesson_progress"("pet_id", "lesson_id");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

CREATE UNIQUE INDEX "pet_members_pet_id_user_id_key" ON "pet_members"("pet_id", "user_id");
CREATE UNIQUE INDEX "pet_invite_tokens_token_key" ON "pet_invite_tokens"("token");
CREATE INDEX "pet_invite_tokens_pet_id_idx" ON "pet_invite_tokens"("pet_id");

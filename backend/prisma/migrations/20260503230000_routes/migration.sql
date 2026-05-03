-- Персональные маршруты (заменяют треки)
CREATE TABLE "routes" (
    "id"              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key"             TEXT    NOT NULL,
    "title"           TEXT    NOT NULL,
    "description"     TEXT,
    "icon"            TEXT,
    "target_problem"  TEXT,
    "age_min_months"  INTEGER,
    "age_max_months"  INTEGER,
    "order_index"     INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "routes_key_key" ON "routes"("key");

-- Навыки маршрута (упорядоченный список атомов)
CREATE TABLE "route_skills" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "route_id"    INTEGER NOT NULL,
    "skill_key"   TEXT    NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_required" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "route_skills_route_id_fkey"  FOREIGN KEY ("route_id")  REFERENCES "routes"("id")  ON DELETE CASCADE,
    CONSTRAINT "route_skills_skill_key_fkey" FOREIGN KEY ("skill_key") REFERENCES "skills"("key") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "route_skills_route_id_skill_key_key" ON "route_skills"("route_id", "skill_key");

-- Add image fields to lesson_steps
ALTER TABLE "lesson_steps" ADD COLUMN "image_url"  TEXT;
ALTER TABLE "lesson_steps" ADD COLUMN "image_role" TEXT;
ALTER TABLE "lesson_steps" ADD COLUMN "alt_text"   TEXT;

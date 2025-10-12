ALTER TABLE "ai_models"
ADD COLUMN IF NOT EXISTS "settings" jsonb DEFAULT '{}'::jsonb;

UPDATE "ai_models"
SET "settings" = '{}'::jsonb
WHERE "settings" IS NULL;

ALTER TABLE "ai_models"
ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb;

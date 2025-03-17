-- Simplified user_id migration script
-- Contains three basic steps

BEGIN;--> statement-breakpoint

-- Step 1: Add nullable user_id columns
ALTER TABLE "agents_to_sessions" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "file_chunks" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "files_to_sessions" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint

-- Step 2: Populate user_id fields
-- Populate user_id for agents_to_sessions
UPDATE "agents_to_sessions" AS ats
SET "user_id" = a."user_id"
FROM "agents" AS a
WHERE ats."agent_id" = a."id";--> statement-breakpoint

-- Populate user_id for file_chunks
UPDATE "file_chunks" AS fc
SET "user_id" = f."user_id"
FROM "files" AS f
WHERE fc."file_id" = f."id";--> statement-breakpoint

-- Populate user_id for files_to_sessions
UPDATE "files_to_sessions" AS fts
SET "user_id" = f."user_id"
FROM "files" AS f
WHERE fts."file_id" = f."id";--> statement-breakpoint

-- Get user_id from sessions table (for handling potential NULL values)
UPDATE "files_to_sessions" AS fts
SET "user_id" = s."user_id"
FROM "sessions" AS s
WHERE fts."session_id" = s."id" AND fts."user_id" IS NULL;--> statement-breakpoint

UPDATE "agents_to_sessions" AS ats
SET "user_id" = s."user_id"
FROM "sessions" AS s
WHERE ats."session_id" = s."id" AND ats."user_id" IS NULL;--> statement-breakpoint

-- Step 3: Add NOT NULL constraints and foreign keys
ALTER TABLE "agents_to_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file_chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files_to_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "agents_to_sessions"
    ADD CONSTRAINT "agents_to_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "file_chunks"
    ADD CONSTRAINT "file_chunks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "files_to_sessions"
    ADD CONSTRAINT "files_to_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

COMMIT;--> statement-breakpoint

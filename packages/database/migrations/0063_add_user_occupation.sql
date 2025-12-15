DROP INDEX IF EXISTS "user_memories_contexts_title_vector_index";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "occupation" text;--> statement-breakpoint
ALTER TABLE "user_memories_contexts" DROP COLUMN IF EXISTS "title_vector";
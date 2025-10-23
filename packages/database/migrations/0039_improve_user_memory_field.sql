ALTER TABLE "user_memories_preferences" DROP CONSTRAINT "user_memories_preferences_context_id_user_memories_contexts_id_fk";
--> statement-breakpoint
ALTER TABLE "user_memories_identities" ALTER COLUMN "role" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_memories_identities" ALTER COLUMN "user_memory_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "labels" jsonb;--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "extracted_labels" jsonb;--> statement-breakpoint
ALTER TABLE "user_memories_identities" ADD COLUMN "episodic_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_memories_identities" DROP COLUMN "current_focuses";--> statement-breakpoint
ALTER TABLE "user_memories_identities" DROP COLUMN "experience";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" DROP COLUMN "context_id";
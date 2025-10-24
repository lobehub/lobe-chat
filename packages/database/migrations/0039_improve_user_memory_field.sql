ALTER TABLE "user_memories_contexts" RENAME COLUMN "labels" TO "metadata";--> statement-breakpoint
ALTER TABLE "user_memories_identities" RENAME COLUMN "labels" TO "metadata";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" RENAME COLUMN "labels" TO "metadata";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" DROP CONSTRAINT "user_memories_preferences_context_id_user_memories_contexts_id_fk";
--> statement-breakpoint
ALTER TABLE "user_memories_identities" ALTER COLUMN "role" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_memories_identities" ALTER COLUMN "user_memory_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "user_memories_contexts" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "user_memories_experiences" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "user_memories_identities" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "user_memories_identities" ADD COLUMN "episodic_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_memories_preferences" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "user_memories_contexts" ADD CONSTRAINT "user_memories_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memories_experiences" ADD CONSTRAINT "user_memories_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memories_identities" ADD CONSTRAINT "user_memories_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memories_preferences" ADD CONSTRAINT "user_memories_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memories_contexts" DROP COLUMN "extracted_labels";--> statement-breakpoint
ALTER TABLE "user_memories_experiences" DROP COLUMN "labels";--> statement-breakpoint
ALTER TABLE "user_memories_experiences" DROP COLUMN "extracted_labels";--> statement-breakpoint
ALTER TABLE "user_memories_identities" DROP COLUMN "current_focuses";--> statement-breakpoint
ALTER TABLE "user_memories_identities" DROP COLUMN "experience";--> statement-breakpoint
ALTER TABLE "user_memories_identities" DROP COLUMN "extracted_labels";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" DROP COLUMN "context_id";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" DROP COLUMN "extracted_labels";--> statement-breakpoint
ALTER TABLE "user_memories_preferences" DROP COLUMN "extracted_scopes";
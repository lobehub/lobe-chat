DROP INDEX "user_memories_summary_vector_1024_index";--> statement-breakpoint
DROP INDEX "user_memories_details_vector_1024_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_user_id_index" ON "user_memories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_contexts_user_id_index" ON "user_memories_contexts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_experiences_user_id_index" ON "user_memories_experiences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_experiences_user_memory_id_index" ON "user_memories_experiences" USING btree ("user_memory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_identities_user_id_index" ON "user_memories_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_identities_user_memory_id_index" ON "user_memories_identities" USING btree ("user_memory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_preferences_user_id_index" ON "user_memories_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_memories_preferences_user_memory_id_index" ON "user_memories_preferences" USING btree ("user_memory_id");

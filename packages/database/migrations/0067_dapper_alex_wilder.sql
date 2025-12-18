ALTER TABLE "message_groups" ADD COLUMN IF NOT EXISTS "type" text;--> statement-breakpoint
ALTER TABLE "message_groups" ADD COLUMN IF NOT EXISTS "content" text;--> statement-breakpoint
ALTER TABLE "message_groups" ADD COLUMN IF NOT EXISTS "editor_data" jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "summary" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN IF NOT EXISTS "agent_id" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN IF NOT EXISTS "group_id" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN IF NOT EXISTS "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_group_id_chat_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."chat_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_groups_type_idx" ON "message_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "threads_agent_id_idx" ON "threads" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "threads_group_id_idx" ON "threads" USING btree ("group_id");

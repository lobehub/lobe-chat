ALTER TABLE "message_groups" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "message_groups" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "message_groups" ADD COLUMN "editor_data" jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "agent_id" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_groups_type_idx" ON "message_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX "threads_agent_id_idx" ON "threads" USING btree ("agent_id");
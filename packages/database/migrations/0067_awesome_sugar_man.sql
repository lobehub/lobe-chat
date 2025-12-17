ALTER TABLE "threads" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_group_id_chat_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."chat_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "threads_group_id_idx" ON "threads" USING btree ("group_id");
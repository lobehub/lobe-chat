-- Add group_id column to chat_groups table to support session group organization
-- This allows chat groups to be organized into session groups, similar to how sessions work

ALTER TABLE "chat_groups" ADD COLUMN IF NOT EXISTS "group_id" text;--> statement-breakpoint
ALTER TABLE "chat_groups" ADD CONSTRAINT "chat_groups_group_id_session_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."session_groups"("id") ON DELETE set null ON UPDATE no action;

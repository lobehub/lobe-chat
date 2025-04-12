ALTER TABLE "agents" ADD COLUMN "opening_message" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "opening_questions" jsonb DEFAULT '[]'::jsonb;
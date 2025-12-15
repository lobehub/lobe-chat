ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "response_language" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "career" text;

ALTER TABLE "users" DROP COLUMN IF EXISTS "occupation";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" varchar(64)[];

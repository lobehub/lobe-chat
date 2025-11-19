ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_slug_unique" UNIQUE("slug");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
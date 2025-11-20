ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_slug_unique" UNIQUE("slug");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "slug" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 CREATE UNIQUE INDEX IF NOT EXISTS "documents_slug_user_id_unique" ON "documents" ("slug","user_id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
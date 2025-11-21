ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "slug" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 CREATE UNIQUE INDEX IF NOT EXISTS "documents_slug_user_id_unique" ON "documents" ("slug","user_id") WHERE "slug" IS NOT NULL;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
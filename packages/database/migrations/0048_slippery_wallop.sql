ALTER TABLE "files" DROP CONSTRAINT "files_slug_unique";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "editor_content" jsonb;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "documents_slug_user_id_unique" ON "documents" USING btree ("slug","user_id") WHERE "documents"."slug" is not null;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "slug";
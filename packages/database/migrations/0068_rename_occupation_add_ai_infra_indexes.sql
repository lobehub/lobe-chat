ALTER TABLE "users" RENAME COLUMN "occupation" TO "interests";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_models_user_id_idx" ON "ai_models" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_providers_user_id_idx" ON "ai_providers" USING btree ("user_id");
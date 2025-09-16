-- 将超过 1000 字符的 description 截断为 1000 字符
UPDATE agents
SET description = LEFT(description, 1000)
WHERE LENGTH(description) > 1000;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_title_idx" ON "agents" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_description_idx" ON "agents" USING btree ("description");

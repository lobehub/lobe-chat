-- Truncate title to 255 characters if it exceeds the limit
UPDATE agents
SET title = LEFT(title, 255)
WHERE LENGTH(title) > 255;--> statement-breakpoint

-- Truncate description to 1000 characters if it exceeds the limit
UPDATE agents
SET description = LEFT(description, 1000)
WHERE LENGTH(description) > 1000;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "agents_title_idx" ON "agents" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_description_idx" ON "agents" USING btree ("description");

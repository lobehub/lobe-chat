-- 将超过 255 字符的 title 截断为 255 字符
UPDATE agents
SET title = LEFT(title, 255)
WHERE LENGTH(title) > 255;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "description" SET DATA TYPE varchar(1000);

-- 完整的用户ID迁移脚本
-- 包含所有表的字段添加、数据填充和约束设置

BEGIN;--> statement-breakpoint

CREATE INDEX "file_hash_idx" ON "files" USING btree ("file_hash");--> statement-breakpoint

-- 步骤 1: 添加可为空的 user_id 列到所有需要的表
ALTER TABLE "global_files" ADD COLUMN IF NOT EXISTS "creator" text;--> statement-breakpoint
ALTER TABLE "knowledge_base_files" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_chunks" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_plugins" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_queries" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_query_chunks" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_tts" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "message_translates" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "messages_files" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "agents_to_sessions" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "file_chunks" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "files_to_sessions" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint

-- 步骤 2: 填充 user_id 字段
-- 从关联表中获取 user_id

-- 为 knowledge_base_files 填充 user_id
UPDATE "knowledge_base_files" AS kbf
SET "user_id" = kb."user_id"
  FROM "knowledge_bases" AS kb
WHERE kbf."knowledge_base_id" = kb."id";--> statement-breakpoint

-- 为 message_chunks 填充 user_id
UPDATE "message_chunks" AS mc
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mc."message_id" = m."id";--> statement-breakpoint

-- 为 message_plugins 填充 user_id (直接从 messages 表获取)
-- 修改: 将 LIKE 改为 =
UPDATE "message_plugins" AS mp
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mp."id" = m."id";--> statement-breakpoint

-- 为 message_queries 填充 user_id
UPDATE "message_queries" AS mq
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mq."message_id" = m."id";--> statement-breakpoint

-- 为 message_query_chunks 填充 user_id
UPDATE "message_query_chunks" AS mqc
SET "user_id" = mq."user_id"
  FROM "message_queries" AS mq
WHERE mqc."query_id" = mq."id";--> statement-breakpoint

-- 为 message_tts 填充 user_id
UPDATE "message_tts" AS mt
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mt."id" = m."id";--> statement-breakpoint

-- 为 message_translates 填充 user_id
UPDATE "message_translates" AS mt
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mt."id" = m."id";--> statement-breakpoint

-- 为 messages_files 填充 user_id
UPDATE "messages_files" AS mf
SET "user_id" = m."user_id"
  FROM "messages" AS m
WHERE mf."message_id" = m."id";--> statement-breakpoint

-- 为 global_files 填充 creator (从 files 表获取第一个创建该文件的用户)
UPDATE "global_files" AS gf
SET "creator" = (
  SELECT f."user_id"
  FROM "files" AS f
  WHERE f."file_hash" = gf."hash_id"
  ORDER BY f."created_at" ASC
  LIMIT 1
  );--> statement-breakpoint

-- 删除在 files 表中找不到任何用户使用过的 global_files 记录
DELETE FROM "global_files"
WHERE "creator" IS NULL;--> statement-breakpoint

-- 为 agents_to_sessions 填充 user_id
UPDATE "agents_to_sessions" AS ats
SET "user_id" = a."user_id"
  FROM "agents" AS a
WHERE ats."agent_id" = a."id";--> statement-breakpoint

-- 为 file_chunks 填充 user_id
UPDATE "file_chunks" AS fc
SET "user_id" = f."user_id"
  FROM "files" AS f
WHERE fc."file_id" = f."id";--> statement-breakpoint

-- 为 files_to_sessions 填充 user_id
UPDATE "files_to_sessions" AS fts
SET "user_id" = f."user_id"
  FROM "files" AS f
WHERE fts."file_id" = f."id";--> statement-breakpoint

-- 从 sessions 表获取 user_id (处理潜在的 NULL 值)
UPDATE "files_to_sessions" AS fts
SET "user_id" = s."user_id"
  FROM "sessions" AS s
WHERE fts."session_id" = s."id" AND fts."user_id" IS NULL;--> statement-breakpoint

UPDATE "agents_to_sessions" AS ats
SET "user_id" = s."user_id"
  FROM "sessions" AS s
WHERE ats."session_id" = s."id" AND ats."user_id" IS NULL;--> statement-breakpoint

-- 步骤 3: 检查是否有未填充的记录
DO $$
DECLARE
kb_files_count INTEGER;
    msg_chunks_count INTEGER;
    msg_plugins_count INTEGER;
    msg_queries_count INTEGER;
    msg_query_chunks_count INTEGER;
    msg_tts_count INTEGER;
    msg_translates_count INTEGER;
    msgs_files_count INTEGER;
    agents_sessions_count INTEGER;
    file_chunks_count INTEGER;
    files_sessions_count INTEGER;
BEGIN
SELECT COUNT(*) INTO kb_files_count FROM "knowledge_base_files" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_chunks_count FROM "message_chunks" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_plugins_count FROM "message_plugins" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_queries_count FROM "message_queries" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_query_chunks_count FROM "message_query_chunks" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_tts_count FROM "message_tts" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msg_translates_count FROM "message_translates" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO msgs_files_count FROM "messages_files" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO agents_sessions_count FROM "agents_to_sessions" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO file_chunks_count FROM "file_chunks" WHERE "user_id" IS NULL;
SELECT COUNT(*) INTO files_sessions_count FROM "files_to_sessions" WHERE "user_id" IS NULL;

IF kb_files_count > 0 OR msg_chunks_count > 0 OR msg_plugins_count > 0 OR
       msg_queries_count > 0 OR msg_query_chunks_count > 0 OR msg_tts_count > 0 OR
       msg_translates_count > 0 OR msgs_files_count > 0 OR agents_sessions_count > 0 OR
       file_chunks_count > 0 OR files_sessions_count > 0 THEN
        RAISE EXCEPTION 'There are records with NULL user_id values that could not be populated';
END IF;
END $$;--> statement-breakpoint

-- 步骤 4: 添加 NOT NULL 约束和外键
ALTER TABLE "knowledge_base_files" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_plugins" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_queries" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_query_chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_tts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message_translates" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages_files" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agents_to_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file_chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files_to_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint

-- 添加外键约束
ALTER TABLE "global_files"
  ADD CONSTRAINT "global_files_creator_users_id_fk"
    FOREIGN KEY ("creator") REFERENCES "public"."users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "knowledge_base_files"
  ADD CONSTRAINT "knowledge_base_files_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_chunks"
  ADD CONSTRAINT "message_chunks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_plugins"
  ADD CONSTRAINT "message_plugins_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_queries"
  ADD CONSTRAINT "message_queries_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_query_chunks"
  ADD CONSTRAINT "message_query_chunks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_tts"
  ADD CONSTRAINT "message_tts_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "message_translates"
  ADD CONSTRAINT "message_translates_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "messages_files"
  ADD CONSTRAINT "messages_files_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "agents_to_sessions"
  ADD CONSTRAINT "agents_to_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "file_chunks"
  ADD CONSTRAINT "file_chunks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "files_to_sessions"
  ADD CONSTRAINT "files_to_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;--> statement-breakpoint

COMMIT;--> statement-breakpoint

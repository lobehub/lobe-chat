CREATE TABLE IF NOT EXISTS "channel_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" text NOT NULL,
	"event" text NOT NULL,
	"target_id" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"member_id" uuid NOT NULL,
	"message_id" text NOT NULL,
	"thread_id" text,
	"requester_member_id" uuid NOT NULL,
	"delivery_key" text DEFAULT 'initial' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"blocked_reason" text,
	"blocked_code" text,
	"operation_id" text,
	"manifest" jsonb,
	"execution_config" jsonb,
	"device_id" varchar(64),
	"working_directory" text,
	"accepted_at" timestamp with time zone,
	"lease_owner" text,
	"lease_expires_at" timestamp with time zone,
	"writer_held" boolean DEFAULT false NOT NULL,
	"isolated_at" timestamp with time zone,
	"draft" text,
	"publication_revoked" boolean DEFAULT false NOT NULL,
	"published_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_jobs_operation_id_unique" UNIQUE("operation_id"),
	CONSTRAINT "channel_jobs_scope_unique" UNIQUE("channel_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_member_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"member_id" uuid NOT NULL,
	"device_owner_id" text NOT NULL,
	"device_id" varchar(64) NOT NULL,
	"working_directory" text NOT NULL,
	"environment_revision" integer NOT NULL,
	"requested_by_member_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"user_id" text,
	"role" text,
	"last_read_sequence" integer,
	"agent_id" text,
	"name" text,
	"description" text DEFAULT '' NOT NULL,
	"config" jsonb,
	"execution_paused" boolean DEFAULT false NOT NULL,
	"environment_revision" integer DEFAULT 0 NOT NULL,
	"environment_cutoff" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_members_scope_unique" UNIQUE("channel_id","id"),
	CONSTRAINT "channel_members_actor_check" CHECK (("channel_members"."actor_type" = 'user' AND "channel_members"."role" IS NOT NULL AND "channel_members"."config" IS NULL AND "channel_members"."agent_id" IS NULL)
        OR ("channel_members"."actor_type" = 'agent' AND "channel_members"."user_id" IS NULL AND "channel_members"."role" IS NULL AND "channel_members"."name" IS NOT NULL AND "channel_members"."config" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"thread_id" text,
	"sequence" integer NOT NULL,
	"author_member_id" uuid NOT NULL,
	"mentions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"request_key" text NOT NULL,
	"reply_to_id" text,
	"routing_status" text NOT NULL,
	"routing_source" text,
	"routing_reason" text,
	"routing_attempt" integer DEFAULT 0 NOT NULL,
	"recipient_member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_messages_scope_unique" UNIQUE("channel_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_threads" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"root_message_id" text NOT NULL,
	"root_sequence" integer NOT NULL,
	"follower_member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_threads_scope_unique" UNIQUE("channel_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"workspace_id" text,
	"project_id" text,
	"title" text NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages_files" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_operations" ADD COLUMN IF NOT EXISTS "channel_id" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "channel_id" text;--> statement-breakpoint
ALTER TABLE "messages_files" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "channel_id" text;--> statement-breakpoint
ALTER TABLE "channel_audit" DROP CONSTRAINT IF EXISTS "channel_audit_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_audit" ADD CONSTRAINT "channel_audit_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_operation_id_agent_operations_id_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_operation_id_agent_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."agent_operations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_member_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_member_fk" FOREIGN KEY ("channel_id","member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_requester_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_requester_fk" FOREIGN KEY ("channel_id","requester_member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_message_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_message_fk" FOREIGN KEY ("channel_id","message_id") REFERENCES "public"."channel_messages"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_thread_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_thread_fk" FOREIGN KEY ("channel_id","thread_id") REFERENCES "public"."channel_threads"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member_grants" DROP CONSTRAINT IF EXISTS "channel_member_grants_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_member_grants" ADD CONSTRAINT "channel_member_grants_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member_grants" DROP CONSTRAINT IF EXISTS "channel_member_grants_device_owner_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "channel_member_grants" ADD CONSTRAINT "channel_member_grants_device_owner_id_users_id_fk" FOREIGN KEY ("device_owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member_grants" DROP CONSTRAINT IF EXISTS "channel_member_grants_member_fk";--> statement-breakpoint
ALTER TABLE "channel_member_grants" ADD CONSTRAINT "channel_member_grants_member_fk" FOREIGN KEY ("channel_id","member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member_grants" DROP CONSTRAINT IF EXISTS "channel_member_grants_requester_fk";--> statement-breakpoint
ALTER TABLE "channel_member_grants" ADD CONSTRAINT "channel_member_grants_requester_fk" FOREIGN KEY ("channel_id","requested_by_member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" DROP CONSTRAINT IF EXISTS "channel_members_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" DROP CONSTRAINT IF EXISTS "channel_members_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" DROP CONSTRAINT IF EXISTS "channel_members_agent_id_agents_id_fk";--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_id_messages_id_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_id_messages_id_fk" FOREIGN KEY ("id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_thread_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_thread_fk" FOREIGN KEY ("channel_id","thread_id") REFERENCES "public"."channel_threads"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_author_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_author_fk" FOREIGN KEY ("channel_id","author_member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_threads" DROP CONSTRAINT IF EXISTS "channel_threads_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_threads" ADD CONSTRAINT "channel_threads_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_threads" DROP CONSTRAINT IF EXISTS "channel_threads_root_fk";--> statement-breakpoint
ALTER TABLE "channel_threads" ADD CONSTRAINT "channel_threads_root_fk" FOREIGN KEY ("channel_id","root_message_id") REFERENCES "public"."channel_messages"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "channels_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "channels_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "channels_project_id_projects_id_fk";--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_audit_channel_event_idx" ON "channel_audit" USING btree ("channel_id","event","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_audit_target_event_idx" ON "channel_audit" USING btree ("target_id","event","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_jobs_delivery_unique" ON "channel_jobs" USING btree ("message_id","member_id","delivery_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_jobs_channel_status_idx" ON "channel_jobs" USING btree ("channel_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_jobs_member_queue_idx" ON "channel_jobs" USING btree ("member_id","status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_jobs_lease_expires_idx" ON "channel_jobs" USING btree ("lease_expires_at") WHERE "channel_jobs"."writer_held" AND "channel_jobs"."isolated_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_jobs_active_member_unique" ON "channel_jobs" USING btree ("member_id") WHERE "channel_jobs"."writer_held" AND "channel_jobs"."isolated_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_jobs_active_directory_unique" ON "channel_jobs" USING btree ("device_id","working_directory") WHERE "channel_jobs"."device_id" IS NOT NULL AND "channel_jobs"."working_directory" IS NOT NULL AND "channel_jobs"."writer_held";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_member_grants_member_revision_unique" ON "channel_member_grants" USING btree ("member_id","environment_revision");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_member_grants_owner_status_idx" ON "channel_member_grants" USING btree ("device_owner_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_members_channel_user_unique" ON "channel_members" USING btree ("channel_id","user_id") WHERE "channel_members"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_user_id_idx" ON "channel_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_agent_id_idx" ON "channel_members" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_messages_sequence_unique" ON "channel_messages" USING btree ("channel_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_messages_request_key_unique" ON "channel_messages" USING btree ("channel_id","request_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_thread_sequence_idx" ON "channel_messages" USING btree ("channel_id","thread_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_request_sequence_idx" ON "channel_messages" USING btree ("channel_id","thread_id","sequence") WHERE "channel_messages"."routing_status" <> 'reply';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_routing_pending_idx" ON "channel_messages" USING btree ("channel_id","id") WHERE "channel_messages"."routing_status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_threads_root_unique" ON "channel_threads" USING btree ("channel_id","root_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_user_id_idx" ON "channels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_project_id_idx" ON "channels" USING btree ("project_id") WHERE "channels"."project_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_workspace_visibility_idx" ON "channels" USING btree ("workspace_id","visibility");--> statement-breakpoint
-- messages / topics constraints.
--
-- The ALTER COLUMN / ADD COLUMN statements above already hold ACCESS EXCLUSIVE on these hot
-- tables until the migration commits, so validating here would block every read and write for
-- full-table scans. Rows that predate 0184 satisfy both constraints (channel_id NULL, user_id
-- NOT NULL), and NOT VALID constraints still apply to every new row. To mark them validated,
-- run VALIDATE CONSTRAINT online after deploy; it takes SHARE UPDATE EXCLUSIVE and does not
-- block reads or writes. Do not add it to this migration.
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "topics" ADD CONSTRAINT "topics_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_owner_check" CHECK ("messages"."user_id" IS NOT NULL OR "messages"."channel_id" IS NOT NULL) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "topics" ADD CONSTRAINT "topics_owner_check" CHECK ("topics"."user_id" IS NOT NULL OR "topics"."channel_id" IS NOT NULL) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
-- Hot-table channel indexes.
--
-- On cloud production, build these online before deploy, one statement at a time and outside
-- a transaction. The columns must exist first; adding a nullable column only changes the catalog:
--
--   SET lock_timeout = '3s';
--   ALTER TABLE "agent_operations" ADD COLUMN IF NOT EXISTS "channel_id" text;
--   ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "channel_id" text;
--   ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "channel_id" text;
--   RESET lock_timeout;
--
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "agent_operations_channel_id_idx"
--   ON "agent_operations" USING btree ("channel_id");
--
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "messages_channel_id_idx"
--   ON "messages" USING btree ("channel_id");
--
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "topics_channel_id_idx"
--   ON "topics" USING btree ("channel_id");
--
--   CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "topics_public_channel_unique"
--   ON "topics" USING btree ("channel_id") WHERE "topics"."mode" = 'channel';
--
-- A failed CONCURRENTLY build leaves an INVALID index under the same name, and IF NOT EXISTS
-- below would silently keep it. Before deploy, confirm pg_index.indisvalid is true for all four;
-- DROP INDEX CONCURRENTLY and rebuild any that is not.
--
-- The guarded statements below are then NO-OPs on databases that already have the indexes,
-- while fresh / self-hosted databases still converge during normal migration replay. Keep them
-- non-CONCURRENTLY so local PGlite / normal migration replay remains compatible.
CREATE INDEX IF NOT EXISTS "agent_operations_channel_id_idx" ON "agent_operations" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_channel_id_idx" ON "messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_channel_id_idx" ON "topics" USING btree ("channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "topics_public_channel_unique" ON "topics" USING btree ("channel_id") WHERE "topics"."mode" = 'channel';

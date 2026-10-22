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
	"member_id" text NOT NULL,
	"message_id" text NOT NULL,
	"thread_id" text,
	"requester_member_id" text NOT NULL,
	"delivery_key" text DEFAULT 'initial' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"blocked_reason" text,
	"blocked_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_jobs_scope_unique" UNIQUE("channel_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_member_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"member_id" text NOT NULL,
	"device_owner_id" text NOT NULL,
	"device_id" varchar(64) NOT NULL,
	"working_directory" text NOT NULL,
	"environment_revision" integer NOT NULL,
	"requested_by_member_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_members" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"user_id" text,
	"role" text,
	"last_read_sequence" integer,
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
	CONSTRAINT "channel_members_actor_check" CHECK (("channel_members"."actor_type" = 'user' AND "channel_members"."role" IS NOT NULL AND "channel_members"."config" IS NULL)
        OR ("channel_members"."actor_type" = 'agent' AND "channel_members"."user_id" IS NULL AND "channel_members"."role" IS NULL AND "channel_members"."name" IS NOT NULL AND "channel_members"."config" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_message_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" text NOT NULL,
	"message_id" text NOT NULL,
	"file_id" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"thread_id" text,
	"sequence" integer NOT NULL,
	"author_member_id" text NOT NULL,
	"content" text NOT NULL,
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
CREATE TABLE IF NOT EXISTS "channel_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"job_id" text NOT NULL,
	"member_id" text NOT NULL,
	"requester_member_id" text NOT NULL,
	"session_id" text NOT NULL,
	"status" text DEFAULT 'starting' NOT NULL,
	"activity" text,
	"fence" integer DEFAULT 1 NOT NULL,
	"execution_fence" integer DEFAULT 1 NOT NULL,
	"execution_config" jsonb,
	"environment_revision" integer DEFAULT 0 NOT NULL,
	"device_id" varchar(64),
	"working_directory" text,
	"environment_error" text,
	"manifest" jsonb NOT NULL,
	"acceptance" text DEFAULT 'pending' NOT NULL,
	"native_turn_id" text,
	"lease_owner" text,
	"lease_expires_at" timestamp with time zone,
	"heartbeat_at" timestamp with time zone,
	"physical_stopped" boolean DEFAULT false NOT NULL,
	"cleanup_requested" boolean DEFAULT false NOT NULL,
	"writer_released" boolean DEFAULT false NOT NULL,
	"isolated_at" timestamp with time zone,
	"draft" text,
	"publication_status" text DEFAULT 'pending' NOT NULL,
	"publication_revoked" boolean DEFAULT false NOT NULL,
	"published_message_id" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_runs_scope_unique" UNIQUE("channel_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_runtime_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"run_id" text NOT NULL,
	"stable_key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_runtime_states" (
	"session_id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"member_id" text NOT NULL,
	"scope" text NOT NULL,
	"generation" integer DEFAULT 1 NOT NULL,
	"native_session_id" text,
	"accepted_sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"creator_id" text,
	"workspace_id" text,
	"title" text NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_audit" DROP CONSTRAINT IF EXISTS "channel_audit_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_audit" ADD CONSTRAINT "channel_audit_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_jobs" DROP CONSTRAINT IF EXISTS "channel_jobs_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_jobs" ADD CONSTRAINT "channel_jobs_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "channel_message_files" DROP CONSTRAINT IF EXISTS "channel_message_files_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_message_files" ADD CONSTRAINT "channel_message_files_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_message_files" DROP CONSTRAINT IF EXISTS "channel_message_files_file_id_files_id_fk";--> statement-breakpoint
ALTER TABLE "channel_message_files" ADD CONSTRAINT "channel_message_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_message_files" DROP CONSTRAINT IF EXISTS "channel_message_files_message_fk";--> statement-breakpoint
ALTER TABLE "channel_message_files" ADD CONSTRAINT "channel_message_files_message_fk" FOREIGN KEY ("channel_id","message_id") REFERENCES "public"."channel_messages"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_thread_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_thread_fk" FOREIGN KEY ("channel_id","thread_id") REFERENCES "public"."channel_threads"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_messages" DROP CONSTRAINT IF EXISTS "channel_messages_author_fk";--> statement-breakpoint
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_author_fk" FOREIGN KEY ("channel_id","author_member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runs" DROP CONSTRAINT IF EXISTS "channel_runs_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runs" ADD CONSTRAINT "channel_runs_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runs" DROP CONSTRAINT IF EXISTS "channel_runs_session_id_channel_sessions_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runs" ADD CONSTRAINT "channel_runs_session_id_channel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."channel_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runs" DROP CONSTRAINT IF EXISTS "channel_runs_job_fk";--> statement-breakpoint
ALTER TABLE "channel_runs" ADD CONSTRAINT "channel_runs_job_fk" FOREIGN KEY ("channel_id","job_id") REFERENCES "public"."channel_jobs"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runs" DROP CONSTRAINT IF EXISTS "channel_runs_member_fk";--> statement-breakpoint
ALTER TABLE "channel_runs" ADD CONSTRAINT "channel_runs_member_fk" FOREIGN KEY ("channel_id","member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runs" DROP CONSTRAINT IF EXISTS "channel_runs_requester_fk";--> statement-breakpoint
ALTER TABLE "channel_runs" ADD CONSTRAINT "channel_runs_requester_fk" FOREIGN KEY ("channel_id","requester_member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runtime_messages" DROP CONSTRAINT IF EXISTS "channel_runtime_messages_session_id_channel_sessions_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runtime_messages" ADD CONSTRAINT "channel_runtime_messages_session_id_channel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."channel_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runtime_messages" DROP CONSTRAINT IF EXISTS "channel_runtime_messages_run_id_channel_runs_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runtime_messages" ADD CONSTRAINT "channel_runtime_messages_run_id_channel_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."channel_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runtime_states" DROP CONSTRAINT IF EXISTS "channel_runtime_states_session_id_channel_sessions_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runtime_states" ADD CONSTRAINT "channel_runtime_states_session_id_channel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."channel_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_runtime_states" DROP CONSTRAINT IF EXISTS "channel_runtime_states_run_id_channel_runs_id_fk";--> statement-breakpoint
ALTER TABLE "channel_runtime_states" ADD CONSTRAINT "channel_runtime_states_run_id_channel_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."channel_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_sessions" DROP CONSTRAINT IF EXISTS "channel_sessions_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_sessions" ADD CONSTRAINT "channel_sessions_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_sessions" DROP CONSTRAINT IF EXISTS "channel_sessions_member_fk";--> statement-breakpoint
ALTER TABLE "channel_sessions" ADD CONSTRAINT "channel_sessions_member_fk" FOREIGN KEY ("channel_id","member_id") REFERENCES "public"."channel_members"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_threads" DROP CONSTRAINT IF EXISTS "channel_threads_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_threads" ADD CONSTRAINT "channel_threads_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_threads" DROP CONSTRAINT IF EXISTS "channel_threads_root_fk";--> statement-breakpoint
ALTER TABLE "channel_threads" ADD CONSTRAINT "channel_threads_root_fk" FOREIGN KEY ("channel_id","root_message_id") REFERENCES "public"."channel_messages"("channel_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "channels_creator_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "channels_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_audit_channel_event_idx" ON "channel_audit" USING btree ("channel_id","event","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_audit_target_event_idx" ON "channel_audit" USING btree ("target_id","event","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_jobs_delivery_unique" ON "channel_jobs" USING btree ("message_id","member_id","delivery_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_jobs_channel_status_idx" ON "channel_jobs" USING btree ("channel_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_jobs_member_queue_idx" ON "channel_jobs" USING btree ("member_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_member_grants_member_revision_unique" ON "channel_member_grants" USING btree ("member_id","environment_revision");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_member_grants_owner_status_idx" ON "channel_member_grants" USING btree ("device_owner_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_members_channel_user_unique" ON "channel_members" USING btree ("channel_id","user_id") WHERE "channel_members"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_user_id_idx" ON "channel_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_message_files_message_file_unique" ON "channel_message_files" USING btree ("message_id","file_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_message_files_file_id_idx" ON "channel_message_files" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_messages_sequence_unique" ON "channel_messages" USING btree ("channel_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_messages_request_key_unique" ON "channel_messages" USING btree ("channel_id","request_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_thread_sequence_idx" ON "channel_messages" USING btree ("channel_id","thread_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_request_sequence_idx" ON "channel_messages" USING btree ("channel_id","thread_id","sequence") WHERE "channel_messages"."routing_status" <> 'reply';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_messages_routing_pending_idx" ON "channel_messages" USING btree ("channel_id","id") WHERE "channel_messages"."routing_status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_runs_job_unique" ON "channel_runs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_runs_channel_id_idx" ON "channel_runs" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_runs_unsettled_idx" ON "channel_runs" USING btree ("channel_id","id") WHERE "channel_runs"."writer_released" = false OR "channel_runs"."physical_stopped" = false;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_runs_lease_expires_idx" ON "channel_runs" USING btree ("lease_expires_at") WHERE "channel_runs"."writer_released" = false AND "channel_runs"."isolated_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_runs_active_member_unique" ON "channel_runs" USING btree ("member_id") WHERE "channel_runs"."writer_released" = false AND "channel_runs"."isolated_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_runs_active_directory_unique" ON "channel_runs" USING btree ("device_id","working_directory") WHERE "channel_runs"."device_id" IS NOT NULL AND "channel_runs"."working_directory" IS NOT NULL AND "channel_runs"."writer_released" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_runtime_messages_session_key_unique" ON "channel_runtime_messages" USING btree ("session_id","stable_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_sessions_member_scope_unique" ON "channel_sessions" USING btree ("member_id","scope");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_threads_root_unique" ON "channel_threads" USING btree ("channel_id","root_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_creator_id_idx" ON "channels" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_workspace_visibility_idx" ON "channels" USING btree ("workspace_id","visibility");
CREATE TABLE IF NOT EXISTS "quick_note_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quick_note_id" text NOT NULL,
	"source_history_id" varchar(255) NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"role" text NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quick_note_run_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"document_history_id" varchar(255),
	"user_id" text NOT NULL,
	"workspace_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quick_note_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quick_note_id" text NOT NULL,
	"source_history_id" varchar(255) NOT NULL,
	"thread_id" text,
	"operation_id" text,
	"kind" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quick_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"document_id" varchar(255) NOT NULL,
	"topic_id" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"collection" text,
	"location" text,
	"discovery_due_at" timestamp with time zone,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quick_note_resources" DROP CONSTRAINT IF EXISTS "quick_note_resources_quick_note_id_quick_notes_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_resources" DROP CONSTRAINT IF EXISTS "quick_note_resources_source_history_id_document_histories_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_resources" DROP CONSTRAINT IF EXISTS "quick_note_resources_document_id_documents_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_resources" DROP CONSTRAINT IF EXISTS "quick_note_resources_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_resources" DROP CONSTRAINT IF EXISTS "quick_note_resources_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" DROP CONSTRAINT IF EXISTS "quick_note_run_resources_run_id_quick_note_runs_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" DROP CONSTRAINT IF EXISTS "quick_note_run_resources_resource_id_quick_note_resources_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" DROP CONSTRAINT IF EXISTS "quick_note_run_resources_document_history_id_document_histories_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" DROP CONSTRAINT IF EXISTS "quick_note_run_resources_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" DROP CONSTRAINT IF EXISTS "quick_note_run_resources_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_runs" DROP CONSTRAINT IF EXISTS "quick_note_runs_quick_note_id_quick_notes_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_runs" DROP CONSTRAINT IF EXISTS "quick_note_runs_source_history_id_document_histories_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_runs" DROP CONSTRAINT IF EXISTS "quick_note_runs_thread_id_threads_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_runs" DROP CONSTRAINT IF EXISTS "quick_note_runs_operation_id_agent_operations_id_fk";--> statement-breakpoint
ALTER TABLE "quick_notes" DROP CONSTRAINT IF EXISTS "quick_notes_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "quick_notes" DROP CONSTRAINT IF EXISTS "quick_notes_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "quick_notes" DROP CONSTRAINT IF EXISTS "quick_notes_document_id_documents_id_fk";--> statement-breakpoint
ALTER TABLE "quick_notes" DROP CONSTRAINT IF EXISTS "quick_notes_topic_id_topics_id_fk";--> statement-breakpoint
ALTER TABLE "quick_note_resources" ADD CONSTRAINT "quick_note_resources_quick_note_id_quick_notes_id_fk" FOREIGN KEY ("quick_note_id") REFERENCES "public"."quick_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_resources" ADD CONSTRAINT "quick_note_resources_source_history_id_document_histories_id_fk" FOREIGN KEY ("source_history_id") REFERENCES "public"."document_histories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_resources" ADD CONSTRAINT "quick_note_resources_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_resources" ADD CONSTRAINT "quick_note_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_resources" ADD CONSTRAINT "quick_note_resources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" ADD CONSTRAINT "quick_note_run_resources_run_id_quick_note_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."quick_note_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" ADD CONSTRAINT "quick_note_run_resources_resource_id_quick_note_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."quick_note_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" ADD CONSTRAINT "quick_note_run_resources_document_history_id_document_histories_id_fk" FOREIGN KEY ("document_history_id") REFERENCES "public"."document_histories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" ADD CONSTRAINT "quick_note_run_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_run_resources" ADD CONSTRAINT "quick_note_run_resources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_runs" ADD CONSTRAINT "quick_note_runs_quick_note_id_quick_notes_id_fk" FOREIGN KEY ("quick_note_id") REFERENCES "public"."quick_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_runs" ADD CONSTRAINT "quick_note_runs_source_history_id_document_histories_id_fk" FOREIGN KEY ("source_history_id") REFERENCES "public"."document_histories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_runs" ADD CONSTRAINT "quick_note_runs_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_note_runs" ADD CONSTRAINT "quick_note_runs_operation_id_agent_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."agent_operations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_notes" ADD CONSTRAINT "quick_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_notes" ADD CONSTRAINT "quick_notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_notes" ADD CONSTRAINT "quick_notes_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_notes" ADD CONSTRAINT "quick_notes_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_note_resources_identity_unique" ON "quick_note_resources" USING btree ("quick_note_id","source_history_id","document_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_note_resources_annotation_unique" ON "quick_note_resources" USING btree ("quick_note_id","source_history_id","role") WHERE "quick_note_resources"."role" = 'annotation';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_resources_quick_note_id_idx" ON "quick_note_resources" USING btree ("quick_note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_resources_source_history_id_idx" ON "quick_note_resources" USING btree ("source_history_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_resources_document_id_idx" ON "quick_note_resources" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_resources_user_id_idx" ON "quick_note_resources" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_resources_workspace_id_idx" ON "quick_note_resources" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_note_run_resources_identity_unique" ON "quick_note_run_resources" USING btree ("run_id","resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_run_resources_run_id_idx" ON "quick_note_run_resources" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_run_resources_resource_id_idx" ON "quick_note_run_resources" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_run_resources_document_history_id_idx" ON "quick_note_run_resources" USING btree ("document_history_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_run_resources_user_id_idx" ON "quick_note_run_resources" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_run_resources_workspace_id_idx" ON "quick_note_run_resources" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_runs_quick_note_id_idx" ON "quick_note_runs" USING btree ("quick_note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_runs_source_history_id_idx" ON "quick_note_runs" USING btree ("source_history_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_runs_thread_id_idx" ON "quick_note_runs" USING btree ("thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_note_runs_operation_id_unique" ON "quick_note_runs" USING btree ("operation_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_note_runs_active_kind_unique" ON "quick_note_runs" USING btree ("quick_note_id","kind") WHERE "quick_note_runs"."status" IN ('pending', 'running');--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_note_runs_status_idx" ON "quick_note_runs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_notes_document_id_unique" ON "quick_notes" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quick_notes_topic_id_unique" ON "quick_notes" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_notes_user_id_idx" ON "quick_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_notes_workspace_id_idx" ON "quick_notes" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_notes_discovery_due_at_idx" ON "quick_notes" USING btree ("discovery_due_at");

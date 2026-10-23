CREATE TABLE IF NOT EXISTS "file_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"page_view_count" integer DEFAULT 0 NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"page_view_count" integer DEFAULT 0 NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_shares" DROP CONSTRAINT IF EXISTS "file_shares_file_id_files_id_fk";--> statement-breakpoint
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_shares" DROP CONSTRAINT IF EXISTS "file_shares_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_shares" DROP CONSTRAINT IF EXISTS "file_shares_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_shares" DROP CONSTRAINT IF EXISTS "goal_shares_goal_id_goals_id_fk";--> statement-breakpoint
ALTER TABLE "goal_shares" ADD CONSTRAINT "goal_shares_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_shares" DROP CONSTRAINT IF EXISTS "goal_shares_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "goal_shares" ADD CONSTRAINT "goal_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_shares" DROP CONSTRAINT IF EXISTS "goal_shares_workspace_id_workspaces_id_fk";--> statement-breakpoint
ALTER TABLE "goal_shares" ADD CONSTRAINT "goal_shares_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "file_shares_file_id_unique" ON "file_shares" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_shares_user_id_idx" ON "file_shares" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_shares_workspace_id_idx" ON "file_shares" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "goal_shares_goal_id_unique" ON "goal_shares" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_shares_user_id_idx" ON "goal_shares" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_shares_workspace_id_idx" ON "goal_shares" USING btree ("workspace_id");
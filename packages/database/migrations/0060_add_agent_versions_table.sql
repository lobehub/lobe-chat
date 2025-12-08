CREATE TABLE "agent_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"user_id" text NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(255),
	"description" varchar(1000),
	"tags" jsonb,
	"editor_data" jsonb,
	"avatar" text,
	"background_color" text,
	"plugins" jsonb,
	"chat_config" jsonb,
	"few_shots" jsonb,
	"model" text,
	"params" jsonb,
	"provider" text,
	"system_role" text,
	"tts" jsonb,
	"opening_message" text,
	"opening_questions" text[],
	"change_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_versions" ADD CONSTRAINT "agent_versions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD CONSTRAINT "agent_versions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_versions_agent_id_idx" ON "agent_versions" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "agent_versions_agent_version_unique" ON "agent_versions" USING btree ("agent_id","version");
CREATE TABLE "user_memories_activities" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_memory_id" varchar(255),
	"metadata" jsonb,
	"tags" text[],
	"activity_type" varchar(255),
	"status" varchar(255),
	"timezone" varchar(255),
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"associated_identity_ids" jsonb,
	"location" jsonb,
	"notes" text,
	"narrative" text,
	"narrative_vector" vector(1024),
	"feedback" text,
	"feedback_vector" vector(1024),
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_memories_activities" ADD CONSTRAINT "user_memories_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memories_activities" ADD CONSTRAINT "user_memories_activities_user_memory_id_user_memories_id_fk" FOREIGN KEY ("user_memory_id") REFERENCES "public"."user_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_memories_activities_narrative_vector_index" ON "user_memories_activities" USING hnsw ("narrative_vector" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "user_memories_activities_feedback_vector_index" ON "user_memories_activities" USING hnsw ("feedback_vector" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "user_memories_activities_activity_type_index" ON "user_memories_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "user_memories_activities_status_index" ON "user_memories_activities" USING btree ("status");
CREATE TABLE IF NOT EXISTS "acceptance_flow_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_version_id" uuid NOT NULL,
	"edge_key" text NOT NULL,
	"source_node_key" text NOT NULL,
	"target_node_key" text NOT NULL,
	"trigger" text NOT NULL,
	"condition" text,
	"required" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acceptance_flow_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_version_id" uuid NOT NULL,
	"node_key" text NOT NULL,
	"title" text NOT NULL,
	"instruction" text NOT NULL,
	"expected" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acceptance_flow_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_version_id" uuid NOT NULL,
	"verify_run_id" uuid NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acceptance_flow_step_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_run_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"incoming_edge_id" uuid,
	"previous_attempt_id" uuid,
	"request_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"observation" text NOT NULL,
	"verdict" text NOT NULL,
	"check_result_id" uuid NOT NULL,
	"review" text,
	"review_comment" text,
	"reviewed_by" text,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acceptance_flow_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"goal" text NOT NULL,
	"preconditions" text NOT NULL,
	"entry_node_key" text NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acceptance_flows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acceptance_id" uuid NOT NULL,
	"title" text NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_edge_key_unique" ON "acceptance_flow_edges" USING btree ("flow_version_id","edge_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_node_key_unique" ON "acceptance_flow_nodes" USING btree ("flow_version_id","node_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_run_round_unique" ON "acceptance_flow_runs" USING btree ("flow_version_id","verify_run_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_attempt_request_unique" ON "acceptance_flow_step_attempts" USING btree ("flow_run_id","request_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_attempt_sequence_unique" ON "acceptance_flow_step_attempts" USING btree ("flow_run_id","sequence");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "acceptance_flow_version_unique" ON "acceptance_flow_versions" USING btree ("flow_id","version");
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" DROP CONSTRAINT IF EXISTS "acceptance_flow_edges_flow_version_id_acceptance_flow_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" ADD CONSTRAINT "acceptance_flow_edges_flow_version_id_acceptance_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "public"."acceptance_flow_versions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" DROP CONSTRAINT IF EXISTS "acceptance_flow_edges_flow_version_id_source_node_key_acceptance_flow_nodes_flow_version_id_node_key_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" ADD CONSTRAINT "acceptance_flow_edges_flow_version_id_source_node_key_acceptance_flow_nodes_flow_version_id_node_key_fk" FOREIGN KEY ("flow_version_id","source_node_key") REFERENCES "public"."acceptance_flow_nodes"("flow_version_id","node_key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" DROP CONSTRAINT IF EXISTS "acceptance_flow_edges_flow_version_id_target_node_key_acceptance_flow_nodes_flow_version_id_node_key_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_edges" ADD CONSTRAINT "acceptance_flow_edges_flow_version_id_target_node_key_acceptance_flow_nodes_flow_version_id_node_key_fk" FOREIGN KEY ("flow_version_id","target_node_key") REFERENCES "public"."acceptance_flow_nodes"("flow_version_id","node_key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_nodes" DROP CONSTRAINT IF EXISTS "acceptance_flow_nodes_flow_version_id_acceptance_flow_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_nodes" ADD CONSTRAINT "acceptance_flow_nodes_flow_version_id_acceptance_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "public"."acceptance_flow_versions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_runs" DROP CONSTRAINT IF EXISTS "acceptance_flow_runs_flow_version_id_acceptance_flow_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_runs" ADD CONSTRAINT "acceptance_flow_runs_flow_version_id_acceptance_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "public"."acceptance_flow_versions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_runs" DROP CONSTRAINT IF EXISTS "acceptance_flow_runs_verify_run_id_verify_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_runs" ADD CONSTRAINT "acceptance_flow_runs_verify_run_id_verify_runs_id_fk" FOREIGN KEY ("verify_run_id") REFERENCES "public"."verify_runs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" DROP CONSTRAINT IF EXISTS "acceptance_flow_step_attempts_flow_run_id_acceptance_flow_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" ADD CONSTRAINT "acceptance_flow_step_attempts_flow_run_id_acceptance_flow_runs_id_fk" FOREIGN KEY ("flow_run_id") REFERENCES "public"."acceptance_flow_runs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" DROP CONSTRAINT IF EXISTS "acceptance_flow_step_attempts_node_id_acceptance_flow_nodes_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" ADD CONSTRAINT "acceptance_flow_step_attempts_node_id_acceptance_flow_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."acceptance_flow_nodes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" DROP CONSTRAINT IF EXISTS "acceptance_flow_step_attempts_incoming_edge_id_acceptance_flow_edges_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" ADD CONSTRAINT "acceptance_flow_step_attempts_incoming_edge_id_acceptance_flow_edges_id_fk" FOREIGN KEY ("incoming_edge_id") REFERENCES "public"."acceptance_flow_edges"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" DROP CONSTRAINT IF EXISTS "acceptance_flow_step_attempts_check_result_id_verify_check_results_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_step_attempts" ADD CONSTRAINT "acceptance_flow_step_attempts_check_result_id_verify_check_results_id_fk" FOREIGN KEY ("check_result_id") REFERENCES "public"."verify_check_results"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flow_versions" DROP CONSTRAINT IF EXISTS "acceptance_flow_versions_flow_id_acceptance_flows_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flow_versions" ADD CONSTRAINT "acceptance_flow_versions_flow_id_acceptance_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."acceptance_flows"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acceptance_flows" DROP CONSTRAINT IF EXISTS "acceptance_flows_acceptance_id_acceptances_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_flows" ADD CONSTRAINT "acceptance_flows_acceptance_id_acceptances_id_fk" FOREIGN KEY ("acceptance_id") REFERENCES "public"."acceptances"("id") ON DELETE cascade ON UPDATE no action;

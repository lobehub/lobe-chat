CREATE INDEX IF NOT EXISTS "agent_documents_deleted_by_agent_id_idx" ON "agent_documents" USING btree ("deleted_by_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_node_decisions_resolved_by_agent_id_idx" ON "goal_node_decisions" USING btree ("resolved_by_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_nodes_created_by_agent_id_idx" ON "goal_nodes" USING btree ("created_by_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_plugins_identifier_idx" ON "message_plugins" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_plugins_api_name_idx" ON "message_plugins" USING btree ("api_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_topic_id_created_at_id_idx" ON "messages" USING btree ("topic_id","created_at","id") WHERE "messages"."message_group_id" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_target_id_idx" ON "messages" USING btree ("target_id") WHERE "messages"."target_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "signals_agent_id_idx" ON "signals" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_activities_actor_agent_id_idx" ON "task_activities" USING btree ("actor_agent_id");
ALTER TABLE "rag_eval_datasets" ADD COLUMN "knowledge_base_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rag_eval_datasets" ADD CONSTRAINT "rag_eval_datasets_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

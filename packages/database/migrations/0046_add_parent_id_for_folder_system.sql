-- Add parent_id column to documents table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'documents'
    AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE "documents" ADD COLUMN "parent_id" varchar(30);
  END IF;
END $$;
--> statement-breakpoint

-- Add parent_id column to files table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'files'
    AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE "files" ADD COLUMN "parent_id" varchar(30);
  END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraint for documents.parent_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'documents'
    AND constraint_name = 'documents_parent_id_documents_id_fk'
  ) THEN
    ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_documents_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraint for files.parent_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'files'
    AND constraint_name = 'files_parent_id_documents_id_fk'
  ) THEN
    ALTER TABLE "files" ADD CONSTRAINT "files_parent_id_documents_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
--> statement-breakpoint

-- Create index on documents.parent_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'documents'
    AND indexname = 'documents_parent_id_idx'
  ) THEN
    CREATE INDEX "documents_parent_id_idx" ON "documents" USING btree ("parent_id");
  END IF;
END $$;
--> statement-breakpoint

-- Create index on files.parent_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'files'
    AND indexname = 'files_parent_id_idx'
  ) THEN
    CREATE INDEX "files_parent_id_idx" ON "files" USING btree ("parent_id");
  END IF;
END $$;

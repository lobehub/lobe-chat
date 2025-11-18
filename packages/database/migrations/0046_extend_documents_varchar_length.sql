-- Extend varchar length for documents.id and add parent_id to support folder system
-- This migration safely extends varchar columns from 30 to 255 characters

-- Step 1: Extend documents.id (primary key)
-- PostgreSQL allows extending varchar length without issues since it doesn't affect storage
ALTER TABLE "documents" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint

-- Step 2: Extend document_chunks.document_id (foreign key to documents.id)
-- Must be done before adding parent_id to documents table to maintain referential integrity
ALTER TABLE "document_chunks" ALTER COLUMN "document_id" SET DATA TYPE varchar(255);--> statement-breakpoint

-- Step 3: Add parent_id column to documents table for folder hierarchy (new column)
-- Using DO block for conditional column addition to ensure idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE "documents" ADD COLUMN "parent_id" varchar(255);
  END IF;
END $$;--> statement-breakpoint

-- Step 4: Add foreign key constraint for documents.parent_id (self-referencing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_parent_id_documents_id_fk'
  ) THEN
    ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_documents_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

-- Step 5: Add index on documents.parent_id for better query performance
CREATE INDEX IF NOT EXISTS "documents_parent_id_idx" ON "documents" USING btree ("parent_id");--> statement-breakpoint

-- Step 6: Add parent_id column to files table for folder hierarchy (new column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE "files" ADD COLUMN "parent_id" varchar(30);
  END IF;
END $$;--> statement-breakpoint

-- Step 7: Add foreign key constraint for files.parent_id (references documents.id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'files_parent_id_documents_id_fk'
  ) THEN
    ALTER TABLE "files" ADD CONSTRAINT "files_parent_id_documents_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

-- Step 8: Add index on files.parent_id for better query performance
CREATE INDEX IF NOT EXISTS "files_parent_id_idx" ON "files" USING btree ("parent_id");
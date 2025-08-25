-- Convert order column from text to integer in chat_groups_agents table
-- This fixes lexicographic sorting issues (e.g., '10' coming before '2')

-- First, update any existing order values to ensure they are valid integers
-- Convert any non-numeric values to 0
UPDATE chat_groups_agents 
SET "order" = CASE 
  WHEN "order" ~ '^[0-9]+$' THEN "order"
  ELSE '0'
END;

-- Drop the existing default first
ALTER TABLE chat_groups_agents 
ALTER COLUMN "order" DROP DEFAULT;

-- Change the column type from text to integer
ALTER TABLE chat_groups_agents 
ALTER COLUMN "order" TYPE integer USING CAST("order" AS integer);

-- Set the new integer default
ALTER TABLE chat_groups_agents 
ALTER COLUMN "order" SET DEFAULT 0;
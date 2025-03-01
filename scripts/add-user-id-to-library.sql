-- Add user_id column to library table
-- This script adds a user_id column to the library table and migrates existing data

-- Step 1: Add the user_id column allowing NULL temporarily
ALTER TABLE "library" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- Step 2: Set a default value for existing records
-- We're assigning a system user ID to existing records
UPDATE "library" SET "user_id" = 'system_migration_user' WHERE "user_id" IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE "library" ALTER COLUMN "user_id" SET NOT NULL;

-- Add an index on user_id for faster querying
CREATE INDEX IF NOT EXISTS idx_library_user_id ON "library" ("user_id");

-- Log the migration
SELECT 'Successfully added user_id to library table' as message; 
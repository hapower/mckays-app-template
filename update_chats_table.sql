-- Rename 'name' column to 'title' and add specialty_id
ALTER TABLE IF EXISTS chats RENAME COLUMN name TO title;

-- Add specialty_id column with foreign key constraint
ALTER TABLE IF EXISTS chats ADD COLUMN IF NOT EXISTS specialty_id uuid REFERENCES specialties(id);

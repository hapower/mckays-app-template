-- Create tables for the application - simplified version
-- Create ENUM types first
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('assistant', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "specialty_type" AS ENUM('internal_medicine', 'cardiology', 'pediatrics', 'dermatology', 'neurology', 'orthopedics', 'oncology', 'psychiatry', 'emergency_medicine', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "membership" AS ENUM('free', 'pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create tables one by one
CREATE TABLE IF NOT EXISTS "profiles" (
  "user_id" text PRIMARY KEY NOT NULL,
  "membership" "membership" DEFAULT 'free' NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "specialties" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "type" "specialty_type" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_id" uuid NOT NULL,
  "content" text NOT NULL,
  "role" "role" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "citations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" uuid NOT NULL,
  "reference_number" integer NOT NULL,
  "citation_text" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "library" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "specialty_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints separately
ALTER TABLE "messages" 
  ADD CONSTRAINT "messages_chat_id_chats_id_fk" 
  FOREIGN KEY ("chat_id") 
  REFERENCES "chats"("id") 
  ON DELETE CASCADE;

ALTER TABLE "citations" 
  ADD CONSTRAINT "citations_message_id_messages_id_fk" 
  FOREIGN KEY ("message_id") 
  REFERENCES "messages"("id") 
  ON DELETE CASCADE;

ALTER TABLE "library" 
  ADD CONSTRAINT "library_specialty_id_specialties_id_fk" 
  FOREIGN KEY ("specialty_id") 
  REFERENCES "specialties"("id");

-- Check if tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'; 
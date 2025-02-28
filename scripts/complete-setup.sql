-- Enable the pg_vector extension for storing and querying embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to check PostgreSQL extensions
CREATE OR REPLACE FUNCTION pg_extensions()
RETURNS TABLE (name text, installed_version text, comment text) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        e.extname as name, 
        e.extversion as installed_version,
        c.description as comment
    FROM pg_extension e
    LEFT JOIN pg_description c ON c.objoid = e.oid
    ORDER BY e.extname;
$$;

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('assistant', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."specialty_type" AS ENUM('internal_medicine', 'cardiology', 'pediatrics', 'dermatology', 'neurology', 'orthopedics', 'oncology', 'psychiatry', 'emergency_medicine', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."membership" AS ENUM('free', 'pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create tables for the application
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

-- Create or update medical_embeddings table
CREATE TABLE IF NOT EXISTS medical_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB,
  specialty_id UUID,
  embedding VECTOR(1536),  -- For OpenAI embeddings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster similarity searches
CREATE INDEX IF NOT EXISTS medical_embeddings_embedding_idx ON medical_embeddings 
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "citations" ADD CONSTRAINT "citations_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "library" ADD CONSTRAINT "library_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "medical_embeddings" ADD CONSTRAINT "medical_embeddings_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Function to match documents by embedding similarity and specialty
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  specialty_filter UUID,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    medical_embeddings.id,
    medical_embeddings.content,
    medical_embeddings.metadata,
    1 - (medical_embeddings.embedding <=> query_embedding) AS similarity
  FROM medical_embeddings
  WHERE 
    (specialty_id = specialty_filter OR specialty_filter IS NULL) AND
    1 - (medical_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Create a citation extraction function to help process AI responses
CREATE OR REPLACE FUNCTION extract_citations(
  text TEXT
)
RETURNS TABLE (
  reference_number INT,
  citation_text TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  citation_pattern TEXT := '\[(\d+)\]\s*([^\[\]]+)(?=\[\d+\]|$)';
  matches RECORD;
BEGIN
  FOR matches IN
    SELECT 
      (regexp_matches(text, citation_pattern, 'g'))[1]::INT as ref_num,
      (regexp_matches(text, citation_pattern, 'g'))[2] as cite_text
    ORDER BY 1
  LOOP
    reference_number := matches.ref_num;
    citation_text := matches.cite_text;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Storage buckets for medical documents
-- NOTE: Must be run from the Supabase dashboard or using the Supabase API
-- INSERT INTO storage.buckets (id, name)
-- VALUES ('medical_documents', 'Medical Documents');

-- Security policy for medical_embeddings
-- NOTE: Initially allow all access for development, restrict in production
ALTER TABLE medical_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (development)
CREATE POLICY "Allow all operations on medical_embeddings"
  ON medical_embeddings
  FOR ALL
  USING (true); 
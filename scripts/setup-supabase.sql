-- Enable the pg_vector extension for storing and querying embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to check PostgreSQL extensions
CREATE OR REPLACE FUNCTION pg_extensions()
RETURNS TABLE (name text, default_version text, installed_version text, comment text) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        e.extname as name, 
        e.extdefault as default_version, 
        e.extversion as installed_version,
        c.description as comment
    FROM pg_extension e
    LEFT JOIN pg_description c ON c.objoid = e.oid
    ORDER BY e.extname;
$$;

-- Create table for document embeddings with specialty filtering (if not exists)
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
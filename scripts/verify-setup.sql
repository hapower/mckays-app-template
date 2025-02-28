-- Verify PostgreSQL extensions
SELECT * FROM pg_extensions();

-- Verify vector extension is enabled
SELECT installed_version FROM pg_extensions() WHERE name = 'vector';

-- Verify all tables exist
SELECT
    table_name,
    array_agg(column_name::text) AS columns
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN (
        'profiles',
        'specialties',
        'chats',
        'messages',
        'citations',
        'library',
        'medical_embeddings'
    )
GROUP BY
    table_name
ORDER BY 
    table_name;

-- Verify ENUMs
SELECT n.nspname AS enum_schema,
       t.typname AS enum_name,
       e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
AND t.typname IN ('role', 'specialty_type', 'membership')
ORDER BY t.typname, e.enumlabel;

-- Verify functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM 
    information_schema.routines
WHERE 
    routine_schema = 'public'
    AND routine_name IN ('match_documents', 'extract_citations', 'pg_extensions')
ORDER BY
    routine_name; 
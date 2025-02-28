/*
<ai_context>
Initializes the database connection and schema for the app.
Adds support for Supabase vector store functionality and connection pooling.
</ai_context>
*/

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { createClient } from "@supabase/supabase-js"
import postgres from "postgres"

// Import schema tables
import {
  profilesTable,
  membershipEnum,
  specialtiesTable,
  specialtyTypeEnum,
  chatsTable,
  messagesTable,
  roleEnum,
  citationsTable,
  libraryTable,
  documentEmbeddingsTable
} from "@/db/schema"

// Load environment variables
config({ path: ".env.local" })

// Set up the schema object with all tables
const schema = {
  profiles: profilesTable,
  specialties: specialtiesTable,
  chats: chatsTable,
  messages: messagesTable,
  citations: citationsTable,
  library: libraryTable,
  documentEmbeddings: documentEmbeddingsTable,
  // Enums
  membershipEnum,
  specialtyTypeEnum,
  roleEnum
}

// Create a PostgreSQL client with connection pooling for better performance
const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // Maximum pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30 // Connection lifetime max 30 minutes
})

// Create Drizzle ORM instance with our schema
export const db = drizzle(client, { schema })

// Initialize Supabase client for vector store and file storage operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false, // Don't persist session in this server context
      autoRefreshToken: false
    }
  }
)

// Helper function to query vector embeddings
export async function queryEmbeddings(
  queryEmbedding: number[],
  specialtyId: string,
  threshold: number = 0.5,
  limit: number = 5
) {
  try {
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      specialty_filter: specialtyId
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error querying embeddings:", error)
    return { data: null, error }
  }
}

// Helper function to store vector embeddings
export async function storeEmbedding(
  content: string,
  metadata: any,
  specialtyId: string,
  embedding: number[]
) {
  try {
    const { data, error } = await supabase.from("medical_embeddings").insert({
      content,
      metadata,
      specialty_id: specialtyId,
      embedding
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error storing embedding:", error)
    return { data: null, error }
  }
}

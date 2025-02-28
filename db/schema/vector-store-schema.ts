/**
 * Vector store schema for the RAG (Retrieval Augmented Generation) system
 *
 * This schema defines the structure for storing and retrieving document embeddings
 * that power the RAG system. The RAG system enhances AI responses by retrieving
 * relevant medical documents based on semantic similarity to user queries.
 *
 * Note: The actual embedding vectors are stored using Supabase's pgvector extension,
 * which is not directly represented in Drizzle ORM. The SQL setup for pgvector
 * must be done separately in the Supabase SQL editor.
 *
 * @module db/schema/vector-store-schema
 */

import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { specialtiesTable } from "./specialties-schema"

/**
 * Vector store table schema for medical document embeddings
 *
 * This table stores:
 * - Document content
 * - Metadata about the document (authors, title, year, etc.)
 * - Association with a medical specialty
 * - Creation timestamp
 *
 * Note: The embedding vector itself (VECTOR(1536)) is handled by Supabase directly
 * and not through Drizzle ORM since it uses the pgvector extension.
 */
export const vectorStoreTable = pgTable("medical_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  specialtyId: uuid("specialty_id").references(() => specialtiesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Type for inserting a new document embedding
 */
export type InsertVectorStore = typeof vectorStoreTable.$inferInsert

/**
 * Type for selected document embedding record from database
 */
export type SelectVectorStore = typeof vectorStoreTable.$inferSelect

/**
 * Interface for document similarity search results
 *
 * When querying for similar documents, the database returns both the document
 * and its similarity score to the query.
 */
export interface VectorSimilarityResult {
  id: string
  content: string
  metadata: Record<string, any>
  similarity: number
}

/**
 * Interface for RAG query parameters
 */
export interface RAGQueryParams {
  query: string
  specialtyId?: string
  threshold?: number
  limit?: number
}

/**
 * Interface for document embedding with vector
 *
 * This represents a document with its embedding vector when sending
 * to Supabase for storage.
 */
export interface DocumentEmbedding {
  content: string
  metadata: Record<string, any>
  specialtyId?: string
  embedding: number[]
}

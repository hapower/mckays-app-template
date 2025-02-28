import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { specialtiesTable } from "./specialties-schema"

export const documentEmbeddingsTable = pgTable("medical_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  specialtyId: uuid("specialty_id").references(() => specialtiesTable.id),
  // Note: The actual embedding vector field is handled by Supabase directly
  // and not through Drizzle since it uses the pg_vector extension
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertDocumentEmbedding =
  typeof documentEmbeddingsTable.$inferInsert
export type SelectDocumentEmbedding =
  typeof documentEmbeddingsTable.$inferSelect

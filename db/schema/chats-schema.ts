/**
 * Database schema for chat sessions in the AttendMe application.
 *
 * This schema defines the structure for chat conversations between users and the AI assistant.
 * Each chat can be associated with a specific medical specialty to provide context for the
 * RAG system and enhance responses with specialty-specific knowledge.
 *
 * @module db/schema/chats-schema
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { specialtiesTable } from "./specialties-schema"

/**
 * Chats table schema
 *
 * Stores information about chat sessions including:
 * - Basic chat metadata (id, title)
 * - User association
 * - Optional specialty association for specialized answers
 * - Creation and update timestamps
 */
export const chatsTable = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  specialtyId: uuid("specialty_id").references(() => specialtiesTable.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Type for inserting a new chat record
 */
export type InsertChat = typeof chatsTable.$inferInsert

/**
 * Type for selected chat record from database
 */
export type SelectChat = typeof chatsTable.$inferSelect

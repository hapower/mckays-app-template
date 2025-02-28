/**
 * Database schema for messages in the AttendMe application.
 *
 * This schema defines the structure for individual messages within chat sessions.
 * Messages can be either from the user or the AI assistant, with their content
 * and associated metadata stored for retrieval and display.
 *
 * @module db/schema/messages-schema
 */

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { chatsTable } from "./chats-schema"

/**
 * Enum for message roles
 * - assistant: Messages from the AI
 * - user: Messages from the human user
 */
export const roleEnum = pgEnum("role", ["assistant", "user"])

/**
 * Messages table schema
 *
 * Stores:
 * - Message content
 * - Role (who sent the message)
 * - Association with a chat session
 * - Timestamps for creation and updates
 *
 * Uses cascade deletion to automatically remove messages when a chat is deleted.
 */
export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => chatsTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Type for inserting a new message record
 */
export type InsertMessage = typeof messagesTable.$inferInsert

/**
 * Type for selected message record from database
 */
export type SelectMessage = typeof messagesTable.$inferSelect

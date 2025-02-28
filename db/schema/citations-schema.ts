import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { messagesTable } from "./messages-schema"

export const citationsTable = pgTable("citations", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .references(() => messagesTable.id, { onDelete: "cascade" })
    .notNull(),
  referenceNumber: integer("reference_number").notNull(),
  citationText: text("citation_text").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCitation = typeof citationsTable.$inferInsert
export type SelectCitation = typeof citationsTable.$inferSelect

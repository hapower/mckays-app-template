import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { specialtiesTable } from "./specialties-schema"

export const libraryTable = pgTable("library", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  specialtyId: uuid("specialty_id").references(() => specialtiesTable.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertLibraryItem = typeof libraryTable.$inferInsert
export type SelectLibraryItem = typeof libraryTable.$inferSelect

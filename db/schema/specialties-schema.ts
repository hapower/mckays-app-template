import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const specialtyTypeEnum = pgEnum("specialty_type", [
  "internal_medicine",
  "cardiology",
  "pediatrics",
  "dermatology",
  "neurology",
  "orthopedics",
  "oncology",
  "psychiatry",
  "emergency_medicine",
  "other"
])

export const specialtiesTable = pgTable("specialties", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: specialtyTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSpecialty = typeof specialtiesTable.$inferInsert
export type SelectSpecialty = typeof specialtiesTable.$inferSelect

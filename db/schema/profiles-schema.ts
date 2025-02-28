/*
<ai_context>
Defines the database schema for user profiles in AttendMe application.
This schema stores essential user information and their membership details.
</ai_context>
*/

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const membershipEnum = pgEnum("membership", ["free", "student", "pro"])

export const profilesTable = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  specialty: text("specialty"),
  stripeCustomerId: text("stripe_customer_id"),
  membership: membershipEnum("membership").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect

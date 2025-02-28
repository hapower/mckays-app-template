/*
<ai_context>
Configures Drizzle ORM for the app with support for PostgreSQL and Supabase.
</ai_context>
*/

import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Load environment variables from .env.local
config({ path: ".env.local" })

// Define Drizzle configuration
export default defineConfig({
  schema: "./db/schema/index.ts", // Path to your schema
  out: "./db/migrations", // Output directory for migrations
  dialect: "postgresql", // Database dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Database connection string
  },
  verbose: true, // Enable verbose logging
  strict: true, // Enable strict mode
  tablesFilter: ["*"], // Include all tables without prefix filter
})

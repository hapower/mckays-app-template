/**
 * One-time script to update the chats table schema
 * 
 * This script:
 * 1. Renames the 'name' column to 'title' in the chats table
 * 2. Adds a specialty_id column with foreign key reference to the specialties table
 * 
 * Run with: node scripts/update-chats-schema.js
 */

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function updateChatsSchema() {
  // Create DB client
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('Starting chats table schema update...');
    
    // Begin transaction
    await sql.begin(async (tx) => {
      // Check if the name column exists
      const nameColumnResult = await tx.unsafe(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_name = 'chats' AND column_name = 'name'
      `);
      const nameColumnExists = parseInt(nameColumnResult[0].count);
      
      // Only rename if the name column exists
      if (nameColumnExists > 0) {
        console.log('Renaming name column to title...');
        await tx.unsafe('ALTER TABLE chats RENAME COLUMN name TO title');
      } else {
        console.log('Column already renamed or doesn\'t exist');
      }
      
      // Check if specialty_id column already exists
      const specialtyIdResult = await tx.unsafe(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_name = 'chats' AND column_name = 'specialty_id'
      `);
      const specialtyIdExists = parseInt(specialtyIdResult[0].count);
      
      // Only add if specialty_id doesn't exist
      if (specialtyIdExists === 0) {
        console.log('Adding specialty_id column...');
        await tx.unsafe('ALTER TABLE chats ADD COLUMN specialty_id uuid REFERENCES specialties(id)');
      } else {
        console.log('specialty_id column already exists');
      }
    });
    
    console.log('Chats schema update completed successfully!');
  } catch (error) {
    console.error('Error updating chats schema:', error);
  } finally {
    await sql.end();
  }
}

// Run the migration
updateChatsSchema(); 
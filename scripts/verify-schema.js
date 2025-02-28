/**
 * Script to verify the chat schema changes
 * 
 * This script:
 * 1. Checks the chats table has a 'title' column (not 'name')
 * 2. Checks the chats table has a 'specialty_id' column
 * 
 * Run with: node scripts/verify-schema.js
 */

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function verifyChatsSchema() {
  // Create DB client
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('Verifying chats table schema...');
    
    // Check for title column
    const titleResult = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'title'
    `;
    
    if (titleResult.length > 0) {
      console.log('✅ title column exists with data type:', titleResult[0].data_type);
    } else {
      console.log('❌ title column not found');
    }
    
    // Check for name column (should not exist)
    const nameResult = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'name'
    `;
    
    if (nameResult.length === 0) {
      console.log('✅ name column no longer exists (correctly renamed to title)');
    } else {
      console.log('❌ name column still exists');
    }
    
    // Check for specialty_id column
    const specialtyIdResult = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'specialty_id'
    `;
    
    if (specialtyIdResult.length > 0) {
      console.log('✅ specialty_id column exists with data type:', specialtyIdResult[0].data_type);
      console.log('   is_nullable:', specialtyIdResult[0].is_nullable);
    } else {
      console.log('❌ specialty_id column not found');
    }
    
    // Check for foreign key constraint
    const fkResult = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'chats'
        AND kcu.column_name = 'specialty_id'
    `;
    
    if (fkResult.length > 0) {
      console.log('✅ specialty_id has foreign key constraint to:', 
                 `${fkResult[0].foreign_table_name}(${fkResult[0].foreign_column_name})`);
    } else {
      console.log('❌ specialty_id foreign key constraint not found');
    }
    
  } catch (error) {
    console.error('Error verifying chats schema:', error);
  } finally {
    await sql.end();
    console.log('Verification complete.');
  }
}

// Run the verification
verifyChatsSchema(); 
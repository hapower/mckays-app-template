// scripts/test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test the connection by querying the extensions
    const { data, error } = await supabase.from('pg_extension').select('*').eq('extname', 'vector');
    
    if (error) throw error;
    
    console.log('Successfully connected to Supabase!');
    console.log('pg_vector extension status:', data.length > 0 ? 'Enabled' : 'Not found');
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  }
}

testConnection();
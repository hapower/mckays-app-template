// Basic test script for Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('.env.local file not found. Please create it with your Supabase credentials.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test the connection by querying PostgreSQL's pg_extension table directly
    const { data, error } = await supabase.from('pg_extension').select('extname');
    
    if (error) {
      // If this fails, try a simpler query
      const { data: versionData, error: versionError } = await supabase.rpc('version');
      
      if (versionError) {
        throw new Error('Could not connect to Supabase: ' + versionError.message);
      }
      
      console.log('Successfully connected to Supabase!');
      console.log('PostgreSQL version:', versionData);
      console.log('Note: Could not check for pg_vector extension. Please run the setup-supabase.sql script in the SQL editor.');
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    
    // Check if vector extension is enabled
    const vectorExtension = data.find(ext => ext.extname === 'vector');
    if (vectorExtension) {
      console.log('✅ pg_vector extension is enabled');
    } else {
      console.log('❌ pg_vector extension is not enabled. Please enable it in the SQL editor.');
      console.log('Run the setup-supabase.sql script in your Supabase SQL editor.');
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
    console.error('Please check your credentials and make sure your Supabase project is up and running.');
  }
}

testConnection(); 
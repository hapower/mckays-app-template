// Test script for Supabase connection
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
    // Test the connection by running a simple query
    const { data, error } = await supabase.rpc('pg_extensions');
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully connected to Supabase!');
    
    // Check if vector extension is enabled
    const vectorExtension = data.find(ext => ext.name === 'vector');
    if (vectorExtension) {
      console.log('✅ pg_vector extension is enabled');
    } else {
      console.log('❌ pg_vector extension is not enabled. Please enable it in the SQL editor.');
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
    console.error('Please check your credentials and make sure your Supabase project is up and running.');
  }
}

testConnection(); 
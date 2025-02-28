// Script to migrate the database using drizzle-kit
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

// Wrap exec in a promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`Running command: ${command}`));
    
    const child = exec(command, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      console.log(data.toString());
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      console.error(chalk.red(data.toString()));
      errorOutput += data.toString();
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

async function main() {
  try {
    console.log(chalk.green('Starting migration process...'));
    
    // Step 1: Generate the SQL migration files
    await execPromise('npx drizzle-kit generate');
    
    // Step 2: Try to push the changes to the database (SQL execution)
    await execPromise('npx drizzle-kit push');
    
    console.log(chalk.green('✅ Migration completed successfully!'));
    
    // Output success
    console.log(chalk.green('\nDatabase migration completed! Here are the next steps:'));
    console.log(chalk.yellow('1. Check your Supabase dashboard to verify tables are created'));
    console.log(chalk.yellow('2. If tables are still missing, run the create-tables-only.sql script directly in Supabase SQL Editor'));
    
  } catch (error) {
    console.error(chalk.red(`❌ Migration failed: ${error.message}`));
    
    if (error.message.includes('drizzle-kit')) {
      console.log(chalk.yellow('\nAttempting direct SQL approach as fallback...'));
      console.log(chalk.yellow('Please run the create-tables-only.sql script in the Supabase SQL Editor'));
    }
  }
}

main(); 
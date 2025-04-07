import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = createClient({
  url: process.env.DATABASE_URL
});

const db = drizzle(client, { schema });

async function init() {
  try {
    console.log('Initializing database...');
    
    // Run migrations
    await migrate(db, {
      migrationsFolder: 'drizzle'
    });
    
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init(); 
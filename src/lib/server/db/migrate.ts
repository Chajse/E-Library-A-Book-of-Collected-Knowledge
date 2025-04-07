import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client);

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle'
    });
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error performing migrations:', error);
    process.exit(1);
  }
}

main(); 
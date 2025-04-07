import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

// If using a local SQLite file, ensure the path is absolute
const client = createClient({
	url: DATABASE_URL.startsWith('file:') 
		? `file:${join(process.cwd(), DATABASE_URL.slice(5))}` 
		: DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

// Configure drizzle with the schema and prepare statements for more efficient queries
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? true : false
});

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
		? `file:${join(process.cwd(), DATABASE_URL.slice(5)).replace(/\\/g, '/')}` 
		: DATABASE_URL
});

// Configure drizzle with the schema
export const db = drizzle(client, { schema });

// Add debug log to check the database connection
console.log('Database URL:', DATABASE_URL.startsWith('file:') 
	? `file:${join(process.cwd(), DATABASE_URL.slice(5)).replace(/\\/g, '/')}` 
	: DATABASE_URL);

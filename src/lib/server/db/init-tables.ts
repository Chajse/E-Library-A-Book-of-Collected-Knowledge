import * as dotenv from 'dotenv';
import { db } from '../db';
import { sql } from 'drizzle-orm';

dotenv.config();

async function initializeTables() {
  try {
    console.log('Initializing database tables...');
    
    // Check if favorites table exists
    const favoritesExists = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='favorites';`);
    if (favoritesExists.rows.length === 0) {
      console.log('Creating favorites table...');
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);
      console.log('Favorites table created successfully!');
    } else {
      console.log('Favorites table already exists.');
    }
    
    // Check if bookmarks table exists
    const bookmarksExists = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks';`);
    if (bookmarksExists.rows.length === 0) {
      console.log('Creating bookmarks table...');
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          last_page INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);
      console.log('Bookmarks table created successfully!');
    } else {
      console.log('Bookmarks table already exists.');
    }
    
    console.log('Tables initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing tables:', error);
    process.exit(1);
  }
}

initializeTables(); 
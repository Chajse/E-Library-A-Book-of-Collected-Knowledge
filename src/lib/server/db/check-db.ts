import * as dotenv from 'dotenv';
import { db } from '../db';
import { users, books } from './schema';
import { sql } from 'drizzle-orm';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('Checking database content...');
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users:`);
    
    // Display user info without passwords
    allUsers.forEach(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userInfo } = user;
      
      // Format dates manually if they're invalid
      const formattedUser = {
        ...userInfo,
        createdAt: userInfo.createdAt instanceof Date && !isNaN(userInfo.createdAt.getTime()) 
          ? userInfo.createdAt.toISOString() 
          : 'Unknown date',
        updatedAt: userInfo.updatedAt instanceof Date && !isNaN(userInfo.updatedAt.getTime()) 
          ? userInfo.updatedAt.toISOString() 
          : 'Unknown date'
      };
      
      console.log(formattedUser);
    });
    
    // Check books table
    console.log('\nChecking books table...');
    try {
      const allBooks = await db.select().from(books);
      console.log(`Found ${allBooks.length} books:`);
      
      if (allBooks.length > 0) {
        allBooks.forEach(book => {
          // Format dates manually if they're invalid
          const formattedBook = {
            ...book,
            createdAt: book.createdAt instanceof Date && !isNaN(book.createdAt.getTime()) 
              ? book.createdAt.toISOString() 
              : 'Unknown date',
            updatedAt: book.updatedAt instanceof Date && !isNaN(book.updatedAt.getTime()) 
              ? book.updatedAt.toISOString() 
              : 'Unknown date'
          };
          
          console.log(formattedBook);
        });
      } else {
        console.log('No books found in the database.');
      }
    } catch (error) {
      console.error('Error checking books table:', error);
      console.log('The books table might not exist in the database.');
    }
    
    console.log('\nChecking database schema...');
    // Use a raw query to get table info
    try {
      const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table';`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('Available tables:', tables.rows.map((row: any) => row.name));
      
      // Check books table schema
      const booksSchema = await db.run(sql`PRAGMA table_info(books);`);
      console.log('\nBooks table schema:');
      if (booksSchema.rows.length > 0) {
        console.log(booksSchema.rows);
      } else {
        console.log('Books table schema not found.');
      }
    } catch (error) {
      console.error('Error checking database schema:', error);
    }
    
    console.log('\nDatabase check completed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase(); 
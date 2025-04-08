import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { books } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('Admin books page load started');
  const user = locals.user;

  if (!user) {
    console.log('No user found, redirecting to login');
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    console.log('User is not admin, redirecting to dashboard');
    throw redirect(303, '/books');
  }

  try {
    console.log('Attempting to fetch books from database...');
    
    // First, let's try a simple query to test the connection
    const testQuery = await db.select({ count: sql`count(*)` }).from(books);
    console.log('Test query result:', testQuery);
    
    // Now fetch all books with detailed logging
    console.log('Executing main books query...');
    const allBooks = await db.select().from(books);
    console.log('Raw books data:', allBooks);
    console.log('Number of books found:', allBooks.length);
    
    if (allBooks.length === 0) {
      console.log('No books found in database. Checking database connection...');
      // Try to get the table schema to verify connection
      const tableInfo = await db.run(sql`SELECT * FROM sqlite_master WHERE type='table' AND name='books';`);
      console.log('Table info:', tableInfo);
    }

    // Sort books by creation date
    const sortedBooks = [...allBooks].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('Returning sorted books to client');
    return {
      books: sortedBooks
    };
  } catch (error) {
    console.error('Error loading books:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    return {
      books: []
    };
  }
};

export const actions: Actions = {
  deleteBook: async ({ request, locals }) => {
    console.log('Delete book action started');
    const user = locals.user;

    if (!user) {
      console.log('No user found, redirecting to login');
      throw redirect(303, '/login');
    }

    if (user.role !== 'admin') {
      console.log('User is not admin, redirecting to dashboard');
      throw redirect(303, '/books');
    }

    const formData = await request.formData();
    const id = formData.get('id');
    console.log('Attempting to delete book with ID:', id);

    if (!id || typeof id !== 'string') {
      console.log('Invalid book ID provided:', id);
      return fail(400, { message: 'Invalid book ID' });
    }

    try {
      // Delete the book
      await db.delete(books).where(eq(books.id, parseInt(id)));
      console.log('Book deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.stack);
      }
      return fail(500, { message: 'Failed to delete book' });
    }
  }
}; 
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { books } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    throw redirect(303, '/dashboard');
  }

  try {
    // Get all books from the database
    const allBooks = await db.query.books.findMany({
      orderBy: (books, { desc }) => [desc(books.createdAt)]
    });

    return {
      books: allBooks
    };
  } catch (error) {
    console.error('Error loading books:', error);
    return {
      books: []
    };
  }
};

export const actions: Actions = {
  deleteBook: async ({ request, locals }) => {
    const user = locals.user;

    if (!user) {
      throw redirect(303, '/login');
    }

    if (user.role !== 'admin') {
      throw redirect(303, '/dashboard');
    }

    const formData = await request.formData();
    const id = formData.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid book ID' });
    }

    try {
      // Delete the book
      await db.delete(books).where(eq(books.id, parseInt(id)));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      return fail(500, { message: 'Failed to delete book' });
    }
  }
}; 
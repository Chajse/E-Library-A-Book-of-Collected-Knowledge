import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, books } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('Admin page loading, user:', locals.user); // Debug log
  
  const user = locals.user;

  if (!user) {
    console.log('No user found, redirecting to login'); // Debug log
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    console.log('User is not admin, redirecting to dashboard'); // Debug log
    throw redirect(303, '/books');
  }

  try {
    // Get counts for dashboard stats
    console.log('Fetching user count...'); // Debug log
    const userResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const userCount = userResult[0].count;
    console.log('User count:', userCount); // Debug log
    
    // Get book count
    console.log('Fetching book count...'); // Debug log
    const bookResult = await db.select({ count: sql<number>`count(*)` }).from(books);
    const bookCount = bookResult[0].count;
    console.log('Book count:', bookCount); // Debug log
    
    // Get recent activity - latest 5 books added or updated
    const recentBooks = await db.select({
      id: books.id,
      title: books.title,
      author: books.author,
      category: books.category,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt
    })
    .from(books)
    .orderBy(desc(books.updatedAt))
    .limit(5);
    
    // Format the recent activity
    const recentActivity = recentBooks.map(book => {
      // Determine if this was a creation or update
      const isNew = book.createdAt && book.updatedAt && 
        new Date(book.createdAt).getTime() === new Date(book.updatedAt).getTime();
      
      // Format the date
      const timestamp = new Date(book.updatedAt || book.createdAt).toLocaleString();
      
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        type: isNew ? 'added' : 'updated',
        timestamp,
      };
    });
    
    return {
      user,
      stats: {
        userCount,
        bookCount,
        activeLoans: 0 // We'll implement this later
      },
      recentActivity
    };
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    return {
      user,
      stats: {
        userCount: 0,
        bookCount: 0,
        activeLoans: 0
      },
      recentActivity: []
    };
  }
}; 
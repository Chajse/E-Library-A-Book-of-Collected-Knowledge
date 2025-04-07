import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, books } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('Admin page loading, user:', locals.user); // Debug log
  
  const user = locals.user;

  if (!user) {
    console.log('No user found, redirecting to login'); // Debug log
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    console.log('User is not admin, redirecting to dashboard'); // Debug log
    throw redirect(303, '/dashboard');
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
    
    return {
      user,
      stats: {
        userCount,
        bookCount,
        activeLoans: 0 // We'll implement this later
      }
    };
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    return {
      user,
      stats: {
        userCount: 0,
        bookCount: 0,
        activeLoans: 0
      }
    };
  }
}; 
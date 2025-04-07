import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
  // If user is already logged in, redirect to appropriate dashboard
  if (locals.user) {
    if (locals.user.role === 'admin') {
      throw redirect(303, '/admin');
    } else {
      throw redirect(303, '/dashboard');
    }
  }

  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const type = formData.get('type')?.toString() || 'user';

    if (!email || !password) {
      return fail(400, {
        error: 'Missing email or password'
      });
    }

    try {
      // Find user in database
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      if (!user || !user.password) {
        return fail(401, {
          error: 'Invalid email or password'
        });
      }

      // Verify password against hashed password in database
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        return fail(401, {
          error: 'Invalid email or password'
        });
      }

      // Check if user role matches the login tab type
      if (type === 'admin' && user.role !== 'admin') {
        return fail(403, {
          error: 'Regular users must use the User tab to login'
        });
      }

      if (type === 'user' && user.role === 'admin') {
        return fail(403, {
          error: 'Admin users must use the Admin tab to login'
        });
      }

      // Create session data
      const sessionData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };

      // Set session cookie
      cookies.set('session', JSON.stringify(sessionData), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return { success: true, user: sessionData };
    } catch (error) {
      console.error('Login error:', error);
      return fail(500, {
        error: 'An error occurred during login'
      });
    }
  }
}; 
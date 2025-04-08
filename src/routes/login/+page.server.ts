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
      throw redirect(303, '/books');
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

    console.log('Login attempt:', { email, type, timestamp: new Date().toISOString() });

    if (!email || !password) {
      console.log('Missing email or password');
      return fail(400, {
        error: 'Missing email or password'
      });
    }

    try {
      // Find user in database
      console.log(`Attempting to find user with email: ${email}`);
      
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      console.log(`User found:`, user ? 'Yes' : 'No');

      if (!user) {
        console.log(`User not found: ${email}`);
        return fail(401, {
          error: 'Invalid email or password'
        });
      }

      if (!user.password) {
        console.error('User has no password set:', email);
        return fail(401, {
          error: 'Invalid user account configuration'
        });
      }

      // Verify password against hashed password in database
      console.log('Verifying password...');
      const isValidPassword = await verifyPassword(password, user.password);
      console.log('Password valid:', isValidPassword ? 'Yes' : 'No');

      if (!isValidPassword) {
        console.log(`Invalid password for user: ${email}`);
        return fail(401, {
          error: 'Invalid email or password'
        });
      }

      // Check if user role matches the login tab type
      console.log(`User role: ${user.role}, Login type: ${type}`);
      
      if (type === 'admin' && user.role !== 'admin') {
        console.log('Regular user attempted admin login');
        return fail(403, {
          error: 'Regular users must use the User tab to login'
        });
      }

      if (type === 'user' && user.role === 'admin') {
        console.log('Admin user attempted regular user login');
        return fail(403, {
          error: 'Admin users must use the Admin tab to login'
        });
      }

      // Check if user is active
      if (user.active === false) {
        console.log(`Inactive user attempted login: ${email}`);
        return fail(403, {
          error: 'Your account has been deactivated. Please contact an administrator.'
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

      console.log('Setting session cookie for user:', sessionData);

      try {
        // Set session cookie
        cookies.set('session', JSON.stringify(sessionData), {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        
        console.log('Session cookie set successfully');
        return { success: true, user: sessionData };
      } catch (cookieError) {
        console.error('Error setting session cookie:', cookieError);
        return fail(500, {
          error: 'Error creating user session. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More detailed error handling
      let errorMessage = 'An error occurred during login';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', error.stack);
      }
      
      return fail(500, {
        error: errorMessage
      });
    }
  }
}; 
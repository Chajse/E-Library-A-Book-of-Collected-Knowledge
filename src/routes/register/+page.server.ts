import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUser } from '$lib/server/auth';
import { DatabaseError } from '$lib/server/db/errors';
import { redirect } from '@sveltejs/kit';

// Add a load function to check if user is already logged in
export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    // If user is already logged in, redirect to appropriate dashboard
    if (locals.user.role === 'admin') {
      throw redirect(303, '/admin');
    } else {
      throw redirect(303, '/books');
    }
  }
  
  return {};
};

export const actions = {
  default: async ({ request }) => {
    try {
      const data = await request.formData();
      const email = data.get('email');
      const password = data.get('password');
      const firstName = data.get('firstName');
      const lastName = data.get('lastName');
      const type = data.get('type');

      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !type ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        typeof type !== 'string' ||
        !['user', 'admin'].includes(type)
      ) {
        return fail(400, { message: 'Invalid form data' });
      }

      // Check if admin registration is allowed
      if (type === 'admin') {
        // For security reasons, we should have a separate admin registration process
        // or only allow admin creation through a seeding process
        // For now, we'll just restrict it with a message
        return fail(403, { message: 'Admin registration is restricted. Please contact system administrator.' });
      }

      // Check password length
      if (password.length < 8) {
        return fail(400, { message: 'Password must be at least 8 characters long' });
      }

      // Create the user - we're just creating the user but not using the return value
      await createUser({
        email,
        password,
        firstName,
        lastName,
        role: type as 'user' | 'admin'
      });

      // Return success but don't set session cookie - user must login
      return { 
        success: true, 
        message: 'Registration successful! Please login with your credentials.' 
      };
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err instanceof DatabaseError) {
        return fail(err.statusCode, { message: err.message });
      }
      
      if (err instanceof Error) {
        return fail(500, { message: err.message });
      }
      
      return fail(500, { message: 'An unexpected error occurred during registration' });
    }
  }
} satisfies Actions; 
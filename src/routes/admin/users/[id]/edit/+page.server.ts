import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    throw redirect(303, '/books');
  }

  const { id } = params;
  
  if (!id || isNaN(Number(id))) {
    throw error(400, 'Invalid user ID');
  }

  try {
    // Get the user by ID
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, parseInt(id))
    });

    if (!targetUser) {
      throw error(404, 'User not found');
    }

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role,
        active: targetUser.active
      },
      sessionUser: user
    };
  } catch (err) {
    console.error('Error loading user:', err);
    throw error(500, 'Failed to load user');
  }
};

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const adminUser = locals.user;

    if (!adminUser) {
      throw redirect(303, '/login');
    }

    if (adminUser.role !== 'admin') {
      throw redirect(303, '/books');
    }

    const { id } = params;
    
    if (!id || isNaN(Number(id))) {
      return fail(400, { error: 'Invalid user ID' });
    }

    try {
      // First fetch the existing user to verify it exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, parseInt(id))
      });

      if (!existingUser) {
        return fail(404, { error: 'User not found' });
      }

      const formData = await request.formData();
      
      const email = formData.get('email')?.toString();
      const firstName = formData.get('firstName')?.toString();
      const lastName = formData.get('lastName')?.toString();
      const role = formData.get('role')?.toString();
      const password = formData.get('password')?.toString();
      const active = formData.get('active') === 'on';
      
      if (!email || !firstName || !lastName || !role || (role !== 'user' && role !== 'admin')) {
        return fail(400, { error: 'Missing or invalid required fields' });
      }

      // If this is the admin's own account, prevent role change from admin
      if (parseInt(id) === adminUser.id && role !== 'admin') {
        return fail(400, { error: 'You cannot change your own admin role' });
      }

      // Create update data structure - start with required fields
      const updateData: {
        email: string;
        firstName: string;
        lastName: string;
        role: 'user' | 'admin';
        active: boolean;
        password?: string;
      } = {
        email,
        firstName,
        lastName,
        role: role as 'user' | 'admin',
        active
      };

      // Only update password if provided
      if (password && password.trim() !== '') {
        if (password.length < 8) {
          return fail(400, { error: 'Password must be at least 8 characters' });
        }
        updateData.password = await hashPassword(password);
      }
      
      // Update the user in the database
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, parseInt(id)))
        .returning();
      
      return {
        success: true,
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          active: updatedUser.active
        }
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return fail(500, { error: 'Failed to update user' });
    }
  }
}; 
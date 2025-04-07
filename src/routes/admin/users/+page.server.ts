import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
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
    // Get all users from the database
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    });

    // Transform for the UI
    const transformedUsers = allUsers.map(user => ({
      id: user.id,
      username: `${user.firstName} ${user.lastName}`,
      email: user.email,
      active: user.active === undefined ? true : user.active, 
      role: user.role
    }));

    return {
      users: transformedUsers
    };
  } catch (error) {
    console.error('Error loading users:', error);
    return {
      users: []
    };
  }
};

export const actions: Actions = {
  toggleStatus: async ({ request, locals }) => {
    const user = locals.user;

    if (!user) {
      throw redirect(303, '/login');
    }

    if (user.role !== 'admin') {
      throw redirect(303, '/dashboard');
    }

    const formData = await request.formData();
    const id = formData.get('id');
    const currentStatus = formData.get('currentStatus') === 'true';

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid user ID' });
    }

    try {
      // Don't allow deactivating the current admin
      if (parseInt(id) === user.id && currentStatus) {
        return fail(400, { 
          message: 'You cannot deactivate your own account',
          id: parseInt(id)
        });
      }

      // Toggle user status
      await db.update(users)
        .set({ active: !currentStatus })
        .where(eq(users.id, parseInt(id)));
      
      return { 
        success: true, 
        message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        id: parseInt(id),
        status: !currentStatus
      };
    } catch (error) {
      console.error('Error toggling user status:', error);
      return fail(500, { 
        message: 'Failed to update user status',
        id: parseInt(id)
      });
    }
  },

  deleteUser: async ({ request, locals }) => {
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
      return fail(400, { message: 'Invalid user ID' });
    }

    try {
      // Don't allow deleting the current admin
      if (parseInt(id) === user.id) {
        return fail(400, { 
          message: 'You cannot delete your own account',
          id: parseInt(id)
        });
      }

      // Delete the user
      await db.delete(users).where(eq(users.id, parseInt(id)));
      
      return { 
        success: true, 
        message: 'User deleted successfully',
        id: parseInt(id)
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return fail(500, { 
        message: 'Failed to delete user',
        id: parseInt(id)
      });
    }
  }
}; 
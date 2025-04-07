import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  console.log('Layout server load, user:', locals.user); // Debug log
  
  // Create a valid Session object
  return {
    session: locals.user ? {
      user: {
        id: String(locals.user.id),
        email: locals.user.email,
        firstName: locals.user.firstName,
        lastName: locals.user.lastName,
        role: locals.user.role
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    } : null
  };
}; 
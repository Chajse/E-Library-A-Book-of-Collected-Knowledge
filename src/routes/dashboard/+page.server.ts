import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  return {
    user: locals.user
  };
}; 
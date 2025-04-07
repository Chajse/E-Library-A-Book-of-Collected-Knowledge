import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
  // Clear user from locals
  locals.user = null;
  
  // Clear the session cookie
  cookies.delete('session', { 
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return json({ success: true });
}; 
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Session } from '@auth/core/types';

// Handle session management
const handleSession: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');
  
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      event.locals.user = sessionData;
      
      // Add getSession function to locals
      event.locals.getSession = async () => {
        if (!event.locals.user) return null;
        
        // Convert to the format expected by the app
        const session: Session = {
          user: {
            id: String(event.locals.user.id),
            email: event.locals.user.email,
            firstName: event.locals.user.firstName,
            lastName: event.locals.user.lastName,
            role: event.locals.user.role
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        return session;
      };
    } catch (error) {
      console.error('Error parsing session cookie:', error);
      event.cookies.delete('session', { path: '/' });
      event.locals.user = null;
    }
  } else {
    // Ensure getSession always exists even without a session cookie
    event.locals.user = null;
    event.locals.getSession = async () => null;
  }

  const response = await resolve(event);
  return response;
};

// Handle route protection
const protectRoutes: Handle = async ({ event, resolve }) => {
  const user = event.locals.user;
  const pathname = event.url.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      throw redirect(303, '/login');
    }
    if (user.role !== 'admin') {
      throw redirect(303, '/books');
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/books')) {
    if (!user) {
      throw redirect(303, '/login');
    }
  }

  return resolve(event);
};

export const handle = sequence(handleSession, protectRoutes); 
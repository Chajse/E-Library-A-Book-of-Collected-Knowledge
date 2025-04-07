// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '@auth/core/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: number;
				email: string;
				firstName: string;
				lastName: string;
				role: 'user' | 'admin';
			} | null;
			getSession: () => Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface User {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role?: 'user' | 'admin';
	}
	interface Session {
		user: User & {
			role?: 'user' | 'admin';
		};
	}
}

export {};

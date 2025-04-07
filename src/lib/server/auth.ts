import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { DatabaseError } from './db/errors';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not set');
}

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
}) {
  const hashedPassword = await hashPassword(userData.password);
  
  try {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();
    
    return user;
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      throw new DatabaseError('Email already exists', 400);
    }
    throw new DatabaseError('Failed to create user', 500);
  }
}

export async function validateUser(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!user) {
    throw new DatabaseError('Invalid email or password', 401);
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new DatabaseError('Invalid email or password', 401);
  }

  const { id, email: userEmail, firstName, lastName, role } = user;
  return { id, email: userEmail, firstName, lastName, role };
} 
import * as dotenv from 'dotenv';
import { createUser } from '../auth';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

async function seed() {
  try {
    // Create admin user
    await createUser({
      email: 'admin1@example.com',
      password: 'admin123',
      firstName: 'Admin1',
      lastName: 'User1',
      role: 'admin'
    });

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 
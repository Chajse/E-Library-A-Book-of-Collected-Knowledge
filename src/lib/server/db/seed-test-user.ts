import * as dotenv from 'dotenv';
import { createUser } from '../auth';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

async function seedTestUser() {
  try {
    // Create test users
    await createUser({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });

    // Create admin if doesn't exist yet
    try {
      await createUser({
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
    } catch {
      console.log('Admin user may already exist, skipping...');
    }

    // Display login credentials for testing
    console.log('\nYou can use the following credentials for testing:');
    console.log('User login:');
    console.log('  Email: user@example.com');
    console.log('  Password: password123');
    console.log('Admin login:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');

    console.log('\nTest user seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test user:', error);
    process.exit(1);
  }
}

seedTestUser(); 
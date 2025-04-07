import * as dotenv from 'dotenv';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from './auth';

dotenv.config();

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Test credentials
    const testCases = [
      { email: 'admin@example.com', password: 'admin123', type: 'admin' },
      { email: 'user@example.com', password: 'password123', type: 'user' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTesting ${testCase.type} login: ${testCase.email}`);
      
      // 1. Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, testCase.email)
      });
      
      if (!user) {
        console.log(`❌ User not found: ${testCase.email}`);
        continue;
      }
      console.log(`✅ User found: ${user.email} (${user.firstName} ${user.lastName})`);
      
      // 2. Verify password
      const isValidPassword = await verifyPassword(testCase.password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Password verification failed for: ${testCase.email}`);
        continue;
      }
      console.log(`✅ Password verified successfully`);
      
      // 3. Check role match
      if (testCase.type === 'admin' && user.role !== 'admin') {
        console.log(`❌ Role mismatch: Expected admin, got ${user.role}`);
        continue;
      }
      
      if (testCase.type === 'user' && user.role !== 'user') {
        console.log(`❌ Role mismatch: Expected user, got ${user.role}`);
        continue;
      }
      console.log(`✅ Role verification passed: ${user.role}`);
      
      // 4. Check if user is active
      if (user.active === false) {
        console.log(`❌ User is inactive: ${user.email}`);
        continue;
      }
      console.log(`✅ User is active`);
      
      console.log(`✅ Login test PASSED for ${testCase.email}`);
    }
    
    console.log('\nLogin testing completed');
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
}

testLogin(); 
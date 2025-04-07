import * as dotenv from 'dotenv';
import { db } from '../db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

dotenv.config();

async function fixUserData() {
  try {
    console.log('Checking for data integrity issues...');
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);
    
    // Check and fix issues
    let fixedCount = 0;
    
    for (const user of allUsers) {
      let needsUpdate = false;
      const updates: Partial<typeof user> = {};
      
      // Check for missing active field
      if (user.active === undefined || user.active === null) {
        updates.active = true;
        needsUpdate = true;
        console.log(`User ${user.id} (${user.email}) missing active field, setting to true`);
      }
      
      // Check for missing role
      if (user.role === undefined || user.role === null) {
        updates.role = 'user';
        needsUpdate = true;
        console.log(`User ${user.id} (${user.email}) missing role field, setting to 'user'`);
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await db.update(users)
          .set(updates)
          .where(eq(users.id, user.id));
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} users with data integrity issues`);
    console.log('Database fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixUserData(); 
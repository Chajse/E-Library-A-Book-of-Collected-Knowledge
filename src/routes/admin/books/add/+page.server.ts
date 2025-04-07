import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { books } from '$lib/server/db/schema';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Category {
  id: number;
  name: string;
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    throw redirect(303, '/dashboard');
  }

  try {
    // Get all categories - we'll implement this in the future
    // when we have the categories table populated
    const allCategories: Category[] = [];

    return {
      categories: allCategories
    };
  } catch (error) {
    console.error('Error loading categories:', error);
    return {
      categories: []
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user;

    if (!user) {
      throw redirect(303, '/login');
    }

    if (user.role !== 'admin') {
      throw redirect(303, '/dashboard');
    }

    try {
      const formData = await request.formData();
      
      const title = formData.get('title')?.toString();
      const author = formData.get('author')?.toString();
      const description = formData.get('description')?.toString() || '';
      const category = formData.get('category')?.toString();
      const coverImageFile = formData.get('coverImage') as File | null;
      
      if (!title || !author || !category) {
        return fail(400, { error: 'Missing required fields' });
      }
      
      let coverImagePath = null;
      
      // Handle file upload if provided
      if (coverImageFile && coverImageFile.size > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'static', 'uploads');
        if (!existsSync(uploadsDir)) {
          mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Generate unique filename for the cover image
        const fileName = `${uuidv4()}-${coverImageFile.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadsDir, fileName);
        
        try {
          // Read file as array buffer
          const buffer = await coverImageFile.arrayBuffer();
          
          // Write to file system
          writeFileSync(filePath, Buffer.from(buffer));
          
          // Save the path to be stored in DB
          coverImagePath = `/uploads/${fileName}`;
        } catch (err) {
          console.error('Error processing image file:', err);
          return fail(500, { error: 'Failed to process image file' });
        }
      }
      
      // Insert the book into the database
      const [newBook] = await db.insert(books).values({
        title,
        author,
        description,
        category,
        coverImage: coverImagePath
      }).returning();
      
      return {
        success: true,
        book: newBook
      };
    } catch (error) {
      console.error('Error adding book:', error);
      return fail(500, { error: 'Failed to add book' });
    }
  }
}; 
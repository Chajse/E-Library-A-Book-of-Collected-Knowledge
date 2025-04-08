import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { books } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Category {
  id: number;
  name: string;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    throw redirect(303, '/books');
  }

  const { id } = params;
  
  if (!id || isNaN(Number(id))) {
    throw error(400, 'Invalid book ID');
  }

  try {
    // Get the book by ID
    const book = await db.query.books.findFirst({
      where: eq(books.id, parseInt(id))
    });

    if (!book) {
      throw error(404, 'Book not found');
    }

    // Get all categories - we'll implement this in the future
    // when we have the categories table populated
    const allCategories: Category[] = [];

    return {
      book,
      categories: allCategories
    };
  } catch (err) {
    console.error('Error loading book:', err);
    throw error(500, 'Failed to load book');
  }
};

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const user = locals.user;

    if (!user) {
      throw redirect(303, '/login');
    }

    if (user.role !== 'admin') {
      throw redirect(303, '/books');
    }

    const { id } = params;
    
    if (!id || isNaN(Number(id))) {
      return fail(400, { error: 'Invalid book ID' });
    }

    try {
      // First fetch the existing book to get current details
      const existingBook = await db.query.books.findFirst({
        where: eq(books.id, parseInt(id))
      });

      if (!existingBook) {
        return fail(404, { error: 'Book not found' });
      }

      const formData = await request.formData();
      
      const title = formData.get('title')?.toString();
      const author = formData.get('author')?.toString();
      const description = formData.get('description')?.toString() || '';
      const category = formData.get('category')?.toString();
      const coverImageFile = formData.get('coverImage') as File | null;
      
      if (!title || !author || !category) {
        return fail(400, { error: 'Missing required fields' });
      }
      
      let coverImagePath = existingBook.coverImage;
      
      // Handle file upload if provided
      if (coverImageFile && coverImageFile.size > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'static', 'uploads');
        if (!existsSync(uploadsDir)) {
          mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Delete old cover image if it exists
        if (existingBook.coverImage && existingBook.coverImage.startsWith('/uploads/')) {
          try {
            const oldFilePath = join(process.cwd(), 'static', existingBook.coverImage);
            if (existsSync(oldFilePath)) {
              unlinkSync(oldFilePath);
            }
          } catch (err) {
            console.error('Error deleting old cover image:', err);
          }
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
      
      // Update the book in the database
      const [updatedBook] = await db.update(books)
        .set({
          title,
          author,
          description,
          category,
          coverImage: coverImagePath
        })
        .where(eq(books.id, parseInt(id)))
        .returning();
      
      return {
        success: true,
        book: updatedBook
      };
    } catch (error) {
      console.error('Error updating book:', error);
      return fail(500, { error: 'Failed to update book' });
    }
  }
}; 
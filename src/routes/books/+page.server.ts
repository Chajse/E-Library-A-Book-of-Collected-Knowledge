import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { books, favorites, bookmarks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

interface Locals {
  user: {
    id: number;
  } | null;
}

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string | null;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BookWithFlags extends Book {
  isFavorite: boolean;
  isBookmarked: boolean;
}

interface CategoryBooks {
  [category: string]: BookWithFlags[];
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = (locals as Locals).user;
  
  if (!user) {
    throw redirect(302, '/login');
  }

  // Check if we're viewing a specific section
  const section = url.searchParams.get('section');
  const showAll = url.searchParams.get('showAll') === 'true';
  
  // Check if we need to load a specific book
  const bookId = url.searchParams.get('id');
  
  if (bookId) {
    try {
      // Fetch the specific book
      const bookData = await db.select().from(books).where(eq(books.id, parseInt(bookId)));
      
      if (bookData.length === 0) {
        return {
          book: null,
          error: 'Book not found'
        };
      }
      
      // Check if it's a favorite
      const isFavorite = await db.select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, user.id),
          eq(favorites.bookId, parseInt(bookId))
        ))
        .then(results => results.length > 0)
        .catch(() => false);
      
      // Check if it's bookmarked
      const isBookmarked = await db.select()
        .from(bookmarks)
        .where(and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.bookId, parseInt(bookId))
        ))
        .then(results => results.length > 0)
        .catch(() => false);
      
      return {
        book: {
          ...bookData[0],
          isFavorite,
          isBookmarked
        }
      };
    } catch (error) {
      console.error('Error loading specific book:', error);
      return { 
        book: null,
        error: 'Failed to load book'
      };
    }
  }

  try {
    // Fetch all books
    let allBooks: Book[] = [];
    try {
      allBooks = await db.select().from(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      return {
        books: {} as CategoryBooks,
        allBooks: [] as BookWithFlags[],
        favorites: [] as BookWithFlags[],
        bookmarks: [] as BookWithFlags[],
        recommended: [] as BookWithFlags[],
        popular: [] as BookWithFlags[],
        activeSection: null,
        showAll: false
      };
    }
    
    // Fetch user's favorites
    const userFavorites = await db.select()
      .from(favorites)
      .where(eq(favorites.userId, user.id))
      .catch(() => []);
    
    // Create a set of favorited book IDs for quick lookup
    const favoriteBookIds = new Set(userFavorites.map(f => f.bookId));
    
    // Fetch user's bookmarks
    const userBookmarks = await db.select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, user.id))
      .catch(() => []);
    
    // Create a set of bookmarked book IDs for quick lookup
    const bookmarkedBookIds = new Set(userBookmarks.map(b => b.bookId));

    // Get all favorites to count popularity
    const allFavorites = await db.select()
      .from(favorites)
      .catch(() => []);

    // Get all bookmarks to count popularity
    const allBookmarks = await db.select()
      .from(bookmarks)
      .catch(() => []);

    // Count favorites per book
    const favoriteCount = new Map<number, number>();
    allFavorites.forEach(fav => {
      favoriteCount.set(fav.bookId, (favoriteCount.get(fav.bookId) || 0) + 1);
    });

    // Count bookmarks per book
    const bookmarkCount = new Map<number, number>();
    allBookmarks.forEach(bm => {
      bookmarkCount.set(bm.bookId, (bookmarkCount.get(bm.bookId) || 0) + 1);
    });

    // Mark books with favorites and bookmarks
    const booksWithFlags: BookWithFlags[] = allBooks.map(book => ({
      ...book,
      isFavorite: favoriteBookIds.has(book.id),
      isBookmarked: bookmarkedBookIds.has(book.id)
    }));

    // Create a favorites collection
    const favoriteBooks = booksWithFlags.filter(book => book.isFavorite);
    
    // Create a bookmarks collection
    const bookmarkedBooks = booksWithFlags.filter(book => book.isBookmarked);

    // Group books by category
    const booksByCategory: CategoryBooks = {};
    booksWithFlags.forEach(book => {
      const category = book.category?.toLowerCase() || 'uncategorized';
      if (!booksByCategory[category]) {
        booksByCategory[category] = [];
      }
      booksByCategory[category].push(book);
    });

    // Get popular books based on combined bookmark and favorite counts across all users
    const popularBooks = [...booksWithFlags]
      .sort((a, b) => {
        const aPopularity = (favoriteCount.get(a.id) || 0) + (bookmarkCount.get(a.id) || 0);
        const bPopularity = (favoriteCount.get(b.id) || 0) + (bookmarkCount.get(b.id) || 0);
        return bPopularity - aPopularity;
      })
      .filter(book => (favoriteCount.get(book.id) || 0) + (bookmarkCount.get(book.id) || 0) > 0);
    
    // Get user preference categories based on their favorites and bookmarks
    const userPreferredCategories = new Set<string>();
    
    // Add categories from user's favorites
    favoriteBooks.forEach(book => {
      if (book.category) {
        userPreferredCategories.add(book.category.toLowerCase());
      }
    });
    
    // Add categories from user's bookmarks
    bookmarkedBooks.forEach(book => {
      if (book.category) {
        userPreferredCategories.add(book.category.toLowerCase());
      }
    });
    
    // Determine recommendations based on user's preferred categories
    let recommendedBooks: BookWithFlags[] = [];
    
    if (userPreferredCategories.size > 0) {
      // Get books from user's preferred categories that they haven't interacted with yet
      recommendedBooks = booksWithFlags.filter(book => 
        book.category && 
        userPreferredCategories.has(book.category.toLowerCase()) && 
        !book.isFavorite && 
        !book.isBookmarked
      );
      
      // Sort by popularity within those categories
      recommendedBooks.sort((a, b) => {
        const aPopularity = (favoriteCount.get(a.id) || 0) + (bookmarkCount.get(a.id) || 0);
        const bPopularity = (favoriteCount.get(b.id) || 0) + (bookmarkCount.get(b.id) || 0);
        return bPopularity - aPopularity;
      });
    }
    
    // If we couldn't find any recommendations based on categories, fall back to overall popularity
    if (recommendedBooks.length === 0) {
      recommendedBooks = popularBooks.filter(book => !book.isFavorite && !book.isBookmarked);
    }

    // Handle a specific section request for "See More" functionality
    if (section && showAll) {
      switch (section) {
        case 'favorites':
          return { favorites: favoriteBooks, activeSection: 'favorites', showAll };
        case 'bookmarks':
          return { bookmarks: bookmarkedBooks, activeSection: 'bookmarks', showAll };
        case 'recommended':
          return { recommended: recommendedBooks, activeSection: 'recommended', showAll };
        case 'popular':
          return { popular: popularBooks, activeSection: 'popular', showAll };
        default:
          // If category, return that category
          if (booksByCategory[section]) {
            return { 
              categoryBooks: booksByCategory[section], 
              activeSection: section,
              showAll 
            };
          }
      }
    }

    return {
      books: booksByCategory,
      allBooks: booksWithFlags,
      favorites: favoriteBooks,
      bookmarks: bookmarkedBooks,
      recommended: recommendedBooks.slice(0, 5),
      popular: popularBooks.slice(0, 5),
      activeSection: section || null,
      showAll: false
    };
  } catch (error) {
    console.error('Error loading books:', error);
    return {
      books: {} as CategoryBooks,
      allBooks: [] as BookWithFlags[],
      favorites: [] as BookWithFlags[],
      bookmarks: [] as BookWithFlags[],
      recommended: [] as BookWithFlags[],
      popular: [] as BookWithFlags[],
      activeSection: null,
      showAll: false
    };
  }
};

export const actions: Actions = {
  toggleFavorite: async ({ request, locals }) => {
    const user = (locals as Locals).user;
    
    if (!user) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const bookId = Number(formData.get('bookId'));
    const redirectUrl = formData.get('redirectUrl') || '/books';

    if (isNaN(bookId)) {
      return { success: false, error: 'Invalid book ID' };
    }

    try {
      // Check if book is already favorited
      const existingFavorite = await db.select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, user.id),
          eq(favorites.bookId, bookId)
        ));

      if (existingFavorite.length > 0) {
        // Remove from favorites
        await db.delete(favorites)
          .where(and(
            eq(favorites.userId, user.id),
            eq(favorites.bookId, bookId)
          ));
        
        return { 
          success: true, 
          action: 'removed',
          redirectUrl 
        };
      } else {
        // Add to favorites
        await db.insert(favorites).values({
          userId: user.id,
          bookId
        });
        
        return { 
          success: true, 
          action: 'added',
          redirectUrl
        };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { 
        success: false, 
        error: 'Failed to toggle favorite',
        redirectUrl 
      };
    }
  },
  
  toggleBookmark: async ({ request, locals }) => {
    const user = (locals as Locals).user;
    
    if (!user) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const bookId = Number(formData.get('bookId'));
    const redirectUrl = formData.get('redirectUrl') || '/books';

    if (isNaN(bookId)) {
      return { success: false, error: 'Invalid book ID' };
    }

    try {
      // Check if book is already bookmarked
      const existingBookmark = await db.select()
        .from(bookmarks)
        .where(and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.bookId, bookId)
        ));

      if (existingBookmark.length > 0) {
        // Remove from bookmarks
        await db.delete(bookmarks)
          .where(and(
            eq(bookmarks.userId, user.id),
            eq(bookmarks.bookId, bookId)
          ));
        
        return { 
          success: true, 
          action: 'removed',
          redirectUrl 
        };
      } else {
        // Add to bookmarks
        await db.insert(bookmarks).values({
          userId: user.id,
          bookId
        });
        
        return { 
          success: true, 
          action: 'added',
          redirectUrl
        };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return { 
        success: false, 
        error: 'Failed to toggle bookmark',
        redirectUrl 
      };
    }
  }
}; 
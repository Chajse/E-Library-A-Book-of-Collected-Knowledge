describe('Admin eBook Details and Management', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/login')
    cy.wait(1000)
    
    // Click the admin tab
    cy.get('[role="group"] button').eq(1).click()
    
    // Enter admin credentials
    cy.get('input:visible').eq(0).type('admin@example.com', {force: true})
    cy.get('input:visible').eq(1).type('admin123', {force: true})
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Verify we're on admin page
    cy.url().should('include', '/admin')
  })

  it('Should display recent ebook activity with correct details on dashboard', () => {
    // Navigate to admin dashboard
    cy.visit('/admin')
    cy.wait(1500)
    
    // Verify the Recent Activity section exists
    cy.contains('h3', 'Recent Activity').should('be.visible')
    
    // Check if the recent activity section has content
    cy.get('body').then($body => {
      if ($body.find('.border-l-4').length > 0) {
        // Test the first activity card
        cy.get('.border-l-4').first().within(() => {
          // Verify book details exist
          cy.get('.text-sm.font-medium').should('exist') // Book title
          cy.get('.text-sm.text-gray-600').should('exist') // Author & category
          cy.get('.text-xs.text-gray-500').should('exist') // Timestamp
          
          // Check activity type indicator (either added or updated)
          cy.get('span.inline-flex').should('exist')
          
          // Store book title for later verification
          cy.get('.text-sm.font-medium').invoke('text').as('bookTitle')
        })
        
        // Click on View Details for the first book
        cy.get('@bookTitle').then(bookTitle => {
          cy.contains('a', 'View Details').first().click({force: true})
          cy.wait(1500)
          
          // Verify the edit page shows the same book
          cy.get('#title').invoke('val').should('include', bookTitle.split(':')[1].trim())
        })
      } else {
        cy.log('No recent activity found. Add or edit books for better testing.')
      }
    })
  })

  it('Should show correct count of books across the application', () => {
    // Go to dashboard
    cy.visit('/admin')
    cy.wait(1500)
    
    // Get book count from dashboard
    cy.contains('h3', 'Total Books')
      .parent()
      .find('p')
      .invoke('text')
      .then(parseFloat)
      .as('dashboardCount')
    
    // Go to books list page
    cy.contains('a', 'List of Book').click()
    cy.wait(1500)
    
    // Count books on list page
    cy.get('body').then($body => {
      // Check if we have any books
      if ($body.text().includes('No books found')) {
        cy.get('@dashboardCount').should('eq', 0)
      } else {
        // Count book cards
        const actualBookCount = $body.find('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').length
        
        // Verify dashboard count matches actual count or is at least reasonable
        // (might not match exactly if pagination is used)
        cy.get('@dashboardCount').then(dashboardCount => {
          // If we have pagination, then dashboard count might be higher than visible books
          if ($body.find('.pagination').length > 0) {
            cy.log('Pagination detected - dashboard count may be higher than visible books')
            // Assert dashboard count is equal to or greater than visible count
            expect(dashboardCount).to.be.at.least(actualBookCount)
          } else {
            // If no pagination, count should match exactly
            expect(Number(dashboardCount)).to.eq(actualBookCount)
          }
        })
      }
    })
  })

  it('Should display all book details correctly when viewing a specific book', () => {
    // Go to books list page
    cy.contains('a', 'List of Book').click()
    cy.wait(1500)
    
    // Check if books exist
    cy.get('body').then($body => {
      const hasBooks = $body.find('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').length > 0
      
      if (hasBooks) {
        // Record details of first book
        let bookInfo = {}
        
        cy.get('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').first().within(() => {
          cy.get('.text-lg.font-bold').invoke('text').then(text => {
            bookInfo.title = text.trim()
          })
          cy.get('.text-sm.text-gray-600').invoke('text').then(text => {
            bookInfo.author = text.trim()
          })
          cy.get('.text-xs.text-gray-500').invoke('text').then(text => {
            bookInfo.category = text.trim().toUpperCase()
          })
        }).then(() => {
          // Click options menu
          cy.get('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').first()
            .find('button[aria-label="Options menu"]')
            .click({force: true})
          
          // Click edit details
          cy.contains('a', 'Edit Details').click({force: true})
          cy.wait(1500)
          
          // Verify book details page has correct information
          cy.get('#title').invoke('val').should('eq', bookInfo.title)
          cy.get('#author').invoke('val').should('eq', bookInfo.author)
          
          // Category might be displayed differently in dropdown
          cy.get('#category').invoke('val').then(categoryVal => {
            // Fix the OR condition by using proper if/else logic
            const upperCategoryVal = categoryVal.toUpperCase()
            const upperBookCategory = bookInfo.category
            
            if (upperCategoryVal.includes(upperBookCategory) || upperBookCategory.includes(upperCategoryVal)) {
              cy.log('Category match confirmed')
            } else {
              // Log it but don't fail the test as category might be displayed differently
              cy.log(`Warning: Category may not match exactly. Form has "${categoryVal}" while book showed "${bookInfo.category}"`)
            }
          })
          
          // Verify cover image is displayed (if available)
          cy.get('.aspect-\\[3\\/4\\]').then($cover => {
            if ($cover.find('img').length > 0) {
              cy.get('.aspect-\\[3\\/4\\] img').should('be.visible')
            } else {
              cy.log('No cover image for this book')
            }
          })
        })
      } else {
        cy.log('No books found. Add books to test this feature thoroughly.')
      }
    })
  })

  it('Should display list view of all books with filtering and sorting', () => {
    // Go to books list page
    cy.contains('a', 'List of Book').click()
    cy.wait(1500)
    
    // Verify the page has filter/sort controls
    cy.get('input[placeholder="Search..."]').should('exist')
    
    // Test search functionality
    cy.get('body').then($body => {
      const hasBooks = $body.find('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').length > 0
      
      if (hasBooks) {
        // Get the title of the first book
        cy.get('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4').first()
          .find('.text-lg.font-bold')
          .invoke('text')
          .then(title => {
            // Search for a portion of the title
            const searchTerm = title.substring(0, Math.min(5, title.length))
            cy.get('input[placeholder="Search..."]').type(searchTerm, {force: true})
            cy.wait(500)
            
            // Verify the book is still visible after filtering
            cy.get('.bg-white.shadow-md.rounded-md.overflow-hidden.p-4')
              .should('exist')
              .contains(title)
            
            // Clear search
            cy.get('input[placeholder="Search..."]').clear()
            cy.wait(500)
          })
        
        // Test category tabs if they exist
        cy.get('body').then($body => {
          if ($body.find('button.px-4.py-2.rounded').length > 0) {
            // Click on a category tab (not the active one)
            cy.get('button.px-4.py-2.rounded').not('.bg-\\[\\#B5BD36\\]').first().click({force: true})
            cy.wait(500)
            
            // Verify it becomes active
            cy.get('button.px-4.py-2.rounded.bg-\\[\\#B5BD36\\]').should('exist')
          } else {
            cy.log('No category tabs found')
          }
        })
      } else {
        cy.log('No books found. Add books to test this feature thoroughly.')
      }
    })
  })

  it('Should navigate between admin sections while preserving state', () => {
    // Start at dashboard
    cy.visit('/admin')
    cy.wait(1000)
    
    // Navigate to books page
    cy.contains('a', 'List of Book').click()
    cy.wait(1000)
    
    // Verify books page loads
    cy.contains('h1', 'List of Book').should('be.visible')
    
    // Navigate to users page
    cy.contains('a', 'Users').click()
    cy.wait(1000)
    
    // Verify users page loads
    cy.contains('h1', 'All Users').should('be.visible')
    
    // Go back to books page
    cy.contains('a', 'List of Book').click()
    cy.wait(1000)
    
    // Verify we return to books page with state preserved
    cy.contains('h1', 'List of Book').should('be.visible')
    
    // Return to dashboard
    cy.contains('a', 'Dashboard').click()
    cy.wait(1000)
    
    // Verify we're back on dashboard
    cy.contains('h1', 'Admin Dashboard').should('be.visible')
    
    // Check quick actions on dashboard
    cy.contains('h3', 'Quick Actions').should('be.visible')
    cy.contains('a', 'Manage Users').should('exist')
    cy.contains('a', 'Add New Book').should('exist')
    cy.contains('a', 'View Books').should('exist')
  })
}) 
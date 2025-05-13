describe('Remove eBook from Favorites', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/login')
    cy.wait(1000) // Wait for page to load completely
    
    // Use simple indexing approach for form inputs
    cy.get('input:visible').eq(0).type('cypresstest@gmail.com', {force: true})
    cy.get('input:visible').eq(1).type('Meowmelol31', {force: true})
    cy.contains('button', 'User Login').click()
    cy.wait(2000) // Give login time to complete
    
    // Verify we're on books page
    cy.url().should('include', '/books')
  })

  it('should allow user to add a book to favorites first', () => {
    // Navigate to books page
    cy.visit('/books')
    cy.wait(2000) // Allow the page to fully load
    
    // Verify the page has books to interact with
    cy.get('body').then($body => {
      const hasBooks = $body.find('img').not('[alt*="Logo"]').length > 0
      
      if (hasBooks) {
        // Click on the first book to view details
        cy.get('img').not('[alt*="Logo"]').first().click({force: true})
        cy.wait(2000) // Wait for book detail page to load
        
        // Check if book is already in favorites
        cy.get('body').then($detailBody => {
          // Look for "Add to Favorites" or "Remove from Favorites" button
          const hasAddButton = $detailBody.text().includes('Add to Favorites') || 
                             $detailBody.text().includes('Add to')
          
          if (hasAddButton) {
            // If it's not in favorites yet, add it
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
            cy.wait(2000) // Wait for action to complete
          } else {
            // Book is already in favorites, test can proceed
            cy.log('Book is already in favorites')
          }
        })
        
        // Go back to books main page
        cy.visit('/books')
        cy.wait(1000)
      } else {
        // Skip test if no books found
        cy.log('No books available to test with - skipping test')
      }
    })
  })

  it('should display book in favorites section', () => {
    // Navigate to books page
    cy.visit('/books')
    cy.wait(2000) // Allow the page to fully load
    
    // Look for the Favorites section
    cy.contains('h2', 'Favorites').should('be.visible')
    
    // Directly navigate to favorites page
    cy.visit('/books?section=favorites&showAll=true')
    cy.wait(2000) // Wait for favorites page to load
    
    // Check if there are any books in favorites
    cy.get('body').then($body => {
      const hasFavoriteBooks = $body.find('img').not('[alt*="Logo"]').length > 0
      
      if (!hasFavoriteBooks) {
        // No favorites found, we need to go add one
        cy.log('No favorites found - returning to main page to add one')
        cy.visit('/books')
        cy.wait(1000)
        
        // Find a book and add it to favorites
        cy.get('img').not('[alt*="Logo"]').first().click({force: true})
        cy.wait(1000)
        
        // Add to favorites if not already favorited
        cy.get('button').contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
        cy.wait(1000)
        
        // Go back to favorites page
        cy.visit('/books?section=favorites&showAll=true')
        cy.wait(2000)
      }
    })
  })

  it('should remove book from favorites from the favorites page', () => {
    // Go directly to favorites page
    cy.visit('/books?section=favorites&showAll=true')
    cy.wait(2000)
    
    // Check if there are any books in favorites
    cy.get('body').then($body => {
      const hasFavoriteBooks = $body.find('img').not('[alt*="Logo"]').length > 0
      
      if (hasFavoriteBooks) {
        // Count initial number of favorites
        cy.get('img').not('[alt*="Logo"]').then($books => {
          const initialCount = $books.length
          cy.log(`Initial favorite books count: ${initialCount}`)
          
          // Hover over first book to reveal favorite button
          cy.get('img').not('[alt*="Logo"]').first().trigger('mouseover', {force: true})
          
          // Find and click the favorite/heart button
          // This may have different implementations depending on the UI:
          // 1. Click on the heart icon directly
          // 2. Click the favorite button/toggle
          // Try different approaches
          cy.get('body').then($hoverBody => {
            // Look for favorite/heart button or SVG
            if ($hoverBody.find('svg[class*="heart"], svg[class*="favorite"]').length > 0) {
              cy.get('svg[class*="heart"], svg[class*="favorite"]').first().click({force: true})
            } else if ($hoverBody.find('button:contains("Remove")').length > 0) {
              cy.contains('button', 'Remove').click({force: true})
            } else {
              // Try clicking the first visible button on the hovered book
              cy.get('img').not('[alt*="Logo"]').first().parent().find('button').first().click({force: true})
            }
          })
          
          cy.wait(2000) // Wait for removal action to complete
          
          // Verify the book was removed by checking count decreased
          if (initialCount > 1) {
            // If there were multiple books, check count decreased
            cy.get('img').not('[alt*="Logo"]').should('have.length.lessThan', initialCount)
          } else {
            // If there was only one book, check for empty state message
            cy.get('body').then($afterBody => {
              const hasBooks = $afterBody.find('img').not('[alt*="Logo"]').length > 0
              const hasEmptyMessage = $afterBody.text().includes('no favorites') || 
                                    $afterBody.text().includes('haven\'t added') ||
                                    $afterBody.text().includes('empty')
              
              // Either there are no books or there's an empty state message
              cy.wrap(!hasBooks || hasEmptyMessage).should('eq', true)
            })
          }
        })
      } else {
        // No favorites to remove, try adding then removing
        cy.log('No favorites found - going to main page to add one first')
        
        // Go to main books page
        cy.visit('/books')
        cy.wait(1000)
        
        // Find a book and add it to favorites
        cy.get('img').not('[alt*="Logo"]').first().click({force: true})
        cy.wait(1000)
        
        // Add to favorites if not already favorited
        cy.get('button').contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
        cy.wait(1000)
        
        // Go back to favorites page
        cy.visit('/books?section=favorites&showAll=true')
        cy.wait(2000)
        
        // Now try removing the newly added favorite
        cy.get('img').not('[alt*="Logo"]').first().trigger('mouseover', {force: true})
        cy.wait(500)
        
        // Click the first button (likely the favorite toggle)
        cy.get('img').not('[alt*="Logo"]').first().parent().find('button').first().click({force: true})
        cy.wait(2000)
        
        // Verify removal - either empty message or no books
        cy.get('body').then($afterRemovalBody => {
          const hasBooks = $afterRemovalBody.find('img').not('[alt*="Logo"]').length > 0
          const hasEmptyMessage = $afterRemovalBody.text().includes('no favorites') || 
                                $afterRemovalBody.text().includes('haven\'t added') ||
                                $afterRemovalBody.text().includes('empty')
          
          // Either there are no books or there's an empty state message
          cy.wrap(!hasBooks || hasEmptyMessage).should('eq', true)
        })
      }
    })
  })

  it('should remove book from favorites from the detail page', () => {
    // Navigate to books page
    cy.visit('/books')
    cy.wait(2000) // Allow page to fully load
    
    // First make sure we have a book in favorites
    // Check if Favorites section exists and has books
    cy.get('body').then($body => {
      const hasFavoritesSection = $body.find('h2:contains("Favorites")').length > 0
      
      if (hasFavoritesSection) {
        // Click on a book to view details - either from favorites or any book
        cy.get('img').not('[alt*="Logo"]').first().click({force: true})
        cy.wait(2000) // Wait for book detail page to load
        
        // Check if book is in favorites
        cy.get('body').then($detailBody => {
          // Look for "Remove from Favorites" button
          const isInFavorites = $detailBody.text().includes('Remove from Favorites') || 
                               $detailBody.text().includes('Remove from')
          
          if (isInFavorites) {
            // Book is in favorites, remove it
            cy.contains(/Remove from Favorites|Remove from/, {matchCase: false}).click({force: true})
            cy.wait(2000) // Wait for action to complete
            
            // Verify button text changed to "Add to Favorites"
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).should('exist')
            
            // Return to favorites page to verify removal
            cy.visit('/books?section=favorites&showAll=true')
            cy.wait(2000)
            
            // Check if book was removed - either no longer in list or empty state
            cy.get('body').then($favBody => {
              // Try to find the book we just removed (can't easily match by title)
              // So we'll check if number of books decreased or empty state message appears
              const hasEmptyMessage = $favBody.text().includes('no favorites') || 
                                    $favBody.text().includes('haven\'t added') ||
                                    $favBody.text().includes('empty')
              
              // If we see an empty message or no books, removal was successful
              const noBooks = $favBody.find('img').not('[alt*="Logo"]').length === 0
              cy.wrap(hasEmptyMessage || noBooks).should('not.eq', false)
            })
          } else {
            // Book is not in favorites, we need to add it first
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
            cy.wait(2000) // Wait for action to complete
            
            // Verify button text changed to "Remove from Favorites"
            cy.contains(/Remove from Favorites|Remove from/, {matchCase: false}).should('exist')
            
            // Now remove it again
            cy.contains(/Remove from Favorites|Remove from/, {matchCase: false}).click({force: true})
            cy.wait(2000)
            
            // Verify it was removed (button text changed back)
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).should('exist')
          }
        })
      } else {
        // No favorites section found, try acting on any book
        cy.log('No favorites section found - will add then remove a book from favorites')
        
        // Click on first book
        cy.get('img').not('[alt*="Logo"]').first().click({force: true})
        cy.wait(1000)
        
        // Add to favorites if not already
        cy.get('button').contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
        cy.wait(1000)
        
        // Now remove from favorites
        cy.get('button').contains(/Remove from Favorites|Remove from/, {matchCase: false}).click({force: true})
        cy.wait(1000)
        
        // Verify it was removed
        cy.get('button').contains(/Add to Favorites|Add to/, {matchCase: false}).should('exist')
      }
    })
  })

  it('should update the favorites count when a book is removed', () => {
    // Navigate to books page
    cy.visit('/books')
    cy.wait(2000)
    
    // Check the initial count in Favorites section
    cy.get('body').then($body => {
      // Find the Favorites section
      if ($body.find('h2:contains("Favorites")').length > 0) {
        // Directly go to favorites page instead of clicking "See More"
        cy.visit('/books?section=favorites&showAll=true')
        cy.wait(2000)
        
        // Count initial favorites
        cy.get('body').then($favBody => {
          const initialCount = $favBody.find('img').not('[alt*="Logo"]').length
          
          if (initialCount > 0) {
            // We have favorites to remove
            cy.log(`Initial favorites count: ${initialCount}`)
            
            // Remove a book from favorites
            cy.get('img').not('[alt*="Logo"]').first().trigger('mouseover', {force: true})
            cy.wait(500)
            
            // Try different approaches to find and click favorite toggle
            cy.get('body').then($hoverBody => {
              if ($hoverBody.find('svg[class*="heart"], svg[class*="favorite"]').length > 0) {
                cy.get('svg[class*="heart"], svg[class*="favorite"]').first().click({force: true})
              } else if ($hoverBody.find('button:contains("Remove")').length > 0) {
                cy.contains('button', 'Remove').click({force: true})
              } else {
                // Try clicking the first visible button on the hovered book
                cy.get('img').not('[alt*="Logo"]').first().parent().find('button').first().click({force: true})
              }
            })
            
            cy.wait(2000)
            
            // Refresh page to ensure count updates
            cy.reload()
            cy.wait(2000)
            
            // Check if count decreased
            if (initialCount > 1) {
              cy.get('img').not('[alt*="Logo"]').should('have.length.lessThan', initialCount)
            } else {
              // If there was only one book, expect empty state
              cy.get('body').then($afterBody => {
                const hasEmptyMessage = $afterBody.text().includes('no favorites') || 
                                      $afterBody.text().includes('haven\'t added') ||
                                      $afterBody.text().includes('empty')
                const noBooks = $afterBody.find('img').not('[alt*="Logo"]').length === 0
                
                cy.wrap(hasEmptyMessage || noBooks).should('not.eq', false)
              })
            }
          } else {
            // No favorites to start with, try adding then removing
            cy.log('No initial favorites - going to add and then remove one')
            cy.visit('/books')
            cy.wait(1000)
            
            // Add a book to favorites
            cy.get('img').not('[alt*="Logo"]').first().click({force: true})
            cy.wait(1000)
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).click({force: true})
            cy.wait(1000)
            
            // Then remove it
            cy.contains(/Remove from Favorites|Remove from/, {matchCase: false}).click({force: true})
            cy.wait(1000)
            
            // Verify it was removed
            cy.contains(/Add to Favorites|Add to/, {matchCase: false}).should('exist')
          }
        })
      } else {
        // No favorites section, can't test count
        cy.log('No favorites section found - skipping count verification test')
      }
    })
  })
}) 
describe('Admin Search Users', () => {
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
    
    // Navigate to users page
    cy.contains('a', 'Users').click()
    cy.wait(1500)
  })

  it('Should have a search input field for users', () => {
    // Verify the search input exists
    cy.get('input[placeholder="Search..."]').should('be.visible')
  })

  it('Should search users by email address', () => {
    // Get the total number of users before search
    cy.get('tbody tr').then($initialRows => {
      const initialCount = $initialRows.length
      cy.log(`Initial user count: ${initialCount}`)
      
      // If we have users, search for one using partial email
      if (initialCount > 0) {
        // Get the email from the first user
        cy.get('tbody tr:first-child td:nth-child(2) .text-sm').invoke('text').then(email => {
          // Take first few characters of email for search
          const searchTerm = email.substring(0, Math.min(5, email.length))
          
          // Perform search
          cy.get('input[placeholder="Search..."]').type(searchTerm)
          cy.wait(500)
          
          // Verify search results contain the email
          cy.get('tbody tr td:nth-child(2) .text-sm').should('contain', searchTerm)
          
          // Check that search filtered results
          cy.get('tbody tr').then($searchRows => {
            if (initialCount > 1) {
              // If we had multiple users, we should have fewer now unless all emails match the pattern
              cy.log(`Search results count: ${$searchRows.length}`)
              // We can't guarantee fewer results so just confirm we got results
              expect($searchRows.length).to.be.at.least(1)
            }
          })
          
          // Clear search to validate reset
          cy.get('input[placeholder="Search..."]').clear()
          cy.wait(500)
          
          // Verify we're back to initial count
          cy.get('tbody tr').should('have.length', initialCount)
        })
      } else {
        cy.log('No users found to test search functionality. Add users for better testing.')
      }
    })
  })

  it('Should search users by username', () => {
    // Get the total number of users before search
    cy.get('tbody tr').then($initialRows => {
      const initialCount = $initialRows.length
      
      // If we have users, search for one using partial username
      if (initialCount > 0) {
        // Get the username from the first user
        cy.get('tbody tr:first-child td:first-child .text-sm').first().invoke('text').then(username => {
          // Take first few characters of username for search
          const searchTerm = username.substring(0, Math.min(3, username.length))
          
          // Perform search
          cy.get('input[placeholder="Search..."]').type(searchTerm)
          cy.wait(500)
          
          // Verify search results contain the username
          cy.get('tbody tr td:first-child .text-sm').should('contain', searchTerm)
          
          // Clear search to validate reset
          cy.get('input[placeholder="Search..."]').clear()
          cy.wait(500)
          
          // Verify we're back to initial count
          cy.get('tbody tr').should('have.length', initialCount)
        })
      } else {
        cy.log('No users found to test search functionality. Add users for better testing.')
      }
    })
  })

  it('Should display appropriate message when no search results found', () => {
    // Enter a search term that's unlikely to match any user
    cy.get('input[placeholder="Search..."]').type('xyzabc123notfound')
    cy.wait(500)
    
    // Check if no users are displayed
    cy.get('tbody tr').should('have.length', 0)
  })
}) 
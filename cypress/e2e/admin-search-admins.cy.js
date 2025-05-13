describe('Admin Search Admins', () => {
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
    
    // Select admin filter to only show admins
    cy.get('select').select('admin')
    cy.wait(500)
  })

  it('Should filter and show only admin accounts', () => {
    // Check that all displayed users are admins
    cy.get('tbody tr').each($row => {
      cy.wrap($row).find('td:first-child .text-xs').should('contain', 'admin')
    })
  })

  it('Should search admins by email address', () => {
    // Get the total number of admins before search
    cy.get('tbody tr').then($initialRows => {
      const initialCount = $initialRows.length
      
      // If we have admins, search for one using partial email
      if (initialCount > 0) {
        // Get the email from the first admin
        cy.get('tbody tr:first-child td:nth-child(2) .text-sm').invoke('text').then(email => {
          // Take first few characters of email for search
          const searchTerm = email.substring(0, Math.min(5, email.length))
          
          // Perform search
          cy.get('input[placeholder="Search..."]').type(searchTerm)
          cy.wait(500)
          
          // Verify search results contain the email and are still admins
          cy.get('tbody tr').should('have.length.at.least', 1)
          cy.get('tbody tr td:nth-child(2) .text-sm').should('contain', searchTerm)
          cy.get('tbody tr td:first-child .text-xs').should('contain', 'admin')
          
          // Clear search to validate reset
          cy.get('input[placeholder="Search..."]').clear()
          cy.wait(500)
          
          // Verify we're back to initial count
          cy.get('tbody tr').should('have.length', initialCount)
        })
      } else {
        cy.log('No admin accounts found to test search functionality. Add admin users for better testing.')
      }
    })
  })

  it('Should search admins by username', () => {
    // Get the total number of admins before search
    cy.get('tbody tr').then($initialRows => {
      const initialCount = $initialRows.length
      
      // If we have admins, search for one using partial username
      if (initialCount > 0) {
        // Get the username from the first admin
        cy.get('tbody tr:first-child td:first-child .text-sm').first().invoke('text').then(username => {
          // Take first few characters of username for search
          const searchTerm = username.substring(0, Math.min(3, username.length))
          
          // Perform search
          cy.get('input[placeholder="Search..."]').type(searchTerm)
          cy.wait(500)
          
          // Verify search results contain the username and are still admins
          cy.get('tbody tr').should('have.length.at.least', 1)
          cy.get('tbody tr td:first-child .text-sm').should('contain', searchTerm)
          cy.get('tbody tr td:first-child .text-xs').should('contain', 'admin')
          
          // Clear search to validate reset
          cy.get('input[placeholder="Search..."]').clear()
          cy.wait(500)
          
          // Verify we're back to initial count
          cy.get('tbody tr').should('have.length', initialCount)
        })
      } else {
        cy.log('No admin accounts found to test search functionality. Add admin users for better testing.')
      }
    })
  })

  it('Should display appropriate message when no admin search results found', () => {
    // Enter a search term that's unlikely to match any admin
    cy.get('input[placeholder="Search..."]').type('xyzabc123notfound')
    cy.wait(500)
    
    // Check if no admins are displayed
    cy.get('tbody tr').should('have.length', 0)
  })

  it('Should keep admin filter active when searching', () => {
    // Get the total number of admins before search
    cy.get('tbody tr').then($rows => {
      if ($rows.length > 0) {
        // First, verify we're in admin filter mode
        cy.get('select').should('have.value', 'admin')
        
        // Perform search with a common term likely to match some users
        cy.get('input[placeholder="Search..."]').type('a')
        cy.wait(500)
        
        // Verify all results are still admins
        cy.get('tbody tr').each($row => {
          cy.wrap($row).find('td:first-child .text-xs').should('contain', 'admin')
        })
        
        // Clear search
        cy.get('input[placeholder="Search..."]').clear()
        cy.wait(500)
        
        // Verify filter is still set to admin
        cy.get('select').should('have.value', 'admin')
      } else {
        cy.log('No admin accounts found to test search functionality. Add admin users for better testing.')
      }
    })
  })
}) 
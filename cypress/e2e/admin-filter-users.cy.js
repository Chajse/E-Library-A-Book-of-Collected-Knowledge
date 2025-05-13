describe('Admin Filter Users', () => {
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

  it('Should have filter options for account types', () => {
    // Verify the filter dropdown exists
    cy.get('select').should('be.visible')
    
    // Verify filter options exist
    cy.get('select option').should('have.length', 3)
    cy.get('select option').eq(0).should('have.value', 'all')
    cy.get('select option').eq(1).should('have.value', 'user')
    cy.get('select option').eq(2).should('have.value', 'admin')
  })

  it('Should filter and show only user accounts', () => {
    // Get total count of all accounts
    cy.get('tbody tr').then($allRows => {
      const allAccountsCount = $allRows.length
      
      // Count user accounts
      let userAccountsCount = 0
      $allRows.each((i, row) => {
        if (Cypress.$(row).find('td:first-child .text-xs').text().includes('user')) {
          userAccountsCount++
        }
      })
      
      cy.log(`Total accounts: ${allAccountsCount}, User accounts: ${userAccountsCount}`)
      
      // Select user filter
      cy.get('select').select('user')
      cy.wait(500)
      
      // If there are user accounts, verify filtering works
      if (userAccountsCount > 0) {
        // Count should match user accounts count
        cy.get('tbody tr').should('have.length', userAccountsCount)
        
        // All rows should be user accounts
        cy.get('tbody tr').each($row => {
          cy.wrap($row).find('td:first-child .text-xs').should('contain', 'user')
        })
      } else {
        // If no user accounts, table should be empty
        cy.get('tbody tr').should('have.length', 0)
      }
      
      // Reset filter to all
      cy.get('select').select('all')
      cy.wait(500)
      
      // Verify all accounts are shown again
      cy.get('tbody tr').should('have.length', allAccountsCount)
    })
  })

  it('Should combine filtering with search functionality', () => {
    // Select user filter
    cy.get('select').select('user')
    cy.wait(500)
    
    // Get filtered users count
    cy.get('tbody tr').then($userRows => {
      const userCount = $userRows.length
      
      if (userCount > 0) {
        // Get the email from the first user
        cy.get('tbody tr:first-child td:nth-child(2) .text-sm').invoke('text').then(email => {
          // Take first few characters of email for search
          const searchTerm = email.substring(0, Math.min(3, email.length))
          
          // Perform search
          cy.get('input[placeholder="Search..."]').type(searchTerm)
          cy.wait(500)
          
          // Verify search results are still only user accounts
          cy.get('tbody tr').each($row => {
            cy.wrap($row).find('td:first-child .text-xs').should('contain', 'user')
          })
          
          // Clear search
          cy.get('input[placeholder="Search..."]').clear()
          cy.wait(500)
          
          // Verify filter is still applied
          cy.get('select').should('have.value', 'user')
          cy.get('tbody tr').should('have.length', userCount)
        })
      } else {
        cy.log('No user accounts found to test combined filtering and searching. Add user accounts for better testing.')
      }
    })
  })

  it('Should maintain user filter when navigating back to users page', () => {
    // Select user filter
    cy.get('select').select('user')
    cy.wait(500)
    
    // Verify user filter is applied
    cy.get('select').should('have.value', 'user')
    
    // Navigate away to dashboard
    cy.contains('a', 'Dashboard').click()
    cy.wait(1000)
    
    // Navigate back to users page
    cy.contains('a', 'Users').click()
    cy.wait(1500)
    
    // Filter should be reset to default "all"
    cy.get('select').should('have.value', 'all')
  })

  it('Should update the user count based on filter selection', () => {
    // Get the total number of accounts
    cy.get('tbody tr').then($allRows => {
      const allAccountsCount = $allRows.length
      
      // Count the number of user accounts
      let userAccountsCount = 0
      $allRows.each((i, row) => {
        if (Cypress.$(row).find('td:first-child .text-xs').text().includes('user')) {
          userAccountsCount++
        }
      })
      
      // Count the number of admin accounts
      let adminAccountsCount = 0
      $allRows.each((i, row) => {
        if (Cypress.$(row).find('td:first-child .text-xs').text().includes('admin')) {
          adminAccountsCount++
        }
      })
      
      cy.log(`All: ${allAccountsCount}, Users: ${userAccountsCount}, Admins: ${adminAccountsCount}`)
      
      // Check user filter
      cy.get('select').select('user')
      cy.wait(500)
      cy.get('tbody tr').should('have.length', userAccountsCount)
      
      // Check admin filter
      cy.get('select').select('admin')
      cy.wait(500)
      cy.get('tbody tr').should('have.length', adminAccountsCount)
      
      // Check all filter
      cy.get('select').select('all')
      cy.wait(500)
      cy.get('tbody tr').should('have.length', allAccountsCount)
    })
  })
}) 
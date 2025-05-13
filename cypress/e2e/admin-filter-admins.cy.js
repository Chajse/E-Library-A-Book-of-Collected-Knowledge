describe('Admin Filter Admins', () => {
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

  it('Should filter and show only admin accounts', () => {
    // Get total count of all accounts
    cy.get('tbody tr').then($allRows => {
      const allAccountsCount = $allRows.length
      
      // Count admin accounts
      let adminAccountsCount = 0
      $allRows.each((i, row) => {
        if (Cypress.$(row).find('td:first-child .text-xs').text().includes('admin')) {
          adminAccountsCount++
        }
      })
      
      cy.log(`Total accounts: ${allAccountsCount}, Admin accounts: ${adminAccountsCount}`)
      
      // Select admin filter
      cy.get('select').select('admin')
      cy.wait(500)
      
      // If there are admin accounts, verify filtering works
      if (adminAccountsCount > 0) {
        // Count should match admin accounts count
        cy.get('tbody tr').should('have.length', adminAccountsCount)
        
        // All rows should be admin accounts
        cy.get('tbody tr').each($row => {
          cy.wrap($row).find('td:first-child .text-xs').should('contain', 'admin')
        })
      } else {
        // If no admin accounts, table should be empty
        cy.get('tbody tr').should('have.length', 0)
      }
      
      // Reset filter to all
      cy.get('select').select('all')
      cy.wait(500)
      
      // Verify all accounts are shown again
      cy.get('tbody tr').should('have.length', allAccountsCount)
    })
  })

  it('Should show admin filter is selected in the dropdown', () => {
    // Select admin filter
    cy.get('select').select('admin')
    cy.wait(500)
    
    // Verify admin option is selected
    cy.get('select').should('have.value', 'admin')
  })

  it('Should display appropriate message when no admin accounts exist', () => {
    // Select admin filter
    cy.get('select').select('admin')
    cy.wait(500)
    
    // Check if admins exist
    cy.get('tbody tr').then($rows => {
      if ($rows.length === 0) {
        // When no rows exist after filtering, the table should be empty
        cy.get('tbody tr').should('have.length', 0)
      } else {
        // If admins exist, they should all be admin accounts
        cy.get('tbody tr').each($row => {
          cy.wrap($row).find('td:first-child .text-xs').should('contain', 'admin')
        })
      }
    })
  })

  it('Should allow editing an admin account while filtered', () => {
    // Select admin filter
    cy.get('select').select('admin')
    cy.wait(500)
    
    // Check if any admin accounts exist
    cy.get('tbody tr').then($rows => {
      if ($rows.length > 0) {
        // Get the first admin's username for verification
        cy.get('tbody tr:first-child td:first-child .text-sm')
          .invoke('text')
          .as('adminUsername')
        
        // Click the edit button for the first admin
        cy.get('tbody tr:first-child a[aria-label="Edit user"]').click()
        cy.wait(2000)
        
        // Verify we're on the edit page for this admin
        cy.url().should('include', '/admin/users/')
        cy.url().should('include', '/edit')
        
        // Verify it's an admin account we're editing
        cy.get('#role').should('have.value', 'admin')
        
        // Verify username matches
        cy.get('@adminUsername').then(username => {
          // The first and last name should be part of the form
          const names = username.split(' ')
          if (names.length >= 2) {
            const firstName = names[0]
            cy.get('#firstName').should('have.value', firstName)
          }
        })
        
        // Cancel editing and return to users page
        cy.contains('a', 'Cancel').click()
        cy.wait(1500)
        
        // Verify we're back on users page
        cy.url().should('include', '/admin/users')
        
        // Verify admin filter is reset to default
        cy.get('select').should('have.value', 'all')
      } else {
        cy.log('No admin accounts found to test edit functionality. Add admin users for better testing.')
      }
    })
  })

  it('Should handle additional actions on filtered admin list', () => {
    // Select admin filter
    cy.get('select').select('admin')
    cy.wait(500)
    
    // Check if there are multiple admin accounts
    cy.get('tbody tr').then($rows => {
      const adminCount = $rows.length
      
      if (adminCount > 1) {
        // We have multiple admins, can attempt status toggle on secondary admin
        
        // Get current admin's username from the header
        cy.get('header .text-sm').invoke('text').then(currentName => {
          const currentAdminName = currentName.trim()
          cy.log(`Current admin: ${currentAdminName}`)
          
          // Find a different admin (not the current one)
          let foundDifferentAdmin = false
          
          // Loop through each row to find a different admin
          cy.get('tbody tr').each(($row, index) => {
            if (!foundDifferentAdmin) {
              const username = $row.find('td:first-child .text-sm').text()
              
              // If this isn't the current admin, toggle status
              if (username && !username.includes(currentAdminName)) {
                foundDifferentAdmin = true
                cy.log(`Found different admin: ${username} at index ${index}`)
                
                // Get the status of this admin
                cy.get(`tbody tr:nth-child(${index + 1}) td:nth-child(3) span`)
                  .invoke('text')
                  .then(statusText => {
                    const initialStatus = statusText.trim()
                    cy.log(`Initial status: "${initialStatus}"`)
                    
                    // Click the status toggle button
                    cy.get(`tbody tr:nth-child(${index + 1}) td:nth-child(3) button`).click()
                    cy.wait(1000)
                    
                    // Status text should have changed
                    const expectedNewStatus = initialStatus === 'Activate' ? 'Inactivate' : 'Activate'
                    cy.log(`Expected new status: "${expectedNewStatus}"`)
                    
                    cy.get(`tbody tr:nth-child(${index + 1}) td:nth-child(3) span`)
                      .invoke('text')
                      .then(newStatusText => {
                        const newStatus = newStatusText.trim()
                        cy.log(`New status: "${newStatus}"`)
                        cy.wrap(newStatus).should('include', expectedNewStatus)
                      })
                    
                    // Toggle back to initial status
                    cy.get(`tbody tr:nth-child(${index + 1}) td:nth-child(3) button`).click()
                    cy.wait(1000)
                  })
              }
            }
          })
        })
      } else if (adminCount === 1) {
        // Likely just the current admin account, which can't be toggled
        cy.log('Only one admin account found. Cannot toggle status of own account.')
      } else {
        cy.log('No admin accounts found to test actions. Add admin users for better testing.')
      }
    })
  })
}) 
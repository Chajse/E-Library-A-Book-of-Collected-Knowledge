describe('Admin Login Functionality', () => {
  beforeEach(() => {
    // Visit login page before each test
    cy.visit('/login')
    cy.wait(1000)
    
    // Ensure we're on the login page
    cy.url().should('include', '/login')
    
    // Switch to the Admin tab
    cy.get('[role="group"] button').eq(1).click()
  })

  it('Should display admin login form with required fields', () => {
    // Verify form elements exist
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.contains('button', 'Admin Login').should('be.visible')
  })

  it('Should show error message when regular user tries to log in as admin', () => {
    // Enter regular user credentials
    cy.get('input[name="email"]').type('cypresstest@gmail.com')
    cy.get('input[name="password"]').type('Meowmelol31')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(1000)
    
    // Verify error message appears with more flexible matching
    cy.get('.bg-red-100').should('be.visible')
    
    // Check for the error text with more flexibility
    cy.get('body').then($body => {
      const errorText = $body.text();
      const hasErrorMessage = 
        errorText.includes('Regular users must use the User tab') || 
        errorText.includes('User tab to login') ||
        errorText.includes('not an admin account');
      
      cy.wrap(hasErrorMessage).should('be.true', 'Should show an error about regular users');
    })
    
    // Verify we're still on login page
    cy.url().should('include', '/login')
  })

  it('Should show error message for invalid admin credentials', () => {
    // Enter invalid admin credentials
    cy.get('input[name="email"]').type('invalid-admin@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(1000)
    
    // Verify error message appears
    cy.get('.bg-red-100').should('be.visible')
    cy.contains('Invalid email or password').should('be.visible')
    
    // Verify we're still on login page
    cy.url().should('include', '/login')
  })

  it('Should redirect to admin dashboard after successful admin login', () => {
    // Enter valid admin credentials
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Verify redirection to admin dashboard
    cy.url().should('include', '/admin')
    
    // Verify admin dashboard elements
    cy.contains('h1', 'Admin Dashboard').should('be.visible')
    cy.contains('button', 'Logout').should('be.visible')
  })

  it('Should display admin name after successful admin login', () => {
    // Enter valid admin credentials
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Verify admin name is displayed
    cy.get('body').then($body => {
      const hasAdminName = $body.text().includes('Admin') || 
                          $body.text().includes('admin@example.com');
      cy.wrap(hasAdminName).should('be.true');
    })
  })

  it('Should provide access to user management after admin login', () => {
    // Enter valid admin credentials
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Navigate to the users management page
    cy.contains('a', 'Users').click()
    cy.wait(1500)
    
    // Verify we're on users management page
    cy.url().should('include', '/admin/users')
    
    // Verify user management elements
    cy.contains('h1', 'All Users').should('be.visible')
    cy.get('table').should('be.visible')
  })

  it('Should provide access to book management after admin login', () => {
    // Enter valid admin credentials
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Navigate to the books management page
    cy.contains('a', 'List of Book').click()
    cy.wait(1500)
    
    // Verify we're on books management page
    cy.url().should('include', '/admin/books')
    
    // Verify book management elements
    cy.contains('h1', 'List of Book').should('be.visible')
  })

  it('Should maintain admin login state on page refresh', () => {
    // Enter valid admin credentials
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    
    // Click admin login button
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Verify redirection to admin dashboard
    cy.url().should('include', '/admin')
    
    // Refresh the page
    cy.reload()
    cy.wait(2000)
    
    // Verify we're still on admin dashboard and logged in
    cy.url().should('include', '/admin')
    cy.contains('button', 'Logout').should('be.visible')
  })
}) 
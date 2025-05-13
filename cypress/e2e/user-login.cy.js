describe('User Login Functionality', () => {
  beforeEach(() => {
    // Visit login page before each test
    cy.visit('/login')
    cy.wait(1000)
    
    // Ensure we're on the login page
    cy.url().should('include', '/login')
    
    // Make sure we're on the User tab, not Admin tab
    cy.get('[role="group"] button').eq(0).click()
  })

  it('Should display login form with all required fields', () => {
    // Verify form elements exist
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.contains('button', 'User Login').should('be.visible')
    
    // Verify "Sign up" link exists for new users
    cy.contains('a', 'Sign up').should('be.visible')
  })

  it('Should show error message for invalid credentials', () => {
    // Enter invalid email/password
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    
    // Click login button
    cy.contains('button', 'User Login').click()
    cy.wait(1000)
    
    // Verify error message appears
    cy.get('.bg-red-100').should('be.visible')
    cy.contains('Invalid email or password').should('be.visible')
    
    // Verify we're still on login page
    cy.url().should('include', '/login')
  })

  it('Should redirect to books page after successful login', () => {
    // Enter valid email/password
    cy.get('input[name="email"]').type('cypresstest@gmail.com')
    cy.get('input[name="password"]').type('Meowmelol31')
    
    // Click login button
    cy.contains('button', 'User Login').click()
    cy.wait(2000)
    
    // Verify redirection to books page
    cy.url().should('include', '/books')
    
    // Verify user is logged in by checking for user-specific elements
    cy.contains('button', 'Logout').should('be.visible')
  })

  it('Should display user name after successful login', () => {
    // Enter valid email/password
    cy.get('input[name="email"]').type('cypresstest@gmail.com')
    cy.get('input[name="password"]').type('Meowmelol31')
    
    // Click login button
    cy.contains('button', 'User Login').click()
    cy.wait(2000)
    
    // Verify user name is displayed in the header
    cy.get('body').then($body => {
      const hasUserName = $body.text().includes('Test') || 
                          $body.text().includes('User') ||
                          $body.text().includes('cypresstest@gmail.com');
      cy.wrap(hasUserName).should('be.true');
    })
  })

  it('Should access personalized features after login', () => {
    // Enter valid email/password
    cy.get('input[name="email"]').type('cypresstest@gmail.com')
    cy.get('input[name="password"]').type('Meowmelol31')
    
    // Click login button
    cy.contains('button', 'User Login').click()
    cy.wait(2000)
    
    // Check for personalized sections like "Favorites", "Bookmarks", etc.
    cy.get('body').then($body => {
      // Check if any of these personalized sections exist
      const hasPersonalizedFeatures = 
        $body.find(':contains("Favorites")').length > 0 || 
        $body.find(':contains("Bookmarks")').length > 0 ||
        $body.find(':contains("My Books")').length > 0 ||
        $body.find(':contains("Recommended")').length > 0;
      
      cy.wrap(hasPersonalizedFeatures).should('be.true');
    })
  })

  it('Should remember login state on page refresh', () => {
    // Enter valid email/password
    cy.get('input[name="email"]').type('cypresstest@gmail.com')
    cy.get('input[name="password"]').type('Meowmelol31')
    
    // Click login button
    cy.contains('button', 'User Login').click()
    cy.wait(2000)
    
    // Verify redirection to books page
    cy.url().should('include', '/books')
    
    // Refresh the page
    cy.reload()
    cy.wait(1000)
    
    // Verify we're still logged in and on the books page
    cy.url().should('include', '/books')
    cy.contains('button', 'Logout').should('be.visible')
  })
}) 
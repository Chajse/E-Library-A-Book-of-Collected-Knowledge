describe('User Logout Functionality', () => {
  beforeEach(() => {
    // Login as a regular user before each test
    cy.visit('/login')
    cy.wait(1000)
    
    // Enter user credentials
    cy.get('input:visible').eq(0).type('cypresstest@gmail.com', {force: true})
    cy.get('input:visible').eq(1).type('Meowmelol31', {force: true})
    cy.contains('button', 'User Login').click()
    cy.wait(2000)
    
    // Verify we're on books page (user dashboard)
    cy.url().should('include', '/books')
  })

  it('Should have a visible logout button', () => {
    // Check if logout button is visible in the header
    cy.contains('button', 'Logout').should('be.visible')
  })

  it('Should successfully log out when logout button is clicked', () => {
    // Click the logout button
    cy.contains('button', 'Logout').click()
    cy.wait(1000)
    
    // After logout, we should be redirected to login page
    cy.url().should('include', '/login')
    
    // Login form should be visible
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
  })

  it('Should prevent access to protected pages after logout', () => {
    // First logout
    cy.contains('button', 'Logout').click()
    cy.wait(1000)
    
    // Try to access protected books page directly
    cy.visit('/books')
    cy.wait(1000)
    
    // Should be redirected to login page
    cy.url().should('include', '/login')
    
    // Should not see protected content
    cy.contains('h1', 'E-Library Admin').should('not.exist')
    cy.contains('button', 'Logout').should('not.exist')
  })

  it('Should maintain logout state after browser refresh', () => {
    // Log the user out
    cy.contains('button', 'Logout').click()
    cy.wait(1000)
    
    // Verify redirection to login page
    cy.url().should('include', '/login')
    
    // Refresh the browser
    cy.reload()
    cy.wait(1000)
    
    // Still should be on login page, not automatically logged back in
    cy.url().should('include', '/login')
    cy.get('input[name="email"]').should('be.visible')
  })

  it('Should show login option after logout', () => {
    // Log the user out
    cy.contains('button', 'Logout').click()
    cy.wait(1000)
    
    // Verify we're on the login page
    cy.url().should('include', '/login')
    
    // Check if login options are available
    cy.contains('button', 'User Login').should('be.visible')
    
    // Check if there's also a register link
    cy.contains('a', 'Sign up').should('be.visible')
  })
}) 
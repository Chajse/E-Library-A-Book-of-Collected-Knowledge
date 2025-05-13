// Login command
Cypress.Commands.add('login', (email = 'user@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  
  // Determine which login button to click based on email
  if (email === 'admin@example.com') {
    cy.contains('button', 'Admin Login').click()
  } else {
    cy.contains('button', 'User Login').click()
  }
  
  // Wait for redirection
  cy.url().should('not.include', '/login')
})

// Add book to favorites
Cypress.Commands.add('addBookToFavorites', (index = 0) => {
  cy.visit('/books')
  cy.get('.grid-cols-2 .relative.group').eq(index).within(() => {
    cy.get('div').trigger('mouseenter')
    cy.get('svg').first().parent().click({force: true})
  })
}) 
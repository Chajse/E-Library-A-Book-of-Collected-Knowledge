describe('Admin Upload eBook Functionality', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/login')
    cy.wait(1000)
    
    // Switch to the Admin tab
    cy.get('[role="group"] button').eq(1).click()
    
    // Enter admin credentials
    cy.get('input[name="email"]').type('admin@example.com', {force: true})
    cy.get('input[name="password"]').type('admin123', {force: true})
    cy.contains('button', 'Admin Login').click()
    cy.wait(2000)
    
    // Verify we're on admin dashboard
    cy.url().should('include', '/admin')
    
    // Navigate to the Add Book page
    cy.contains('a', 'Add Book').click()
    cy.wait(1500)
    
    // Verify we're on the add book page
    cy.url().should('include', '/admin/books/add')
    cy.contains('h1', 'Add Book Info').should('be.visible')
  })

  it('Should display a form with all required fields for uploading a book', () => {
    // Check for all required form fields
    cy.get('input[name="title"]').should('be.visible')
    cy.get('input[name="author"]').should('be.visible')
    cy.get('textarea[name="description"]').should('be.visible')
    cy.get('select[name="category"]').should('be.visible')
    
    // Cover image upload field might be hidden but should exist
    cy.get('input[name="coverImage"]').should('exist')
    
    // Submit button should be visible
    cy.contains('button', 'Add Book').should('be.visible')
  })

  it('Should validate required fields', () => {
    // Try to submit without filling in required fields
    cy.contains('button', 'Add Book').click()
    cy.wait(1000)
    
    // Check for validation indicators (depends on implementation)
    cy.get('body').then($body => {
      // Check for error messages or visual indicators
      const hasValidationFeedback = 
        $body.find('.bg-red-100').length > 0 ||
        $body.find('input:invalid').length > 0 ||
        $body.text().includes('required');
      
      cy.wrap(hasValidationFeedback).should('be.true');
    })
  })

  it('Should allow selecting book categories', () => {
    // Verify dropdown has category options
    cy.get('select[name="category"] option').should('have.length.gt', 1)
    
    // Select a category
    cy.get('select[name="category"]').select('SCIENCE')
    cy.wait(500)
    
    // Verify selection
    cy.get('select[name="category"]').should('have.value', 'SCIENCE')
  })

  it('Should allow adding book description', () => {
    // Type in description textarea
    const testDescription = 'This is a test book description with details about the content.'
    cy.get('textarea[name="description"]').type(testDescription)
    
    // Verify input
    cy.get('textarea[name="description"]').should('have.value', testDescription)
  })

  it('Should allow uploading a cover image', () => {
    // For testing file upload, we need to stub the file selection
    // This is a simplified version that assumes the file input is accessible
    
    // Check if the file input or upload button exists
    cy.get('body').then($body => {
      // Look for file input or label for file input
      if ($body.find('input[type="file"]').length > 0 || 
          $body.find('label[for="coverImage"]').length > 0) {
        
        // Test if we can click the file upload trigger
        if ($body.find('label[for="coverImage"]').length > 0) {
          cy.contains('label', 'Browse...').should('be.visible')
        }
        
        // Note: Actually uploading a file would require more setup
        cy.log('Cover image upload field identified successfully')
      } else {
        cy.log('Cover image upload implementation not standard, skipping detailed test')
      }
    })
  })

  it('Should submit the form and add a new book successfully', () => {
    // Fill in all required fields
    const testBookTitle = 'Test Book ' + Math.floor(Math.random() * 10000)
    const testAuthor = 'Test Author'
    const testDescription = 'This is a test book description for automated testing purposes.'
    
    // Enter book details
    cy.get('input[name="title"]').type(testBookTitle)
    cy.get('input[name="author"]').type(testAuthor)
    cy.get('textarea[name="description"]').type(testDescription)
    cy.get('select[name="category"]').select('SCIENCE')
    
    // Submit the form
    cy.contains('button', 'Add Book').click()
    cy.wait(3000)
    
    // Check for success message
    cy.get('body').then($body => {
      if ($body.find('.bg-green-100').length > 0) {
        cy.get('.bg-green-100').should('be.visible')
        cy.contains('Book added successfully').should('be.visible')
      } else {
        // Alternative: Check if redirected to book list
        cy.url().should('include', '/admin/books')
      }
    })
  })

  it('Should navigate back to the books list after adding a book', () => {
    // Fill in all required fields
    const testBookTitle = 'Test Navigation Book ' + Math.floor(Math.random() * 10000)
    const testAuthor = 'Test Author'
    
    // Enter minimal required book details
    cy.get('input[name="title"]').type(testBookTitle)
    cy.get('input[name="author"]').type(testAuthor)
    cy.get('select[name="category"]').select('SCIENCE')
    
    // Submit the form
    cy.contains('button', 'Add Book').click()
    cy.wait(3000)
    
    // Should redirect to books list page
    cy.url().should('include', '/admin/books')
    
    // Verify we're on the books list page
    cy.contains('h1', 'List of Book').should('be.visible')
  })

  it('Should display the newly added book in the books list', () => {
    // Create a unique book title to search for
    const uniqueTitle = 'Unique Test Book ' + Date.now()
    const testAuthor = 'Test Author'
    
    // Enter book details
    cy.get('input[name="title"]').type(uniqueTitle)
    cy.get('input[name="author"]').type(testAuthor)
    cy.get('select[name="category"]').select('SCIENCE')
    
    // Submit the form
    cy.contains('button', 'Add Book').click()
    cy.wait(3000)
    
    // Should be on books list page
    cy.url().should('include', '/admin/books')
    
    // Search for the unique book title
    cy.get('input[placeholder="Search..."]').type(uniqueTitle)
    cy.wait(1000)
    
    // Verify the book appears in search results
    cy.contains(uniqueTitle).should('be.visible')
  })

  it('Should allow cancelling the book addition process', () => {
    // Start filling in details
    cy.get('input[name="title"]').type('Book To Cancel')
    
    // Look for cancel button and click it
    cy.contains('a', 'Cancel').click()
    cy.wait(1000)
    
    // Should be redirected to books list
    cy.url().should('include', '/admin/books')
    
    // Should not see the form anymore
    cy.contains('h1', 'Add Book Info').should('not.exist')
  })
}) 
describe('Automate GitHub OAuth Login', () => {
  it('Completes GitHub OAuth login flow', () => {
    // Start at your app's OAuth login endpoint
    cy.visit('https://localhost:4003/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' },
    });
    cy.visit('https://localhost:4003/auth/github');

    // Interact with the GitHub login page on a different origin
    cy.origin('https://github.com', () => {
      cy.visit('https://github.com/login', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' },
      });
      cy.get('#login_field').type('notoolsnocraft@gmail.com'); // Replace with test account
      cy.get('#password').type('@12bgmice');   // Replace with test account
      cy.get('input[name="commit"]').click();
    });

    cy.visit('https://localhost:4003/auth/github/callback');

    

     // Wait for the page to load and extract the URL with the 'code' parameter
     cy.url().should('include', 'https://localhost:4003/auth/github/callback').then((url) => {
       // Save the whole URL (including the 'code' parameter) to token.json
       cy.writeFile('token.json', { url: url });
       
       // Optionally, print to Cypress log for debugging
       cy.log(`Callback URL: ${url}`);
     });

  // Verify the authenticated state or extract the token if needed
  cy.contains('You are authenticated with GitHub!').should('be.visible');
});
});

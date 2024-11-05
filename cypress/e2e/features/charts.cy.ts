describe('these tests are for the charts', () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000");
        // Open the settings modal before each test
        cy.get('[data-testid="price-chart-USDC"]').click();
        cy.url().should('include', '/chart/usdc');
      });

    it('should load chart on init', () => {
        cy.intercept(
            "GET",
            `api/fetch-ohlc?id=usd-coin&date=7`
          ).as("apiCall");
          cy.wait("@apiCall");
        cy.get('[data-testid="chart-container"]'). should('be.visible')
    })
})
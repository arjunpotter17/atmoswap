const intervals = ['24H', '1W', '1M', '1Y'];

describe('these tests are for the charts', () => {
  
    //check chart renders before each test iteration
    beforeEach(() => {
      cy.intercept(
        "GET",
        /\/api\/fetch-ohlc\?id=usd-coin&date=\d+/ // regex to match multiple datez
      ).as("apiCall");
        cy.visit("http://localhost:3000");
        cy.get('[data-testid="price-chart-USDC"]').click();
        cy.url().should('include', '/chart/usdc');
      });

    it('should load chart on init', () => {
          cy.wait("@apiCall");
        // cy.get('[data-testid="chart-container"]'). should('be.visible')
    })

    intervals.map(interval => (
      it(`should make another API call on changing view interval to ${interval}`, () => {
        cy.get(`[data-testid="view-${interval}"]`).click();
          cy.wait("@apiCall");
        cy.get('[data-testid="chart-container"]'). should('be.visible')
    })
    ))

    it('should take me back to swap interface on clicking back', () => {
      cy.get('[data-testid="chart-back"]').click();
      cy.url().should('not.include', '/chart/usdc');
    }) 
    
})
describe("routes", () => {
  it("check if route modal opens", () => {
    const params = `?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=50000000&slippageBps=50`;

    cy.intercept("GET", `https://quote-api.jup.ag/v6/quote${params}`).as(
      "fetchOutput"
    );
    cy.visit("http://localhost:3000");
    cy.get('[data-testid="inputA"]').clear().type("50");

    cy.wait("@fetchOutput").then(() => {
      cy.get('[data-testid="route-info-button"]').click();
      cy.get('[data-testid="route-modal"]').should("be.visible");
    });
  });
});

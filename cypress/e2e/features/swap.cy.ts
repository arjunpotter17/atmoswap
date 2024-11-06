//this test suite is for the swap button

describe("tests for swap process", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  //click swap button and check if error modal pops up
  it("click swap button when no wallet", () => {
    cy.get('[data-testid="swap-button"]').click();
    cy.contains("#wallet-disconnect", "Please connect your wallet first");
  });

  //click swap button after wallet connect and check for input errors
  it("click swap button after wallet connect", () => {
    //this should add a mock keypair to ensure that wallet is connected
    cy.get('[data-testid="wallet-button"]').click();
    cy.get(".wallet-adapter-modal-wrapper")
      .should("be.visible")
      .within(() => {
        cy.get(".wallet-adapter-button")
          .should("be.visible")
          .click({ multiple: true });
      });

    cy.get('[data-testid="swap-button"]').click();
    cy.contains("#input-error", "Please enter details to swap");
  });

  //connect to wallet and then click swap button to see if loading swap appears
  it("click wallet connect button and then swap", () => {
    const params = `?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=50000000&slippageBps=50`;
    cy.intercept("GET", `https://quote-api.jup.ag/v6/quote${params}`).as(
      "fetchValue"
    );

    //this should add a mock key to ensure that wallet is connected
    cy.get('[data-testid="wallet-button"]').click();

    cy.get(".wallet-adapter-modal-wrapper")
      .should("be.visible")
      .within(() => {
        cy.get(".wallet-adapter-button")
          .should("be.visible")
          .click({ multiple: true });
      });

    cy.get('[data-testid="inputA"]').clear().type("50");
    cy.wait("@fetchValue").then(() => {
      cy.get('[data-testid="swap-button"]').click();
      cy.contains("#swap-loading", "Swapping tokens...");
    });
  });
});

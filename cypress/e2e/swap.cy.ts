//this test suite is for the swap button

describe("tests for swap process", () => {
  //click swap button and check if error modal pops up
  it("click swap button when no wallet", () => {
    cy.visit("https://atmoswap.vercel.app/");
    cy.get('[data-testid="swap-button"]').click();
    cy.contains('#wallet-disconnect', 'Please connect your wallet first') 
  });

  it("click wallet connect button", () => {
    cy.visit("https://atmoswap.vercel.app/");

    //this requires auto connect to phantom or backpack, unfortunately cypress works in sandbox
    //which means no etensions.
    cy.get('[data-testid="wallet-button"]').click();
  });
});

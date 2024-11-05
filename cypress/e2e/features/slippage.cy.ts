
//This file writes tests for all slippage selections in the slippage settings modal
describe("Slippage settings tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    // Open the settings modal before each test
    cy.get('[data-testid="settings-button"]').click();
    cy.get('[data-testid="settings-modal"]').should("be.visible");
  });

  it("should update slippage when 0.5 button is clicked and saved", () => {
    // Click the 0.5% slippage button
    cy.get('[data-testid="slip-0.5-button"]').click();
    cy.get('[data-testid="slip-0.5-button"]').should(
      "have.class",
      "bg-atmos-primary-green text-black"
    );
    cy.get('[data-testid="slip-save-button"]').click();
    cy.get('[data-testid="settings-modal"]').should("be.hidden");
    cy.get('[data-testid="slippage-display"]').should("contain", "0.5");
  });

  it("should update slippage when 1% button is clicked and saved", () => {
    // Click the 1% slippage button
    cy.get('[data-testid="slip-1-button"]').click();
    cy.get('[data-testid="slip-1-button"]').should(
      "have.class",
      "bg-atmos-primary-green text-black"
    );
    cy.get('[data-testid="slip-save-button"]').click();
    cy.get('[data-testid="settings-modal"]').should("be.hidden");
    cy.get('[data-testid="slippage-display"]').should("contain", "1");
  });

  it("should allow a custom slip value to be entered and saved", () => {
    // Enter a custom slip value in the input field
    cy.get('[data-testid="custom-slip-input"]').clear().type("1.2");
    cy.get('[data-testid="slip-save-button"]').click();
    cy.get('[data-testid="settings-modal"]').should("be.hidden");
    cy.get('[data-testid="slippage-display"]').should("contain", "1.2");
  });

  it("should allow custom slip for max slip", () => {
    // Enter a custom dynamic value in the input field
    cy.get('[data-testid="dynamic-slip-button"]').click();
    cy.get('[data-testid="dynamic-slip-input"]').clear().type("3");
    cy.get('[data-testid="slip-save-button"]').click();
    cy.get('[data-testid="settings-modal"]').should("be.hidden");
    cy.get('[data-testid="slippage-display"]').should("contain", "3");
  });
});

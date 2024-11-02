describe("reverse values when reverse button is clicked", () => {
  it("reverse button clicked", () => {
    cy.visit("https://atmoswap.vercel.app/");

    //capture initial values of dropdown-A and dropdown-B
    cy.get('[data-testid="inputA-drop"]')
      .invoke("text")
      .then((initialDropdownA) => {
        cy.get('[data-testid="inputB-drop"]')
          .invoke("text")
          .then((initialDropdownB) => {
            // type something into inputA
            cy.get('[data-testid="inputA"]').clear().type("50");

            const params = `?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=50000000&slippageBps=50`;

            // await for the API call
            cy.intercept(
              "GET",
              `https://quote-api.jup.ag/v6/quote${params}`
            ).as("apiCall");
            cy.wait("@apiCall");

            // get value of input B
            cy.get('[data-testid="inputB"]')
              .invoke("val")
              .then((inputBValueBeforeReverse) => {
                //click reverse button
                cy.get('[data-testid="reverse-button"]').click();

                //assert that the dropdown values are swapped
                cy.get('[data-testid="inputA-drop"]')
                  .invoke("text")
                  .should("equal", initialDropdownB);
                cy.get('[data-testid="inputB-drop"]')
                  .invoke("text")
                  .should("equal", initialDropdownA);

                cy.get('[data-testid="inputA"]')
                  .invoke("val")
                  .should("equal", inputBValueBeforeReverse);
              });
          });
      });
  });
});

//this test checks that the API is called and input values are changed when a particular input is changed
describe("API interaction based on input change", () => {
  const scenarios = [
    { triggerInput: "inputA", checkInput: "inputB", valueToType: "50" },
    { triggerInput: "inputB", checkInput: "inputA", valueToType: "5" },
  ];

  scenarios.forEach(({ triggerInput, checkInput, valueToType }) => {
    it(`should fetch data when ${triggerInput} is changed and update ${checkInput}`, () => {
      const params =
        triggerInput === "inputA"
          ? `?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=50000000&slippageBps=50`
          : `?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=5000000000&slippageBps=5000`;
      // Intercept the API call
      cy.intercept("GET", `https://quote-api.jup.ag/v6/quote${params}`).as(
        "fetchValue"
      );

      // Visit the page
      cy.visit("http://localhost:3000");

      // Capture the initial value of the input to check
      cy.get(`[data-testid="${checkInput}"]`)
        .invoke("val")
        .then((initialValue) => {
          // Type into the trigger input to initiate the API call
          cy.get(`[data-testid="${triggerInput}"]`).clear().type(valueToType);

          // Wait for the API call and then check if the checkInput's value has changed
          cy.wait("@fetchValue").then(() => {
            cy.get(`[data-testid="${checkInput}"]`)
              .invoke("val")
              .should("not.eq", initialValue);
          });
        });
    });
  });
});

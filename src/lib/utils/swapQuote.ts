export const swapFunds = async (
  price: number,
  sellToken: string,
  buyToken: string,
  slip: number
) => {
  const quoteResponse = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${sellToken}&outputMint=${buyToken}&amount=${price}&slippageBps=${slip}`
    )
  ).json();
  return quoteResponse;
};

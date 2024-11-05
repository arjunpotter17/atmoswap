import { TokenInfo } from "../../constants/tokens";
import { checkPrice } from "./checkPrice";

export const fetchPriceData = async (
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  sellingAmount: string,
  slippage: number,
  setLoader: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (sellingAmount !== "" && sellingAmount !== "0" && sellingAmount !== ".") {
    setLoader(true);
    const data = await checkPrice(
      tokenA,
      parseFloat(sellingAmount),
      tokenB,
      slippage ? slippage * 100 : 50
    );
    if (data) {
      // Calculate Minimum Received
      const calculatedMinReceived = data.price - data.price * 0.005;
      setLoader(false);
      return {
        minReceived: calculatedMinReceived,
        price: data.price,
        routes: data.routes,
        quote: data.quoteResponse,
      };
    } else {
      setLoader(false);
      return null;
    }
  }
  return null;
};

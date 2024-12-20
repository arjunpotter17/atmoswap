import { toast } from "sonner";
import { swapFunds } from "./swapQuote";
import { TokenInfo } from "../types/tokenTypes";

export const checkPrice = async (tokenA:TokenInfo, tokenAmount:number, tokenB:TokenInfo, slippage:number) => {
    try {
      if (!tokenAmount || tokenAmount <= 0) {
        throw new Error("Invalid Price");
      }
      const lamports = tokenAmount * 10 ** tokenA.decimals;
      if (lamports <= 0) {
        throw new Error("Invalid Price");
      }
      if (!slippage || slippage < 0.1) {
        throw new Error("Invalid Slippage");
      }
      const response = await swapFunds(lamports, tokenA.address, tokenB.address, slippage);
      const { routePlan, outAmount } = response;
      const priceInOutputToken = outAmount / 10 ** tokenB.decimals;
      return { price: priceInOutputToken, routes:routePlan, quoteResponse:response };
    } catch (error:unknown) {
      console.log(error);
      toast.error('Error fetching price');
    }
  };

import { PublicKey } from "@solana/web3.js";

export const swapTransaction = async (swapData: any, publicKey: string) => {
  const swapResponse = await fetch("/api/swap-inst-tx", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      swapData,
      key: publicKey,
    }),
  });
  const swapTransaction = await swapResponse.json();

  if (swapTransaction.error) {
    throw new Error("Failed to get swap transaction: " + swapTransaction.error);
  }
  const swapTransactionBuf = Buffer.from(
    swapTransaction?.swapTransaction,
    "base64"
  );
  return swapTransactionBuf;
};

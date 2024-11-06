import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  TransactionConfirmationStrategy,
  VersionedTransaction,
} from "@solana/web3.js";
import { toast } from "sonner";
import { swapTransaction } from "./swapTokens";
export const handleSwapTokens = async (
  wallet: WalletContextState,
  connection: Connection,
  // eslint-disable-next-line
  quoteResponse: any
) => {
  const { connected, publicKey, signTransaction } = wallet;
  if (!connected || !publicKey || !signTransaction) {
    console.log(connected, publicKey, signTransaction);
    toast.error(<p id="wallet-disconnect">Please connect your wallet first</p>);
    return;
  }

  if (!quoteResponse) {
    toast.error(<p id="input-error">Please enter details to swap</p>);
    return;
  }
  const swappingToast = toast.loading(
    <p id="swap-loading">Swapping tokens...</p>
  );
  try {
    const tx = await swapTransaction(quoteResponse, publicKey.toBase58());
    if (tx instanceof Error) {
      console.log(tx);
      toast.error(
        "unable to fetch swap transaction. Please try again in a while."
      );
    }

    const deserializedSwap = VersionedTransaction.deserialize(tx as Buffer);
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    deserializedSwap.message.recentBlockhash = blockhash;
    const signedTx = await signTransaction(deserializedSwap);
    const serializedTx = signedTx.serialize();
    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    const latestBlockhash = await connection.getLatestBlockhash();
    const confirmationStrategy: TransactionConfirmationStrategy = {
      signature: signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    };

    const confirmation = await connection.confirmTransaction(
      confirmationStrategy,
      "processed"
    );

    if (confirmation.value.err) {
      toast.error("Unable to confirm transaction. Network congestion");
      return;
    }
    toast.success("Transaction successful. Check your wallet for funds");

    console.log("Signature: ", signature);
  } catch (error: unknown) {
    console.log(error);
    toast.error("Failed to swap tokens.");
  } finally {
    toast.dismiss(swappingToast);
  }
};

import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, TransactionConfirmationStrategy, VersionedTransaction } from "@solana/web3.js";
import { toast } from "sonner";
import { swapTransaction } from "./swapTokens";
  // eslint-disable-next-line
export const handleSwapTokens = async (wallet:WalletContextState, connection:Connection, quoteResponse:any, ) => {
    const { connected, publicKey, signTransaction } = wallet;
    if (!connected || !publicKey || !signTransaction) {
      console.log(connected, publicKey, signTransaction);
      toast.error("Please connect your wallet first");
      return;
    }

    if (!quoteResponse) {
      toast.error("Please enter details to swap");
      return;
    }
    const swappingToast = toast.loading("Swapping tokens...");
    try {
      const tx = await swapTransaction(quoteResponse, publicKey.toBase58());
      const deserializedSwap = VersionedTransaction.deserialize(tx);
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
        toast.error("Transaction failed");
        return;
      }
      toast.success("Transaction successful. Check your wallet for funds");

      console.log("Signature: ", signature);
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to swap tokens");
    } finally {
      toast.dismiss(swappingToast);
    }
  };
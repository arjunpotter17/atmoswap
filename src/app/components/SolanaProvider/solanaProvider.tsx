"use client";

import dynamic from "next/dynamic";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useCallback } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}`;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

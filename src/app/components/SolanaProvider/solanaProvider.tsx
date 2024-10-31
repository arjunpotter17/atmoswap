"use client";

import dynamic from "next/dynamic";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useCallback } from "react";
// import "@solana/wallet-adapter-react-ui/styles.css"
import { TooltipProvider } from "@/components/ui/tooltip";

require("@solana/wallet-adapter-react-ui/styles.css");
export const WalletButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  const endpoint = `https://mainnet.helius-rpc.com/?api-key=ea9c561f-0680-4ae5-835c-5c0e463fa5e4`;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

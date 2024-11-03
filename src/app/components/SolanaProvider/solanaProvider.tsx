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
import "@solana/wallet-adapter-react-ui/styles.css";
import { E2EWalletAdapter } from 'e2e-react-adapter';

export const WalletButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children, endpoint }: { children: ReactNode, endpoint: string }) {
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[new E2EWalletAdapter()]} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@components/navbar/navbar";
import { SolanaProvider } from "@components/SolanaProvider/solanaProvider";
import { Toaster } from "sonner";
import { SlippageProvider } from "@/lib/contexts/slippage";

export const metadata: Metadata = {
  title: "Atmos swap",
  description:
    "Atmos swap is a swap interface. It allows users to swap tokens on the Solana blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}`;
  return (
    <html lang="en">
      <body className="w-[100vw] h-screen bg-atmos-bg-black text-white flex flex-col items-center px-4 md:px-0">
        <SolanaProvider endpoint={endpoint}>
          <SlippageProvider>
          <Toaster visibleToasts={8} richColors expand pauseWhenPageIsHidden />
          <Navbar />
          <div className="min-w-full pt-[100px]">{children}</div>
          </SlippageProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}

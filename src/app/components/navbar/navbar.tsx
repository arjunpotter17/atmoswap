"use client";
import React from "react";
import Image from "next/image";
import logo from "./atmos.png";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar = () => {
  return (
    <div>
      {/* Navbar */}
      <div className="fixed top-0 bg-atmos-navbar-bg shadow inset-x-0 w-full flex justify-between items-center px-4 md:px-10 z-50 h-20">
        <div className="relative h-10 w-[180px] flex flex-shrink-0 brightness-[1.25] filter contrast-100 grayscale-0 hue-rotate-0 invert-0 saturate-100 sepia-0 drop-shadow-lg">
          <Image src={logo} alt="logo" fill={true} className="" />
        </div>
        <div data-testid="wallet-button">
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

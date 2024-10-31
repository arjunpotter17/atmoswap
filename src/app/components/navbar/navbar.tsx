"use client";
import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CogIcon } from "@/app/icons/cog.icon";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/app/components/sidebar/sidebar"; // Import Sidebar component
import Image from "next/image";
import logo from './atmos.png';

export const Navbar = () => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Toggle the side panel
  const toggleSettingsPanel = () => {
    setSettingsOpen(!isSettingsOpen);
  };

  return (
    <div>
      {/* Navbar */}
      <div className="fixed top-0 bg-atmos-navbar-bg shadow inset-x-0 w-full flex justify-between items-center px-4 md:px-10 z-50 h-20">
        <div className="relative h-10 w-[180px] flex flex-shrink-0 brightness-[1.25] filter contrast-100 grayscale-0 hue-rotate-0 invert-0 saturate-100 sepia-0 drop-shadow-lg">
          <Image src={logo} alt="logo" fill={true} className="" />
        </div>
        <div className="flex items-center justify-center gap-x-2">
         
          <WalletMultiButton className="!text-atmos-navbar-bg !font-bold" />
        </div>
      </div>

      {/* AnimatePresence for smooth exit animations */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-atmos-accent-blue bg-opacity-10 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSettingsPanel} // Clicking outside the panel should close it
            />

            {/* Settings Panel */}
            <Sidebar isOpen={isSettingsOpen} togglePanel={toggleSettingsPanel} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;

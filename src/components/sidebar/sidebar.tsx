"use client";
import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { InfoIcon } from "@/icons/info.icon";
import { CloseIcon } from "@/icons/close.icon";
import {
  TooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarProps = {
  isOpen: boolean;
  togglePanel: () => void;
  selectedSlippage: number | null; // New prop for selected slippage
  setSelectedSlippage: (value: number) => void; // Function to set the selected slippage
};

export const Sidebar = ({ togglePanel, setSelectedSlippage }: SidebarProps) => {
  const [isDynamic, setIsDynamic] = useState(false); // Track dynamic slippage mode
  const [slippage, setSlippage] = useState<string>(""); // Handle slippage value
  const [customSlippage, setCustomSlippage] = useState<string>(""); // Custom input for fixed slippage

  // Handle dynamic slippage input change
  const handleDynamicSlippageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setSlippage(value); // Set the slippage to the input value
    }

    // Show warning if slippage exceeds 5
    if (parseFloat(value) > 5) {
      toast.warning("We suggest you use Fixed Slippage.");
    }
  };

  // Handle custom slippage input change
  const handleCustomSlippageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and decimals, max 2 digits after decimal
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomSlippage(value);
      setSlippage(value);
    }
  };

  // Handle save action
  const handleSave = () => {
    const finalSlippage = slippage !== "" ? slippage : customSlippage;
    const slippageValue = parseFloat(finalSlippage);
    setSelectedSlippage(slippageValue);
    toast.success("Slippage settings saved!");
    togglePanel();
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-atmos-navbar-bg p-6 shadow-lg z-50"
      data-testid="settings-modal"
    >
      <div className="flex justify-between items-center mt-5">
        <h3 className="text-xl text-atmos-primary-green font-bold">
          Swap Settings
        </h3>
        {/* Close button */}
        <button
          data-testid="settings-close"
          className="text-atmos-primary-green"
          onClick={togglePanel}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Settings Content */}
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-white font-medium">Slippage Mode</p>
          <div className="flex gap-4 mt-2">
            {/* Dynamic Button */}
            <button
              data-testid="dynamic-slip-button"
              className={`px-6 py-2 rounded-full ${
                isDynamic
                  ? "bg-atmos-primary-green text-black"
                  : "bg-atmos-modal-bg border border-atmos-grey-text hover:border-atmos-primary-green hover:text-atmos-primary-green text-atmos-grey-text"
              }`}
              onClick={() => {
                setIsDynamic(true);
                setCustomSlippage("");
                setSlippage("");
              }}
            >
              Dynamic
            </button>

            {/* Fixed Button */}
            <button
              data-testid="fixed-slip-button"
              className={`px-6 py-2 rounded-full ${
                !isDynamic
                  ? "bg-atmos-primary-green text-black"
                  : "bg-atmos-modal-bg border border-atmos-grey-text hover:border-atmos-primary-green hover:text-atmos-primary-green text-atmos-grey-text"
              }`}
              onClick={() => {
                setIsDynamic(false);
                setSlippage("");
              }}
            >
              Fixed
            </button>
          </div>
        </div>

        {/* Show dynamic slippage input whne selected */}
        {isDynamic && (
          <div className="mt-4">
            <p className="font-medium flex items-center text-sm text-atmos-grey-text gap-x-2">
              Max{" "}
              <span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Set the maximum slippage you&apos;d like to tolerate.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </p>
            <div className="relative">
              <input
                data-testid="dynamic-slip-input"
                type="text"
                className="mt-2 px-4 py-2 bg-gray-800 text-white text-end rounded-lg w-full pr-10 focus:outline-none focus:ring-0"
                placeholder="Enter slippage"
                value={slippage}
                onChange={handleDynamicSlippageChange}
              />
              <span className="absolute right-4 top-[58%] transform -translate-y-1/2 text-white">
                %
              </span>
            </div>
          </div>
        )}

        {/* Show fixed slippage when selected */}
        {!isDynamic && (
          <>
            <div className="flex justify-between items-center">
              <p className="font-medium flex items-center text-sm text-atmos-grey-text gap-x-2">
                Fixed{" "}
                <span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The exact slippage you want to incorporate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </p>
              <div className="flex gap-x-3">
                {["0.5%", "1%"].map((option) => (
                  <button
                    data-testid={`slip-${option
                      .replace("%", "")
                      .trim()}-button`}
                    key={option}
                    className={`px-4 py-2 rounded-full ${
                      slippage === option.replace("%", "").trim()
                        ? "bg-atmos-primary-green text-black"
                        : "bg-gray-700 text-white"
                    }`}
                    onClick={() => {
                      setSlippage(option.replace("%", "").trim());
                      setCustomSlippage("");
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-medium flex items-center text-sm text-atmos-grey-text gap-x-2">
                Custom
              </p>
              <input
                data-testid="custom-slip-input"
                type="text"
                className="mt-2 px-4 py-2 bg-gray-800 w-full text-white rounded-lg text-end focus:outline-none focus:ring-0"
                placeholder="0.00"
                value={customSlippage}
                onChange={handleCustomSlippageChange}
              />
            </div>
          </>
        )}

        <div className="mt-6">
          <button
            data-testid="slip-save-button"
            className="w-full px-4 py-2 bg-atmos-primary-green text-black rounded-lg hover:bg-atmos-hover-green"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
